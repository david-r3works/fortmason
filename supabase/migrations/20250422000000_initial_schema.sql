-- Fort Mason Landowners Association — Initial Schema
-- Run in Supabase SQL Editor or via `supabase db push`

create extension if not exists "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Extends auth.users; created automatically via trigger on signup
create table public.users (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text unique not null,
  full_name       text not null,
  property_address text,
  role            text not null default 'resident'
                    check (role in ('resident', 'board', 'admin')),
  approved        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ─── THREADS ─────────────────────────────────────────────────────────────────
create table public.threads (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  body        text not null,
  category    text not null
                check (category in ('announcements','general','events','safety','maintenance','classifieds')),
  author_id   uuid references public.users(id) on delete set null,
  pinned      boolean not null default false,
  locked      boolean not null default false,
  view_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── POSTS (replies) ─────────────────────────────────────────────────────────
create table public.posts (
  id          uuid primary key default uuid_generate_v4(),
  thread_id   uuid references public.threads(id) on delete cascade not null,
  author_id   uuid references public.users(id) on delete set null,
  body        text not null,
  like_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── DOCUMENTS ───────────────────────────────────────────────────────────────
create table public.documents (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  category    text not null
                check (category in ('budgets','reports','audits','tax','assessments','reserves')),
  year        integer not null,
  file_path   text not null,
  file_size   bigint not null,
  status      text check (status in ('new','updated')),
  uploaded_by uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── MEETINGS ────────────────────────────────────────────────────────────────
create table public.meetings (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  date        date not null,
  time        text not null,
  location    text not null,
  status      text not null default 'upcoming'
                check (status in ('upcoming','past')),
  created_at  timestamptz not null default now()
);

create table public.meeting_attachments (
  id          uuid primary key default uuid_generate_v4(),
  meeting_id  uuid references public.meetings(id) on delete cascade not null,
  label       text not null,
  file_path   text not null,
  created_at  timestamptz not null default now()
);

create table public.meeting_rsvps (
  id          uuid primary key default uuid_generate_v4(),
  meeting_id  uuid references public.meetings(id) on delete cascade not null,
  user_id     uuid references public.users(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(meeting_id, user_id)
);

-- ─── NEIGHBORHOOD STATUS ─────────────────────────────────────────────────────
create table public.status_items (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  category    text not null check (category in ('facilities','infrastructure')),
  status      text not null default 'ok' check (status in ('ok','warn','alert')),
  description text not null,
  icon        text not null default '🏠',
  updated_by  uuid references public.users(id) on delete set null,
  updated_at  timestamptz not null default now()
);

create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text not null,
  progress    integer not null default 0 check (progress >= 0 and progress <= 100),
  budget      numeric(12,2),
  status      text not null default 'active'
                check (status in ('active','planned','completed')),
  created_at  timestamptz not null default now()
);

create table public.issue_reports (
  id          uuid primary key default uuid_generate_v4(),
  body        text not null,
  submitted_by uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  resolved    boolean not null default false
);

-- ─── CORRESPONDENCE ──────────────────────────────────────────────────────────
create table public.correspondence (
  id          uuid primary key default uuid_generate_v4(),
  subject     text not null,
  body        text not null,
  sent_by     uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── NOTIFICATION SUBSCRIPTIONS ──────────────────────────────────────────────
create table public.notification_subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.users(id) on delete cascade not null unique,
  meetings        boolean not null default true,
  announcements   boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ─── ENABLE RLS ──────────────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.threads enable row level security;
alter table public.posts enable row level security;
alter table public.documents enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_attachments enable row level security;
alter table public.meeting_rsvps enable row level security;
alter table public.status_items enable row level security;
alter table public.projects enable row level security;
alter table public.issue_reports enable row level security;
alter table public.correspondence enable row level security;
alter table public.notification_subscriptions enable row level security;

-- ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
create or replace function public.is_board_or_admin()
returns boolean language sql security definer as $$
  select coalesce(
    (select role in ('board','admin') from public.users where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_approved()
returns boolean language sql security definer as $$
  select coalesce(
    (select approved from public.users where id = auth.uid()),
    false
  );
$$;

-- ─── RLS POLICIES: USERS ─────────────────────────────────────────────────────
create policy "Authenticated users can read all users"
  on public.users for select
  using (auth.uid() is not null);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Board can update any user"
  on public.users for update
  using (public.is_board_or_admin());

-- ─── RLS POLICIES: THREADS ───────────────────────────────────────────────────
create policy "Authenticated users can read threads"
  on public.threads for select
  using (auth.uid() is not null);

create policy "Approved users can create threads"
  on public.threads for insert
  with check (public.is_approved());

create policy "Authors and board can update threads"
  on public.threads for update
  using (author_id = auth.uid() or public.is_board_or_admin());

create policy "Board can delete threads"
  on public.threads for delete
  using (public.is_board_or_admin());

-- ─── RLS POLICIES: POSTS ─────────────────────────────────────────────────────
create policy "Authenticated users can read posts"
  on public.posts for select
  using (auth.uid() is not null);

create policy "Approved users can create posts"
  on public.posts for insert
  with check (public.is_approved());

create policy "Authors and board can update posts"
  on public.posts for update
  using (author_id = auth.uid() or public.is_board_or_admin());

create policy "Board can delete posts"
  on public.posts for delete
  using (public.is_board_or_admin());

-- ─── RLS POLICIES: DOCUMENTS ─────────────────────────────────────────────────
create policy "Authenticated users can read documents"
  on public.documents for select
  using (auth.uid() is not null);

create policy "Board can insert documents"
  on public.documents for insert
  with check (public.is_board_or_admin());

create policy "Board can update documents"
  on public.documents for update
  using (public.is_board_or_admin());

create policy "Board can delete documents"
  on public.documents for delete
  using (public.is_board_or_admin());

-- ─── RLS POLICIES: MEETINGS ──────────────────────────────────────────────────
create policy "Authenticated users can read meetings"
  on public.meetings for select
  using (auth.uid() is not null);

create policy "Board can manage meetings"
  on public.meetings for all
  using (public.is_board_or_admin());

create policy "Authenticated users can read meeting attachments"
  on public.meeting_attachments for select
  using (auth.uid() is not null);

create policy "Board can manage meeting attachments"
  on public.meeting_attachments for all
  using (public.is_board_or_admin());

create policy "Users can read RSVPs"
  on public.meeting_rsvps for select
  using (auth.uid() is not null);

create policy "Users can RSVP"
  on public.meeting_rsvps for insert
  with check (user_id = auth.uid() and public.is_approved());

create policy "Users can cancel their RSVP"
  on public.meeting_rsvps for delete
  using (user_id = auth.uid());

-- ─── RLS POLICIES: STATUS ────────────────────────────────────────────────────
create policy "Authenticated users can read status items"
  on public.status_items for select
  using (auth.uid() is not null);

create policy "Board can manage status items"
  on public.status_items for all
  using (public.is_board_or_admin());

create policy "Authenticated users can read projects"
  on public.projects for select
  using (auth.uid() is not null);

create policy "Board can manage projects"
  on public.projects for all
  using (public.is_board_or_admin());

-- ─── RLS POLICIES: ISSUE REPORTS ─────────────────────────────────────────────
create policy "Users can submit issue reports"
  on public.issue_reports for insert
  with check (submitted_by = auth.uid() and public.is_approved());

create policy "Users can read own reports; board reads all"
  on public.issue_reports for select
  using (submitted_by = auth.uid() or public.is_board_or_admin());

create policy "Board can update issue reports"
  on public.issue_reports for update
  using (public.is_board_or_admin());

-- ─── RLS POLICIES: CORRESPONDENCE ────────────────────────────────────────────
create policy "Authenticated users can read correspondence"
  on public.correspondence for select
  using (auth.uid() is not null);

create policy "Board can send correspondence"
  on public.correspondence for insert
  with check (public.is_board_or_admin());

-- ─── RLS POLICIES: SUBSCRIPTIONS ─────────────────────────────────────────────
create policy "Users manage own subscriptions"
  on public.notification_subscriptions for all
  using (user_id = auth.uid());

-- ─── TRIGGER: create user profile on signup ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, property_address, approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'property_address',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── SEED DATA ────────────────────────────────────────────────────────────────
-- Status items (facilities)
insert into public.status_items (name, category, status, description, icon) values
  ('Community Pool',              'facilities',      'ok',   'Open daily 6 AM–10 PM. Summer schedule (Memorial Day–Labor Day): 6 AM–midnight. Guest passes: 2 per household per week.', '🏊'),
  ('Tennis Courts',               'facilities',      'ok',   'All 4 courts operational. Court 2 net replaced March 15. Reserve via the community app or call (555) 234-5678.', '🎾'),
  ('Common Area Landscaping',     'facilities',      'ok',   'Weekly maintenance on schedule. Spring planting in progress along main boulevard. Irrigation system tested and ready.', '🌳'),
  ('Community Center',            'facilities',      'ok',   'Open Mon–Sat 8 AM–9 PM, Sun 10 AM–6 PM. Room reservations: 2-week advance notice required. Contact office@fortmason.info.', '🏠'),
  ('Main Entrance Gate',          'facilities',      'warn', 'Operational. Access codes updated March 30. If your code isn''t working, contact property management for re-sync.', '🚪'),
  ('Oak Lane (Road)',             'infrastructure',  'warn', 'Resurfacing scheduled April 22–24. Road closed to through traffic. Emergency access maintained. Est. completion: April 24.', '🛣️'),
  ('Street Lighting',             'infrastructure',  'ok',   'All 47 street lights operational. One light at Maple/3rd reported out Apr 5 — city repair scheduled for April 18.', '💡'),
  ('Irrigation & Water',          'infrastructure',  'ok',   'Common area irrigation fully operational. Annual spring activation completed April 1. No leaks reported.', '🚰'),
  ('Community WiFi (Pool/Clubhouse)', 'infrastructure', 'ok', 'Network "FortMason-Guest" active. Password distributed to registered members. Contact tech@fortmason.info for access issues.', '📡'),
  ('Trash & Recycling',           'infrastructure',  'ok',   'Regular pickup: Tuesdays & Fridays. Bulk item pickup: 3rd Saturday of the month. Request special pickup at (555) 100-2000.', '🗑️');

-- Active projects
insert into public.projects (name, description, progress, budget, status) values
  ('Oak Lane Resurfacing',        'Phase 1 of 2. Contractor: Southwest Paving. Apr 22–24.',   15,  28400.00, 'active'),
  ('Boulevard Tree Planting',     'Spring 2025 — 12 new oaks planned along main boulevard.',   58,   4200.00, 'active'),
  ('Pool Deck Refinishing',       'Planned for Aug 2025. Soliciting contractor bids.',           5,      null, 'planned');

-- Upcoming meeting
insert into public.meetings (title, date, time, location, status) values
  ('Regular Board Meeting — May 2025',      '2025-05-13', '7:00 PM',  'Community Center, Room B',   'upcoming'),
  ('Regular Board Meeting — April 2025',    '2025-04-08', '7:00 PM',  'Community Center, Room B',   'past'),
  ('Regular Board Meeting — March 2025',    '2025-03-11', '7:00 PM',  'Community Center, Room B',   'past'),
  ('Regular Board Meeting — February 2025', '2025-02-11', '7:00 PM',  'Community Center, Room B',   'past'),
  ('Annual Meeting — January 2025 (Budget Ratification)', '2025-01-14', '6:30 PM', 'Community Center, Main Hall', 'past');
