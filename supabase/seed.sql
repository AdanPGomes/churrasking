-- ==========================================================================
-- E2E Test Seed Data
-- ==========================================================================
-- Generated from `supabase db dump --local --data-only` after creating
-- users via the app UI. UUIDs replaced with fixed values for test clarity.
--
-- Host:  cd9d1822-... → 00000000-0000-0000-0000-000000000001
-- Guest: 80dcbca3-... → 00000000-0000-0000-0000-000000000002
-- Event:               → 00000000-0000-0000-0000-000000000003
-- Items:               → 00000000-0000-0000-0000-000000000004/5
-- ==========================================================================

SET session_replication_role = replica;
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- --------------------------------------------------------------------------
-- auth.users
-- --------------------------------------------------------------------------

INSERT INTO "auth"."users" (
    "instance_id", "id", "aud", "role", "email", "encrypted_password",
    "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at",
    "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change",
    "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data",
    "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at",
    "phone_change", "phone_change_token", "phone_change_sent_at",
    "email_change_token_current", "email_change_confirm_status", "banned_until",
    "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at",
    "is_anonymous"
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated',
    'host@test.churrasking.com',
    '$2a$10$CIYizaBqeXW5.3Jx8N9U3edeMPYYiGF6JorohRc/CdZGtt2yO7w1i',
    '2026-05-25 13:42:14.152487+00', NULL, '', NULL, '', NULL, '', '', NULL,
    '2026-05-25 13:42:14.172994+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"sub": "00000000-0000-0000-0000-000000000001", "name": "Test Host", "email": "host@test.churrasking.com", "email_verified": true, "phone_verified": false}',
    NULL, '2026-05-25 13:42:14.105064+00', '2026-05-25 13:42:14.180469+00',
NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated',
    'guest@test.churrasking.com',
    '$2a$10$ORq7KqRkAxeHCM1HMnRUoOx/1Q64I3T7S9BLWrLGmSKDkNitoLl82',
    '2026-05-25 13:42:47.998337+00', NULL, '', NULL, '', NULL, '', '', NULL,
    '2026-05-25 13:42:48.006331+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"sub": "00000000-0000-0000-0000-000000000002", "name": "Test Guest", "email": "guest@test.churrasking.com", "email_verified": true, "phone_verified": false}',
    NULL, '2026-05-25 13:42:47.992438+00', '2026-05-25 13:42:48.008419+00',
    NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false
);

-- --------------------------------------------------------------------------
-- auth.identities
-- --------------------------------------------------------------------------

INSERT INTO "auth"."identities" (
    "provider_id", "user_id", "identity_data", "provider",
    "last_sign_in_at", "created_at", "updated_at", "id"
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{"sub": "00000000-0000-0000-0000-000000000001", "name": "Test Host", "email": "host@test.churrasking.com", "email_verified": false, "phone_verified": false}',
    'email',
    '2026-05-25 13:42:14.138692+00', '2026-05-25 13:42:14.138726+00', '2026-05-25 13:42:14.138726+00',
    '00000000-0000-0000-0000-000000000011'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '{"sub": "00000000-0000-0000-0000-000000000002", "name": "Test Guest", "email": "guest@test.churrasking.com", "email_verified": false, "phone_verified": false}',
    'email',
    '2026-05-25 13:42:47.996466+00', '2026-05-25 13:42:47.99649+00', '2026-05-25 13:42:47.99649+00',
    '00000000-0000-0000-0000-000000000012'
);

-- --------------------------------------------------------------------------
-- public.profiles (created by trigger, but included for completeness)
-- --------------------------------------------------------------------------

INSERT INTO "public"."profiles" ("id", "name", "avatar_url", "created_at") VALUES
    ('00000000-0000-0000-0000-000000000001', 'Test Host', NULL, '2026-05-25 13:42:14.103006+00'),
    ('00000000-0000-0000-0000-000000000002', 'Test Guest', NULL, '2026-05-25 13:42:47.992212+00');

-- --------------------------------------------------------------------------
-- public.events (pre-created for guest flow tests)
-- --------------------------------------------------------------------------

INSERT INTO "public"."events" (
    "id", "host_id", "title", "description", "date", "location", "slug"
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Test BBQ',
    'A pre-created event for E2E testing.',
    (now() + interval '7 days')::timestamptz,
    'Test Location',
    'test-bbq-abc123'
);

-- --------------------------------------------------------------------------
-- public.items (attached to the test event)
-- --------------------------------------------------------------------------

INSERT INTO "public"."items" ("id", "event_id", "name", "estimated_cost", "created_by_host") VALUES
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Picanha 2kg', 150.00, true),
    ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'Carvão 5kg', 35.00, true);

-- --------------------------------------------------------------------------
-- Reset replication role
-- --------------------------------------------------------------------------

SET session_replication_role = DEFAULT;