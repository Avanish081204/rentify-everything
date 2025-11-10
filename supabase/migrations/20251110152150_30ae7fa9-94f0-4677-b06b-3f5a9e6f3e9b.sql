-- Create storage bucket for rental listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('rental-images', 'rental-images', true);

-- Create storage policies for rental images
CREATE POLICY "Anyone can view rental images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'rental-images');

CREATE POLICY "Authenticated users can upload rental images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'rental-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own rental images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'rental-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own rental images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'rental-images' AND auth.uid() IS NOT NULL);