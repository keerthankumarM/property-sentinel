REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE POLICY "own newspaper files read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'newspapers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own newspaper files insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'newspapers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own newspaper files delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'newspapers' AND auth.uid()::text = (storage.foldername(name))[1]);