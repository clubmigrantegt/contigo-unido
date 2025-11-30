import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Image, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  title: string;
  content: string;
  author_name: string;
  user_id: string;
}

const WriteComment = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [post, setPost] = useState<Testimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const maxLength = 280;

  useEffect(() => {
    if (!user) {
      toast.error('Debes iniciar sesión para comentar');
      navigate('/community');
      return;
    }

    if (postId) {
      fetchPost();
    }
  }, [postId, user]);

  const fetchPost = async () => {
    try {
      const { data: postData, error: postError } = await supabase
        .from('testimonials')
        .select('id, title, content, author_name, user_id')
        .eq('id', postId)
        .single();

      if (postError) throw postError;
      setPost(postData);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('No se pudo cargar la publicación');
      navigate('/community');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !post) return;

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    if (trimmedComment.length > maxLength) {
      toast.error(`El comentario no puede exceder ${maxLength} caracteres`);
      return;
    }

    setSubmitting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('testimonial_comments')
        .insert({
          testimonial_id: post.id,
          user_id: user.id,
          content: trimmedComment,
          author_name: profile?.full_name || 'Usuario',
        });

      if (error) throw error;

      toast.success('Comentario publicado exitosamente');
      navigate(`/community/post/${postId}`);
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('No se pudo publicar el comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (comment.trim()) {
      const confirmed = window.confirm('¿Estás seguro de que quieres descartar tu comentario?');
      if (!confirmed) return;
    }
    navigate(`/community/post/${postId}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-indigo-100 text-indigo-700',
      'bg-emerald-100 text-emerald-700',
      'bg-rose-100 text-rose-600',
      'bg-amber-100 text-amber-700',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-6 pt-14 pb-4 flex justify-between items-center border-b border-border">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <div className="flex-1 px-6 pt-4">
          <div className="flex gap-3 mb-6">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Actions */}
      <div className="px-6 pt-14 pb-4 flex justify-between items-center border-b border-border">
        <button
          onClick={handleCancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !comment.trim()}
          className="px-5 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg"
          size="sm"
        >
          {submitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4">
        {/* Context (Replying to) */}
        <div className="flex gap-3 mb-6 opacity-60">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(post.author_name)}`}>
              {getInitials(post.author_name)}
            </div>
            <div className="w-0.5 flex-1 bg-border my-1 rounded-full"></div>
          </div>
          <div className="pb-4">
            <span className="text-xs font-bold text-foreground block mb-0.5">
              {post.author_name}
            </span>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>

        {/* User Info (Posting As) */}
        <div className="flex items-start gap-3">
          {user && (
            <>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-accent shrink-0 ${getAvatarColor(user.email || 'User')}`}>
                {getInitials(user.email?.split('@')[0] || 'U')}
              </div>
              <div className="w-full pt-1">
                <span className="text-xs text-muted-foreground block mb-1">
                  Respondiendo a <strong className="text-foreground">{post.author_name}</strong>
                </span>
                <textarea
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full h-40 text-sm text-foreground placeholder-muted-foreground outline-none resize-none bg-transparent leading-relaxed"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={maxLength}
                  autoFocus
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Keyboard Accessory Bar */}
      <div className="bg-accent border-t border-border px-4 py-3 pb-8 sticky bottom-0 z-30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground transition-colors">
              <Image className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground transition-colors">
              <AtSign className="w-5 h-5" />
            </button>
          </div>
          <span className={`text-[10px] font-bold ${comment.length > maxLength ? 'text-red-500' : 'text-muted-foreground'}`}>
            {comment.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WriteComment;
