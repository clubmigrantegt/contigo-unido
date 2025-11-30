import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  ChevronLeft, Bookmark, MoreHorizontal, Heart, 
  MessageCircle, Share
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  title: string;
  content: string;
  author_name: string;
  country_of_origin: string | null;
  category: string;
  created_at: string;
  like_count: number;
  user_liked: boolean;
  comment_count: number;
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  author_name: string;
  user_id: string;
  created_at: string;
  likes: number;
  user_liked: boolean;
}

const countryToCode: Record<string, string> = {
  'Venezuela': 've',
  'Colombia': 'co',
  'México': 'mx',
  'Guatemala': 'gt',
  'El Salvador': 'sv',
  'Honduras': 'hn',
  'Nicaragua': 'ni',
  'Ecuador': 'ec',
  'Perú': 'pe',
  'Cuba': 'cu',
  'Ucrania': 'ua',
  'Siria': 'sy'
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  legal: { bg: 'bg-blue-50', text: 'text-blue-700' },
  trabajo: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  salud: { bg: 'bg-rose-50', text: 'text-rose-700' },
  vivienda: { bg: 'bg-amber-50', text: 'text-amber-700' },
  educacion: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
};

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Testimonial | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { data: postData, error: postError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      const { count: likeCount } = await supabase
        .from('testimonial_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('testimonial_id', postId);

      const { count: commentCount } = await supabase
        .from('testimonial_comments')
        .select('*', { count: 'exact', head: true })
        .eq('testimonial_id', postId);

      let userLiked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from('testimonial_reactions')
          .select('id')
          .eq('testimonial_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        userLiked = !!likeData;
      }

      setPost({
        ...postData,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
        user_liked: userLiked,
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('No se pudo cargar la publicación');
      navigate('/community');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('testimonial_comments')
        .select('id, content, author_name, created_at, user_id')
        .eq('testimonial_id', postId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      const commentIds = commentsData?.map(c => c.id) || [];
      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('comment_id, user_id')
        .in('comment_id', commentIds);

      const enrichedComments: Comment[] = (commentsData || []).map(comment => {
        const commentLikes = likesData?.filter(l => l.comment_id === comment.id) || [];
        const userLiked = commentLikes.some(l => l.user_id === user?.id);

        return {
          id: comment.id,
          content: comment.content,
          author_name: comment.author_name,
          user_id: comment.user_id,
          created_at: comment.created_at,
          likes: commentLikes.length,
          user_liked: userLiked,
        };
      });

      setComments(enrichedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para dar like');
      return;
    }

    if (!post) return;

    try {
      if (post.user_liked) {
        await supabase
          .from('testimonial_reactions')
          .delete()
          .eq('testimonial_id', post.id)
          .eq('user_id', user.id);

        setPost({
          ...post,
          like_count: post.like_count - 1,
          user_liked: false,
        });
      } else {
        await supabase
          .from('testimonial_reactions')
          .insert({
            testimonial_id: post.id,
            user_id: user.id,
          });

        setPost({
          ...post,
          like_count: post.like_count + 1,
          user_liked: true,
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('No se pudo procesar la reacción');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para dar like');
      return;
    }

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      if (comment.user_liked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        setComments(comments.map(c =>
          c.id === commentId
            ? { ...c, likes: c.likes - 1, user_liked: false }
            : c
        ));
      } else {
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        setComments(comments.map(c =>
          c.id === commentId
            ? { ...c, likes: c.likes + 1, user_liked: true }
            : c
        ));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('No se pudo procesar la reacción');
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'ayer';
    if (diffInDays < 7) return `hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      legal: 'Legal',
      trabajo: 'Trabajo',
      salud: 'Salud',
      vivienda: 'Vivienda',
      educacion: 'Educación',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-6 pt-14 pb-4 bg-background/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between border-b border-border">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
        <div className="flex-1 px-6 py-6">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-background/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate('/community')}
            className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors text-foreground shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-sm font-bold text-foreground truncate flex-1 min-w-0">
            {post.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 -mr-2 rounded-full hover:bg-accent transition-colors text-muted-foreground">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Post Content */}
        <div className="px-6 py-6">
          {/* User Meta */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base relative ${getAvatarColor(post.author_name)}`}>
              {getInitials(post.author_name)}
              {post.country_of_origin && countryToCode[post.country_of_origin] && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background overflow-hidden">
                  <img
                    src={`https://flagcdn.com/w40/${countryToCode[post.country_of_origin]}.png`}
                    className="w-full h-full object-cover"
                    alt={post.country_of_origin}
                  />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{post.author_name}</h3>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
            </div>
            <span className={`ml-auto px-2.5 py-1 ${categoryColors[post.category]?.bg || 'bg-slate-50'} ${categoryColors[post.category]?.text || 'text-slate-700'} text-[10px] font-bold uppercase tracking-wide rounded-full`}>
              {getCategoryLabel(post.category)}
            </span>
          </div>

          {/* Title & Body */}
          <h1 className="text-xl font-bold text-foreground mb-4 leading-tight tracking-tight">{post.title}</h1>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between py-4 mt-6 border-b border-border">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 transition-colors ${
                  post.user_liked ? 'text-rose-500' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} />
                <span className="text-sm font-semibold">{post.like_count}</span>
              </button>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{post.comment_count}</span>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-6 pb-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Comentarios
          </h3>

          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(comment.author_name)}`}>
                    {getInitials(comment.author_name)}
                  </div>
                  <div className="flex-1">
                     <div className="bg-neutral-50 rounded-2xl rounded-tl-none p-3 px-4">
                       <div className="flex justify-between items-baseline mb-1">
                         <span className="text-xs font-bold text-neutral-900">{comment.author_name}</span>
                         <span className="text-[10px] text-neutral-400">{formatRelativeTime(comment.created_at)}</span>
                       </div>
                       <p className="text-xs text-neutral-600 leading-relaxed">{comment.content}</p>
                     </div>
                    <div className="flex gap-4 mt-1.5 ml-2">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                          comment.user_liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${comment.user_liked ? 'fill-current' : ''}`} />
                        {comment.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 pb-8 z-30">
        <div className="flex items-center gap-2 max-w-screen-lg mx-auto">
          {user && (
            <>
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getInitials(user.email?.split('@')[0] || 'U')}
              </div>
              <div
                onClick={() => navigate(`/community/post/${postId}/comment`)}
                className="flex-1 bg-slate-50 rounded-full h-10 px-4 flex items-center border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <span className="text-sm text-muted-foreground">Agrega un comentario...</span>
              </div>
            </>
          )}
          {!user && (
            <div className="flex-1 text-center text-sm text-muted-foreground py-2">
              Inicia sesión para comentar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
