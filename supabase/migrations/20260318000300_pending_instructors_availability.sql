-- Store instructor availability at submission time
ALTER TABLE public.pending_instructors
ADD COLUMN IF NOT EXISTS shifts text[],
ADD COLUMN IF NOT EXISTS periods text[];

