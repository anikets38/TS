# TinyStep - Maternal & Infant Care Platform

Complete parenting care platform from pregnancy planning to baby care with AI-powered assistance.

## Features
- **Pregnancy Planning**: Fertility planning, cycle tracking, and conception guidance
- **Pregnancy Guide**: Trimester-by-trimester pregnancy tracking and guidance
- **Baby Care Mode**: Feeding and sleep tracking for infants
- **Vaccination Management**: Schedule and completion tracking with reminders
- **Nutrition Guidance**: Meal planning and nutritional recommendations
- **Health Awareness**: Health tips and medical information
- **AI Assistant**: Chatbot widget powered by n8n workflow (see included n8n JSON files)
- **User Authentication**: JWT-based secure authentication with user profiles

## Tech Stack
- **Frontend**: Static HTML/CSS/JavaScript (served with `live-server`)
- **Backend**: Node.js + Express + MongoDB
- **AI Integration**: n8n workflow automation (chatbot)
- **Database**: MongoDB (Atlas recommended)

## Repository Structure
```
frontend/            # Static site (HTML/CSS/JS)
  ├── pages/         # All HTML pages
  ├── css/           # Stylesheets
  ├── js/            # JavaScript modules
  └── assets/        # Images and media
backend/             # Express API
  ├── routes/        # API endpoints
  ├── models/        # MongoDB schemas
  └── middleware/    # Authentication middleware
n8n-chatbot-*.json   # n8n workflow configurations
```

## Local Development

### 1. Backend Setup
Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

Install dependencies and run the API:
```bash
cd backend
npm install
npm run dev
```

API health check: `http://localhost:5000/health`

### 2. Frontend Setup
The frontend is a static site served via `live-server`.

```bash
cd frontend
npm install
npm start
```

Frontend will run at: `http://localhost:3000`

### 3. Configure API URL
Update the backend URL in [frontend/js/config.js](frontend/js/config.js):
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### 4. n8n Chatbot (Optional)
To enable the AI chatbot:
1. Install [n8n](https://n8n.io/) locally or use n8n.cloud
2. Import the workflow from `n8n-chatbot-workflow.json` or `n8n-chatbot-simple.json`
3. Configure your LLM credentials in the workflow
4. Update the chatbot webhook URL in your frontend configuration

## Deployment (Free Hosting)

### Frontend: Netlify
1. Push this repository to GitHub
2. Go to [Netlify](https://netlify.com) → **Add new site** → **Import from GitHub**
3. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `frontend`
4. Click **Deploy**

### Backend: Render
1. Go to [Render](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure service:
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
4. Add environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
5. Click **Create Web Service**

### Connect Frontend to Backend
After deployment, update [frontend/js/config.js](frontend/js/config.js) with your Render URL:
```javascript
const API_BASE_URL = 'https://your-app.onrender.com/api';
```
Then redeploy on Netlify (or push changes to trigger auto-deploy).

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secure_random_string_here
PORT=5000
```

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/baby/profile` - Get baby profiles
- `POST /api/tracking/feeding` - Log feeding
- `POST /api/tracking/sleep` - Log sleep
- `GET /api/vaccination/schedule` - Get vaccination schedule
- `POST /api/nutrition/plan` - Get nutrition plan
- `POST /api/ai/chat` - AI chatbot endpoint

## Project Pages
- **Landing Page**: `index.html`
- **Authentication**: `login.html`, `signup.html`
- **Mode Selection**: `mode-selection.html`
- **Pregnancy Planning**: `pregnancy-planning.html`, `fertility-planning.html`
- **Pregnancy Guide**: `pregnancy-guide.html`
- **Baby Tracking**: `baby-tracking.html`, `baby-profile.html`
- **Dashboards**: `dashboard.html`, `dashboard-new.html`
- **Features**: `vaccination.html`, `nutrition.html`, `health-awareness.html`
- **User Profile**: `profile.html`

## Technologies Used

### Frontend
- Vanilla JavaScript (ES6+)
- CSS3 with custom properties
- Responsive design
- Local storage for session management

### Backend
- Express.js - Web framework
- Mongoose - MongoDB ODM
- JWT - Authentication
- Bcrypt - Password hashing
- CORS - Cross-origin support
- Express Validator - Input validation

### Database Models
- User - User accounts and authentication
- Baby - Baby profiles
- FeedingLog - Feeding tracking
- SleepLog - Sleep tracking
- Milestone - Development milestones
- Vaccination - Vaccination schedules

## License
ISC

## Notes
- This project includes n8n workflow files for AI chatbot integration
- The chatbot can be customized by modifying the n8n workflow
- All timestamps are stored in UTC
- Frontend uses relative paths for easy deployment
