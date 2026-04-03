# NGO Frontend

React + Vite frontend for the NGO management platform. It includes the public site, donor portal, staff workspace, admin oversight portal, and the frontend guide page at `/frontend-guide`.

## Stack

- React 19
- Vite
- React Router
- Axios
- Lucide icons

## Requirements

- Node.js 18+ recommended
- npm
- The backend running locally or at a reachable API URL

## Install

1. Install dependencies:

```powershell
npm install
```

2. Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

3. If needed, change the API URL in `.env`.

## Environment Variables

The frontend currently uses:

- `VITE_API_BASE_URL`

Default example:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

This value is read once from the shared API config module at `src/api/config.js`.

That shared config is then used by:

- `src/api/axios.js`
- `src/api/publicApi.js`

## Run In Development

```powershell
npm run dev
```

Default local frontend URL:

```text
http://localhost:5173
```

Important pages:

- Public site: `http://localhost:5173/`
- Frontend guide: `http://localhost:5173/frontend-guide`
- Login: `http://localhost:5173/login`
- Register: `http://localhost:5173/register`

## Build

```powershell
npm run build
```

Optional preview:

```powershell
npm run preview
```

## Main Product Areas

- Public pages for browsing projects, donating, reading updates, and reporting projects
- Donor portal for profile, donation history, and subscriptions
- Staff portal for verified project management and project-centered workspaces
- Admin portal for users, staff verification, partners, analytics, and reported projects

## Key Behaviors

- Public project browsing always stays public, even when someone is logged in
- Donors can donate with or without creating an account first
- Staff can register and log in, but project creation requires approved verification
- Admin handles oversight, moderation, partner management, and analytics
- Toast feedback is used for short-lived action messages

## Notes

- Real `.env` files are intentionally ignored and should stay local
- `node_modules/` and `dist/` are intentionally local and should not be committed
- If you change `VITE_API_BASE_URL`, restart the dev server
