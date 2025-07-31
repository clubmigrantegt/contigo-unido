import { useState } from 'react';
import { Calendar, Clock, User, Phone, Video } from 'lucide-react';
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

  // Mock data for available time slots
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00', available: true, professional: 'Dr. María González' },
    { id: '2', time: '10:00', available: false, professional: 'Dr. Carlos Ruiz' },
    { id: '3', time: '11:00', available: true, professional: 'Dr. Ana López' },
    { id: '4', time: '14:00', available: true, professional: 'Dr. María González' },
    { id: '5', time: '15:00', available: true, professional: 'Dr. Luis Martín' },
    { id: '6', time: '16:00', available: false, professional: 'Dr. Ana López' },
    { id: '7', time: '17:00', available: true, professional: 'Dr. Carlos Ruiz' },
  ];

  const serviceTypes = [
    { value: 'psychological', label: 'Apoyo Psicológico', icon: User },
    { value: 'legal', label: 'Consulta Legal', icon: Phone },
    { value: 'group', label: 'Sesión Grupal', icon: Video },
  ];

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
    setAppointment(prev => ({ ...prev, serviceType }));
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

    setLoading(true);
    try {
      // In a real implementation, this would save to the database
      // For now, we'll simulate the appointment creation
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "¡Cita programada!",
        description: "Tu cita ha sido programada exitosamente. Recibirás una confirmación por email.",
      });

      // Reset form
      setAppointment({
        date: undefined,
        timeSlot: '',
        serviceType: '',
        notes: ''
      });
      setSelectedDate(new Date());
    } catch (error) {
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
        {/* Calendar and Time Selection */}
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
            
            {selectedDate && (
              <div className="space-y-3">
                <Label>Horarios disponibles para {selectedDate.toLocaleDateString('es-ES')}</Label>
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Type and Details */}
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

            {/* Appointment Summary */}
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
              {loading ? 'Programando...' : 'Confirmar Cita'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentScheduler;