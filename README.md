# JobConnect

A job recruitment platform with three roles: **Candidate**, **Recruiter**, and **Admin**.

**Live demo:** https://jobconnect-red.vercel.app

## Stack

- **Frontend:** React (JavaScript, Vite), Tailwind CSS v4, React Router, Axios
- **Backend:** Node.js, Express 5, MongoDB with Mongoose
- **Auth:** JWT + bcrypt (`bcryptjs`)

## Getting started

Requires Node.js 20+ and a running MongoDB instance.

```bash
# Backend (http://localhost:5000)
cd server
cp .env.example .env    # then edit values
npm install
npm run dev

# Frontend (http://localhost:5173)
cd client
npm install
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

### Demo data (development only)

```bash
cd server
npm run seed         # clear the demo data and recreate it (safe to repeat)
npm run seed:clear   # only remove the demo data
```

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `SEED_DEMO_PASSWORD` in `server/.env` first (see
`.env.example`). The seed creates fictional recruiters, candidates, companies, jobs and applications
in every status; demo accounts use `@jobconnect-demo.test` emails and share `SEED_DEMO_PASSWORD`.
Only those records are ever deleted. It refuses to run when `NODE_ENV=production` or when
`MONGO_URI` is not a local database.

In development the client proxies `/api` requests to the backend.

## Deployment (Vercel + MongoDB Atlas)

The repo deploys as a single Vercel project: `vercel.json` builds `client/` as the static site and
`api/index.js` runs the Express app as a serverless function on the same domain. Every push to
`main` redeploys automatically.

Set these in the Vercel project (Settings → Environment Variables), then redeploy:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Atlas `mongodb+srv://` connection string, including the database name |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `CLIENT_URL` | the site's own URL, e.g. `https://jobconnect-red.vercel.app` |

Atlas must allow connections from `0.0.0.0/0` (Network Access), since Vercel has no fixed IPs.
