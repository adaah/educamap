-- Enable realtime for schools table
ALTER TABLE public.schools REPLICA IDENTITY FULL;

-- Add schools to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.schools;