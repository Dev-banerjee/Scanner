<div align="center">

  <img src="dashboard/public/logo.svg" alt="VerseScan Logo" width="300" />

  # 🛠️ Contributor Setup Guide

  **Everything you need to clone, configure, and run VerseScan locally.**

</div>

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Step 1 — Clone the Repository](#-step-1--clone-the-repository)
- [Step 2 — Set Up Environment Variables](#-step-2--set-up-environment-variables)
- [Step 3 — Set Up the Backend (Scanner Engine)](#-step-3--set-up-the-backend-scanner-engine)
- [Step 4 — Set Up the Frontend (Dashboard)](#-step-4--set-up-the-frontend-dashboard)
- [Step 5 — Run the Vulnerable Test App (Optional)](#-step-5--run-the-vulnerable-test-app-optional)
- [Step 6 — Run Everything Together](#-step-6--run-everything-together)
- [Project Structure](#-project-structure)
- [Database Setup (Supabase)](#-database-setup-supabase)
- [Git Workflow for Contributors](#-git-workflow-for-contributors)
- [Troubleshooting](#-troubleshooting)

---

## ✅ Prerequisites

Make sure you have these installed **before** cloning:

| Tool | Version | Check Command | Install Link |
| :--- | :--- | :--- | :--- |
| **Git** | Any recent | `git --version` | [git-scm.com](https://git-scm.com/) |
| **Node.js** | v18+ (LTS recommended) | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ (comes with Node) | `npm --version` | — |
| **Python** | 3.10+ | `python --version` | [python.org](https://www.python.org/) |
| **pip** | Latest | `pip --version` | — |

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/AdityaGupta32/Scanner.git
cd Scanner
```

---

## 🔐 Step 2 — Set Up Environment Variables

> [!CAUTION]
> **NEVER** commit `.env`, `.env.local`, or any file containing real API keys.
> These files are already listed in `.gitignore` — do not remove them from there.

The project uses **two** separate environment files. We provide `.env.example` templates — copy them and fill in the actual values.

### 2a. Scanner Engine (Backend)

```bash
cd scanner-engine
cp .env.example .env
```

Open `scanner-engine/.env` and fill in your **Supabase credentials**:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_service_role_key_here
```

> [!IMPORTANT]
> The backend requires the **service_role** (secret) key from Supabase, **not** the anon key.
> Go to your Supabase dashboard → **Settings → API → service_role key**.

### 2b. Dashboard (Frontend)

```bash
cd ../dashboard
cp .env.example .env.local
```

Open `dashboard/.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> [!NOTE]
> The frontend uses the **anon/public** key (not the service_role key).
> Go to your Supabase dashboard → **Settings → API → anon/public key**.

### Where to Get Credentials

Ask the project owner (Aditya Gupta) to share the Supabase credentials with you securely (e.g., via DM, not in a public channel). Alternatively, you can create your own Supabase project for testing — see [Database Setup](#-database-setup-supabase).

---

## ⚙️ Step 3 — Set Up the Backend (Scanner Engine)

```bash
cd scanner-engine
```

### 3a. Create a Virtual Environment (Recommended)

```bash
# Create venv
python -m venv venv

# Activate it
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Windows (CMD):
.\venv\Scripts\activate.bat

# macOS / Linux:
source venv/bin/activate
```

### 3b. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3c. Install Playwright Browsers

```bash
playwright install
```

> [!NOTE]
> This downloads Chromium, Firefox, and WebKit browsers (~400 MB total).
> It's required for the authenticated scanning feature.

### 3d. Start the Backend

```bash
python main.py
```

✅ Backend runs at **http://localhost:8000**

You should see:
```
[✓] Supabase Connected
INFO:     Uvicorn running on http://0.0.0.0:8000
```

If Supabase credentials are missing, it will still run with in-memory storage:
```
[!] Warning: Supabase Credentials missing. Using in-memory storage.
```

---

## 🎨 Step 4 — Set Up the Frontend (Dashboard)

Open a **new terminal** (keep the backend running):

```bash
cd dashboard
```

### 4a. Install Node Dependencies

```bash
npm install
```

### 4b. Start the Development Server

```bash
npm run dev
```

✅ Dashboard runs at **http://localhost:3000**

---

## 🎯 Step 5 — Run the Vulnerable Test App (Optional)

The project includes a deliberately vulnerable web app for testing the scanner. Open a **third terminal**:

```bash
# From the project root
python vulnerable_app.py
```

✅ Vulnerable app runs at **http://localhost:8081**

You can use `http://localhost:8081` as the target URL in the dashboard to test scanning.

---

## 🚀 Step 6 — Run Everything Together

### Option A: Manual (3 terminals)

| Terminal | Command | URL |
| :--- | :--- | :--- |
| Terminal 1 | `cd scanner-engine && python main.py` | http://localhost:8000 |
| Terminal 2 | `cd dashboard && npm run dev` | http://localhost:3000 |
| Terminal 3 | `python vulnerable_app.py` | http://localhost:8081 |

### Option B: PowerShell Script (Windows only)

From the project root:

```powershell
.\start_all.ps1
```

This launches all three components in separate PowerShell windows.

---

## 📁 Project Structure

```
Scanner/
├── dashboard/                 # Next.js 16 frontend
│   ├── app/                   #   App router pages
│   ├── components/            #   React components
│   ├── lib/                   #   Supabase client & utilities
│   ├── public/                #   Static assets (logo, etc.)
│   ├── .env.example           #   ← Template (safe to commit)
│   ├── .env.local             #   ← YOUR secrets (git-ignored)
│   └── package.json
│
├── scanner-engine/            # Python FastAPI backend
│   ├── main.py                #   API server + scan orchestrator
│   ├── spider.py              #   Web crawler
│   ├── scanner.py             #   Vulnerability detection engine
│   ├── authenticator.py       #   Login automation (Playwright)
│   ├── report_generator.py    #   PDF report builder
│   ├── schema.sql             #   Supabase table definitions
│   ├── .env.example           #   ← Template (safe to commit)
│   ├── .env                   #   ← YOUR secrets (git-ignored)
│   └── requirements.txt
│
├── vulnerable_app.py          # Intentionally vulnerable target for testing
├── start_all.ps1              # Windows: launch all services
├── .gitignore                 # Ignores .env files, node_modules, etc.
└── README.md
```

---

## 🗄️ Database Setup (Supabase)

If you're setting up your **own** Supabase project (instead of using shared credentials):

### 1. Create a Free Supabase Project

Go to [supabase.com](https://supabase.com/) → New Project.

### 2. Run the Schema SQL

In your Supabase dashboard, go to **SQL Editor** and paste the contents of [`scanner-engine/schema.sql`](scanner-engine/schema.sql):

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Scans Table
create table scans (
  id uuid default uuid_generate_v4() primary key,
  target_url text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  crawled_count integer default 0,
  vulnerability_count integer default 0,
  user_id uuid
);

-- Vulnerabilities Table
create table vulnerabilities (
  id uuid default uuid_generate_v4() primary key,
  scan_id uuid references scans(id) on delete cascade,
  name text not null,
  severity text not null,
  url text not null,
  param text,
  payload text,
  evidence text,
  cwe text,
  description text,
  remediation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table scans enable row level security;
alter table vulnerabilities enable row level security;

-- Open policies (for development/demo)
create policy "Enable read/insert for all" on scans for all using (true) with check (true);
create policy "Enable read/insert for all" on vulnerabilities for all using (true) with check (true);
```

### 3. Copy Your Keys

From **Settings → API**, copy:
- **Project URL** → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for dashboard)
- **service_role key** → `SUPABASE_KEY` (for backend)

---

## 🔀 Git Workflow for Contributors

### Branch Naming

```
feature/your-feature-name
fix/bug-description
docs/what-you-documented
```

### Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/my-awesome-feature

# 2. Make your changes
# ...

# 3. Stage & commit
git add .
git commit -m "feat: add awesome feature"

# 4. Push your branch
git push origin feature/my-awesome-feature

# 5. Open a Pull Request on GitHub
```

### Commit Message Convention

| Prefix | Use For |
| :--- | :--- |
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `style:` | Formatting (no logic change) |
| `refactor:` | Code restructuring |
| `test:` | Adding/updating tests |
| `chore:` | Build scripts, configs, etc. |

> [!WARNING]
> **Before pushing**, always double-check you haven't accidentally staged any `.env` files:
> ```bash
> git status
> ```
> If you see any `.env` file listed, **remove it** from staging:
> ```bash
> git reset HEAD path/to/.env
> ```

---

## 🐛 Troubleshooting

### "Supabase Credentials missing" warning
- Make sure you created the `.env` file (not just `.env.example`)
- Check that the variable names match exactly: `SUPABASE_URL` and `SUPABASE_KEY`

### `playwright install` fails
- Make sure Python is 3.10+
- Try running as administrator (Windows) or with `sudo` (Linux/Mac)
- If behind a proxy, set `HTTPS_PROXY` environment variable

### `npm install` fails in dashboard
- Delete `node_modules/` and `package-lock.json`, then retry:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Make sure Node.js is v18+

### Port already in use
- Backend (8000): `npx kill-port 8000` or find/kill the process
- Dashboard (3000): `npx kill-port 3000`
- Vulnerable App (8081): `npx kill-port 8081`

### CORS errors in the browser
- Make sure the backend is running on `http://localhost:8000`
- Check that `NEXT_PUBLIC_API_URL` in `dashboard/.env.local` is set to `http://localhost:8000`

---

<div align="center">

  **Questions?** Reach out to the team or open an issue on GitHub.

  Built with 💜 by Team VerseScan

</div>
