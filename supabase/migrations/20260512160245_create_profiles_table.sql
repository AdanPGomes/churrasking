create table public.profiles (
    id          uuid            primary key references auth.users(id) on delete cascade,
    name        text            not null,
    avatar_url  text,
    created_at  timestamptz     default now()
);

alter table public.profiles enable row level security;

create policy "profiles: public read"
    on public.profiles
    for select
    using (true);

create policy "profiles: owner update"
    on public.profiles
    for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();