# Hospital Management Mobile App

Expo (React Native) frontend and Express/MongoDB backend.

## Repository layout

```
├── frontend/     Expo app (Expo Router)
├── backend/      REST API (Express + Mongoose)
└── README.md
```

## Prerequisites

- Node.js LTS
- MongoDB (local or Atlas)
- For mobile: Expo Go or Android/iOS toolchain

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET
npm install
npm run dev
```

Default API port: `8080` (override with `PORT` in `.env`).

### Frontend

```bash
cd frontend
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your machine's API, e.g. http://localhost:8080/api
npm install
npx expo start
```

## GitHub

Remote: `https://github.com/janindudesilva/Hospital-Management-Mobile-App.git`

Do not commit `.env` files; only `.env.example` templates are tracked.
