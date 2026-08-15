# Mariam Hakro — Full-Stack Portfolio

A personal portfolio and professional profile website with a real backend: **Node.js + Express + Supabase (Postgres)**, JWT-authenticated admin panel, and a blog.

```
mariam-hakro-portfolio/
├── frontend/            # Static site: HTML, CSS, vanilla JS (served by the backend, or deployed standalone)
│   ├── index.html
│   ├── blog.html / blog-post.html
│   ├── admin/            # Login + content management dashboard
│   ├── css/ js/ resume/ assets/
│   └── README.md          # Frontend-specific notes (content editing, replacing placeholders)
└── backend/              # Express API + Supabase (Postgres)
    ├── src/
    │   ├── server.js       # Entry point — serves the API AND (in local dev) the frontend static files
    │   ├── db.js            # Supabase client
    │   ├── seedData.js       # Default content + admin user seeding
    │   ├── middleware/auth.js
    │   └── routes/            # auth, content, messages, data-reset
    ├── api/index.js            # Vercel serverless entry point
    ├── vercel.json               # Vercel routing config
    ├── supabase-schema.sql        # Run once in the Supabase SQL editor
    ├── package.json
    └── .env.example
```

## Quick Start

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free project, then open **SQL Editor -> New query**, paste the contents of `backend/supabase-schema.sql`, and run it. This creates the `content`, `messages`, and `admin_users` tables.

From **Settings -> API**, copy your **Project URL** and **service_role** secret key (not the `anon` key — the backend needs the service role key to write data).

### 2. Configure and run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a real `JWT_SECRET`. Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then seed the database (one-time) and start the server:

```bash
npm run seed    # creates default content + the admin user in Supabase
npm start       # http://localhost:4000
```

Open **http://localhost:4000** — that's it in local dev. One server serves both the site and the API, so there's nothing to configure on the frontend side and no CORS setup needed.

- **Public site:** http://localhost:4000
- **Blog:** http://localhost:4000/blog.html
- **Admin login:** http://localhost:4000/admin/login.html

### Default admin credentials

Set in `backend/.env` before running `npm run seed` for the first time:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Change `ADMIN_PASSWORD` before deploying anywhere public.** The seed script only creates the admin user once — if you change the password in `.env` after the user already exists, delete the row in Supabase's Table Editor (`admin_users` table) and re-run `npm run seed`.

## How It Works

- **Content** (profile, skills, projects, experience, education, certifications, services, testimonials, blog posts) is stored as JSONB in a `content` table in Supabase, one row per section — simple to reason about, easy to extend.
- **Auth** is real: passwords are hashed with bcrypt, login issues a signed JWT (12h expiry), and every write endpoint (`PUT /api/content/:key`, `POST /api/data/reset`, and all of `/api/messages` except the public submit) requires a valid `Authorization: Bearer <token>` header. Login is rate-limited per IP. The backend talks to Supabase with the `service_role` key, which bypasses Row Level Security — the browser never talks to Supabase directly.
- **Contact messages** go to their own `messages` table via `POST /api/messages` (public — no auth needed to submit, matching a real contact form), and are only readable/manageable by an authenticated admin.
- The frontend (`frontend/js/data.js`) fetches all content once on page load into memory, then the same render code just reads from that cache.

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/content` | Public | All content sections at once |
| GET | `/api/content/:key` | Public | One section (`profile`, `skills`, `projects`, …) |
| PUT | `/api/content/:key` | Admin | Replace a section |
| POST | `/api/auth/login` | Public | `{ username, password }` → `{ token }` |
| POST | `/api/messages` | Public | Submit a contact form message |
| GET | `/api/messages` | Admin | List all messages |
| PATCH | `/api/messages/:id` | Admin | Mark a message read |
| DELETE | `/api/messages/:id` | Admin | Delete a message |
| POST | `/api/data/reset` | Admin | Reset all content to the seed defaults |
| GET | `/api/health` | Public | Health check |

## Development

```bash
cd backend
npm run dev   # restarts on file changes (Node's built-in --watch)
```

Since the frontend is plain HTML/CSS/JS with no build step, editing files under `frontend/` takes effect on the next page refresh — no bundler, no rebuild.

## Deploying on Vercel

Because content and messages now live in Supabase instead of a local SQLite file, the backend is stateless and safe to run as Vercel serverless functions — deploy frontend and backend as **two separate Vercel projects**:

**Backend project** (root directory: `backend/`)
1. Push this repo to GitHub, then import it into Vercel and set the project's **Root Directory** to `backend`.
2. Add environment variables in Vercel's project settings: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `CORS_ORIGIN` (set this to your frontend's Vercel URL once you have it, e.g. `https://mariam-hakro-portfolio.vercel.app`).
3. Deploy. Vercel picks up `backend/api/index.js` automatically as the serverless function. Run `npm run seed` **once**, locally, pointed at the same Supabase project, before or after this deploy — it only needs to run once, not on every deploy.
4. Your API is now live at `https://your-backend.vercel.app/api/...`.

**Frontend project** (root directory: `frontend/`)
1. Import the same repo again as a second Vercel project, with **Root Directory** set to `frontend`. It's a static site — no build command needed.
2. In `frontend/index.html`, `blog.html`, `blog-post.html`, `admin/login.html`, and `admin/dashboard.html`, uncomment the `window.PORTFOLIO_API_BASE` script tag right before the `data.js` include, and set it to your backend's URL, e.g.:
   ```html
   <script>window.PORTFOLIO_API_BASE = "https://your-backend.vercel.app/api";</script>
   ```
3. Deploy. Your site is now live at `https://your-frontend.vercel.app`.

Other stateful-process hosts (Render, Railway, a VPS) still work fine too if you'd rather run one process serving both frontend and backend together — just set the same environment variables and run `npm install && npm start` (run `npm run seed` once beforehand).

## Security Notes

- Passwords are bcrypt-hashed, never stored in plaintext.
- JWTs expire after 12 hours; there's currently no refresh-token flow, so the admin just logs in again after that.
- Login attempts are rate-limited (8 per minute per IP) to slow down brute-forcing.
- `helmet` is enabled for standard security headers.
- Input on the contact form and content endpoints is validated server-side, not just in the browser.
- Row Level Security is enabled on all Supabase tables with no policies granted to `anon`/`authenticated` — only the backend, using the `service_role` key, can read or write. Never expose that key to the frontend.
- There's a single admin account. If you want multiple editors with different permissions, the `admin_users` table is there to extend, but role-based access isn't built out.
- CORS defaults to wide open when `CORS_ORIGIN` is unset (fine for same-origin local dev). Set `CORS_ORIGIN` to your exact frontend URL once you deploy the two projects separately.

## What Changed from the Static/SQLite Versions

- `frontend/js/data.js` — was a localStorage wrapper, is now a `fetch`-based API client with an in-memory cache and a configurable `API_BASE`.
- `backend/src/db.js` — was a local SQLite file (`better-sqlite3`), is now a Supabase (Postgres) client.
- Admin login — was a hardcoded check in the browser; is now a real `/api/auth/login` call against hashed passwords stored in Supabase.
- Contact form — now `POST`s to `/api/messages` and is stored in Supabase, readable only by an authenticated admin.
- Content edits in the admin panel — persist centrally in Supabase and are visible to every visitor, from any device.
- Seeding moved out of server startup into a one-time `npm run seed` step, so cold starts on serverless platforms don't hit the database unnecessarily.
