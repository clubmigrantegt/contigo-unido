import { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Clock, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePsychologicalChat } from '@/hooks/usePsychologicalChat';
import ChatInterface from '@/components/chat/ChatInterface';
import SessionRatingModal from '@/components/chat/SessionRatingModal';

const PsychologicalSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const {
    messages,
    isLoading: chatLoading,
    isSessionActive,
    startSession,
    sendMessage,
    endSession,
    submitRating,
    messagesEndRef
  } = usePsychologicalChat();

  const supportOptions = [
    {
      id: 'chat',
      title: 'Chat en Vivo',
      description: 'Conecta instantáneamente con un profesional',
      icon: MessageCircle,
      status: 'available',
      waitTime: '2-5 min',
      type: 'Conversación escrita'
    },
    {
      id: 'phone',
      title: 'Llamada Telefónica',
      description: 'Habla directamente con un consejero',
      icon: Phone,
      status: 'busy',
      waitTime: '10-15 min',
      type: 'Conversación de voz'
    },
    {
      id: 'group',
      title: 'Sesión Grupal',
      description: 'Únete a un grupo de apoyo virtual',
      icon: Users,
      status: 'busy',
      waitTime: 'No disponible',
      type: 'Sesión grupal'
    }
  ];

  const crisisResources = [
    {
      title: 'Línea Nacional de Crisis',
      phone: '988',
      description: 'Ayuda inmediata 24/7 en español',
      urgent: true
    },
    {
      title: 'Crisis Text Line',
      phone: 'Texto "HOLA" al 741741',
      description: 'Apoyo por mensaje de texto',
      urgent: false
    }
  ];

  const handleStartChatSession = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para acceder al apoyo",
        variant: "destructive",
      });
      return;
    }

    await startSession();
  };

  const handleEndSession = async () => {
    const sessionId = await endSession();
    if (sessionId) {
      setShowRatingModal(true);
    }
  };

  const handleRatingSubmit = (rating: number, feedback?: string) => {
    submitRating(rating, feedback);
    setShowRatingModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success/10 text-success border-success/20';
      case 'busy':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'scheduled':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'Ocupado';
      case 'scheduled':
        return 'Programado';
      default:
        return 'No disponible';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/services" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Servicios
              </Link>
            </Button>
          </div>
          <div className="mt-4">
            <h1 className="flex items-center">
              <Heart className="h-6 w-6 mr-3 text-primary" />
              Apoyo Psicológico
            </h1>
            <p className="body text-muted-foreground mt-1">
              Soporte emocional profesional disponible
            </p>
          </div>
        </div>
      </div>

      {/* If chat is active, show full screen chat */}
      {isSessionActive ? (
        <ChatInterface
          messages={messages}
          isLoading={chatLoading}
          isSessionActive={isSessionActive}
          onSendMessage={sendMessage}
          onEndSession={handleEndSession}
          messagesEndRef={messagesEndRef}
        />
      ) : (
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Crisis Alert - Made smaller */}
          <Alert className="border-destructive bg-destructive/5 py-2">
            <Phone className="h-3 w-3" />
            <AlertDescription className="text-sm">
              <strong>¿En crisis?</strong> Llama al <strong>911</strong> si estás en peligro inmediato.
            </AlertDescription>
          </Alert>

          {/* Tabs for Support and Resources */}
          <Tabs defaultValue="support" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="support">Apoyo</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="support" className="space-y-6 mt-6">
              {/* Support Options */}
              <section>
                <div className="grid grid-cols-1 gap-4">
                  {supportOptions.map((option) => (
                    <Card 
                      key={option.id} 
                      className="card-elevated hover:shadow-lg transition-all duration-300"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <option.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{option.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {option.description}
                              </CardDescription>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getStatusColor(option.status)}>
                                  {getStatusText(option.status)}
                                </Badge>
                                <span className="caption text-muted-foreground">
                                  {option.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="body-small">{option.waitTime}</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={option.id === 'chat' ? handleStartChatSession : () => toast({
                            title: "Próximamente",
                            description: "Esta funcionalidad estará disponible pronto",
                          })}
                          disabled={loading || option.status === 'busy'}
                          className="w-full btn-primary"
                        >
                          {loading ? 'Conectando...' : 
                           option.status === 'busy' ? 'No disponible' : 
                           option.status === 'scheduled' ? 'Unirse' : 'Iniciar Sesión'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Information */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Información Importante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Todos nuestros profesionales están certificados y especializados en temas de migración</p>
                    <p>• Las sesiones son confidenciales y están protegidas por las leyes de privacidad</p>
                    <p>• El servicio es gratuito y disponible en español</p>
                    <p>• Si no hay disponibilidad inmediata, te conectaremos tan pronto como sea posible</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-6 mt-6">
              {/* Crisis Resources */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Recursos de Crisis</h2>
                <div className="space-y-3">
                  {crisisResources.map((resource, index) => (
                    <Card 
                      key={index} 
                      className={`card-elevated ${
                        resource.urgent ? 'border-destructive bg-destructive/5' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className={`font-medium ${
                              resource.urgent ? 'text-destructive' : 'text-foreground'
                            }`}>
                              {resource.title}
                            </h3>
                            <p className="body-small text-muted-foreground mt-1">
                              {resource.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`font-mono text-lg ${
                              resource.urgent ? 'text-destructive' : 'text-foreground'
                            }`}>
                              {resource.phone}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Rating Modal */}
      <SessionRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
};

export default PsychologicalSupport;