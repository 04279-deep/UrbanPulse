from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from detection.damage_classifier import UnifiedDamageClassifier
from prediction.nlp_classifier import NLPComplaintClassifier
from prediction.severity_model import IssueSeverityPredictor
from prediction.maintenance_predictor import PredictiveMaintenanceEngine
from prediction.risk_analytics import SpatialRiskAnalytics

app = FastAPI(
  title="UrbanPulse AI Microservice",
  description="Computer Vision & Machine Learning Microservice for Urban Infrastructure Monitoring",
  version="2.0.0",
)

# Enable CORS for frontend and backend microservices
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Initialize engines
vision_classifier = UnifiedDamageClassifier()
nlp_classifier = NLPComplaintClassifier()
severity_predictor = IssueSeverityPredictor()
maintenance_engine = PredictiveMaintenanceEngine()
risk_analytics = SpatialRiskAnalytics()

class TextClassificationRequest(BaseModel):
  title: str
  description: str

class SeverityPredictionRequest(BaseModel):
  category: str
  hour: Optional[int] = 14
  is_vulnerable_zone: Optional[bool] = False
  is_rainy: Optional[bool] = False
  desc_length: Optional[int] = 60
  repeat_reports: Optional[int] = 0

class PredictiveMaintenanceRequest(BaseModel):
  asset_type: str
  age_years: Optional[float] = 3.0
  operational_cycles: Optional[float] = 40.0
  stress_metric: Optional[float] = 50.0
  past_repairs: Optional[int] = 1
  last_inspection_days_ago: Optional[int] = 60

class HotspotsRequest(BaseModel):
  complaints: List[Dict[str, Any]]

@app.get("/")
def root():
  return {
    "platform": "UrbanPulse AI",
    "status": "online",
    "version": "2.0.0",
    "docs_url": "/docs",
  }

@app.get("/health")
def health():
  return {
    "status": "healthy",
    "services": {
      "computer_vision": "active (OpenCV + Contour/Texture Morphological Engine)",
      "nlp_classification": "active (Scikit-Learn TF-IDF + Naive Bayes)",
      "severity_prediction": "active (Random Forest Regressor)",
      "predictive_maintenance": "active (Gradient Boosting Classifier)",
      "spatial_risk": "active (DBSCAN / Density Grid)",
    },
    "simulation_mode": False,
    "note": "Fully functional real-time machine learning & computer vision models active.",
  }

@app.post("/api/ai/detect-damage")
async def detect_damage(
  file: UploadFile = File(...),
  reported_category: Optional[str] = Form(""),
):
  try:
    image_bytes = await file.read()
    if not image_bytes:
      raise HTTPException(status_code=400, detail="Empty file payload")

    result = vision_classifier.process(image_bytes, reported_category=reported_category)
    return result
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")

@app.post("/api/ai/classify-text")
def classify_text(req: TextClassificationRequest):
  combined_text = f"{req.title}. {req.description}"
  return nlp_classifier.classify(combined_text)

@app.post("/api/ai/predict-severity")
def predict_severity(req: SeverityPredictionRequest):
  return severity_predictor.predict(
    category=req.category,
    hour=req.hour,
    is_vulnerable_zone=req.is_vulnerable_zone,
    is_rainy=req.is_rainy,
    desc_length=req.desc_length,
    repeat_reports=req.repeat_reports,
  )

@app.post("/api/ai/predictive-maintenance")
def predict_maintenance(req: PredictiveMaintenanceRequest):
  return maintenance_engine.predict(
    asset_type=req.asset_type,
    age_years=req.age_years,
    operational_cycles=req.operational_cycles,
    stress_metric=req.stress_metric,
    past_repairs=req.past_repairs,
    last_inspection_days_ago=req.last_inspection_days_ago,
  )

@app.post("/api/ai/risk-hotspots")
def get_risk_hotspots(req: HotspotsRequest):
  return risk_analytics.analyze_hotspots(req.complaints)

if __name__ == "__main__":
  import uvicorn
  uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
