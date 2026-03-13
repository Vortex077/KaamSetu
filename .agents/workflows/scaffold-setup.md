---
description: Set up KaamSetu project scaffold — Next.js frontend + Express backend + MongoDB + auth + folder structure
---

# KaamSetu — Project Scaffold Setup

## What This Project Is
KaamSetu is an AI-powered hyperlocal platform connecting daily wage workers and students to nearby hirers in India. "Uber for daily wage workers." Built for HackIndia EIT 2026 hackathon (AI theme).

## Two User Types
- **Workers/Students**: Daily wage labourers, students seeking part-time work. Register via WhatsApp voice note in Hindi. Zero app download.
- **Hirers**: Shop owners, restaurants, households, factories. Post gigs on web app, see AI-ranked matched workers.

---

## Tech Stack

### Frontend
- Next.js 14 (App Router), Tailwind CSS, Lucide React, Leaflet.js, Recharts, Axios, react-hot-toast, next-pwa

### Backend
- Node.js, Express.js, JWT (jsonwebtoken), bcryptjs, Multer, Axios, Mongoose, dotenv, cors

### Database
- MongoDB Atlas (free M0), Mongoose ODM, 2dsphere indexes on location fields
- Collections: users, workerprofiles, gigjobs, applications, reviews

---

## Folder Structure (Create Exactly This)

```
kaamsetu/
├── frontend/                   # Next.js 14 app
│   ├── app/
│   │   ├── page.jsx            # Landing page
│   │   ├── layout.js
│   │   ├── globals.css
│   │   ├── auth/
│   │   │   ├── login/page.jsx
│   │   │   └── register/page.jsx
│   │   ├── worker/
│   │   │   ├── profile/page.jsx
│   │   │   ├── gigs/page.jsx
│   │   │   └── applications/page.jsx
│   │   └── hirer/
│   │       ├── post/page.jsx
│   │       ├── matches/page.jsx
│   │       └── manage/page.jsx
│   ├── components/
│   │   ├── WorkerCard.jsx
│   │   ├── GigCard.jsx
│   │   ├── MatchScore.jsx
│   │   ├── WhatsAppDemo.jsx
│   │   ├── PaymentModal.jsx
│   │   ├── GigStatusTracker.jsx
│   │   ├── MapView.jsx
│   │   └── Navbar.jsx
│   └── lib/
│       ├── api.js
│       └── auth.js
│
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workers.js
│   │   ├── gigs.js
│   │   ├── applications.js
│   │   └── webhook.js
│   ├── models/
│   │   ├── User.js
│   │   ├── WorkerProfile.js    # 2dsphere index on location
│   │   ├── GigJob.js           # 2dsphere index + payment state machine
│   │   ├── Application.js
│   │   └── Review.js
│   ├── ai/
│   │   ├── index.js
│   │   ├── matchEngine.js
│   │   ├── voiceRegistration.js
│   │   ├── gigGenerator.js
│   │   ├── fraudDetection.js
│   │   └── jobAlerts.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   └── upload.js           # Multer for audio
│   ├── server.js
│   └── seedData.js
│
└── .env (backend)
    .env.local (frontend)
```

---

## Environment Variables

### Backend .env
```
PORT=5000
MONGODB_URI=mongodb+srv://<your_atlas_uri>/kaamsetu
JWT_SECRET=<your_secret>
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
CLOUDINARY_URL=your_cloudinary_url
USE_LOCAL_WHISPER=false
WORKER_ACCEPTANCE_TIMEOUT_HOURS=2
```

### Frontend .env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## MongoDB Schemas

### User
```js
{ name: String, phone: String (unique), email: String, password: String, role: "worker"|"hirer", isVerified: Boolean, createdAt: Date }
```

### WorkerProfile
```js
{ userId: ObjectId (ref User, unique), name: String, photo: String, skills: [String], location: { type: "Point", coordinates: [lng, lat], city: String, address: String }, dailyRate: Number, availability: { days: [String], isAvailable: Boolean }, experience: String, whatsappNumber: String, isVerified: Boolean, rating: Number (0-5), totalJobs: Number, workHistory: [ObjectId], registrationMethod: "web"|"whatsapp_voice" }
// INDEX: location "2dsphere"
```

### GigJob (Payment State Machine)
```js
{ hirerId: ObjectId, title: String, description: String, skillsRequired: [String], payPerDay: Number, duration: Number, totalPay: Number (auto: payPerDay × duration), platformFee: Number (auto: 8%), location: { type: "Point", coordinates: [lng, lat], address: String, city: String }, status: "open"|"payment_pending"|"payment_held"|"worker_accepted"|"in_progress"|"completed"|"cancelled", paymentStatus: "unpaid"|"held_in_escrow"|"released"|"refunded", paymentHeldAt: Date, workerTimeoutAt: Date, hiredWorkerId: ObjectId, contactRevealedAt: Date, postedAt: Date, startDate: Date, endDate: Date }
// INDEX: location "2dsphere", hirerId, status
```

### Application
```js
{ gigId: ObjectId, workerId: ObjectId, matchScore: Number (0-100), scoreBreakdown: { skills: max40, distance: max30, rating: max20, availability: max10 }, distanceKm: Number, matchedSkills: [String], status: "applied"|"hired"|"rejected"|"completed", appliedAt: Date, hiredAt: Date }
// INDEX: gigId+workerId unique compound
```

### Review
```js
{ gigId: ObjectId, reviewerId: ObjectId, revieweeId: ObjectId, rating: Number (1-5), comment: String, createdAt: Date }
// INDEX: gigId+reviewerId+revieweeId unique compound
```

---

## API Routes to Create

```
POST /api/auth/register     POST /api/auth/login
GET  /api/workers/profile   PUT  /api/workers/profile
POST /api/workers/voice-register
GET  /api/workers/gigs/nearby   GET /api/workers/applications
POST /api/gigs              GET  /api/gigs/:id/matches
POST /api/gigs/:id/hire/:workerId   POST /api/gigs/:id/accept
POST /api/gigs/:id/decline  POST /api/gigs/:id/complete
GET  /api/gigs/:id/status
POST /api/applications      GET  /api/applications/my
POST /api/reviews
GET  /webhook               POST /webhook
```

---

## Setup Steps

// turbo-all

1. Create the folder structure as defined above
2. Initialize Next.js frontend: `npx -y create-next-app@latest ./frontend --js --tailwind --app --eslint --use-npm --yes --disable-git`
3. Install frontend deps: `cd frontend && npm install lucide-react leaflet react-leaflet recharts axios react-hot-toast next-pwa`
4. Create backend/package.json with dependencies: express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv, multer, axios, openai, cloudinary, nodemon(dev)
5. Install backend deps: `cd backend && npm install`
6. Create .env files with placeholder values
7. Create all 5 Mongoose models with correct indexes (2dsphere on WorkerProfile.location and GigJob.location)
8. Create JWT auth middleware + Multer upload middleware
9. Create all route files with try/catch and consistent response format: `{ success: true/false, data/error }`
10. Create server.js with MongoDB connection, CORS, all routes mounted
11. Create AI module stubs (matchEngine fully implemented, others as stubs)
12. Test server starts with: `node -e "require('./server')"`

## Response Format (Always)
```
Success: { success: true, data: {} }
Error:   { success: false, error: "message" }
```

## Key Rules
- async/await everywhere, never .then()
- Every route wrapped in try/catch
- Never expose phone numbers until contactRevealedAt is set
- 2dsphere $near queries for geospatial matching
- GigJob status must follow state machine order exactly
- Payment BEFORE worker notification (core trust mechanism)
