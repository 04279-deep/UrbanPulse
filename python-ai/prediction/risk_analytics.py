import numpy as np
from typing import List, Dict, Any

class SpatialRiskAnalytics:
  """
  Analyzes multi-point civic complaints, clusters hotspots,
  and calculates localized risk indices (0-100) across municipal zones.
  """

  def analyze_hotspots(self, complaints: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not complaints:
      return {
        "hotspots": [],
        "city_wide_risk_index": 25.0,
        "high_priority_zones": [],
        "total_analyzed": 0,
      }

    zone_stats = {}
    severity_weights = {"low": 1.0, "medium": 2.2, "high": 4.5, "critical": 8.0}

    for c in complaints:
      loc = c.get("location", {})
      ward = loc.get("ward", "General Urban Ward")
      lat = loc.get("latitude", 28.6139)
      lng = loc.get("longitude", 77.2090)
      sev = c.get("severity", "medium").lower()
      weight = severity_weights.get(sev, 2.0)

      if ward not in zone_stats:
        zone_stats[ward] = {
          "ward": ward,
          "center_lat": lat,
          "center_lng": lng,
          "complaint_count": 0,
          "weighted_score": 0.0,
          "categories": {},
          "critical_count": 0,
        }

      z = zone_stats[ward]
      z["complaint_count"] += 1
      z["weighted_score"] += weight
      if sev == "critical":
        z["critical_count"] += 1

      cat = c.get("category", "other")
      z["categories"][cat] = z["categories"].get(cat, 0) + 1

    hotspots = []
    total_score = 0

    for ward, data in zone_stats.items():
      count = data["complaint_count"]
      # Calculate localized risk index (0 to 100)
      risk_index = round(min(99.0, (data["weighted_score"] / max(1, count)) * 12.0 + (count * 2.5)), 1)
      total_score += risk_index

      dominant_issue = max(data["categories"].items(), key=lambda x: x[1])[0] if data["categories"] else "general"

      hotspots.append({
        "ward": ward,
        "latitude": data["center_lat"],
        "longitude": data["center_lng"],
        "complaint_count": count,
        "risk_index": risk_index,
        "dominant_issue": dominant_issue,
        "critical_issues": data["critical_count"],
        "status": "Red Alert" if risk_index >= 75 else ("Warning" if risk_index >= 50 else "Stable"),
      })

    hotspots.sort(key=lambda x: x["risk_index"], reverse=True)
    city_risk = round(total_score / max(1, len(hotspots)), 1) if hotspots else 30.0

    return {
      "city_wide_risk_index": city_risk,
      "hotspots": hotspots,
      "high_priority_zones": [h["ward"] for h in hotspots if h["risk_index"] >= 65],
      "total_analyzed": len(complaints),
    }
