-- Create the 'documents' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Allow public read access" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to upload" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow owners to update and delete" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

CREATE POLICY "Allow owners to delete" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid()); 