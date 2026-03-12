# 🏦 SkyBank - Modern Full-Stack Banking System

SkyBank is a robust, secure, and intuitive banking application. It features multi-account management, real-time transaction tracking, and an automated ledger system.

## ✨ Key Features
- **Multi-Account Support:** Manage multiple savings/current accounts under one profile.
- **Ledger-Based Tracking:** Real-time DEBIT/CREDIT tracking using a dedicated Ledger source of truth.
- **Smart Dashboard:** Visual insights into recent activity and quick money transfers.
- **Decimal Reference IDs:** Hexadecimal MongoIDs converted to readable decimal numbers.
- **Email Notifications:** Automated alerts for both sender and receiver.

## 📁 Project Structure
- `src/models`: Mongoose schemas (User, Account, Transaction, Ledger)
- `src/controllers`: Business logic and route handlers
- `src/views`: EJS templates with Tailwind CSS
- `src/services`: Email notification service

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Frontend:** EJS, Tailwind CSS
- **Icons:** Lucide Icons

## 🚀 Getting Started
1. Clone the repo: `git clone https://github.com/rishabhshuklaaa/Bank_Transaction_System.git`
2. Install dependencies: `npm install`
3. Set up `.env` with `PORT`, `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, and `EMAIL_PASS`.
4. Run: `npm run dev`

---
Developed by [Rishabh Shukla](https://github.com/rishabhshuklaaa)