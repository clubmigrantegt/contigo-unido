import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Video, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  professional: string;
}

interface AppointmentData {
  date: Date | undefined;
  timeSlot: string;
  serviceType: string;
  notes: string;
}

const AppointmentScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointment, setAppointment] = useState<AppointmentData>({
    date: undefined,
    timeSlot: '',
    serviceType: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const serviceTypes = [
    { value: 'psychological', label: 'Apoyo Psicológico', icon: User },
    { value: 'legal', label: 'Consulta Legal', icon: Phone },
    { value: 'group', label: 'Sesión Grupal', icon: Video },
  ];

  useEffect(() => {
    if (appointment.date && appointment.serviceType) {
      fetchTimeSlots();
    }
  }, [appointment.date, appointment.serviceType]);

  const fetchTimeSlots = async () => {
    if (!appointment.date || !appointment.serviceType) return;

    setLoadingSlots(true);
    try {
      const dayOfWeek = appointment.date.getDay();
      const dateStr = format(appointment.date, 'yyyy-MM-dd');

      const { data: slots, error: slotsError } = await supabase
        .from('available_time_slots')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('service_type', appointment.serviceType)
        .eq('is_active', true);

      if (slotsError) throw slotsError;

      const { data: existingAppointments, error: apptError } = await supabase
        .from('appointments')
        .select('time_slot, professional_name')
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');

      if (apptError) throw apptError;

      const availableSlots: TimeSlot[] = (slots || []).map((slot) => {
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

      setTimeSlots(availableSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los horarios disponibles',
        variant: 'destructive',
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setAppointment(prev => ({ ...prev, date, timeSlot: '' }));
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (slot?.available) {
      setAppointment(prev => ({ ...prev, timeSlot: timeSlotId }));
    }
  };

  const handleServiceTypeSelect = (serviceType: string) => {
    setAppointment(prev => ({ ...prev, serviceType, timeSlot: '' }));
  };

  const handleNotesChange = (notes: string) => {
    setAppointment(prev => ({ ...prev, notes }));
  };

  const handleSubmitAppointment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para programar una cita",
        variant: "destructive",
      });
      return;
    }

    if (!appointment.date || !appointment.timeSlot || !appointment.serviceType) {
      toast({
        title: "Información incompleta",
        description: "Por favor selecciona fecha, hora y tipo de servicio",
        variant: "destructive",
      });
      return;
    }

    const selectedSlot = timeSlots.find(slot => slot.id === appointment.timeSlot);
    if (!selectedSlot) {
      toast({
        title: "Error",
        description: "Horario no válido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dateStr = format(appointment.date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          appointment_date: dateStr,
          time_slot: selectedSlot.time,
          service_type: appointment.serviceType,
          professional_name: selectedSlot.professional,
          notes: appointment.notes || null,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'appointment_reminder',
        title: 'Recordatorio de Cita',
        message: `Tienes una cita el ${format(appointment.date, 'dd/MM/yyyy')} a las ${selectedSlot.time} con ${selectedSlot.professional}`,
        action_url: '/services?tab=appointments',
        metadata: { appointment_id: data.id },
      });

      toast({
        title: "¡Cita programada!",
        description: `Tu cita ha sido programada para el ${format(appointment.date, 'dd/MM/yyyy')} a las ${selectedSlot.time}`,
      });

      setAppointment({
        date: undefined,
        timeSlot: '',
        serviceType: '',
        notes: ''
      });
      setSelectedDate(new Date());
      fetchTimeSlots();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo programar la cita. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    const service = serviceTypes.find(s => s.value === serviceType);
    if (!service) return null;
    const Icon = service.icon;
    return <Icon className="h-4 w-4" />;
  };

  const selectedTimeSlot = timeSlots.find(s => s.id === appointment.timeSlot);
  const selectedService = serviceTypes.find(s => s.value === appointment.serviceType);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Programar Cita</h2>
        <p className="text-muted-foreground">
          Agenda tu sesión con uno de nuestros profesionales
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Selecciona Fecha y Hora</span>
            </CardTitle>
            <CardDescription>
              Elige un día disponible y una hora que te convenga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => 
                date < new Date() || date.getDay() === 0 || date.getDay() === 6
              }
              className="rounded-md border"
            />
            
            {selectedDate && appointment.serviceType && (
              <div className="space-y-3">
                <Label>Horarios disponibles para {selectedDate.toLocaleDateString('es-ES')}</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : timeSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay horarios disponibles para esta fecha
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={appointment.timeSlot === slot.id ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSlotSelect(slot.id)}
                          className="text-sm"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {slot.time}
                          {!slot.available && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              No disponible
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                    
                    {selectedTimeSlot && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium">
                          Profesional asignado: {selectedTimeSlot.professional}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {selectedDate && !appointment.serviceType && (
              <p className="text-center text-muted-foreground py-8">
                Selecciona un tipo de servicio primero
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Detalles de la Cita</span>
            </CardTitle>
            <CardDescription>
              Especifica el tipo de servicio y cualquier información adicional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-type">Tipo de Servicio</Label>
              <Select 
                value={appointment.serviceType} 
                onValueChange={handleServiceTypeSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => {
                    const Icon = service.icon;
                    return (
                      <SelectItem key={service.value} value={service.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{service.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Describe brevemente el motivo de tu consulta o cualquier información relevante..."
                value={appointment.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {(appointment.date || appointment.timeSlot || appointment.serviceType) && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Resumen de la cita:</h4>
                {appointment.date && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{appointment.date.toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                {selectedTimeSlot && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{selectedTimeSlot.time} - {selectedTimeSlot.professional}</span>
                  </div>
                )}
                {selectedService && (
                  <div className="flex items-center space-x-2 text-sm">
                    {getServiceIcon(appointment.serviceType)}
                    <span>{selectedService.label}</span>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <Button 
              onClick={handleSubmitAppointment}
              disabled={loading || !appointment.date || !appointment.timeSlot || !appointment.serviceType}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Programando...
                </>
              ) : (
                'Confirmar Cita'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentScheduler;