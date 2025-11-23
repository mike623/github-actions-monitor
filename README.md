# GitHub Actions Monitor

A full-stack web application to monitor GitHub Actions workflows for selected repositories.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: NextAuth.js (v5) with GitHub Provider
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM

## Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env.local` file with the following variables:
    ```env
    NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
    DATABASE_URL="postgres://postgres:[password]@db.[project].supabase.co:5432/postgres"
    ```
4.  **Database Migration**:
    Push the schema to your Supabase database:
    ```bash
    npx drizzle-kit push
    ```
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Features

- **Authentication**: Sign in with GitHub.
- **Repository Selection**: Search and add repositories to monitor.
- **Workflow Monitoring**: View the latest workflow runs for monitored repositories.
- **Auto-Refresh**: Workflow status updates automatically.
