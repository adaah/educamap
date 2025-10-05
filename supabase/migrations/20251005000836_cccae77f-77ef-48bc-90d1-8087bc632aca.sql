-- Add contributor field to instructors, former_students and schools for tracking who added the information
ALTER TABLE public.instructors ADD COLUMN contributor_name text;
ALTER TABLE public.former_students ADD COLUMN contributor_name text;
ALTER TABLE public.schools ADD COLUMN contributor_name text;