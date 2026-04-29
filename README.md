# 🏦 SkyBank – Professional MERN Banking System

SkyBank is a high-integrity financial application built with a **Ledger-based architecture**.  
It prioritizes **data consistency, transaction safety, and real-time notifications**.

---

## 🚀 Key Features

### ⚡ Atomic Transactions (ACID Compliance)
Uses **MongoDB Sessions** to ensure transfers are **all-or-nothing**.  
If recipient credit fails, sender debit is rolled back automatically.

### 📖 Double-Entry Bookkeeping
Balances are dynamically calculated from **Ledger logs (DEBIT/CREDIT)** for complete auditability.

### 📧 Automated Email Notifications
Integrated with **Nodemailer** to send real-time transaction receipts and alerts.

### 🔑 Idempotency Protection
Prevents duplicate payments during retries using unique transaction keys.

### 🔐 Secure Authentication
JWT-based authentication with secure login/logout flow.

---

## 🛠️ Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- Lucide React Icons
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Nodemailer
- JWT

---

## 📂 Project Structure

```bash
Bank_Transaction_System/
├── frontend/
│   ├── src/
│   └── package.json
│
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── app.js
│
├── server.js
└── package.json
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/rishabhshuklaaa/Bank_Transaction_System.git
cd Bank_Transaction_System
npm install
```

---

### 2️⃣ Backend Environment Setup

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Developed By

**Rishabh Shukla**