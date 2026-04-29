# 🏦 SkyBank: Professional MERN Banking System

**SkyBank** is a high-integrity financial application built with a **Ledger-based architecture**. It prioritizes data consistency and security, ensuring that every transaction is atomic, traceable, and notified in real-time.

---

## 🚀 Key Features & Core Logic
This project implements enterprise-level banking principles that go beyond basic CRUD:

* **⚡ Atomic Transactions (ACID Compliance):** Utilizes **MongoDB Sessions** to ensure that money transfers are "all-or-nothing." If the recipient credit fails, the sender's debit is automatically rolled back.
* **📖 Double-Entry Bookkeeping:** Real-time balance is dynamically aggregated from **Ledger logs** (`DEBIT`/`CREDIT`). This ensures 100% auditability and prevents balance tampering.
* **📧 Automated Email Notifications:** Integrated with **Nodemailer** to send instant transaction alerts (Receipts/Alerts) to users for every successful transfer or deposit.
* **🔑 Idempotency Protection:** Prevents accidental duplicate payments during network retries by using unique **Idempotency Keys** for every transaction.
* **🔐 Secure Authentication:** Robust user authentication using **JWT (JSON Web Tokens)** with secure storage and logout functionality.

---

## 🛠️ Tech Stack

### **Frontend**
* `React 18` (Vite) - Component-based UI
* `Tailwind CSS` - Modern Styling
* `Lucide Icons` - Minimalist Iconography
* `Axios` - API Communications

### **Backend**
* `Node.js` & `Express.js` - Server-side Logic
* `MongoDB` & `Mongoose` - NoSQL Database & Schema Modeling
* `Nodemailer` - SMTP Email Service
* `JWT` - Secure Authorization

---

## 📂 Project Structure
```plaintext
Bank_Transaction_System/
├── frontend/             # React + Vite App (UI/UX)
│   ├── src/              # api, components, context, pages
│   └── package.json
├── src/                  # Node.js + Express Backend
│   ├── controllers/      # Atomic Tx & Account Logic
│   ├── middleware/       # JWT Auth & Validation
│   ├── models/           # DB Schemas (User, Tx, Ledger)
│   ├── routes/           # Secure API Endpoints
│   ├── services/         # Email (Nodemailer) Service
│   └── app.js            # Express Config
├── server.js             # Entry Point
└── package.json          # Dependencies

---

## ⚙️ Setup & Installation

### **1. 📥 Clone & Install**

git clone [https://github.com/rishabhshuklaaa/Bank_Transaction_System.git](https://github.com/rishabhshuklaaa/Bank_Transaction_System.git)
cd Bank_Transaction_System
npm install

2. 🖥️ Backend Setup (.env)
Create a .env file in the root directory and add:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
Run Server: npm run dev

3. 💻 Frontend Setup

cd frontend
npm install
npm run dev

Developed with ❤️ by Rishabh Shukla

