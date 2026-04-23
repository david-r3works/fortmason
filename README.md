# Fort Mason Landowners Association — fortmason.info

Full-stack community portal for the Fort Mason Landowners Association.

**Stack:** Next.js 14 (App Router) · Supabase (Auth + Postgres + Storage) · Tailwind CSS · Vercel

---

## Features

| Feature | Description |
|---------|-------------|
| **Auth** | Email/password, Google OAuth, Apple OAuth; board-approval workflow |
| **Dashboard** | Activity feed, upcoming events, stats, neighborhood status summary |
| **Message Board** | Category-filtered threads, nested replies, like/react, pin/lock (board) |
| **Financial Docs** | Folder grid, searchable table, drag-and-drop upload (board), signed-URL downloads |
| **Board Meetings** | Meeting list, RSVP, PDF attachments, board panel, correspondence feed |
| **Neighborhood Status** | Facility/infrastructure status, active projects, issue reporting |
| **Archive** | Links to Wayback Machine snapshots of the previous site |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- (Optional) A [Vercel](https://vercel.com) account for deployment

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd fortmason
npm install
```

### 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Settings → API**, copy your Project URL and anon key.
3. In **Settings → API**, copy your service role key (keep this secret).

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the database migration

In your Supabase project, go to **SQL Editor** and run the contents of:

```
supabase/migrations/20250422000000_initial_schema.sql
```

This creates all tables, RLS policies, triggers, and seed data.

### 5. Create the Storage bucket

In Supabase **Storage**, create a bucket named `documents` with the following settings:
- **Public:** No (private)
- Allow uploads from authenticated users (set via RLS — see below)

Add these storage RLS policies in the SQL editor:

```sql
-- Allow authenticated users to read documents
create policy "Authenticated users can read documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid() is not null);

-- Allow board members to upload
create policy "Board can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('board', 'admin')
    )
  );

-- Allow board members to delete
create policy "Board can delete documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents' and
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('board', 'admin')
    )
  );
```

### 6. Configure OAuth providers (optional)

**Google:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `https://your-project-ref.supabase.co/auth/v1/callback` as an authorized redirect URI
4. In Supabase **Auth → Providers → Google**, enter your Client ID and Client Secret

**Apple:**
1. Go to [developer.apple.com](https://developer.apple.com) → Certificates, IDs & Profiles
2. Create a Services ID with Sign In with Apple enabled
3. Add `https://your-project-ref.supabase.co/auth/v1/callback` as a return URL
4. In Supabase **Auth → Providers → Apple**, enter your credentials

### 7. Configure auth redirect URLs

In Supabase **Auth → URL Configuration**:
- **Site URL:** `http://localhost:3000` (dev) or `https://fortmason.info` (prod)
- **Redirect URLs:** Add `http://localhost:3000/auth/callback` and `https://fortmason.info/auth/callback`

### 8. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 9. Create your first user and approve it

1. Register an account at `/register`
2. In Supabase **Table Editor → users**, set `role = 'admin'` and `approved = true` on your user
3. Sign in — you'll have full admin access

---

## Approve New Users (Board Workflow)

When a user registers:
1. They get a "pending approval" screen
2. A board member opens **Supabase Table Editor → users**
3. Sets `approved = true` for the user
4. The user can then log in

> **Tip:** Build a simple admin page at `/admin/users` (not yet implemented) for one-click approvals.

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin fortmason
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Framework: **Next.js** (auto-detected)
3. Add all environment variables from `.env.local` **plus**:
   ```
   NEXT_PUBLIC_SITE_URL=https://fortmason.info
   ```

### 3. Configure domain

In Vercel **Project → Settings → Domains**, add `fortmason.info` and follow the DNS instructions.

### 4. Update Supabase redirect URLs

Add `https://fortmason.info/auth/callback` to Supabase **Auth → URL Configuration → Redirect URLs**.

---

## Deploy Edge Functions (Email Notifications)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the notification function
supabase functions deploy send-notification
```

Then set the function's environment variables in Supabase **Edge Functions → send-notification → Secrets**.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (server only) | Service role key — keep secret |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical URL (`https://fortmason.info` in prod) |

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Resident profiles (extends `auth.users`) |
| `threads` | Message board posts |
| `posts` | Thread replies |
| `documents` | Financial document metadata |
| `meetings` | Board meeting records |
| `meeting_attachments` | PDFs per meeting |
| `meeting_rsvps` | RSVP records |
| `status_items` | Facility/infrastructure status |
| `projects` | Active community projects |
| `issue_reports` | Resident-submitted issues |
| `correspondence` | Board announcements |
| `notification_subscriptions` | Email preferences |

---

## Roles & Permissions

| Permission | Resident | Board | Admin |
|-----------|----------|-------|-------|
| Read everything | ✅ | ✅ | ✅ |
| Post threads & replies | ✅ | ✅ | ✅ |
| Submit issue reports | ✅ | ✅ | ✅ |
| RSVP to meetings | ✅ | ✅ | ✅ |
| Upload documents | — | ✅ | ✅ |
| Post meeting records | — | ✅ | ✅ |
| Update status items | — | ✅ | ✅ |
| Send correspondence | — | ✅ | ✅ |
| Pin / lock threads | — | ✅ | ✅ |
| Approve new users | — | ✅ | ✅ |
| Manage all users | — | — | ✅ |

---

## Contact

- Board: [board@fortmason.info](mailto:board@fortmason.info)
- Office: [office@fortmason.info](mailto:office@fortmason.info)
- Tech support: [tech@fortmason.info](mailto:tech@fortmason.info)
