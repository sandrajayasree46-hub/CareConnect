<div align="center">

# 🤝 CareConnect

### _Bridging the gap between elders and volunteers_

A full-stack web application that connects elderly individuals who need assistance with compassionate volunteers — built with **Flask** + **React**.

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📖 About the Project

**CareConnect** is a community-driven platform designed to make elderly care easier and more accessible. Elders can post requests for help (grocery runs, medical appointments, companionship, etc.), and verified volunteers can browse and accept those requests. Admins oversee the entire platform to ensure safety and smooth operations.

### 🎯 Key Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Auth** | Separate flows for Elders, Volunteers, and Admins with JWT-secured sessions |
| 📋 **Assistance Requests** | Elders can post, track, and manage help requests with categories and urgency levels |
| 🙋 **Volunteer Matching** | Volunteers browse available requests and accept them |
| 📊 **Admin Dashboard** | Full platform oversight — manage users, view stats, moderate requests |
| 🌙 **Dark Mode** | System-aware theme with manual toggle |
| 📱 **Responsive Design** | Works beautifully on desktop and mobile |
| 🚨 **Emergency Contacts** | Elders can register emergency contacts linked to their profile |
| 🔔 **Toast Notifications** | Real-time feedback using `react-hot-toast` |
| ✨ **Smooth Animations** | Powered by `framer-motion` |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Flask 3.0** | REST API framework |
| **Flask-SQLAlchemy** | ORM & database management |
| **Flask-CORS** | Cross-origin resource sharing |
| **PyJWT** | JSON Web Token authentication |
| **bcrypt** | Password hashing |
| **SQLite** | Lightweight relational database |
| **python-dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Lightning-fast dev server & bundler |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **TailwindCSS v4** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon library |
| **react-hot-toast** | Toast notifications |
| **clsx** | Conditional class names |

---

## 📁 Project Structure

```
careconnect/
├── README.md
│
├── backend/                         # Flask REST API
│   ├── app.py                       # App factory & server entry point
│   ├── config.py                    # Configuration settings
│   ├── requirements.txt             # Python dependencies
│   ├── database/
│   │   └── db.py                    # SQLAlchemy instance
│   ├── models/
│   │   ├── user.py                  # User model (Elder, Volunteer, Admin)
│   │   ├── request.py               # Assistance request model
│   │   ├── volunteer.py             # Volunteer profile model
│   │   └── emergency_contact.py     # Emergency contact model
│   ├── routes/
│   │   ├── auth.py                  # /api/register, /api/login
│   │   ├── requests.py              # /api/requests (CRUD)
│   │   ├── users.py                 # /api/profile, /api/emergency-contacts
│   │   └── admin.py                 # /api/admin/* (admin only)
│   └── utils/
│       └── helpers.py               # JWT helpers, auth decorators, bcrypt utils
│
└── frontend/                        # React + Vite SPA
    ├── index.html
    ├── vite.config.js               # Vite config with API proxy
    ├── package.json
    └── src/
        ├── App.jsx                  # Root router & context providers
        ├── main.jsx                 # React entry point
        ├── index.css                # Global styles
        ├── context/
        │   ├── AuthContext.jsx      # Global auth state (JWT, user info)
        │   └── ThemeContext.jsx     # Dark/light mode state
        ├── services/
        │   ├── api.js               # Axios instance with auth interceptors
        │   └── auth.js              # Login, register, logout helpers
        ├── layouts/
        │   ├── AuthLayout.jsx       # Layout for login/register pages
        │   └── DashboardLayout.jsx  # Layout with sidebar for dashboards
        ├── pages/
        │   ├── LandingPage.jsx      # Public home page
        │   ├── LoginPage.jsx        # Login form
        │   ├── RegisterPage.jsx     # Registration form with role selection
        │   ├── ElderDashboard.jsx   # Elder's request management
        │   ├── VolunteerDashboard.jsx # Volunteer's request browser
        │   ├── AdminDashboard.jsx   # Admin control panel
        │   ├── RequestAssistancePage.jsx # Create new request
        │   ├── ProfilePage.jsx      # View & edit profile
        │   └── SettingsPage.jsx     # App settings (theme, etc.)
        └── components/
            ├── ui/                  # Reusable UI primitives
            │   ├── Button.jsx
            │   ├── Card.jsx
            │   ├── Badge.jsx
            │   ├── Input.jsx
            │   ├── Modal.jsx
            │   └── Skeleton.jsx
            ├── dashboard/           # Dashboard-specific widgets
            │   ├── StatCard.jsx
            │   └── RequestCard.jsx
            └── common/
                └── Sidebar.jsx      # Navigation sidebar
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **npm** 9 or higher

---

### 1. Clone the Repository

```bash
git clone https://github.com/sandrajayasree46-hub/CareConnect.git
cd CareConnect
```

---

### 2. Set Up the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

> ✅ The API will be running at **http://localhost:5000**

---

### 3. Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

> ✅ The app will be running at **http://localhost:5173**

---

## 🔑 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/register` | Register a new user | ❌ |
| `POST` | `/api/login` | Login and receive JWT | ❌ |

### Assistance Requests
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/requests` | List requests (role-filtered) | ✅ |
| `POST` | `/api/requests` | Create a request | ✅ Elder |
| `PUT` | `/api/requests/:id` | Update a request | ✅ |
| `DELETE` | `/api/requests/:id` | Delete a request | ✅ |

### User Profile
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/profile` | Get own profile | ✅ |
| `PUT` | `/api/profile` | Update profile | ✅ |
| `GET` | `/api/emergency-contacts` | List emergency contacts | ✅ |
| `POST` | `/api/emergency-contacts` | Add emergency contact | ✅ |
| `DELETE` | `/api/emergency-contacts/:id` | Remove contact | ✅ |

### Admin (Admin role only)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform statistics |
| `GET` | `/api/admin/users` | All registered users |
| `PUT` | `/api/admin/users/:id/toggle-active` | Activate/deactivate user |
| `DELETE` | `/api/admin/users/:id` | Delete a user |
| `GET` | `/api/admin/requests` | All platform requests |
| `GET` | `/api/admin/volunteers` | All volunteer profiles |

---

## 👤 Default Test Accounts

Register via the UI or use these test credentials:

| Role | Email | Password |
|---|---|---|
| 👴 Elder | elder@test.com | Test1234! |
| 🙋 Volunteer | volunteer@test.com | Test1234! |
| 🛡️ Admin | admin@test.com | Test1234! |

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and open a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by **Sandra Jayasree**

</div>
