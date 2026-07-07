# KGBHSian Group Members Data — Full Stack App

A React frontend + Node/Express backend for registering KGBHSian alumni,
storing their data in a real database, showing a public member directory,
and emailing each member their ID card as a JPG via Gmail.

## What's inside

```
kgbhsian-app/
├── backend/          Express API + JSON-file database + Gmail sender
│   ├── server.js     API routes
│   ├── db.js         Simple dependency-free database (kgbhsian.db.json)
│   ├── mailer.js      Sends the card via Gmail (Nodemailer)
│   ├── package.json
│   └── .env.example  Copy to .env and fill in your values
│
└── frontend/         React app (Vite)
    ├── src/App.jsx                    Tab navigation + live counter
    ├── src/components/RegisterForm.jsx  The registration form + card generator
    ├── src/components/MemberCard.jsx    The visual ID card
    ├── src/components/Directory.jsx     Public member directory with search
    ├── public/crest.png                 School crest
    └── package.json
```

## How it works

1. A member fills the form. The browser renders their ID card into a JPG
   (using html2canvas) and sends the form data + JPG to the backend.
2. The backend saves the record to `backend/kgbhsian.db.json` (a plain JSON
   file acting as the database — no separate database server needed) and
   emails the JPG to the member via Gmail.
3. Anyone can open the **Member Directory** tab to see everyone who has
   registered (name, batch, designation, blood group, location — phone,
   email, and full address are kept private, visible only via the admin
   export).

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `GMAIL_USER` — the Gmail address that will send cards
- `GMAIL_APP_PASSWORD` — an **App Password**, not your normal Gmail password.
  Generate one at https://myaccount.google.com/apppasswords
  (requires 2-Step Verification enabled on that Google account)
- `ADMIN_TOKEN` — make up a long random string; protects the CSV export

Start it:
```bash
npm start
```
It runs on `http://localhost:4000` by default.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
It runs on `http://localhost:5173` and proxies `/api/*` requests to the
backend automatically (see `vite.config.js`).

Open `http://localhost:5173` in your browser — you should see the form.

### 3. Production build

```bash
cd frontend
npm run build
```
This outputs static files to `frontend/dist/`. Serve them with any static
host (Netlify, Vercel, Nginx, etc.), and point your web server or the
static host's redirect rules so that requests to `/api/*` are forwarded
to wherever you deploy the `backend/` folder (e.g. Render, Railway, a VPS,
or an Express `express.static()` setup serving both from one process).

## API reference

| Method | Route                  | Description                                  |
|--------|-------------------------|-----------------------------------------------|
| POST   | `/api/members`          | Register a member (also triggers the email)   |
| GET    | `/api/members`          | Public directory (safe fields only)           |
| GET    | `/api/members/count`    | Total registered members                      |
| GET    | `/api/admin/export?token=...` | Full CSV export (name, phone, email, address, etc.) — requires `ADMIN_TOKEN` |
| GET    | `/api/health`           | Health check                                  |

## Notes and limits

- **Database**: `kgbhsian.db.json` is a plain file, which is perfectly fine
  for an alumni group's scale (hundreds to a few thousand members). If you
  outgrow it later, the `db.js` module is the only file you'd need to swap
  out for a real database (e.g. Postgres) — the rest of the app doesn't
  care how storage works internally.
- **Email limits**: a regular Gmail account can send roughly 100 emails/day.
  Fine for steady registrations; if you expect a big rush at once, consider
  a transactional email service (e.g. SendGrid, Postmark) instead of Gmail —
  `mailer.js` is a small, isolated file so swapping providers is
  straightforward.
- **Privacy**: the public directory intentionally hides phone, email, and
  full address. Only the admin CSV export (token-protected) includes those.
