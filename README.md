# CareConnect – Quick Start Guide

## Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

---

## 🚀 Running the Application

### 1. Start the Backend (Flask)

Open a terminal and run:

```powershell
cd C:\Jayasree\careconnect\backend
python app.py
```

The API will be available at: **http://localhost:5000**

### 2. Start the Frontend (Vite)

Open a **second** terminal and run:

```powershell
cd C:\Jayasree\careconnect\frontend
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## 👤 Default Test Accounts

Register via the UI, or use these suggestions:

| Role      | Email                     | Password   |
|-----------|---------------------------|------------|
| Elder     | elder@test.com            | Test1234!  |
| Volunteer | volunteer@test.com        | Test1234!  |
| Admin     | admin@test.com            | Test1234!  |

---

## 📁 Project Structure

```
careconnect/
├── backend/
│   ├── app.py              ← Flask entry point
│   ├── config.py           ← Settings
│   ├── requirements.txt
│   ├── database/db.py      ← SQLAlchemy setup
│   ├── models/             ← User, Request, EmergencyContact, Volunteer
│   ├── routes/             ← auth, requests, users, admin blueprints
│   └── utils/helpers.py    ← JWT, bcrypt, decorators
│
└── frontend/
    ├── src/
    │   ├── App.jsx          ← Router + providers
    │   ├── context/         ← AuthContext, ThemeContext
    │   ├── services/        ← api.js (Axios), auth.js
    │   ├── layouts/         ← AuthLayout, DashboardLayout
    │   ├── pages/           ← All 10 pages
    │   └── components/
    │       ├── ui/          ← Button, Card, Badge, Input, Modal, Skeleton
    │       ├── dashboard/   ← StatCard, RequestCard
    │       └── common/      ← Sidebar
    └── vite.config.js       ← Tailwind + API proxy
```

---

## 🔑 API Endpoints

### Auth
- `POST /api/register` — Register new user
- `POST /api/login` — Login, returns JWT

### Requests
- `GET /api/requests` — List (role-filtered)
- `POST /api/requests` — Create (elder only)
- `PUT /api/requests/:id` — Update status/details
- `DELETE /api/requests/:id` — Delete

### Users
- `GET /api/profile` — Get own profile
- `PUT /api/profile` — Update profile
- `GET/POST /api/emergency-contacts` — Manage contacts
- `DELETE /api/emergency-contacts/:id`

### Admin (admin role only)
- `GET /api/admin/stats` — Dashboard stats
- `GET /api/admin/users` — All users
- `PUT /api/admin/users/:id/toggle-active`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/requests` — All requests
- `GET /api/admin/volunteers`
