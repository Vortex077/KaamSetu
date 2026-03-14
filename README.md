# 🤝 KaamSetu: Empowering Blue-Collar Workers

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-success?logo=mongodb)

**KaamSetu** helps bridge the digital divide for India's blue-collar workforce. It is an AI-powered job matchmaking platform designed to connect hirers with daily wage workers, part-time staff, and full-time tradesmen seamlessly. 

The core philosophy of KaamSetu is accessibility. We recognize that many daily wage earners are not tech-savvy. Therefore, KaamSetu allows workers to register, find jobs, and accept payments using simple **Hindi Voice Notes on Telegram**, completely bypassing the need to navigate complex web apps.

---

## ✨ Key Features

- **🎙️ AI Voice Registration (Telegram):** Workers simply send a Hindi voice note (e.g., *"Main Ramesh hoon, plumber hoon, Delhi mein rehta hoon, 500 rupaye lunga"*). Our AI extracts skills, location, and rates automatically using Gemini 2.5 Flash.
- **🧠 Smart Matchmaking Engine:** Our custom AI match engine scores workers against gig requirements based on 4 criteria: Skills, Distance (Haversine formula), Rating, and Availability.
- **📍 Geolocation & Routing:** Full Nominatim OpenStreetMap integration for forward/reverse geocoding to match workers within a 20km radius of the job site.
- **📱 Segmented Notifications:**
  - **Daily Wage Workers** are notified and can accept jobs directly via Telegram.
  - **Part-Time/Full-Time Workers** receive professional Nodemailer emails with instant "Accept Work" links.
- **🛡️ Secure Escrow Flow:** Hirers lock payments in escrow before the worker is notified, ensuring guaranteed payment for the blue-collar worker.
- **🎨 Modern Glassmorphism UI:** Built with Next.js and Tailwind CSS, featuring beautiful gradients, responsive design, and intuitive UX tailored for hirers.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **AI & Integrations:** Google Gemini 2.5 Flash API, `node-telegram-bot-api`, Nodemailer, Nominatim Geocoding

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18 or correctly supported LTS version.
- **Git**: To clone the repository.
- **MongoDB**: The application connects to a MongoDB database (local or Atlas cluster).

### 2. Clone the repository

```bash
git clone https://github.com/Vortex077/KaamSetu.git
cd KaamSetu_hackathon
```

### 3. Environment Variables

Before running the app, you need to configure the backend environment. Navigate to the `backend/` directory and create a `.env` file with the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# URL Configuration (Use your local network IP for mobile testing, e.g., http://192.168.1.x)
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
WORKER_ACCEPTANCE_TIMEOUT_HOURS=2

# Email Notification Credentials (Nodemailer)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 4. Fast Setup (Install & Run)

We have provided convenient scripts to automatically download all packages for both the frontend and backend and start the development servers.

**On Windows:**
Double-click `install_and_run.bat` or run it via command prompt:
```cmd
.\install_and_run.bat
```

**On Mac/Linux:**
```bash
chmod +x install_and_run.sh
./install_and_run.sh
```

### 5. Running Manually

If you prefer not to use the automated scripts, run them individually:

**Backend:**
```bash
cd backend
npm install
node seedData.js # (Optional: seeds initial mock data)
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:3000` and the backend at `http://localhost:5000`.

---
*Built with ❤️ for the Hackathon.*
