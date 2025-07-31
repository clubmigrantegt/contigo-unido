-- Add likes/reactions functionality to testimonials
CREATE TABLE public.testimonial_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, testimonial_id)
);

-- Enable RLS on testimonial_reactions
ALTER TABLE public.testimonial_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonial_reactions
CREATE POLICY "Users can view all reactions" 
ON public.testimonial_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own reactions" 
ON public.testimonial_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" 
ON public.testimonial_reactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.testimonial_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add categories to testimonials for better organization
ALTER TABLE public.testimonials 
ADD COLUMN category TEXT DEFAULT 'general';

-- Add search functionality optimizations
ALTER TABLE public.testimonials 
ADD COLUMN tags TEXT[];

-- Create index for better search performance
CREATE INDEX idx_testimonials_category ON public.testimonials(category);
CREATE INDEX idx_testimonials_tags ON public.testimonials USING GIN(tags);
CREATE INDEX idx_testimonials_search ON public.testimonials USING GIN(
  to_tsvector('spanish', title || ' ' || content)
);

-- Add user favorites for legal topics
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL, -- 'legal_topic', 'testimonial', etc.
  resource_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_type, resource_id)
);

-- Enable RLS on user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add usage tracking for analytics
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activity
CREATE POLICY "Users can view their own activity" 
ON public.user_activity 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
ON public.user_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at);

-- Add consultation requests for legal topics
CREATE TABLE public.legal_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_category TEXT NOT NULL,
  question TEXT NOT NULL,
  contact_preference TEXT NOT NULL DEFAULT 'email',
  urgency_level TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on legal_consultations
ALTER TABLE public.legal_consultations ENABLE ROW LEVEL SECURITY;

-- Create policies for legal_consultations
CREATE POLICY "Users can view their own consultations" 
ON public.legal_consultations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consultations" 
ON public.legal_consultations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultations" 
ON public.legal_consultations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on legal_consultations
CREATE TRIGGER update_legal_consultations_updated_at
BEFORE UPDATE ON public.legal_consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();