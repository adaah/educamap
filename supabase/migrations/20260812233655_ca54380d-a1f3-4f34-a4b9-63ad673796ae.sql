ALTER TABLE public.pending_schools ADD COLUMN IF NOT EXISTS submission_group_id uuid;
ALTER TABLE public.pending_school_updates ADD COLUMN IF NOT EXISTS submission_group_id uuid;
ALTER TABLE public.pending_instructors ADD COLUMN IF NOT EXISTS submission_group_id uuid;
ALTER TABLE public.pending_former_students ADD COLUMN IF NOT EXISTS submission_group_id uuid;

CREATE INDEX IF NOT EXISTS idx_pending_schools_group ON public.pending_schools (submission_group_id);
CREATE INDEX IF NOT EXISTS idx_pending_school_updates_group ON public.pending_school_updates (submission_group_id);
CREATE INDEX IF NOT EXISTS idx_pending_instructors_group ON public.pending_instructors (submission_group_id);
CREATE INDEX IF NOT EXISTS idx_pending_former_students_group ON public.pending_former_students (submission_group_id);