# TaskFlow — Team Task Manager

A production-ready, full-stack Team Task Manager with role-based access control. Built with React + TypeScript + Tailwind CSS + Supabase.

![TaskFlow](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan) ![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

---

## Features

- **Authentication** — Signup/Login with Supabase Auth, secure session handling
- **Role-Based Access** — Admin and Member roles with granular permissions
- **Project Management** — Create, edit, delete projects with member management
- **Task Management** — Full CRUD with status, priority, due dates, and assignees
- **Dashboard Analytics** — Stats cards, progress visualization, recent activity
- **Responsive Design** — Works beautifully on mobile and desktop
- **Real-time Ready** — Built on Supabase (can enable real-time subscriptions)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Build | Vite |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Date Handling | date-fns |

## Role Permissions

| Feature | Admin | Member |
|---------|-------|--------|
| Create/Edit/Delete Projects | ✅ | ❌ |
| Add/Remove Project Members | ✅ | ❌ |
| Create/Edit/Delete Tasks | ✅ | ❌ |
| Assign Tasks to Members | ✅ | ❌ |
| View All Tasks | ✅ | ❌ |
| View Assigned Tasks | ✅ | ✅ |
| Update Own Task Status | ✅ | ✅ |
| Full Dashboard Analytics | ✅ | Personal only |

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd team-task-manager
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~2 minutes)
3. In the SQL Editor, run the entire contents of `supabase/schema.sql`
4. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Create Your First Admin Account

1. Go to `/signup`
2. Fill in your details and select **Admin** role
3. Start creating projects and tasks!

---

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx       # Route guard
│   ├── layout/
│   │   ├── AppLayout.tsx            # Main layout wrapper
│   │   ├── Sidebar.tsx              # Desktop sidebar nav
│   │   └── MobileNav.tsx            # Mobile header + drawer
│   ├── projects/
│   │   ├── ProjectCard.tsx          # Project grid card
│   │   └── ProjectForm.tsx          # Create/Edit modal
│   ├── tasks/
│   │   ├── TaskCard.tsx             # Task display card
│   │   ├── TaskForm.tsx             # Create/Edit modal
│   │   └── TaskBadges.tsx           # Status/Priority badges
│   └── ui/
│       ├── Avatar.tsx               # User initials avatar
│       ├── ConfirmDialog.tsx        # Delete confirmation
│       ├── EmptyState.tsx           # Empty state display
│       ├── LoadingSpinner.tsx       # Loading indicator
│       └── Modal.tsx                # Reusable modal
├── context/
│   └── AuthContext.tsx              # Auth state + helpers
├── hooks/
│   ├── useDashboard.ts              # Dashboard stats fetch
│   ├── useProjects.ts               # Project CRUD
│   ├── useTasks.ts                  # Task CRUD with filters
│   └── useTeam.ts                   # Team members fetch
├── lib/
│   └── supabase.ts                  # Supabase client
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   ├── TasksPage.tsx
│   └── TeamPage.tsx
├── types/
│   └── index.ts                     # TypeScript interfaces
├── App.tsx                          # Router setup
├── main.tsx                         # Entry point
└── index.css                        # Global styles + Tailwind
```

---

## Database Schema

### Tables

**profiles** — User profiles (extends auth.users)
- `id` UUID (FK → auth.users)
- `email`, `full_name`, `avatar_url`, `role`, `created_at`

**projects** — Project records
- `id`, `name`, `description`, `owner_id`, `created_at`, `updated_at`

**project_members** — Many-to-many projects ↔ users
- `id`, `project_id`, `user_id`, `joined_at`

**tasks** — Task records
- `id`, `title`, `description`, `project_id`, `assigned_to`, `created_by`
- `status` (todo | in_progress | completed)
- `priority` (low | medium | high)
- `due_date`, `created_at`, `updated_at`

**activity_logs** — Audit trail
- `id`, `user_id`, `action`, `entity_type`, `entity_id`, `entity_name`, `created_at`

---

## Deployment

### Netlify / Vercel

```bash
npm run build
# Upload the `dist/` folder to Netlify
# Or connect your GitHub repo to Vercel
```

Set environment variables in your hosting dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Railway

1. Connect GitHub repo to Railway
2. Set the build command: `npm run build`
3. Set the start command: `npm run preview` (or use a static file server)
4. Add environment variables

---

## Demo Accounts

After running the schema, create these accounts via the signup page:

| Email | Role | Password |
|-------|------|----------|
| admin@demo.com | Admin | demo1234 |
| member@demo.com | Member | demo1234 |

---

## License

MIT
