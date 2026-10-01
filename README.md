# JobConnect

A job recruitment platform with three roles: **Candidate**, **Recruiter**, and **Admin**.

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
