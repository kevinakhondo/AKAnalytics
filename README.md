# A & K Analytics

B2B data analytics consultancy website with a React customer portal and admin portal, backed by an Express API.

## Project structure

```
├── *.html            # Static marketing pages (Vite entry points)
├── *.css             # Per-page stylesheets
├── auth.js           # Browser-compatible auth module (CDN globals)
├── Images/           # Site images (hero.webp, etc.)
├── src/
│   ├── App.jsx       # Customer portal React SPA
│   ├── App-admin.jsx # Admin portal React SPA
│   ├── main.jsx      # Customer portal entry
│   ├── main-admin.jsx# Admin portal entry
│   ├── auth.js       # Auth module (ES module, for React)
│   └── styles.css    # Portal styles
├── vite.config.js
├── netlify.toml
└── package.json
```

## Local development

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Environment variables

The backend URL is hardcoded to `https://a-k-analytics-backend.onrender.com`. If you run the backend locally, update `API_BASE_URL` in both `auth.js` and `src/auth.js`.

### Run dev server

```bash
npm run dev
```

Vite starts on `http://localhost:5173`. All 19 HTML pages are served at their filenames (e.g. `/about.html`, `/customer-portal.html`).

### Build

```bash
npm run build
```

Output goes to `dist/`. All pages are output flat at the root of `dist/`.

## Deploy

The site deploys automatically to Netlify on push to `main`.

- Build command: `npm run build`
- Publish directory: `dist`
- The catch-all redirect in `netlify.toml` routes unknown paths to `index.html`

**First-visit cold starts**: the backend (Render free tier) may take 30–60 s to wake up. The customer portal retries the profile fetch automatically up to 3 times with exponential back-off.

## Backend

Hosted at `https://a-k-analytics-backend.onrender.com` (Express + MongoDB on Render).

Endpoints used:

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/users/login` | — |
| GET | `/api/users/profile` | Bearer token |
| GET | `/api/customer/dashboard` | Bearer token |
| GET | `/api/customer/analytics` | Bearer token |
| GET/POST/DELETE | `/api/customer/bookings` | Bearer token |
| POST | `/api/customer/upload` | Bearer token |
| POST | `/api/customer/db-connect` | Bearer token |
| GET | `/api/admin/users` | Admin token |
| PATCH | `/api/admin/users/:id` | Admin token |
| GET | `/api/admin/bookings` | Admin token |

## Authentication

JWT tokens are stored under the `aka_token` localStorage key (namespaced to avoid collisions with other apps on the same domain). User ID and email are stored under `aka_userId` and `aka_email`.

## Key dependencies

| Package | Purpose |
|---------|---------|
| React 18 | Customer and admin portals |
| Vite | Build tool and dev server |
| socket.io-client | Live chat |
| axios | HTTP requests |
| dompurify | XSS prevention |
| i18next | Internationalisation (EN/ES) |
