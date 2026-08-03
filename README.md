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

## Clone And Folder Structure

Clone the frontend and backend into the same parent folder so the project stays in the expected local layout:

```powershell
mkdir NGOs
cd NGOs
git clone https://github.com/Munyeshya/ngo-frontend.git
git clone https://github.com/Munyeshya/ngo-backend.git
```

Recommended structure:

```text
NGOs/
  ngo-frontend/
  ngo-backend/
```

Run frontend commands inside `ngo-frontend` and backend commands inside `ngo-backend`.

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
VITE_API_BASE_URL=http://127.0.0.1:8000
```

This value is read once from the shared API config module at `src/api/config.js`.

The frontend builds the final API root internally as:

```text
${VITE_API_BASE_URL}/api
```

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
- Staff portal for project workspaces, evidence-backed updates, spending tables, and impact monitoring
- Admin portal for users, staff verification, project approval, partners, analytics, and reported projects
- Printable project transparency reports that can be saved as PDF

## Key Behaviors

- Public project browsing always stays public, even when someone is logged in
- Donors can donate with or without creating an account first
- Staff can register and log in, but project creation requires approved verification
- New staff projects require admin approval before becoming public or accepting donations
- Admin handles oversight, moderation, partner management, and analytics
- Staff submits itemized cashout requests; admin approval records spending and publishes the public update
- Impact targets and dated measurements appear in staff and public project views
- Toast feedback is used for short-lived action messages

## Verification

```powershell
npm run lint
npm run build
```

The printable report route is `/projects/:projectId/transparency-report`.

## Notes

- Real `.env` files are intentionally ignored and should stay local
- `node_modules/` and `dist/` are intentionally local and should not be committed
- If you change `VITE_API_BASE_URL`, restart the dev server
