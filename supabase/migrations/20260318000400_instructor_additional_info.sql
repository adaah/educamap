-- Store additional info per instructor (and at submission time)
ALTER TABLE public.instructors
ADD COLUMN IF NOT EXISTS additional_info text;

ALTER TABLE public.pending_instructors
ADD COLUMN IF NOT EXISTS additional_info text;

