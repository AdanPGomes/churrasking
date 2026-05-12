create table public.guests (
    id          uuid        primary key default gen_random_uuid(),
    event_id    uuid        not null references public.events(id) on delete cascade,
    name        text        not null,
    email       text        not null,
    rsvp_status text        not null default 'pending',
                            check (rsvp_status in ('pending', 'confirmed', 'declined')),
    created_at  timestamptz not null default now(),

    -- OWASP A04: prevents guest impersonation via duplicate registration
    constraint guests_event_email_unique unique (event_id, email)
);

-- Lookup all guests for an event (guest list)
create index guests_event_id_idx on public.guests(event_id);
-- Lookup all guests by email (upsert  session resolution)
create index guests_event_emil_idx on public.guests(event_id, email);

alter table public.guests enable row level security;

create policy "guests: public read"
    on public.guests
    for select
    using (true);

create policy "guests: public insert"
    on public.guests
    for insert
    with check (true);

-- Guests update are scoped in application layer via signed HMAC cookie
-- RLS allow update; the server action validates the cookie before calling DB
-- OWASP A04: cookie is HMAC-signed - tampered cookies are rejected server-side
create policy "guests: public update"
    on public.guests
    for update
    using (true);

create policy "guests: host delete"
    on public.guests
    for delete
    using (
        exists (
            select 1 from public.events
            where events.id = guests.event_id
            and events.host_id = auth.uid()
        )
    );