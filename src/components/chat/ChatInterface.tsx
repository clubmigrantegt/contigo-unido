import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Send, Bot, User, X, ArrowLeft } from 'lucide-react';
import { ChatMessage } from '@/hooks/usePsychologicalChat';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isSessionActive: boolean;
  onSendMessage: (message: string) => void;
  onEndSession: () => void;
  onNavigateBack: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  isSessionActive,
  onSendMessage,
  onEndSession,
  onNavigateBack,
  messagesEndRef
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageCount = useRef(messages.length);

  const handleSend = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage('');
      // Only auto-scroll when user sends a message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Only auto-scroll for bot responses if user is not actively scrolling
  useEffect(() => {
    if (messages.length > lastMessageCount.current && !isUserScrolling) {
      const lastMessage = messages[messages.length - 1];
      // Only auto-scroll for bot responses, not user messages
      if (!lastMessage?.isUser) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    lastMessageCount.current = messages.length;
  }, [messages, isUserScrolling]);

  // Detect user scrolling
  const handleScroll = () => {
    setIsUserScrolling(true);
    // Reset scrolling detection after 2 seconds
    setTimeout(() => setIsUserScrolling(false), 2000);
  };

  if (!isSessionActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Chat Header - Sticky at top with backdrop blur */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">Asistente de Apoyo</h3>
            <p className="text-sm text-muted-foreground">En línea</p>
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Finalizar sesión de chat?</AlertDialogTitle>
              <AlertDialogDescription>
                Si finalizas la sesión, no podrás continuar la conversación actual. 
                Tendrás la oportunidad de calificar la sesión antes de cerrarla completamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onEndSession}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Finalizar sesión
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Messages Area - Scrollable middle section */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        onScroll={handleScroll}
        ref={scrollAreaRef}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.isUser
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <span className="text-xs opacity-70 mt-2 block">
                {message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {message.isUser && (
              <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-3 max-w-[75%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Sticky at bottom with backdrop blur and safe area */}
      <div className="sticky bottom-0 z-10 p-4 border-t bg-background/95 backdrop-blur-sm" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="flex gap-3 items-end">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-2xl border-2 focus:border-primary/50"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="h-11 w-11 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;