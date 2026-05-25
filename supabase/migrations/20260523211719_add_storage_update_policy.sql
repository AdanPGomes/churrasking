create policy "event-covers: host update"
    on storage.objects
    for update
    to authenticated
    using (
        bucket_id = 'event-covers'
        and auth.uid()::text = (storage.foldername(name))[1]
    );