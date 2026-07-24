<div align="center">

# 🤝 CareConnect

### _Bridging the gap between elders and volunteers_

A full-stack web application that connects elderly individuals who need assistance with compassionate volunteers — built with **Flask** + **React**.

[![Live Demo](https://img.shields.io/badge/Vercel-Live--Demo-success?style=for-the-badge&logo=vercel&logoColor=white)](https://careconnect-beryl.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 🌐 Live Production Application

- **Live App**: [https://careconnect-beryl.vercel.app](https://careconnect-beryl.vercel.app)
- **GitHub Repository**: [https://github.com/sandrajayasree46-hub/CareConnect.git](https://github.com/sandrajayasree46-hub/CareConnect.git)

---

## 📖 About the Project

**CareConnect** is a community-driven platform designed to make elderly care easier, faster, and more reliable. Elders can submit requests for help (grocery runs, medical assistance, transport, companionship, home repair, etc.), and verified volunteers can browse, accept, and complete those requests in real-time. Admins oversee the entire platform to maintain security, verify accounts, and monitor metrics.

---

## 🎯 Key Features & System Architecture

| Feature | Description |
|---|---|
| 🔐 **Authentication & Session Persistence** | Role-based JWT authentication with persistent session state (`localStorage`), automatic token validation, and complete refresh protection across all routes without resets |
| ⚡ **Live Auto-Sync & Polling** | Real-time 5-second background updates on Volunteer, Elder, and Admin dashboards so newly created requests appear instantly without page reloads |
| 🔔 **Notification System** | Dynamic top-bar Notification Bell with unread badges and drop-down list. Automatic notification dispatching when requests are created, accepted, or completed |
| 🔄 **Complete Request Lifecycle** | Strict lifecycle state transitions: `Pending` $\rightarrow$ `Accepted` $\rightarrow$ `In Progress` $\rightarrow$ `Completed` |
| 🙋 **Volunteer Dashboard** | Displays Volunteer Name, Email, Available Requests, Assigned Requests, Completed Tasks, and Rating with dynamic live counters |
| 👴 **Elder Dashboard & SOS** | Quick request wizard, live status tracking, emergency contact management, and one-tap SOS emergency alert system |
| 📊 **Admin Dashboard** | Full platform analytics, user activation/deactivation, account moderation, and request tracking |
| 🔒 **Security & Scoping** | Enforced role-based access control, foreign key constraints, duplicate submission prevention, and SQLAlchemy database indexing |
| 🌙 **Dark Mode & Styling** | Sleek glassmorphism theme with dark/light mode toggle and responsive mobile design |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Flask 3.0** | REST API framework |
| **Flask-SQLAlchemy** | ORM & database management |
| **SQLite** | Database engine with `PRAGMA foreign_keys=ON` |
| **PyJWT** | JSON Web Token authentication |
| **bcrypt** | Secure password hashing |
| **Flask-CORS** | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Modern UI framework |
| **Vite 8** | Fast build tool & development server |
| **React Router v7** | Client-side SPA routing & route guards |
| **Axios** | HTTP client with automatic token interceptors |
| **TailwindCSS v4** | Utility-first styling system |
| **Framer Motion** | Micro-animations and page transitions |
| **Lucide React** | Icon system |
| **react-hot-toast** | Toast notifications |

---

## 📁 Project Structure

```
careconnect/
├── README.md
├── vercel.json                      # Vercel deployment configuration
├── backend/                         # Flask REST API
│   ├── app.py                       # App factory & blueprint registration
│   ├── config.py                    # App configuration
│   ├── test_system.py               # E2E system test suite
│   ├── database/
│   │   └── db.py                    # SQLAlchemy instance & SQLite FK enforcer
│   ├── models/
│   │   ├── user.py                  # User model
│   │   ├── request.py               # Assistance request model
│   │   ├── volunteer.py             # Volunteer profile model
│   │   ├── emergency_contact.py     # Emergency contact model
│   │   └── notification.py          # Notification model
│   ├── routes/
│   │   ├── auth.py                  # Authentication routes (/api/login, /api/register)
│   │   ├── requests.py              # Request CRUD & status lifecycle
│   │   ├── notifications.py         # Notification endpoints
│   │   ├── users.py                 # Profile & emergency contacts
│   │   └── admin.py                 # Admin dashboard endpoints
│   └── utils/
│       └── helpers.py               # Auth decorators, JWT, bcrypt helpers
│
└── frontend/                        # React + Vite SPA
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                  # Root router & theme/auth providers
        ├── context/
        │   ├── AuthContext.jsx      # Session & user token state persistence
        │   └── ThemeContext.jsx     # Dark mode context
        ├── layouts/
        │   └── DashboardLayout.jsx  # Top bar, Notification Bell & Sidebar
        ├── pages/
        │   ├── ElderDashboard.jsx   # Elder dashboard & emergency contacts
        │   ├── VolunteerDashboard.jsx # Volunteer dashboard & task management
        │   ├── AdminDashboard.jsx   # Admin management panel
        │   ├── RequestAssistancePage.jsx # Multi-step request wizard
        │   ├── ProfilePage.jsx      # Profile management
        │   ├── SettingsPage.jsx     # App settings
        │   ├── LoginPage.jsx        # Login page
        │   ├── RegisterPage.jsx     # Account registration
        │   └── LandingPage.jsx      # Public landing page
        └── components/              # UI components & cards
```

---

## 🚀 Getting Started

### Prerequisites
- **Python** 3.10+
- **Node.js** 18+
- **npm** 9+

---

### 1. Clone the Repository

```bash
git clone https://github.com/sandrajayasree46-hub/CareConnect.git
cd CareConnect
```

---

### 2. Set Up & Run Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend API
python app.py
```
> API server will run at `http://localhost:5000`

---

### 3. Set Up & Run Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```
> Frontend application will run at `http://localhost:5173`

---

## 🔑 API Reference Summary

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Register new Elder, Volunteer, or Admin account |
| `POST` | `/api/login` | Login and receive JWT access token |

### Assistance Requests
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/requests` | Fetch requests (role-scoped & filtered) | Authenticated |
| `POST` | `/api/requests` | Create assistance request | Elder / Admin |
| `GET` | `/api/requests/:id` | Get single request details | Scoped |
| `PUT` | `/api/requests/:id` | Update status (`accepted`, `in_progress`, `completed`, `cancelled`) | Scoped |
| `DELETE` | `/api/requests/:id` | Delete request | Owner / Admin |

### Notifications
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/notifications` | Fetch user notifications & unread count | Authenticated |
| `PUT` | `/api/notifications/read` | Mark notification(s) as read | Authenticated |
| `DELETE` | `/api/notifications/:id` | Delete notification | Authenticated |

### Profile & Emergency Contacts
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/profile` | Fetch authenticated user profile | Authenticated |
| `PUT` | `/api/profile` | Update profile fields & volunteer status | Authenticated |
| `GET` | `/api/emergency-contacts` | Fetch emergency contacts | Authenticated |
| `POST` | `/api/emergency-contacts` | Add emergency contact | Authenticated |
| `DELETE` | `/api/emergency-contacts/:id` | Delete emergency contact | Owner |

### Admin Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Aggregate platform metrics | Admin |
| `GET` | `/api/admin/users` | List all registered users | Admin |
| `PUT` | `/api/admin/users/:id/toggle-active` | Activate or deactivate user | Admin |
| `DELETE` | `/api/admin/users/:id` | Delete user | Admin |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by **Sandra Jayasree**

</div>
