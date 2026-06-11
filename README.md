# 🔗 Katomaran — URL Shortener with Analytics

A full-stack **MERN** (MongoDB, Express, React, Node.js) URL Shortener application with real-time analytics, QR code generation, custom aliases, and link expiry tracking. Built for the Katomaran Hackathon.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture Diagram](#-architecture-diagram)
- [AI Planning Document](#-ai-planning-document)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Sample Outputs](#-sample-outputs)
- [Assumptions Made](#-assumptions-made)
- [Demo Video](#-demo-video)
- [License](#-license)

---

## ✨ Features

### Mandatory Features
| Feature | Description |
|---|---|
| **Authentication** | Secure user signup & login with JWT tokens and bcrypt password hashing |
| **Protected Routes** | Dashboard and analytics pages are protected; each user manages only their own URLs |
| **URL Shortening** | Submit a long URL and generate a unique short URL (using nanoid) |
| **URL Validation** | Server-side validation ensures proper URL format before shortening |
| **Server-Side Redirect** | Clicking a short URL triggers a server-side 302 redirect to the original |
| **User Dashboard** | View all created short URLs with original URL, short URL, created date, total clicks |
| **Delete URLs** | Ability to delete any shortened URL |
| **Copy to Clipboard** | One-click copy of short URLs from the dashboard |
| **Click Analytics** | Track number of clicks per short URL with timestamps |
| **Analytics Page** | Detailed analytics per URL: total clicks, last visited time, visit history |
| **Responsive UI** | Fully responsive glassmorphism design with loading/error/success states |

### Bonus Features
| Feature | Description |
|---|---|
| **Custom Alias** | Set a custom short code (e.g., `my-portfolio`) instead of auto-generated |
| **QR Code Generation** | Generate and download QR codes for any shortened URL |
| **Link Expiry** | Set an expiry date after which the link deactivates automatically |
| **Device/Browser Analytics** | Track visitor device type (Desktop/Mobile/Tablet) and browser |
| **Daily Click Trends** | Interactive area chart showing click trends over the last 7 days |
| **Edit Destination URL** | Update the original destination URL of an existing shortened link |
| **Docker Deployment** | Full Docker Compose setup for one-command deployment |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Frontend (Port 3000)                  │   │
│  │  ┌────────────┐  ┌───────────┐  ┌───────────────────┐   │   │
│  │  │ Login/     │  │ Dashboard │  │  Analytics Page   │   │   │
│  │  │ Signup     │  │  (CRUD)   │  │  (Charts/Tables)  │   │   │
│  │  └─────┬──────┘  └─────┬─────┘  └────────┬──────────┘   │   │
│  │        │               │                  │              │   │
│  │        └───────────────┼──────────────────┘              │   │
│  │                        │                                 │   │
│  │              ┌─────────▼─────────┐                       │   │
│  │              │   Axios API Layer │                       │   │
│  │              │  (JWT Interceptor)│                       │   │
│  │              └─────────┬─────────┘                       │   │
│  └────────────────────────┼─────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP (REST API)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND (Port 5000)                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐   │
│  │   Auth   │  │   URL    │  │ Analytics │  │  Redirect    │   │
│  │  Routes  │  │  Routes  │  │  Routes   │  │  Routes      │   │
│  │ /api/auth│  │ /api/urls│  │/api/analytics│ /:shortCode  │   │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬───────┘   │
│       │              │              │               │           │
│  ┌────▼──────────────▼──────────────▼───────────────▼───────┐   │
│  │                   Middleware Layer                        │   │
│  │    ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │    │  Helmet  │  │  CORS    │  │ JWT Auth │              │   │
│  │    └──────────┘  └──────────┘  └──────────┘              │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                   Mongoose Models                        │   │
│  │    ┌──────────┐  ┌───────────┐  ┌──────────┐            │   │
│  │    │   User   │  │  ShortUrl │  │  Visit   │            │   │
│  │    └──────────┘  └───────────┘  └──────────┘            │   │
│  └──────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   MongoDB Database  │
                   │   (Port 27017)      │
                   │  ┌───────────────┐  │
                   │  │  Collections: │  │
                   │  │  - users      │  │
                   │  │  - shorturls  │  │
                   │  │  - visits     │  │
                   │  └───────────────┘  │
                   └─────────────────────┘
```

### Data Flow

1. **URL Shortening**: User → React Form → POST `/api/urls` → Validate → Generate nanoid → Save to MongoDB → Return short URL
2. **Redirect**: Visitor → GET `/:shortCode` → Lookup in DB → Log visit details → 302 Redirect to original URL
3. **Analytics**: User → GET `/api/analytics/:urlId` → Aggregate visits → Return device/browser/trend data → Render charts

---

## 🤖 AI Planning Document

### Phase 1: Planning & Design
- Identified all mandatory and bonus features from the hackathon problem statement
- Designed the database schema with 3 collections: Users, ShortUrls, Visits
- Planned RESTful API endpoints with JWT-based authentication
- Chose a dark-themed glassmorphism UI design for a premium look

### Phase 2: Feature List

#### Core Features Implemented
1. **Authentication System** — JWT-based auth with bcrypt password hashing, login/signup forms with validation
2. **URL Shortening Engine** — nanoid-based short code generation with uniqueness verification, custom alias support
3. **Server-Side Redirect** — Express route handler that logs visit data and performs 302 redirect
4. **Dashboard** — Paginated URL listing with stats cards, CRUD operations, QR code modal
5. **Analytics** — Per-URL analytics with Recharts area charts, device/browser breakdowns, visit logs

#### Bonus Features Implemented
6. **Custom Alias** — Alphanumeric validation, uniqueness check, 3-30 character limit
7. **QR Code Generation** — SVG QR codes via `qrcode.react` with PNG download
8. **Link Expiry** — Datetime picker, auto-deactivation on access after expiry
9. **Device/Browser Analytics** — User-agent parsing for device type and browser detection
10. **Daily Click Trends** — 7-day area chart with zero-fill for days without clicks
11. **Edit Destination URL** — Update original URL of existing shortened links
12. **Docker Deployment** — Multi-service docker-compose with MongoDB, backend, frontend

### Phase 3: Development Workflow
1. Set up MongoDB schema and Express server
2. Built authentication routes with JWT
3. Created URL shortening CRUD API
4. Implemented redirect handler with visit logging
5. Built analytics aggregation pipeline
6. Developed React frontend with routing
7. Styled with custom CSS (glassmorphism dark theme)
8. Added bonus features (QR, expiry, custom alias, edit URL)
9. Dockerized the application

### Phase 4: Testing & Verification
- Manual testing of all CRUD operations
- Verified redirect flow logs visits correctly
- Tested responsive layout on different viewport sizes
- Validated form error states and loading indicators

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Recharts, Lucide Icons, qrcode.react |
| **Backend** | Node.js, Express 5, Mongoose, JWT, bcryptjs, nanoid, validator, helmet |
| **Database** | MongoDB 5.0+ |
| **DevOps** | Docker, Docker Compose |
| **Styling** | Custom CSS (Glassmorphism, CSS Variables, Responsive) |
| **Fonts** | Google Fonts (Inter, Outfit) |

---

## 📁 Project Structure

```
Katomaran/
├── README.md                          # This file
├── .gitignore                         # Root gitignore
├── .env.example                       # Environment variables reference
├── docker-compose.yml                 # Docker multi-service config
│
├── urlshortener-backend/              # Express.js API Server
│   ├── .env.example                   # Backend env template
│   ├── .gitignore                     # Backend gitignore
│   ├── Dockerfile                     # Backend Docker image
│   ├── package.json                   # Dependencies & scripts
│   ├── server.js                      # Express app entry point
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification middleware
│   ├── models/
│   │   ├── User.js                    # User schema (bcrypt hashing)
│   │   ├── ShortUrl.js                # Short URL schema
│   │   └── Visit.js                   # Visit log schema
│   └── routes/
│       ├── authRoutes.js              # POST /register, /login
│       ├── urlRoutes.js               # CRUD /api/urls
│       ├── analyticsRoutes.js         # GET /api/analytics
│       └── redirectRoutes.js          # GET /:shortCode (redirect)
│
└── urlshortener-frontend/             # React SPA
    ├── .env.example                   # Frontend env template
    ├── .gitignore                     # Frontend gitignore
    ├── Dockerfile                     # Frontend Docker image
    ├── package.json                   # Dependencies & scripts
    ├── public/
    │   └── index.html                 # HTML template
    └── src/
        ├── index.js                   # React entry point
        ├── index.css                  # Global CSS (design system)
        ├── App.js                     # Router configuration
        ├── api/
        │   └── api.js                 # Axios API layer
        ├── components/
        │   └── ProtectedRoute.js      # Auth route guard
        └── pages/
            ├── LoginPage.js           # Login form
            ├── SignupPage.js          # Registration form
            ├── AuthPages.css          # Auth page styles
            ├── Dashboard.js           # Main dashboard
            ├── Dashboard.css          # Dashboard styles
            ├── Analytics.js           # URL analytics page
            └── Analytics.css          # Analytics styles
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** running locally (or via Docker)
- **npm** (comes with Node.js)

### Option 1: Local Development

#### 1. Clone the repository
```bash
git clone https://github.com/Sabari7866/Katomaran.git
cd Katomaran
```

#### 2. Start MongoDB
Make sure MongoDB is running on `localhost:27017`. You can use:
```bash
# Using Docker for MongoDB only
docker run -d -p 27017:27017 --name mongo mongo:5.0
```

#### 3. Set up Backend
```bash
cd urlshortener-backend

# Copy environment template
cp .env.example .env
# Edit .env with your values (defaults work for local dev)

# Install dependencies
npm install

# Start development server
npm run dev
```
Backend will run on **http://localhost:5000**

#### 4. Set up Frontend
```bash
cd urlshortener-frontend

# Copy environment template
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# Install dependencies
npm install

# Start development server
npm start
```
Frontend will run on **http://localhost:3000**

### Option 2: Docker Compose (One Command)

```bash
# From the project root
docker-compose up --build
```

This starts:
- **MongoDB** on port 27017
- **Backend** on port 5000
- **Frontend** on port 3000

To stop: `docker-compose down`

---

## 🔐 Environment Variables

### Backend (`urlshortener-backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/urlshortener` |
| `JWT_SECRET` | Secret key for JWT signing | *(must change in production)* |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |

### Frontend (`urlshortener-frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `REACT_APP_BACKEND_URL` | Backend base URL (for short link display) | `http://localhost:5000` |
| `BROWSER` | Disable auto-open browser | `none` |

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ username, email, password }` | Register a new user |
| `POST` | `/api/auth/login` | `{ email, password }` | Log in and receive JWT |

### URL Management (Protected - requires `Authorization: Bearer <token>`)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/urls` | `{ originalUrl, customAlias?, expiryDate? }` | Create a short URL |
| `GET` | `/api/urls?page=1&limit=10` | — | Get paginated user URLs |
| `PUT` | `/api/urls/:id` | `{ originalUrl }` | Update destination URL |
| `DELETE` | `/api/urls/:id` | — | Delete a short URL |

### Analytics (Protected)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/dashboard/summary` | Get dashboard summary stats |
| `GET` | `/api/analytics/:urlId` | Get detailed analytics for a URL |

### Redirect (Public)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:shortCode` | Redirect to original URL + log visit |

---

## 📸 Sample Outputs

### Login Page
> Dark-themed glassmorphism login card with email/password fields, gradient submit button, and signup link.

### Dashboard
> Stats cards showing Total Links, Total Redirects, Active Links. URL shortening form with advanced options (custom alias, expiry). Paginated table of shortened URLs with copy, QR, analytics, and delete actions.

### QR Code Modal
> Modal overlay with generated QR code SVG and PNG download button.

### Analytics Page
> Area chart showing 7-day click trends. Device and browser distribution with progress bars. Recent visits log table with timestamp, IP, device, browser, and referrer.

### Database Entries
```json
// User Document
{
  "_id": "ObjectId('...')",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "$2b$10$... (bcrypt hash)",
  "createdAt": "2026-06-11T10:00:00.000Z"
}

// ShortUrl Document
{
  "_id": "ObjectId('...')",
  "originalUrl": "https://www.google.com/search?q=example",
  "shortCode": "aB3kXz9",
  "customAlias": null,
  "user": "ObjectId('...')",
  "clicks": 15,
  "expiryDate": null,
  "isActive": true,
  "lastVisited": "2026-06-11T12:30:00.000Z",
  "createdAt": "2026-06-11T10:05:00.000Z"
}

// Visit Document
{
  "_id": "ObjectId('...')",
  "shortUrl": "ObjectId('...')",
  "visitedAt": "2026-06-11T12:30:00.000Z",
  "ipAddress": "::1",
  "userAgent": "Mozilla/5.0 ...",
  "device": "Desktop",
  "browser": "Chrome",
  "referer": "Direct"
}
```

---

## 📋 Assumptions Made

1. **MongoDB** is available locally on default port 27017 (or via Docker).
2. **Short codes** are 7-character nanoid strings; custom aliases are 3-30 alphanumeric characters.
3. **JWT tokens** expire after 7 days; no refresh token mechanism is implemented.
4. **URL validation** requires the protocol (http:// or https://) to be included.
5. **Click analytics** are recorded per-visit (not per unique visitor) — every redirect counts as a click.
6. **Device/Browser detection** is based on user-agent string parsing (server-side), not a third-party API.
7. **Geolocation** is not implemented as it would require a third-party IP geolocation API.
8. **Bulk CSV upload** is not implemented in this version.
9. **The application** is designed for local development; production deployment would need HTTPS, proper secrets, and a domain.
10. **Passwords** are hashed using bcrypt with 10 salt rounds.

---

## 🎥 Demo Video

> **[Add your Loom / YouTube video link here]**
>
> The video demonstrates:
> - User registration and login flow
> - Creating short URLs with custom alias and expiry
> - Copying short URLs and QR code generation
> - Redirect flow and analytics tracking
> - Dashboard overview and URL management
> - Analytics page with charts and visit logs

---

## 📄 License

ISC

---

*This project is a part of a hackathon run by [https://katomaran.com](https://katomaran.com)*
