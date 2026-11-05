# UrbanPulse – Smart Urban Infrastructure Monitoring & Analytics Platform

UrbanPulse is a full-stack, distributed smart city infrastructure monitoring, computer vision triage, and predictive maintenance platform. It bridges citizens and municipal engineering divisions with automated defect detection, GIS incident mapping, and spatial hazard analytics.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │             CLIENT LAYER               │
                      │  • React 18 Web Portal (Vite + TW)     │
                      │  • React Native Mobile Application     │
                      └──────────────────┬─────────────────────┘
                                         │
                    HTTP REST / JSON     │   Socket.IO WebSockets
                                         │
                      ┌──────────────────▼─────────────────────┐
                      │        NODE.JS EXPRESS BACKEND         │
                      │               (Port 5000)              │
                      │  • JWT Authentication & RBAC           │
                      │  • Incident Lifecycle & Audit Log      │
                      │  • Department & Squad Dispatcher       │
                      │  • Multer Multipart Media Handler      │
                      └───────────────┬────────────┬───────────┘
                                      │            │
                         Mongoose ODM │            │ HTTP REST
                                      │            │
┌─────────────────────────────────────▼──┐      ┌──▼───────────────────────────────────┐
│            MONGODB DATABASE            │      │        PYTHON AI MICROSERVICE        │
│  • Users (Citizen, Authority, Admin)   │      │         (FastAPI - Port 8000)        │
│  • Complaints & Status Timelines       │      │  • OpenCV Road Pothole Detector      │
│  • Departments & Maintenance Squads    │      │  • Multi-Spectral Waste Segmenter    │
│  • Infrastructure Assets & Telemetry   │      │  • Hydrological Waterlog Engine      │
│  • Notifications & Citizen Feedback    │      │  • TF-IDF Naive Bayes NLP Triage     │
└────────────────────────────────────────┘      │  • Gradient Boosting Asset RUL       │
                                                │  • DBSCAN Ward Spatial Risk Index    │
                                                └──────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

1. **Computer Vision Defect Extraction (OpenCV + Feature Segmentation)**
   - **Road & Potholes**: Adaptive thresholding and morphological closure isolate pavement depressions, compute damaged surface percentage, bounding boxes, and severity.
   - **Solid Waste**: Color entropy dispersion and texture irregularity identify roadside dumping clusters.
   - **Drainage & Floods**: Specular gradient detection maps standing puddles and submerged transit lanes.
   - **Streetlights**: Luminance deficiency detection and dark-zone alerts.
   - **Water Main Leaks**: Surface runoff plume detection.

2. **NLP Automated Complaint Triage**
   - Scikit-learn TF-IDF vectorizer + Multinomial Naive Bayes pipeline trained on realistic civic complaints.
   - Automatically routes freeform citizen descriptions to the proper municipal department.

3. **Predictive Maintenance for Smart City Infrastructure**
   - Scikit-learn Gradient Boosting model predicts asset breakdown probability, remaining useful life (RUL), and condition scores (0-100) from telemetry (vibration, pressure, lux output, operating cycles).

4. **Interactive GIS Smart City Map (Leaflet & OpenStreetMap)**
   - Category filtering (Road, Waste, Drainage, Streetlight, Water, Traffic).
   - Priority severity color-coded markers (Critical, High, Medium, Resolved).
   - Spatial hazard risk density circles.
   - Interactive popups with photo previews and live tracking links.

5. **Role-Based Portals & Dashboards**
   - **Citizen Dashboard**: Track reported incidents, earn civic reputation points, and collect badges (*"Pothole Hunter"*, *"First Responder"*).
   - **Municipal Authority Hub**: Triage queue, dispatch repair crews, update statuses, and trigger AI predictive maintenance audits.
   - **City Admin Suite**: Command-wide telemetry, department SLAs, fleet monitoring, and microservice mesh health.

6. **Citizen Feedback Loop & Public Audit Trail**
   - 5-star citizen satisfaction ratings on quality and timeliness.
   - Immutable audit trail recording every status change with timestamps and technician notes.

---

## 📁 Repository Directory Structure

