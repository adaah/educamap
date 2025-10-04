-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  full_address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  nature TEXT NOT NULL CHECK (nature IN ('Pública', 'Particular')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create school_periods table
CREATE TABLE IF NOT EXISTS public.school_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  period TEXT NOT NULL
);

-- Create school_subjects table
CREATE TABLE IF NOT EXISTS public.school_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject TEXT NOT NULL
);

-- Create school_shifts table
CREATE TABLE IF NOT EXISTS public.school_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  shift TEXT NOT NULL
);

-- Create instructors table
CREATE TABLE IF NOT EXISTS public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  email TEXT,
  linkedin TEXT,
  whatsapp TEXT,
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create former_students table
CREATE TABLE IF NOT EXISTS public.former_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  university TEXT NOT NULL,
  course TEXT NOT NULL,
  email TEXT,
  linkedin TEXT,
  instagram TEXT,
  whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.former_students ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Schools are publicly readable" ON public.schools FOR SELECT USING (true);
CREATE POLICY "School periods are publicly readable" ON public.school_periods FOR SELECT USING (true);
CREATE POLICY "School subjects are publicly readable" ON public.school_subjects FOR SELECT USING (true);
CREATE POLICY "School shifts are publicly readable" ON public.school_shifts FOR SELECT USING (true);
CREATE POLICY "Instructors are publicly readable" ON public.instructors FOR SELECT USING (true);
CREATE POLICY "Former students are publicly readable" ON public.former_students FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_schools_neighborhood ON public.schools(neighborhood);
CREATE INDEX idx_schools_nature ON public.schools(nature);
CREATE INDEX idx_school_periods_school_id ON public.school_periods(school_id);
CREATE INDEX idx_school_subjects_school_id ON public.school_subjects(school_id);
CREATE INDEX idx_school_shifts_school_id ON public.school_shifts(school_id);
CREATE INDEX idx_instructors_school_id ON public.instructors(school_id);
CREATE INDEX idx_former_students_school_id ON public.former_students(school_id);