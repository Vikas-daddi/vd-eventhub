# 🎟️ VD‑EventHub – Smart Event Management System

🌍 **Live Website:** [https://vd-eventhub-9wnp.vercel.app](https://vd-eventhub-9wnp.vercel.app)

A full‑stack event management platform with QR ticketing, admin dashboard, and real‑time analytics. Built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js).

---

## ✨ Features

### 👤 User Module
- Sign up / Login with JWT authentication
- Browse events with search & category filter
- View event details with live countdown timer
- Book tickets (fake payment simulation – card/UPI)
- Download QR ticket as **PNG** or **PDF**
- View booking history
- Cancel bookings with **refund policy** (100%/50%/0% based on cancellation date)
- Personal dashboard with spending stats

### 👑 Admin Module
- Secure admin login & role‑based access
- **Dashboard** – total users, events, bookings, revenue, attendance rate
- **Manage events** – add, edit, delete (with image URL or upload)
- **Manage users** – view all registered users
- **Manage bookings** – see all tickets across all users
- **Mark attendance** – QR scanner (camera) or manual check‑in (using booking ID)

### 🔧 Technical Highlights
- QR code generation (`qrcode` + `html5-qrcode`)
- PDF ticket generation (`jspdf`, `html2canvas`)
- Modern **glassmorphism** UI with Tailwind CSS
- Fully responsive layout
- Live countdown timer
- Fake payment simulation (no real gateway)

---

## 🛠️ Tech Stack

| Layer       | Technology                               |
|-------------|------------------------------------------|
| Frontend    | React 18, React Router, Axios, Tailwind CSS, Lucide Icons, Recharts |
| Backend     | Node.js, Express.js, MongoDB, Mongoose   |
| Auth        | JWT, bcryptjs                            |
| QR & PDF    | qrcode, html5-qrcode, jspdf, html2canvas |
| Dev tools   | Nodemon, ESLint                          |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Vikas-daddi/vd-eventhub.git
cd vd-eventhub