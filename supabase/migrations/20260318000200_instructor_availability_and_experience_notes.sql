-- Add additional info to experiences (former students) and pending experiences
ALTER TABLE public.former_students
ADD COLUMN IF NOT EXISTS additional_info text;

ALTER TABLE public.pending_former_students
ADD COLUMN IF NOT EXISTS additional_info text;

-- Instructor availability: shifts and periods are per-instructor (not per-school)
CREATE TABLE IF NOT EXISTS public.instructor_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  shift text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.instructor_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  period text NOT NULL
);

ALTER TABLE public.instructor_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_periods ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Instructor shifts are publicly readable" ON public.instructor_shifts;
CREATE POLICY "Instructor shifts are publicly readable"
ON public.instructor_shifts
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Instructor periods are publicly readable" ON public.instructor_periods;
CREATE POLICY "Instructor periods are publicly readable"
ON public.instructor_periods
FOR SELECT
USING (true);

-- Only admins can manage (consistent with other main tables)
DROP POLICY IF EXISTS "Only admins can manage instructor shifts" ON public.instructor_shifts;
CREATE POLICY "Only admins can manage instructor shifts"
ON public.instructor_shifts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can manage instructor periods" ON public.instructor_periods;
CREATE POLICY "Only admins can manage instructor periods"
ON public.instructor_periods
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instructor_shifts_instructor_id ON public.instructor_shifts(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_periods_instructor_id ON public.instructor_periods(instructor_id);

