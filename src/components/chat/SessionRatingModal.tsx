import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface SessionRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback?: string) => void;
}

const SessionRatingModal: React.FC<SessionRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback.trim() || undefined);
      setRating(0);
      setFeedback('');
      onClose();
    }
  };

  const handleSkip = () => {
    setRating(0);
    setFeedback('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Califica tu sesión</DialogTitle>
          <DialogDescription>
            Tu opinión nos ayuda a mejorar nuestro servicio de apoyo psicológico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Stars */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm font-medium">¿Cómo calificarías tu experiencia?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors hover:bg-accent rounded"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && 'Muy insatisfecho'}
                {rating === 2 && 'Insatisfecho'}
                {rating === 3 && 'Neutral'}
                {rating === 4 && 'Satisfecho'}
                {rating === 5 && 'Muy satisfecho'}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comentarios adicionales (opcional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Compártenos tus comentarios sobre la sesión..."
              className="min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Omitir
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
            >
              Enviar calificación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionRatingModal;