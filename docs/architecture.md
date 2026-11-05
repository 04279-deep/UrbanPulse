# UrbanPulse Architecture Documentation

UrbanPulse is a full-stack, distributed smart city infrastructure monitoring and predictive maintenance platform.

## 1. System Topology & Microservices

```
┌────────────────────────────────────────────────────────┐
│                   Client Layer                         │
│  - React.js Web Portal (Tailwind + Leaflet + Recharts) │
│  - React Native Mobile App (Citizen Field Reporting)   │
└───────────────┬─────────────────────────┬──────────────┘
                │                         │
          HTTP REST / JSON           Socket.IO WebSockets
                │                         │
┌───────────────▼─────────────────────────▼──────────────┐
│             Node.js / Express Core Backend             │
│               (Port 5000 / Socket.IO)                  │
│  - Authentication (JWT + Bcrypt)                       │
│  - Incident Lifecycle Controller & Audit Logger        │
│  - Municipal Department & Squad Dispatcher             │
│  - Multer Image Processing & Storage                   │
└───────────────┬─────────────────────────┬──────────────┘
                │                         │
          Mongoose ODM              HTTP REST (Inference)
                │                         │
┌───────────────▼────────┐      ┌─────────▼──────────────┐
│    MongoDB Cluster     │      │   Python AI Microservice│
│ - Users, Complaints    │      │    (FastAPI - Port 8000)│
│ - Departments, Teams   │      │ - OpenCV Contour Engine │
│ - Infrastructure Assets│      │ - TF-IDF Naive Bayes NLP│
│ - Feedback, Audit Logs │      │ - Random Forest Severity│
└────────────────────────┘      │ - Gradient Boosting RUL │
                                └────────────────────────┘
```

## 2. Artificial Intelligence Pipelines

### A. Road Damage & Pothole Extraction (`detection/pothole_detector.py`)
- Employs OpenCV Gaussian filtering and adaptive thresholding to isolate asphalt depressions.
- Morphological closing filters out surface noise while contour bounding computes damaged area percentage.
- Computes pothole count, surface damage percentage, bounding box coordinates, and defect severity (`low`, `medium`, `high`, `critical`).

### B. Garbage & Illegal Dump Accumulation (`detection/garbage_detector.py`)
- Color entropy and saturation variance analysis in HSV color space.
- Detects non-uniform chromatic variance characteristic of commercial and residential trash bags and plastic debris.

### C. Hydrological Waterlogging & Standing Puddles (`detection/waterlogging_detector.py`)
- Isolates specular reflective road sheets using low-gradient specular surface masks on lower-half vehicular corridors.
- Alerts drainage departments for high-water depth blockages.

### D. Natural Language Complaint Triage (`prediction/nlp_classifier.py`)
- Scikit-learn TF-IDF n-gram vectorizer + Multinomial Naive Bayes model.
- Automatically routes freeform citizen descriptions to one of six municipal departments (`ROADS`, `WASTE`, `DRAINAGE`, `WATER`, `LIGHTING`, `TRAFFIC`).

### E. Predictive Maintenance Engine (`prediction/maintenance_predictor.py`)
- Scikit-learn Gradient Boosting Classifier trained on operational hours, asset age, stress metrics, past repair history, and inspection gaps.
- Computes Remaining Useful Life (RUL) in days, condition score (0-100), and recommended preventive actions before catastrophic breakdown occurs.

### F. Spatial Risk Hotspot Clustering (`prediction/risk_analytics.py`)
- Multi-point weighted severity density aggregation across municipal wards.
- Outputs dynamic risk indices (0-100) and priority alert statuses (`Red Alert`, `Warning`, `Stable`).
