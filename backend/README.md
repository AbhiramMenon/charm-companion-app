# KrackIT Backend

Supabase-backed database and API layer for the KrackIT platform.

## Architecture

```
Admin App (Vite)          Mobile App (TanStack Start)
     │                            │
     │ uses adminApi.ts           │ uses mobileApi.ts
     │ (is_admin RLS role)        │ (per-user RLS)
     └────────┐     ┌────────────┘
              ▼     ▼
         Supabase Project
         ├── PostgreSQL DB (RLS enforced)
         ├── Supabase Auth (JWT)
         └── Realtime channels
```

**Key principle:** Admin and mobile never communicate directly.
Admin writes to DB → DB triggers update counts/aggregates → Mobile reads from DB.

---

## Setup (one-time)

### 1. Create a Supabase project

Go to https://supabase.com → New project → note the project URL and API keys.

### 2. Run migrations

In the Supabase SQL editor (or via Supabase CLI), run these files **in order**:

```
supabase/migrations/001_schema.sql    ← Tables, indexes
supabase/migrations/002_rls.sql       ← Row Level Security policies
supabase/migrations/003_functions.sql ← Triggers, functions, views
supabase/seed.sql                     ← Initial content data
```

Or with the Supabase CLI:
```bash
supabase db push
```

### 3. Create the first admin user

In Supabase SQL editor, after signing up via the admin app:

```sql
-- Replace with the UUID from auth.users for your admin email
UPDATE user_profiles SET is_admin = TRUE WHERE id = 'YOUR-USER-UUID';
```

### 4. Configure env files

**Admin app:**
```bash
cd admin
cp .env.example .env
# Edit .env — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

**Mobile app:**
```bash
cd charm-companion-app-main
cp .env.example .env
# Edit .env — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

Both apps use the **anon key** (not service role). Write access for admin operations
is controlled by the `is_admin` flag in `user_profiles` via the `is_admin()` RLS helper.

### 5. Install Supabase client packages

```bash
# Admin app
cd admin
npm install @supabase/supabase-js

# Mobile app
cd charm-companion-app-main
npm install @supabase/supabase-js
```

---

## Database Schema

| Table                   | Purpose                                         |
|-------------------------|-------------------------------------------------|
| `exams`                 | Exam catalog (UPSC, SSC, NEET, JEE, CAT, IBPS) |
| `subjects`              | Subjects per exam                               |
| `chapters`              | Chapters per subject                            |
| `topics`                | Topics per chapter                              |
| `tricks`                | Mnemonic tricks (FTS indexed)                   |
| `short_notes`           | Study notes per topic                           |
| `exam_news`             | News/notifications per exam                     |
| `exam_pricing`          | Subscription pricing per exam                   |
| `trick_of_day`          | Daily scheduled trick                           |
| `app_settings`          | App identity, team, social links (singleton)    |
| `user_profiles`         | Extends auth.users — tier, streak, progress     |
| `subscriptions`         | User subscription records                       |
| `user_progress`         | Per-user per-trick viewed/mastered state        |
| `user_bookmarks`        | Saved tricks per user                           |
| `user_ratings`          | Individual star ratings                         |
| `trick_ratings`         | Aggregated ratings (updated by trigger)         |
| `support_issues`        | User-submitted support requests                 |
| `push_notifications`    | Admin-created notifications                     |
| `notification_deliveries` | Per-user delivery + read tracking             |

---

## Database Triggers (automatic cascade)

| Event                    | Trigger                        | Effect                                    |
|--------------------------|--------------------------------|-------------------------------------------|
| `auth.users` INSERT      | `handle_new_user()`            | Creates `user_profiles` row               |
| `user_ratings` change    | `update_trick_rating()`        | Recalculates `trick_ratings` aggregates   |
| `tricks` INSERT/DELETE   | `update_topic_tricks_count()`  | Updates `topics.tricks_count`             |
| `topics` count change    | `update_chapter_tricks_count()`| Updates `chapters.tricks_count`           |
| `chapters` INSERT/DELETE | `update_subject_chapters_count`| Updates `subjects.chapters_count`         |
| `subjects` INSERT/DELETE | `update_exam_counts()`         | Updates `exams.subjects_count + tricks_count` |
| `user_progress` change   | `update_user_tricks_learned()` | Updates `user_profiles.tricks_learned`    |
| `subscriptions` change   | `on_subscription_change()`     | Updates `user_profiles.tier`              |

---

## Views (for Analytics)

| View                 | Purpose                              |
|----------------------|--------------------------------------|
| `v_content_stats`    | Total counts for all content tables  |
| `v_user_stats`       | User/subscription aggregates         |
| `v_revenue_by_exam`  | Revenue breakdown per exam           |
| `v_tricks_by_difficulty` | Trick count by difficulty level  |
| `v_top_rated_tricks` | Top 20 tricks by average rating      |

---

## API Library (`backend/src/`)

The shared TypeScript API library can be used directly in both apps:

```typescript
import { createMobileClient, createKrackitApi } from './backend/src/api';

const sb  = createMobileClient(url, anonKey);
const api = createKrackitApi(sb);

// Content
const exams  = await api.exams.list();
const tricks = await api.tricks.list('topic-id');
const found  = await api.tricks.search('mughal emperors');

// User
await api.progress.markViewed(userId, trickId);
await api.ratings.rate(userId, trickId, 5);
await api.bookmarks.toggle(userId, trickId);

// Subscriptions
const subs    = await api.subscriptions.getActiveForUser(userId);
const examIds = await api.subscriptions.getSubscribedExamIds(userId);

// Admin-only (fails with RLS for non-admins)
const stats  = await api.analytics.userStats();
const revenue= await api.analytics.revenueByExam();
```

---

## Security Model

| Actor            | Auth mechanism          | RLS access                                      |
|------------------|-------------------------|-------------------------------------------------|
| Mobile user      | Supabase Auth JWT       | Own rows only; read public content              |
| Admin user       | Supabase Auth + is_admin| Full CRUD on all tables via `is_admin()` check  |
| Unauthenticated  | Anon key                | Read `exam_pricing`, `app_settings` only        |

**Rate limiting:** Supabase applies per-project rate limits at the API gateway level.
Additional app-level rate limiting (existing `security.ts`) remains in place for the mobile auth flow.

---

## Adding a New Table (migration pattern)

1. Add CREATE TABLE to a new `00N_feature.sql` migration file
2. Add RLS policies (enable RLS + `SELECT`/`INSERT`/etc. policies)
3. Add types to `backend/src/types.ts`
4. Add API module to `backend/src/api/`
5. Export from `backend/src/api/index.ts`

---

## Scheduled Jobs

Run `expire_stale_subscriptions()` daily to flip expired subscriptions to `expired`:

```sql
SELECT cron.schedule('expire-subs', '0 0 * * *', 'SELECT expire_stale_subscriptions()');
```

Requires `pg_cron` extension (enable in Supabase dashboard → Extensions).
Alternatively, call it from a Supabase Edge Function on a schedule.
