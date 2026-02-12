# 🚀 Smart Bookmark App

A real-time bookmark manager built with Next.js (App Router) and Supabase.

Users can:
- 🔐 Sign in with Google
- ➕ Add bookmarks
- ❌ Delete their own bookmarks
- ⚡ See updates instantly (real-time sync across tabs)

---

## 🛠 Tech Stack

- Next.js 14 (App Router)
- Supabase (Auth + Postgres + Realtime)
- Tailwind CSS
- Vercel (Deployment)

---

## ✨ Features

### 🔐 Authentication
- Google OAuth using Supabase
- Session persists across tabs

### 📚 Bookmark Management
- Add new bookmarks
- Delete your own bookmarks
- Each user only sees their own data (RLS enabled)

### ⚡ Real-Time Updates
- Bookmarks update instantly
- Open two tabs → add in one → appears in other

---

## 🗄 Database Schema (Supabase)

Table: `bookmarks`

| Column      | Type      |
|------------|----------|
| id         | uuid (PK) |
| user_id    | uuid (FK → auth.users) |
| title      | text |
| url        | text |
| created_at | timestamp |

Row Level Security (RLS) enabled with policies:
- Users can SELECT their own bookmarks
- Users can INSERT their own bookmarks
- Users can DELETE their own bookmarks

---

## ⚙️ Local Setup

1️⃣ Clone the repo

```bash
git clone https://github.com/Inscoding/smart-bookmark-app.git
cd smart-bookmark-app
