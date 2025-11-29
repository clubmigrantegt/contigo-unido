-- Create appointments table
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  appointment_date date NOT NULL,
  time_slot text NOT NULL,
  service_type text NOT NULL,
  professional_name text,
  notes text,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS policies for appointments
CREATE POLICY "Users can view their own appointments" 
  ON public.appointments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments" 
  ON public.appointments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
  ON public.appointments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" 
  ON public.appointments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create available_time_slots table
CREATE TABLE public.available_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL,
  time text NOT NULL,
  professional_name text NOT NULL,
  service_type text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for available_time_slots
ALTER TABLE public.available_time_slots ENABLE ROW LEVEL SECURITY;

-- Public read policy for time slots
CREATE POLICY "Anyone can view active time slots" 
  ON public.available_time_slots FOR SELECT 
  USING (is_active = true);

-- Insert sample time slots
INSERT INTO public.available_time_slots (day_of_week, time, professional_name, service_type) VALUES
(1, '09:00', 'Dr. María González', 'psychological'),
(1, '10:00', 'Dr. Carlos Ruiz', 'psychological'),
(1, '11:00', 'Dr. Ana López', 'legal'),
(1, '14:00', 'Dr. María González', 'psychological'),
(1, '15:00', 'Dr. Luis Martín', 'group'),
(1, '16:00', 'Dr. Ana López', 'legal'),
(1, '17:00', 'Dr. Carlos Ruiz', 'psychological'),
(2, '09:00', 'Dr. María González', 'psychological'),
(2, '10:00', 'Dr. Carlos Ruiz', 'legal'),
(2, '11:00', 'Dr. Ana López', 'legal'),
(2, '14:00', 'Dr. María González', 'psychological'),
(2, '15:00', 'Dr. Luis Martín', 'group'),
(2, '16:00', 'Dr. Ana López', 'psychological'),
(2, '17:00', 'Dr. Carlos Ruiz', 'psychological'),
(3, '09:00', 'Dr. María González', 'psychological'),
(3, '10:00', 'Dr. Carlos Ruiz', 'psychological'),
(3, '11:00', 'Dr. Ana López', 'legal'),
(3, '14:00', 'Dr. María González', 'legal'),
(3, '15:00', 'Dr. Luis Martín', 'group'),
(3, '16:00', 'Dr. Ana López', 'legal'),
(3, '17:00', 'Dr. Carlos Ruiz', 'psychological'),
(4, '09:00', 'Dr. María González', 'psychological'),
(4, '10:00', 'Dr. Carlos Ruiz', 'psychological'),
(4, '11:00', 'Dr. Ana López', 'legal'),
(4, '14:00', 'Dr. María González', 'psychological'),
(4, '15:00', 'Dr. Luis Martín', 'group'),
(4, '16:00', 'Dr. Ana López', 'legal'),
(4, '17:00', 'Dr. Carlos Ruiz', 'psychological'),
(5, '09:00', 'Dr. María González', 'psychological'),
(5, '10:00', 'Dr. Carlos Ruiz', 'legal'),
(5, '11:00', 'Dr. Ana López', 'legal'),
(5, '14:00', 'Dr. María González', 'psychological'),
(5, '15:00', 'Dr. Luis Martín', 'group'),
(5, '16:00', 'Dr. Ana López', 'psychological'),
(5, '17:00', 'Dr. Carlos Ruiz', 'psychological');

-- Create testimonial_comments table
CREATE TABLE public.testimonial_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  testimonial_id uuid NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  author_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for testimonial_comments
ALTER TABLE public.testimonial_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Anyone can view comments" 
  ON public.testimonial_comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own comments" 
  ON public.testimonial_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.testimonial_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.testimonial_comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create comment_likes table
CREATE TABLE public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.testimonial_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS for comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment likes
CREATE POLICY "Anyone can view comment likes" 
  ON public.comment_likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own likes" 
  ON public.comment_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
  ON public.comment_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  action_url text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at on appointments
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at on testimonial_comments
CREATE TRIGGER update_testimonial_comments_updated_at
  BEFORE UPDATE ON public.testimonial_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();