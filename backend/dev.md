# Developer Documentation (dev.md)

This document provides a technical deep-dive into the Smart Attendance College backend.

---

## 📂 Directory Structure

```text
backend/
├── src/
│   ├── config/             # Database & environment configs
│   ├── controllers/        # Thin HTTP layer; delegates to services
│   ├── middleware/         # Auth, RBAC, Error Handling, Rate Limiting
│   ├── models/             # Mongoose schemas & data constraints
│   ├── routes/             # API endpoint definitions
│   ├── services/           # Core business logic & state transitions
│   ├── scripts/            # Database seeding & verification tests
│   ├── utils/              # Shared utilities (logger)
│   ├── validators/         # Joi/Express-validator logic
│   ├── workers/            # Async tasks (AI Attendance Generation Stub)
│   └── index.js            # App entry point & route registration
├── .env                    # Secret configuration
└── package.json            # Dependencies & scripts
```

---

## 🔐 Access Control Matrix

| Domain | Action | Student | Faculty | HOD | Admin |
|--------|--------|:-------:|:-------:|:---:|:-----:|
| **Auth** | Login/Refresh | ✅ | ✅ | ✅ | ✅ |
| **Department** | Create/Update | ❌ | ❌ | ✅ | ✅ |
| **Class** | Create (Draft) | ❌ | ✅ | ❌ | ❌ |
| **Class** | Approve/Reject | ❌ | ❌ | ✅ | ❌ |
| **Enrollment** | Request | ✅ | ❌ | ❌ | ❌ |
| **Enrollment** | Approve/Reject | ❌ | ❌ | ❌ | ✅ |
| **Lecture** | Create/Upload | ❌ | ✅ | ❌ | ❌ |
| **Attendance** | View (Personal) | ✅ | ❌ | ❌ | ❌ |
| **Attendance** | View (Class) | ❌ | ✅ | ✅ | ✅ |
| **Dispute** | Raise | ✅ | ❌ | ❌ | ❌ |
| **Dispute** | Resolve | ❌ | ✅ | ❌ | ❌ |
| **Dispute** | Override | ❌ | ❌ | ✅ | ✅ |
| **Audit** | View Logs | ❌ | ❌ | ✅ | ✅ |

---

## 🛣️ API Endpoints

### 1. Identity & Access (`/api/auth`)
- `POST /login`: Generate JWT access/refresh tokens.
- `POST /refresh`: Renew access token.
- `POST /logout`: Invalidate refresh token.
- `GET /me`: Request user profile.

### 2. Academic Structure (`/api/departments` & `/api/classes`)
- `POST /departments`: Create a department (Admin/HOD).
- `POST /classes`: Create a class (Faculty).
- `POST /classes/:id/submit`: Submit class for HOD approval.
- `POST /classes/:id/approve`: HOD approval.
- `POST /classes/:id/timetable`: Add schedule slot.

### 3. Enrollment (`/api/enrollments`)
- `POST /request`: Student requests class entry.
- `GET /pending`: Admin lists requests.
- `POST /:id/approve`: Admin approves student.

### 4. Attendance Domain (`/api`)
- `POST /lectures`: Faculty creates session session.
- `POST /lectures/:id/photos`: Append-only photo evidence.
- `GET /attendance/my`: Student views own record.
- `GET /attendance/class/:classId`: Class-wide summary.

### 5. Disputes (`/api/disputes`)
- `POST /`: Student raises dispute (within 72h).
- `POST /:id/resolve`: Faculty resolution.
- `POST /override/:id`: Admin/HOD force-change.
- `GET /effective/my`: Computed status (Original + Override).

---

## ⚙️ Configuration (.env)

| Key | Description | Example |
|-----|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | Database connection | `mongodb://...` |
| `JWT_ACCESS_SECRET` | Secret for short-lived token | `access_secret` |
| `JWT_REFRESH_SECRET` | Secret for long-lived token | `refresh_secret` |
| `ACCESS_TOKEN_EXPIRY` | Token life | `15m` |
| `REFRESH_TOKEN_EXPIRY` | Token life | `7d` |

---

## 🧩 Key Architecture Patterns

- **Effective Attendance Pattern**: Combines `AttendanceEntry` (original) and `AttendanceOverride` (layer) to provide a non-destructive correction workflow.
- **Async Employee Stub**: `attendanceWorker.js` uses `setImmediate` to pretend to run AI face recognition, marking enrolled students present. This is designed for easy replacement with a real pipeline.
- **State Machine Enforcement**: All primary entities (`Class`, `Lecture`, `Dispute`) have strictly defined status enumerations and valid transition maps in their service layer.
