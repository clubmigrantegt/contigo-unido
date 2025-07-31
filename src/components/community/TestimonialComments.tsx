import { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  likes: number;
  user_liked: boolean;
}

interface TestimonialCommentsProps {
  testimonialId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TestimonialComments = ({ testimonialId, isOpen, onClose }: TestimonialCommentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && testimonialId) {
      fetchComments();
    }
  }, [isOpen, testimonialId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from a comments table
      // For now, we'll simulate with mock data
      const mockComments: Comment[] = [
        {
          id: '1',
          content: '¡Qué historia tan inspiradora! Me da mucha esperanza saber que otros han pasado por experiencias similares.',
          author_name: 'Ana M.',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 3,
          user_liked: false
        },
        {
          id: '2',
          content: 'Gracias por compartir tu experiencia. Es muy valiente de tu parte y seguro ayudará a muchas personas.',
          author_name: 'Carlos R.',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          likes: 1,
          user_liked: true
        },
        {
          id: '3',
          content: 'Me identifico mucho con lo que cuentas. ¿Podrías compartir más detalles sobre cómo lograste superarlo?',
          author_name: 'María L.',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          likes: 2,
          user_liked: false
        }
      ];
      
      setComments(mockComments);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para comentar",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "El comentario no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // In a real implementation, this would save to the database
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author_name: user.user_metadata?.full_name || 'Usuario Anónimo',
        created_at: new Date().toISOString(),
        likes: 0,
        user_liked: false
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      toast({
        title: "Comentario publicado",
        description: "Tu comentario ha sido agregado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar el comentario",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para dar like",
        variant: "destructive",
      });
      return;
    }

    try {
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.user_liked ? comment.likes - 1 : comment.likes + 1,
            user_liked: !comment.user_liked
          };
        }
        return comment;
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la reacción",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Comentarios</span>
              <Badge variant="secondary">{comments.length}</Badge>
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Add Comment Form */}
          {user && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <Textarea
                placeholder="Escribe tu comentario aquí..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-1" />
                  {submitting ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                Inicia sesión para participar en la conversación
              </p>
            </div>
          )}

          <Separator />

          {/* Comments List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No hay comentarios aún</h3>
              <p className="text-muted-foreground">
                ¡Sé el primero en comentar esta historia!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {getInitials(comment.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">
                          {comment.author_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeComment(comment.id)}
                          className={`h-8 ${comment.user_liked ? 'text-red-500' : 'text-muted-foreground'}`}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${comment.user_liked ? 'fill-current' : ''}`} />
                          {comment.likes}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialComments;