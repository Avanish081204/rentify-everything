-- Create rental_listings table for users to list their items
CREATE TABLE public.rental_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  purchase_price NUMERIC(10, 2),
  duration TEXT NOT NULL,
  location TEXT NOT NULL,
  condition TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  available_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  free_delivery BOOLEAN DEFAULT false,
  insurance BOOLEAN DEFAULT false,
  instant_booking BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_listings ENABLE ROW LEVEL SECURITY;

-- Policies for rental_listings
CREATE POLICY "Anyone can view active listings" 
ON public.rental_listings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own listings" 
ON public.rental_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON public.rental_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" 
ON public.rental_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_rental_listings_updated_at
BEFORE UPDATE ON public.rental_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_payments_updated_at();

-- Create index for better query performance
CREATE INDEX idx_rental_listings_user_id ON public.rental_listings(user_id);
CREATE INDEX idx_rental_listings_category ON public.rental_listings(category);
CREATE INDEX idx_rental_listings_is_active ON public.rental_listings(is_active);