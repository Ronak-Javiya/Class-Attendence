# Smart Attendance College — Backend

A robust, institutional-grade attendance management system where attendance is **photo-generated, audit-safe, and immutable by default**.

## 🚀 Overview

The Smart Attendance College platform automates student attendance tracking using classroom photos. It eliminates manual marking errors and fraud by using a strict, system-generated, and auditable workflow.

### Key Value Propositions
- **Fraud-Proof**: Attendance is generated ONLY from photos uploaded by the faculty.
- **Audit-Safe**: Every change to attendance (via disputes) is permanently logged with full traceability.
- **Role-Based**: Strict access control for Students, Faculty, HODs, and Admins.
- **State-Driven**: Components follow rigorous state machines (e.g., Classes must be HOD-approved; Lectures must be locked).

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Security**: JWT (Access/Refresh), bcrypt, Helmet, Rate Limiter
- **Logging**: Winston

---

## 📦 Core Modules

1. **Identity & Access (IAM)**: Robust authentication and role-based access control.
2. **Academic Structure**: Management of Departments, Classes, and Timetables with HOD approval workflows.
3. **Enrollment & Approval**: Student requests to join classes with Admin approval.
4. **Attendance Domain**: Photo-only attendance generation with a strict 2-hour upload window.
5. **Dispute & Audit**: Student-initiated disputes and auditable overrides.

---

## 🏃 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation
1. Clone the repository and navigate to the backend folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see `backend/.env.example`).
4. Seed initial data:
   ```bash
   npm run seed
   ```

### Running the App
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

---

## 🧪 Verification
The system includes comprehensive test scripts for each domain:
- `node src/scripts/test-academic.js` — Test class lifecycle.
- `node src/scripts/test-enrollment.js` — Test student enrollment.
- `node src/scripts/test-attendance.js` — Test photo-only attendance.
- `node src/scripts/test-dispute.js` — Test dispute/override workflow.

---

## 📖 Further Documentation
- For technical details, API specs, and directory structure, see [dev.md](./dev.md).
