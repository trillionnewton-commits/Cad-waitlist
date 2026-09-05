# AIM Landing Page — CAD Waitlist

Waitlist signups are stored in **Supabase** and exported to **Excel (.xlsx)**.

## Deployed site

GitHub Pages: `https://trillionnewton-commits.github.io/Cad-waitlist/`

```
Landingpage/
├── index.html          Landing page (waitlist forms → Supabase)
├── admin.html          Excel export page (service_role key, in-memory only)
├── assets/
│   ├── css/style.css   All styles
│   ├── js/config.js    Supabase URL + publishable key
│   └── js/main.js      All interactions + form submit
├── sql/schema.sql      Supabase table + policies (run once in SQL Editor)
├── server/             Optional local dev server (static files)
└── archive/            Old single-file version (backup)
```

## One-time setup (already applied to code, run SQL in Supabase)

1. Supabase Dashboard → **SQL Editor** → New query
2. Paste the contents of `sql/schema.sql` → **Run**

## How data flows

1. Visitor submits email + store URL on the landing page
2. Form POSTs to Supabase REST (`waitlist` table, upsert on email)
3. "You're #N in line" comes from the `waitlist_count()` RPC (no data exposed)

## Getting signups into Excel

- **Option A (quick):** Supabase Dashboard → Table Editor → `waitlist` → **Download CSV** (opens in Excel)
- **Option B (button):** open `/admin.html` on the deployed site, paste your `service_role` key, click **Download Excel (.xlsx)**

## Local run (optional)

```
cd server
npm start        # http://localhost:8000
```

## Placeholders still to replace in index.html

1. `YOUR_BOOKING_LINK` (popup step 2 booking button) → your Calendly / Google Calendar link
2. `https://wa.me/91XXXXXXXXXX?text=...` → your real WhatsApp number
