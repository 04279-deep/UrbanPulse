# UrbanPulse REST API Reference

Base URL: `http://localhost:5000/api`
AI Service: `http://localhost:8000/api/ai`

---

## Authentication Endpoints

### `POST /auth/register`
Create a new user account.
- **Body**: `{ name, email, password, role, departmentCode, phone, address }`
- **Response**: `{ success: true, token, user: { id, name, email, role, civicPoints } }`

### `POST /auth/login`
Authenticate existing user.
- **Body**: `{ email, password }`
- **Response**: `{ success: true, token, user }`

### `GET /auth/me`
Retrieve currently authenticated profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, user }`

---

## Complaints & Incident Endpoints

### `POST /complaints`
Lodge an infrastructure defect with photo and coordinates.
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Fields**: `title`, `description`, `category`, `ward`, `address`, `landmark`, `latitude`, `longitude`, `images` (file)
- **Response**: `{ success: true, complaint }`

### `GET /complaints`
Retrieve all complaints with multi-criteria filters.
- **Query Params**: `category`, `severity`, `status`, `ward`, `search`, `myComplaints`
- **Response**: `{ success: true, count, complaints }`

### `GET /complaints/:id`
Retrieve single complaint by Mongo ID or Ticket ID (`UP-2026-xxxxx`).

### `PUT /complaints/:id/status`
Update status and append audit log.
- **Headers**: `Authorization: Bearer <token>` (Authority or Admin)
- **Body**: `{ status, note, assignedTeamId }`

### `POST /complaints/:id/upvote`
Toggle citizen priority upvote.

---

## Analytics Endpoints

### `GET /analytics/dashboard`
Aggregated municipal metrics.
- **Response**:
  - `summary`: total complaints, pending, resolved, critical, resolutionRate, cityRiskIndex, totalAssets
  - `categoryStats`: counts per domain
  - `monthlyTrends`: 6-month historical trend
  - `departments`: active vs resolved load per division
  - `aiStats`: accuracy percentages and model engine status
  - `riskHotspots`: spatial risk ranking by ward

---

## Infrastructure & Maintenance Endpoints

### `GET /infrastructure`
List monitored smart city assets (streetlights, water pipes, road segments, bins, culverts).

### `POST /infrastructure/:id/predictive-maintenance`
Trigger real-time machine learning failure probability audit via Python AI service.

---

## Python AI Microservice Direct Endpoints (`:8000`)

### `GET /health`
Inspect status of OpenCV, NLP, and ML models.

### `POST /api/ai/detect-damage`
Inspect photo for potholes, garbage accumulation, or standing water.
- **Form Fields**: `file` (binary), `reported_category` (optional)

### `POST /api/ai/classify-text`
NLP text classification.
- **Body**: `{ title, description }`

### `POST /api/ai/predictive-maintenance`
Predict asset failure probability and health score.
- **Body**: `{ asset_type, age_years, operational_cycles, stress_metric, past_repairs }`
