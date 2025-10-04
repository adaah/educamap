-- Enable INSERT on schools table for anonymous users
CREATE POLICY "Anyone can insert schools"
ON public.schools
FOR INSERT
TO anon
WITH CHECK (true);

-- Enable INSERT on school_shifts table
CREATE POLICY "Anyone can insert school shifts"
ON public.school_shifts
FOR INSERT
TO anon
WITH CHECK (true);

-- Enable INSERT on school_periods table
CREATE POLICY "Anyone can insert school periods"
ON public.school_periods
FOR INSERT
TO anon
WITH CHECK (true);

-- Enable INSERT on school_subjects table
CREATE POLICY "Anyone can insert school subjects"
ON public.school_subjects
FOR INSERT
TO anon
WITH CHECK (true);

-- Enable INSERT on instructors table
CREATE POLICY "Anyone can insert instructors"
ON public.instructors
FOR INSERT
TO anon
WITH CHECK (true);

-- Enable INSERT on former_students table
CREATE POLICY "Anyone can insert former students"
ON public.former_students
FOR INSERT
TO anon
WITH CHECK (true);