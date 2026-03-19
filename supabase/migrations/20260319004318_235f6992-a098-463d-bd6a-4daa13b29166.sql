
-- 1. Add missing UPDATE/DELETE policies for pending_school_updates
CREATE POLICY "Admins can update pending school updates"
  ON public.pending_school_updates
  FOR UPDATE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pending school updates"
  ON public.pending_school_updates
  FOR DELETE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Make former_students.school_id nullable so students without a school can be approved
ALTER TABLE public.former_students ALTER COLUMN school_id DROP NOT NULL;
