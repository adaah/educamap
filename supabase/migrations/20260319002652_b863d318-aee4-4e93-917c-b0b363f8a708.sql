
ALTER TABLE public.pending_former_students 
  ADD COLUMN school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  ADD COLUMN school_name text;