```
urbanpulse/
│
├── frontend/                     # React 18 + Vite + Tailwind CSS Web Portal
│   ├── public/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, Reusable UI widgets
│   │   ├── context/              # AuthContext & Socket.IO client state
│   │   ├── pages/                # Landing, Map, Report, Tracking, Dashboards
│   │   ├── services/             # Axios API client & WebSocket mesh
│   │   ├── App.jsx               # React Router routes & RBAC guards
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                      # Node.js + Express + Mongoose + Socket.IO Core
│   ├── config/                   # MongoDB connection & in-memory fallback
│   ├── controllers/              # Auth, Complaints, Analytics, Infrastructure, Teams
│   ├── middleware/               # JWT Protect, Role Authorize, Multer Upload, ErrorHandler
│   ├── models/                   # 9 Mongoose schemas with strict validations
│   ├── routes/                   # REST API routes mounted under /api/
│   ├── services/                 # AI microservice client & Socket.IO broadcaster
│   ├── uploads/                  # Local media disk storage
│   ├── seed.js                   # Pre-populated database seeder script
│   ├── server.js                 # HTTP & WebSocket entrypoint
│   └── package.json
│
├── python-ai/                    # FastAPI Computer Vision & Machine Learning Service
│   ├── detection/                # Pothole, Garbage, Waterlog CV detectors
│   ├── prediction/               # NLP classifier, Severity regressor, Maintenance RUL
│   ├── main.py                   # FastAPI REST server with CORS & OpenAPI docs
│   └── requirements.txt
│
├── mobile/                       # React Native Citizen Application
│   ├── src/
│   │   └── services/             # Mobile Axios client
│   ├── App.js                    # Bottom tab navigation & screens
│   ├── app.json                  # Expo configuration & hardware permissions
│   └── package.json
│
├── docs/                         # Technical documentation & API references
│   ├── architecture.md
│   └── api.md
│
├── .env.example
└── README.md
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites
- **Node.js**: v18+ (v24 recommended)
- **Python**: v3.10+ (v3.11 recommended)
- **MongoDB**: Local MongoDB or MongoDB Atlas (Includes automatic In-Memory fallback)

---

### Step 1: Start the Python AI Microservice

```powershell
cd python-ai
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install AI dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Verify AI Service*: Open `http://127.0.0.1:8000/docs` to test interactive Swagger endpoints.

---

### Step 2: Start the Node.js Express Backend

```powershell
cd backend
# Install backend dependencies
npm install

# (Optional) Seed database with demo accounts and infrastructure assets
npm run seed

# Start Express server on port 5000
npm start
```
*Database Notice*: If local MongoDB is not running on `27017`, the backend automatically launches a seamless **MongoDB In-Memory Server** with pre-seeded data.

---

### Step 3: Start the React Frontend

```powershell
cd frontend
# Install dependencies
npm install

# Launch Vite dev server on port 5173
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Step 4: React Native Mobile Application

```powershell
cd mobile
npm install
npm start
```

---

## 🔑 Pre-Seeded Demo Accounts

Use these one-click credentials on the Login page or Navbar demo switcher:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@urbanpulse.io` | `password123` | Report issues, track status, earn civic points & badges |
| **Municipal Authority** | `authority@urbanpulse.io` | `password123` | Department dispatch, status updates, run asset AI audits |
| **Chief Admin** | `admin@urbanpulse.io` | `password123` | City-wide analytics, department oversight, fleet manager |

---

## 🧪 Verification & Testing Commands

### 1. Test Backend Health & Analytics API
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/dashboard" -Method Get
```

### 2. Test Python AI NLP Classification
```powershell
$body = @{ title = "Road Collapse"; description = "Dangerous sinkhole on 5th avenue near school" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/ai/classify-text" -Method Post -Body $body -ContentType "application/json"
```

### 3. Test Predictive Maintenance Engine
```powershell
$body = @{ asset_type = "water_pipeline"; age_years = 5.0; operational_cycles = 85.0; stress_metric = 75.0; past_repairs = 3 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/ai/predictive-maintenance" -Method Post -Body $body -ContentType "application/json"
```

---

## 📜 License
Developed for the Smart City Urban Infrastructure Initiative. Distributed under ISC License.
