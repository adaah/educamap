-- Pending updates for existing schools (moderation)
CREATE TABLE IF NOT EXISTS public.pending_school_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  website TEXT,
  additional_info TEXT,
  periods TEXT[],
  subjects TEXT[],
  shifts TEXT[],
  instructors JSONB,
  contributor_name TEXT,
  contributor_position TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.pending_school_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit pending school updates" ON public.pending_school_updates;
CREATE POLICY "Anyone can submit pending school updates"
ON public.pending_school_updates
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view pending school updates" ON public.pending_school_updates;
CREATE POLICY "Admins can view pending school updates"
ON public.pending_school_updates
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update pending school updates" ON public.pending_school_updates;
CREATE POLICY "Admins can update pending school updates"
ON public.pending_school_updates
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete pending school updates" ON public.pending_school_updates;
CREATE POLICY "Admins can delete pending school updates"
ON public.pending_school_updates
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

