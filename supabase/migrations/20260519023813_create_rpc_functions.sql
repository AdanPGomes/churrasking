create or replace function public.create_event_with_items(
    p_host_id       uuid,
    p_title         text,
    p_description   text,
    p_date          timestamptz,
    p_location      text,
    p_slug          text,
    p_cover_url     text,
    p_items         jsonb
)
returns table (id uuid, slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_event_id      uuid;
    v_slug          text;
begin
    insert into public.events (
        host_id,
        title,
        description,
        date,
        location,
        slug,
        cover_url
    )
    values (
        p_host_id,
        p_title,
        p_description,
        p_date,
        p_location,
        p_slug,
        p_cover_url
    )
    returning events.id, events.slug
    into v_event_id, v_slug;

    if jsonb_array_length(p_items) > 0 then
        insert into public.items (event_id, name, estimated_cost, created_by_host)
        select
            v_event_id,
            (item->>'name')::text,
            (item->>'estimated_cost')::numeric,
            true
        from jsonb_array_elements(p_items) as item;
    end if;

    return query select v_event_id, v_slug;
end;
$$;

create or replace function public.claim_item(
    p_item_id       uuid,
    p_guest_id      uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if exists (
        select 1 from public.items
        where id = p_item_id and assigned_guest_id is not null
    ) then raise exception 'Item already claimed' using errcode = 'P0001';
    end if;

    update public.items
    set assigned_guest_id = p_guest_id
    where id = p_item_id;
end;
$$;

create or replace function public.unclaim_item(
    p_item_id       uuid,
    p_guest_id      uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not exists (
        select 1 from public.items
        where id = p_item_id and assigned_guest_id = p_guest_id
    ) then raise exception 'Item not claimed by this guest' using errcode = 'P0002';
    end if;

    update public.items
    set assigned_guest_id = null
    where id = p_item_id;
end;
$$;