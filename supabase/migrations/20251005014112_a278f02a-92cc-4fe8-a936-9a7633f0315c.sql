-- Create school_views table to track which schools users have visited
CREATE TABLE public.school_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, school_id)
);

-- Enable RLS
ALTER TABLE public.school_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own school views
CREATE POLICY "Users can view their own school views"
ON public.school_views
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own school views
CREATE POLICY "Users can insert their own school views"
ON public.school_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all school views
CREATE POLICY "Admins can view all school views"
ON public.school_views
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_school_views_user_id ON public.school_views(user_id, viewed_at DESC);
CREATE INDEX idx_school_views_school_id ON public.school_views(school_id);

-- Update viewed_at when user views the same school again
CREATE OR REPLACE FUNCTION public.upsert_school_view()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.school_views (user_id, school_id, viewed_at)
  VALUES (NEW.user_id, NEW.school_id, NOW())
  ON CONFLICT (user_id, school_id)
  DO UPDATE SET viewed_at = NOW();
  RETURN NEW;
END;
$$;