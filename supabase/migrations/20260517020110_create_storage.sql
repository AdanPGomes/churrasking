insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'event-covers',
    'event-covers',
    true,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

create policy "authenticated users can upload event covers"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'event-covers');

create policy "public can read event covers"
    on storage.objects
    for select
    to public
    using (bucket_id = 'event-covers');

create policy "host can delete own event covers"
    on storage.objects
    for delete
    to authenticated
    using (
        bucket_id = 'event-covers'
        and auth.uid()::text = (storage.foldername(name))[1]
    );