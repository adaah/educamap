-- Add user_id to former_students and instructors tables to link them to auth users
ALTER TABLE public.former_students ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.instructors ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create contact_requests table for managing access requests
CREATE TABLE public.contact_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_email text NOT NULL,
  requester_name text,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('former_student', 'instructor', 'school')),
  entity_id uuid NOT NULL,
  entity_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  UNIQUE(requester_user_id, entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Users can create requests
CREATE POLICY "Users can create contact requests"
ON public.contact_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_user_id);

-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (auth.uid() = requester_user_id OR auth.uid() = owner_user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Owners can update requests (approve/deny)
CREATE POLICY "Owners can respond to requests"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete requests
CREATE POLICY "Admins can delete requests"
ON public.contact_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_contact_requests_owner ON public.contact_requests(owner_user_id, status);
CREATE INDEX idx_contact_requests_requester ON public.contact_requests(requester_user_id, status);