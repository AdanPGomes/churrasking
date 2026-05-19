drop view if exists public.event_summary;
drop view if exists public.host_stats;

create view public.event_summary
    with (security_invoker = true)
as
select
    e.id,
    e.host_id,
    e.title,
    e.slug,
    e.date,
    e.location,
    e.cover_url,
    e.created_at,
    count(g.id)                                             as total_guests,
    count(g.id) filter (where g.rsvp_status = 'confirmed')  as confirmed_guests,
    count(g.id) filter (where g.rsvp_status = 'declined')   as declined_guests,
    count(g.id) filter (where g.rsvp_status = 'pending')    as pending_guests
from public.events e
left join public.guests g on g.event_id = e.id
group by e.id;

grant select on public.event_summary to authenticated;

create view public.host_stats
    with (security_invoker = true)
as
select
    e.host_id,
    count(distinct e.id)                                    as total_events,
    count(distinct case when e.date < now() then e.id end)  as past_events,
    count(distinct g.id)                                    as total_guests,
    round(
        avg(
            case
                when g.rsvp_status = 'confirmed'
                then 1.0 else 0.0
            end
        ) * 100
    )                                                       as confirmation_rate
from public.events e
left join public.guests g on g.event_id = e.id
group by e.host_id;

grant select on public.host_stats to authenticated;