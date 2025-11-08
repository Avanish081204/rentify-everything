-- Change rental_id column type from UUID to TEXT
ALTER TABLE public.payments 
ALTER COLUMN rental_id TYPE TEXT;