-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create pending tables for moderation
CREATE TABLE public.pending_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  full_address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  nature TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  additional_info TEXT,
  contributor_name TEXT,
  periods TEXT[],
  subjects TEXT[],
  shifts TEXT[],
  instructors JSONB,
  consent_to_share_data BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.pending_schools ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pending_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  email TEXT,
  linkedin TEXT,
  whatsapp TEXT,
  instagram TEXT,
  contributor_name TEXT,
  school_id UUID,
  school_name TEXT,
  consent_to_share_data BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.pending_instructors ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pending_former_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  university TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  linkedin TEXT,
  instagram TEXT,
  contributor_name TEXT,
  consent_to_share_data BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.pending_former_students ENABLE ROW LEVEL SECURITY;

-- RLS for pending tables: anyone can insert, only admins can read/update
CREATE POLICY "Anyone can submit pending schools"
ON public.pending_schools
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view pending schools"
ON public.pending_schools
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pending schools"
ON public.pending_schools
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pending schools"
ON public.pending_schools
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit pending instructors"
ON public.pending_instructors
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view pending instructors"
ON public.pending_instructors
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pending instructors"
ON public.pending_instructors
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pending instructors"
ON public.pending_instructors
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit pending former students"
ON public.pending_former_students
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view pending former students"
ON public.pending_former_students
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pending former students"
ON public.pending_former_students
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pending former students"
ON public.pending_former_students
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for main tables to block public inserts
DROP POLICY IF EXISTS "Anyone can insert schools" ON public.schools;
DROP POLICY IF EXISTS "Anyone can insert instructors" ON public.instructors;
DROP POLICY IF EXISTS "Anyone can insert former students" ON public.former_students;
DROP POLICY IF EXISTS "Anyone can insert school periods" ON public.school_periods;
DROP POLICY IF EXISTS "Anyone can insert school subjects" ON public.school_subjects;
DROP POLICY IF EXISTS "Anyone can insert school shifts" ON public.school_shifts;

-- Only admins can insert into main tables
CREATE POLICY "Only admins can insert schools"
ON public.schools
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update schools"
ON public.schools
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete schools"
ON public.schools
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert instructors"
ON public.instructors
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update instructors"
ON public.instructors
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete instructors"
ON public.instructors
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert former students"
ON public.former_students
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update former students"
ON public.former_students
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete former students"
ON public.former_students
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage school periods"
ON public.school_periods
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage school subjects"
ON public.school_subjects
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage school shifts"
ON public.school_shifts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));