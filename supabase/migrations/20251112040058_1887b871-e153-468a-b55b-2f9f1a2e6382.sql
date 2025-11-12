-- Add status column to rental_listings for approval workflow
ALTER TABLE public.rental_listings 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add check constraint for valid status values
ALTER TABLE public.rental_listings
ADD CONSTRAINT rental_listings_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing listings to approved status
UPDATE public.rental_listings 
SET status = 'approved' 
WHERE status = 'pending';

-- Update RLS policy to only show approved listings publicly
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.rental_listings;

CREATE POLICY "Anyone can view approved listings" 
ON public.rental_listings 
FOR SELECT 
USING (status = 'approved' AND is_active = true);

-- Allow admins to view all listings
CREATE POLICY "Admins can view all listings" 
ON public.rental_listings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to view their own listings regardless of status
CREATE POLICY "Users can view own listings" 
ON public.rental_listings 
FOR SELECT 
USING (auth.uid() = user_id);