-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  full_name TEXT NOT NULL,
  country_of_origin TEXT,
  email TEXT,
  preferred_language TEXT DEFAULT 'es' CHECK (preferred_language IN ('es', 'en')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat sessions table for psychological support history
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table for community stories
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  country_of_origin TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create legal topics table for informational content
CREATE TABLE public.legal_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create banners table for dynamic content
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create FAQ table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON public.chat_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for testimonials
CREATE POLICY "Users can view approved testimonials" ON public.testimonials
FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own testimonials" ON public.testimonials
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own testimonials" ON public.testimonials
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own testimonials" ON public.testimonials
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for legal_topics (public read)
CREATE POLICY "Anyone can view published legal topics" ON public.legal_topics
FOR SELECT USING (is_published = true);

-- RLS Policies for banners (public read)
CREATE POLICY "Anyone can view active banners" ON public.banners
FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for faqs (public read)
CREATE POLICY "Anyone can view published FAQs" ON public.faqs
FOR SELECT USING (is_published = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_topics_updated_at
BEFORE UPDATE ON public.legal_topics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.phone, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for legal topics
INSERT INTO public.legal_topics (title, slug, content, summary, category, order_index) VALUES
('TPS (Temporary Protected Status)', 'tps', 'El Estatus de Protección Temporal (TPS) es un programa que proporciona alivio de deportación y autorización de trabajo para personas de países designados que enfrentan conflictos armados, desastres naturales u otras circunstancias extraordinarias.', 'Protección temporal para personas de países en crisis', 'immigration', 1),
('Asilo Político', 'asilo', 'El asilo es protección otorgada a individuos ya en Estados Unidos que demuestran que no pueden regresar a su país de origen debido a persecución por raza, religión, nacionalidad, opinión política o pertenencia a un grupo social particular.', 'Protección para personas perseguidas en su país', 'immigration', 2),
('Derechos Laborales', 'derechos-laborales', 'Todos los trabajadores en Estados Unidos, independientemente de su estatus migratorio, tienen derechos básicos incluyendo: salario mínimo, pago de horas extras, condiciones de trabajo seguras, y protección contra discriminación.', 'Derechos fundamentales en el trabajo', 'labor', 3),
('Deportación y ICE', 'deportacion-ice', 'Si eres detenido por ICE, tienes derechos: el derecho a permanecer en silencio, el derecho a un abogado (a tu propio costo), y el derecho a una llamada telefónica. No firmes nada sin entender completamente el documento.', 'Qué hacer en caso de detención migratoria', 'immigration', 4);

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, order_index) VALUES
('¿Cómo puedo verificar mi identidad por teléfono?', 'Enviamos un código de verificación SMS a tu número de teléfono. Ingresa este código en la aplicación para confirmar tu identidad.', 'cuenta', 1),
('¿Es confidencial el apoyo psicológico?', 'Sí, todas las conversaciones son completamente confidenciales. No compartimos información personal con terceros.', 'psicologico', 2),
('¿Puedo cambiar mi país de origen después?', 'Sí, puedes actualizar tu información de perfil en cualquier momento desde la sección "Perfil".', 'cuenta', 3),
('¿El servicio legal está disponible las 24 horas?', 'Actualmente la sección legal es solo informativa. El servicio de consultas con abogados estará disponible próximamente.', 'legal', 4),
('¿Cómo puedo compartir mi testimonio?', 'Ve a la sección "Comunidad" y toca "Compartir mi historia". Tu testimonio será revisado antes de publicarse.', 'comunidad', 5);

-- Insert sample banner
INSERT INTO public.banners (title, content, link_text, priority) VALUES
('¡Bienvenido a El Club del Migrante!', 'Estamos aquí para apoyarte en tu camino. Accede a apoyo psicológico 24/7, información legal y conecta con nuestra comunidad.', 'Conocer más', 1);