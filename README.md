# CareNest AI

Maternal & infant care platform with pregnancy guidance and baby care logging.

## Features
- Pregnancy guidance (planning + pregnancy pages)
- Baby care mode: feeding/sleep tracking
- Vaccination schedule + completion tracking
- Nutrition guidance + health awareness
- JWT authentication + user profiles

## Tech stack
- Frontend: static HTML/CSS/JS (served with `live-server`)
- Backend: Node.js + Express
- Database: MongoDB (Atlas recommended)

## Repo structure
```
frontend/   # Static site (HTML/CSS/JS)
backend/    # Express API
docs/       # Project docs
```

## Local development

### 1) Backend
Create `backend/.env`:
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
PORT=5000
```

Run API:
```bash
cd backend
npm install
npm run dev
```

API health check: `http://localhost:5000/health`

### 2) Frontend
The frontend is a static site served via `live-server`.

```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:3000`

### 3) Configure API URL
Set the backend URL in [frontend/js/config.js](frontend/js/config.js) (usually `http://localhost:5000/api` for local dev).

## Free deployment (recommended)

### Frontend: Netlify
1. Push this repo to GitHub.
2. Netlify → **Add new site** → **Import from GitHub**.
3. Set:
	- Base directory: `frontend`
	- Build command: (empty)
	- Publish directory: `frontend`
4. Deploy.

### Backend: Render
1. Render → **New** → **Web Service** → connect your GitHub repo.
2. Set:
	- Root directory: `backend`
	- Build command: `npm install`
	- Start command: `npm start`
3. Add environment variables:
	- `MONGODB_URI`
	- `JWT_SECRET`
4. Deploy.

### Point frontend to backend
After you get your Render URL (e.g. `https://your-app.onrender.com`), update [frontend/js/config.js](frontend/js/config.js) so `API_BASE_URL` points to:
```text
https://your-app.onrender.com/api
```
Then redeploy Netlify.

## Notes
- The project includes API routes for `/api/ai`, but the AI Assistant UI page/link has been removed from the frontend.
