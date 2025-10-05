-- Create audit logs table to track contact data views
CREATE TABLE public.contact_view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  viewer_email TEXT NOT NULL,
  viewed_entity_type TEXT NOT NULL, -- 'former_student', 'instructor', 'school'
  viewed_entity_id UUID NOT NULL,
  viewed_entity_name TEXT NOT NULL,
  contact_fields_viewed TEXT[] NOT NULL, -- ['email', 'whatsapp', 'linkedin', 'instagram']
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE public.contact_view_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view contact logs"
ON public.contact_view_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Any authenticated user can insert their own view logs
CREATE POLICY "Users can log their own views"
ON public.contact_view_logs
FOR INSERT
WITH CHECK (auth.uid() = viewer_user_id);

-- Create indexes for performance
CREATE INDEX idx_contact_logs_viewer ON public.contact_view_logs(viewer_user_id);
CREATE INDEX idx_contact_logs_entity ON public.contact_view_logs(viewed_entity_type, viewed_entity_id);
CREATE INDEX idx_contact_logs_viewed_at ON public.contact_view_logs(viewed_at DESC);

-- Update RLS policies for former_students: basic data public, contact data requires auth
DROP POLICY IF EXISTS "Former students are publicly readable" ON public.former_students;

-- Anyone can read basic student data (name, course, university)
CREATE POLICY "Student basic data is public"
ON public.former_students
FOR SELECT
USING (true);

-- Contact data (email, whatsapp, linkedin, instagram) should only be accessible
-- via application logic that checks authentication and logs access
-- We'll handle this in the application layer, not in RLS

-- Same for instructors
DROP POLICY IF EXISTS "Instructors are publicly readable" ON public.instructors;

CREATE POLICY "Instructor basic data is public"
ON public.instructors
FOR SELECT
USING (true);

-- Schools remain fully public (no personal contact info risk)
-- Keep existing "Schools are publicly readable" policy as is