# AGENTS.md

This document provides guidelines for agentic coding agents working in the Smart Attendance College repository.

## Build Commands

### Frontend (React + TypeScript + Vite)
```bash
cd frontend
npm run dev              # Start development server
npm run build            # TypeScript check + production build
npm run preview          # Preview production build

# Type checking only (useful for CI)
npx tsc -b               # Run TypeScript compiler
npx tsc -b --noEmit      # Type check without emitting files

# E2E tests with Playwright
npx playwright install    # Install browsers
npx playwright test      # Run all tests
npx playwright test --project=chromium  # Run specific browser
```

### Backend (Node.js + Express)
```bash
cd backend
npm install              # Install dependencies
npm run dev              # Watch mode with nodemon
npm start                # Production start
npm run seed             # Seed database with test users

# Test scripts (requires seeded database)
node src/scripts/test-academic.js     # Class lifecycle tests
node src/scripts/test-enrollment.js   # Enrollment flow tests
node src/scripts/test-attendance.js   # Photo attendance tests
node src/scripts/test-dispute.js      # Dispute workflow tests
```

### AI Face Service (Python + FastAPI)
```bash
cd ai-face-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host [IP_ADDRESS] --port 8000
```

## Code Style Guidelines

### Backend (JavaScript/Node.js)

**Architecture Pattern**: Controllers → Services → Models
- Controllers: Thin HTTP layer, minimal logic, delegate to services
- Services: Business logic, state transitions, validation
- Models: Mongoose schemas with built-in validation

**Imports**: Use CommonJS `require()` syntax
```javascript
const express = require('express');
const mongoose = require('mongoose');
```

**Naming Conventions**:
- Variables/functions: `camelCase`
- Models/Classes: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: `kebab-case.js`

**Error Handling**:
- Use centralized `errorHandler` middleware (registered last)
- Throw errors with `statusCode` property in controllers/services
- Never expose sensitive data in error responses
- Log errors with Winston logger: `logger.error(message, { metadata })`

**Mongoose Schemas**:
- Define enums for status fields (DRAFT, PENDING, ACTIVE, LOCKED, etc.)
- Use `select: false` for sensitive fields (passwordHash, refreshTokenHash)
- Add timestamps: true for createdAt/updatedAt
- Define indexes for frequently queried fields

**API Response Format**:
```javascript
// Success
res.status(200).json({ success: true, data: {...} });

// Error (handled by errorHandler)
res.status(400).json({ success: false, message: '...' });
```

### Frontend (TypeScript/React)

**TypeScript Configuration**: Strict mode enabled in tsconfig.json
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

**Imports**: ES modules with path aliases
```typescript
import api from '@/api/axios';
import useAuthStore from '@/store/authStore';
```

**Component Structure**:
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- Functional components with hooks only (no class components)
- Separate components from business logic (use services/hooks)

**State Management**:
- Zustand: Global client state (auth, theme, toast)
- React Query (TanStack Query): Server state, caching, mutations
- Local state: `useState`, `useReducer` for component-level state

**Naming**:
- Components: `PascalCase`
- Hooks: `camelCase` starting with `use` (e.g., `useAuth`)
- Types/Interfaces: `PascalCase` (e.g., `UserRole`)

**API Client** (`src/api/axios.ts`):
- Axios instance with interceptors for JWT injection
- 401 interceptor redirects to `/login`
- 30-second timeout

### AI Face Service (Python/FastAPI)

**Architecture**: Stateless microservice, no database connections
- Receives images, returns embeddings
- Delegates to `enrollment_embeddings.py` for processing

**Naming**: `snake_case` for functions and variables

**FastAPI Patterns**:
```python
@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-face-service"}

@app.post("/embedding/student")
async def student_embedding(studentId: str = Form(...), images: list[UploadFile] = File(...)):
    # Process images, return embedding
```

**Endpoints**:
- `POST /embedding/student` — Generate mean embedding from 3+ photos
- `POST /embedding/classroom` — Detect all faces in classroom photo

## Architecture Patterns

**Effective Attendance**: Combine `AttendanceEntry` (original) and `AttendanceOverride` (corrections) for non-destructive corrections.

**State Machines**: Class, Lecture, and Dispute entities have strict status transitions defined in service layers.

**Audit Logging**: Every change is logged with userId, timestamp, and action for traceability.

**Photo-Only Attendance**: Faculty uploads classroom photos within 2-hour window; AI generates attendance; lecture locks after processing.

## Security Conventions

- JWT access token: 15-minute expiry
- JWT refresh token: 7-day expiry, stored as hash in DB
- Password hashing: bcrypt with 12 rounds
- Security headers: `helmet` middleware
- Rate limiting: `express-rate-limit` on auth endpoints
- Sensitive fields: Mongoose `select: false` for passwords/tokens

## Access Control Matrix

| Action | Student | Faculty | HOD | Admin |
|--------|:-------:|:-------:|:---:|:-----:|
| Login | Yes | Yes | Yes | Yes |
| Create Class | No | Yes | No | No |
| Approve Class | No | No | Yes | No |
| Request Enrollment | Yes | No | No | No |
| Approve Enrollment | No | No | No | Yes |
| Upload Photos | No | Yes | No | No |
| Resolve Dispute | No | Yes | No | No |
| Override Attendance | No | No | Yes | Yes |
| View Audit Logs | No | No | Yes | Yes |
