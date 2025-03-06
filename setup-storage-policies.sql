-- Enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to the documents bucket
CREATE POLICY "Allow public read access for documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Policy to allow authenticated users to upload to the documents bucket
CREATE POLICY "Allow authenticated users to upload to documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy to allow authenticated users to update their own objects
CREATE POLICY "Allow authenticated users to update their own objects in documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- Policy to allow authenticated users to delete their own objects
CREATE POLICY "Allow authenticated users to delete their own objects in documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- For development purposes, you can also create a policy that allows anonymous uploads
-- CAUTION: Only use this for development/testing, not in production
CREATE POLICY "Allow anonymous uploads to documents"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'documents');

-- For development purposes, you can also create a policy that allows anonymous updates
-- CAUTION: Only use this for development/testing, not in production
CREATE POLICY "Allow anonymous updates to documents"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'documents');

-- For development purposes, you can also create a policy that allows anonymous deletes
-- CAUTION: Only use this for development/testing, not in production
CREATE POLICY "Allow anonymous deletes from documents"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'documents'); 