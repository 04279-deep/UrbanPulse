from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np

TRAINING_CORPUS = [
  ("Deep crater and huge pothole in middle of highway causing tire punctures", "road_damage"),
  ("Broken asphalt and cracked road surface near metro station", "road_damage"),
  ("Pavement broken and severe road depression on main street", "road_damage"),
  ("Dangerous road cave-in and sinkhole after heavy rain", "road_damage"),
  ("Asphalt peeling off and gravel scattered everywhere on crossroad", "road_damage"),
  ("Huge pile of untreated municipal garbage and rotting trash on street corner", "garbage"),
  ("Overflowing dumpster with plastic bags scattered on the sidewalk", "garbage"),
  ("Stinking waste and illegal rubbish dumping site near residential park", "garbage"),
  ("Trash bin broken and domestic garbage spilled across the lane", "garbage"),
  ("Rotting organic waste creating foul smell and stray animals gathering", "garbage"),
  ("Stormwater drain clogged and filthy water overflowing onto main road", "drainage_waterlogging"),
  ("Severe waterlogging and knee-deep standing water after rainstorm", "drainage_waterlogging"),
  ("Blocked sewer line causing black sewage water to flood the lane", "drainage_waterlogging"),
  ("Submerged underpass and flooded junction due to choked drainage canal", "drainage_waterlogging"),
  ("Monsoon rainwater not draining, road converted into stagnant pond", "drainage_waterlogging"),
  ("Streetlight pole sparking and dark road creating safety hazard for women", "streetlight"),
  ("All LED streetlights broken on outer ring road, pitch dark at night", "streetlight"),
  ("Flickering lamp post and exposed electrical wiring near footpath", "streetlight"),
  ("Smart street pole knocked down by vehicle, power cable hanging down", "streetlight"),
  ("Underground drinking water main ruptured and clean water gushing onto road", "water_leakage"),
  ("Supply pipeline burst near overhead tank, massive water loss for 3 days", "water_leakage"),
  ("Low water pressure and continuous leakage from public distribution tap", "water_leakage"),
  ("Cracked municipal water valve leaking gallons of potable water", "water_leakage"),
  ("Traffic signal blinking red constantly causing massive intersection gridlock", "traffic"),
  ("Automated traffic lights out of sync and bottleneck at highway entry", "traffic"),
  ("Illegal roadside parking obstructing bus transit lane and ambulances", "traffic"),
  ("Malfunctioning pedestrian zebra crossing signal and camera sensor", "traffic"),
]

class NLPComplaintClassifier:
  def __init__(self):
    texts = [item[0] for item in TRAINING_CORPUS]
    labels = [item[1] for item in TRAINING_CORPUS]

    self.pipeline = Pipeline([
      ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
      ('clf', MultinomialNB(alpha=0.1)),
    ])
    self.pipeline.fit(texts, labels)
    self.classes = list(self.pipeline.classes_)

  def classify(self, text: str):
    if not text or len(text.strip()) == 0:
      return {
        "suggested_category": "other",
        "confidence": 0.50,
        "urgency": "medium",
        "is_simulated": False,
      }

    probs = self.pipeline.predict_proba([text])[0]
    best_idx = int(np.argmax(probs))
    best_cat = self.classes[best_idx]
    confidence = round(float(probs[best_idx]), 2)

    # Keywords for urgency detection
    lower = text.lower()
    critical_keywords = ["danger", "hazard", "sparking", "sinkhole", "accident", "ambulance", "emergency", "fatal", "flood"]
    high_keywords = ["burst", "ruptured", "broken", "severe", "overflowing", "huge", "dark"]

    if any(k in lower for k in critical_keywords):
      urgency = "critical"
    elif any(k in lower for k in high_keywords):
      urgency = "high"
    else:
      urgency = "medium"

    return {
      "suggested_category": best_cat,
      "confidence": max(0.60, confidence),
      "urgency": urgency,
      "is_simulated": False,
      "probabilities": {cls: round(float(p), 2) for cls, p in zip(self.classes, probs)},
    }
