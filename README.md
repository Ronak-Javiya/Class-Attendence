# Smart Attendance System (Multi-tenant) 🎓

A robust, enterprise-grade attendance tracking platform built for educational institutions. The system uses AI-powered Face Verification, RBAC (Role-Based Access Control) multi-level dashboards, and a background worker queue to handle heavy concurrency during class attendance collection.

Additionally, this project acts as a **Mobile-First Progressive SaaS** and includes full Capacitor integration for compiling the dashboard directly into an Android `.apk` or iOS Native App.

---

## 🚀 Features

*   **Multi-Tenancy:** Single codebase handles multiple institutions (Tenants) simultaneously.
*   **Role-Based Dashboards:** 18 distinct pages tailored for:
    *   **Students:** Face Enrollment, Class Browsing, Attendance Tracking, Disputes.
    *   **Faculty:** Start specific class sessions, Override/Review Attendance, Handle Disputes.
    *   **HOD (Head of Department):** Audit Logs, Override approvals.
    *   **Admin:** Institutional metrics, System-wide overrides, Full Report viewing.
*   **AI Face Verification:** Fast, precise facial recognition powered by a specialized Python Flask microservice.
*   **Asynchronous Bulk Processing:** BullMQ & Redis worker processes attendance validations in the background without blocking the UI.
*   **Native Mobile Support:** Complete `@capacitor` setup allowing the web-app to be packaged securely into Android & iOS apps.
*   **Automated Release Actions:** A `.github/workflows` script automatically builds an Android `.apk` file when you push new git tags (e.g., `v1.0.0`).

---

## 🏗️ Architecture Stack

This project is separated into a Microservice/Monorepo structure.

### 1. Frontend (`/frontend`)
*   **Framework:** React 19 + TypeScript + Vite
*   **Styling:** Tailwind CSS + Radix UI Primitives + Framer Motion (Animations)
*   **State Management:** Zustand (Auth/Store) + React Query (API State)
*   **Routing:** React Router DOM (v7)
*   **Mobile Wrapper:** Capacitor (`@capacitor/core`, `@capacitor/ios`, `@capacitor/android`)

### 2. Backend API (`/backend`)
*   **Framework:** Node.js + Express
*   **Database:** MongoDB + Mongoose (Multi-tenant structured models)
*   **Queue/Worker:** BullMQ (Backed by Redis)
*   **Security:** AES-256-CBC Crypto hashing + JSON Web Tokens (JWT)

### 3. Face Service (`/ai-face-service`)
*   **Framework:** Python 3 + FastAPI
*   **AI Models:** DeepFace / OpenCV embeddings model wrapper
*   *Note: Operates entirely independently. Node.js backend communicates with it over HTTP.*

---

## 🛠️ Installation & Setup

### Requirements:
*   **Node.js** v20+
*   **Python** 3.9+
*   **MongoDB** (Local or Atlas String)
*   **Redis** (Local instance required for BullMQ Background Worker)

### Step 1: Start the Face Verification Service
```bash
cd ai-face-service
python -m venv venv
# On Windows: venv\Scripts\activate.ps1
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Step 2: Set up the Backend
```bash
cd backend
npm install
npm run dev
```

*(You must duplicate `.env.example` as `.env` and fill in your DB/Redis keys first).*

### Step 3: Run the Background Worker Process
Because Attendance validation (comparing 60 faces at once) is extraordinarily CPU-heavy, the main Express server delegates this task. **You must run the worker script alongside the server.**

*(In a new terminal)*
```bash
cd backend
npm run worker:dev
```

### Step 4: Run the Web Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to view the SaaS dashboard.

---

## 📱 Publishing the Native App (Android/iOS)

This project uses Capacitor to wrap the responsive React Web UI into a Native Mobile shell. You don't have to rewrite any Swift or Java code.

### Option 1: The Automated GitHub Way (Android)
We have configured a GitHub Action that spins up a virtual machine, installs Android Studio build tools, compiles your React app, wraps it in the Capacitor android shell, assembles the `.apk` file, and publishes it online for free.

To do this:
1. Ensure all your code is committed: `git add .` -> `git commit -m "update"` -> `git push`
2. Create an exact version tag and push it:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Go to the "Actions" tab on your GitHub repo. Watch the build finish.
4. Go to the "Releases" tab. There is a downloadable `.apk` file there!

### Option 2: Building Manually on your Computer
Whenever you make changes to the React source code (`/frontend/src/...`) and want to update the Native Apps:

```bash
cd frontend

# 1. Compile the React source code
npm run build

# 2. Tell Capacitor to heavily sync the /dist folder into the Native code
npx cap sync
```

*   **For Android:** Open the `frontend/android` folder in Android Studio and hit "Run" to launch the emulator, or hit "Build > APK".
*   **For iOS:** Open the `frontend/ios` folder in Xcode and compile to your physically connected iPhone. *(Requires macOS).*
