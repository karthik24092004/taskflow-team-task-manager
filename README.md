# TaskFlow — Team Task Manager

A full-stack team task management app built with React, TypeScript, and Supabase.
Built as part of the Ethera AI campus recruitment assessment.

## Live Demo
https://taskflow-team-task-manager-production-b093.up.railway.app

---

## What I Built

TaskFlow helps teams manage projects and tasks with role-based access control.
Admins can create and manage everything. Members can view and update their assigned tasks.

---

## Features

- Signup / Login with role selection
- Admin and Member roles with different permissions
- Create, edit and delete projects
- Add and remove team members from projects
- Create tasks with title, description, priority, due date and assignee
- Filter tasks by status, priority and team member
- Dashboard with project and task analytics
- Overdue task highlighting
- Activity feed showing recent team actions
- Fully responsive on mobile and desktop

---

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + REST API)
- React Router
- Vite
- Deployed on Railway

---

## Database Tables

- profiles — stores user info and roles
- projects — project records
- project_members — links users to projects
- tasks — task records with status and priority
- activity_logs — tracks all actions

Row Level Security is enabled on all tables.

---

## Running Locally

Clone the repo and run:

    cd team-task-manager
    npm install
    npm run dev

Add a .env file with:

    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_anon_key

---

## Folder Structure

    src/
    ├── components/   UI components
    ├── context/      Auth context
    ├── hooks/        Data fetching hooks
    ├── pages/        App pages
    ├── lib/          Supabase client
    └── types/        TypeScript types

---

Built by Gurram Karthik Reddy
