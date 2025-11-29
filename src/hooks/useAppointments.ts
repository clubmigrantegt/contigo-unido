import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  professional: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  service_type: string;
  professional_name?: string;
  notes?: string;
  status: string;
  created_at: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = async (
    date: Date,
    serviceType: string
  ): Promise<TimeSlot[]> => {
    try {
      const dayOfWeek = date.getDay();
      const dateStr = format(date, 'yyyy-MM-dd');

      // Fetch available time slots for this day and service
      const { data: slots, error: slotsError } = await supabase
        .from('available_time_slots')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('service_type', serviceType)
        .eq('is_active', true);

      if (slotsError) throw slotsError;

      // Fetch existing appointments for this date
      const { data: existingAppointments, error: apptError } = await supabase
        .from('appointments')
        .select('time_slot, professional_name')
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');

      if (apptError) throw apptError;

      // Map slots to include availability
      const timeSlots: TimeSlot[] = (slots || []).map((slot) => {
        const isBooked = existingAppointments?.some(
          (apt) =>
            apt.time_slot === slot.time &&
            apt.professional_name === slot.professional_name
        );

        return {
          id: slot.id,
          time: slot.time,
          professional: slot.professional_name,
          available: !isBooked,
        };
      });

      return timeSlots;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }
  };

  const createAppointment = async (
    date: Date,
    timeSlot: string,
    serviceType: string,
    professionalName: string,
    notes?: string
  ) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user?.id,
          appointment_date: dateStr,
          time_slot: timeSlot,
          service_type: serviceType,
          professional_name: professionalName,
          notes: notes || null,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      // Create reminder notification for 24 hours before
      const appointmentDate = new Date(date);
      const reminderDate = addDays(appointmentDate, -1);
      
      await supabase.from('notifications').insert({
        user_id: user?.id,
        type: 'appointment_reminder',
        title: 'Recordatorio de Cita',
        message: `Tienes una cita mañana a las ${timeSlot} con ${professionalName}`,
        action_url: '/services?tab=appointments',
        metadata: { appointment_id: data.id },
      });

      setAppointments((prev) => [...prev, data]);

      toast({
        title: 'Cita confirmada',
        description: `Tu cita ha sido programada para el ${format(date, 'dd/MM/yyyy')} a las ${timeSlot}`,
      });

      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo confirmar la cita. Intenta de nuevo.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      );

      toast({
        title: 'Cita cancelada',
        description: 'La cita ha sido cancelada exitosamente',
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la cita',
        variant: 'destructive',
      });
    }
  };

  return {
    appointments,
    loading,
    getAvailableTimeSlots,
    createAppointment,
    cancelAppointment,
    refetch: fetchAppointments,
  };
}
