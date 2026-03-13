# KaamSetu

KaamSetu is a platform designed to connect hirers and daily wage workers.

## Prerequisites

- **Node.js**: v18 or correctly supported LTS version.
- **Git**: To clone the repository.
- **MongoDB**: The application connects to a MongoDB database. (Connection string handles this in the cloud, or locally).

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Vortex077/KaamSetu.git
cd KaamSetu_hackathon
```
*(Note: Use your correct remote URL if different)*

### 2. Fast Setup (Install dependencies & Run)

We have provided convenient scripts to automatically download all packages for both the frontend and backend, and start the development servers.

**On Windows:**
Simply double-click on `install_and_run.bat` or run it from your command prompt:
```cmd
.\install_and_run.bat
```

**On Mac/Linux:**
```bash
chmod +x install_and_run.sh
./install_and_run.sh
```

### 3. Environment Variables

Before everything works properly, you'll need to configure the backend environment.
1. Navigate to the `backend/` directory.
2. Create a `.env` file (if not already present or provided).
3. The `.env` file should look like this:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

# Telegram bot context variables
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
WORKER_ACCEPTANCE_TIMEOUT_HOURS=2

# VAPID Keys for Web Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your_email@example.com

# Email / Notification Credentials
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```
Make sure to replace the placeholder values with actual keys before fully testing.

### 4. Running Manually

If you prefer not to use the automated scripts, you can run the applications manually:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will start gracefully (usually `http://localhost:3000`), and the backend API should attach to the defined PORT (usually `http://localhost:5000`).
