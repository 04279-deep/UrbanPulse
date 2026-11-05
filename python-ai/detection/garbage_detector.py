import cv2
import numpy as np
from typing import Dict, Any, List

class GarbageDetector:
  """
  Garbage and solid waste accumulation detector using OpenCV.
  Analyzes high color variance, irregular texture patches, and non-uniform debris clusters.
  """

  def detect(self, image_bytes: bytes) -> Dict[str, Any]:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
      return {
        "success": False,
        "error": "Failed to decode image",
        "debris_clusters": 0,
        "is_simulated": True,
      }

    h, w, _ = img.shape
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Calculate local entropy / texture irregularity
    edges = cv2.Canny(gray, 60, 180)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
    dilated_edges = cv2.dilate(edges, kernel, iterations=2)

    contours, _ = cv2.findContours(dilated_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    bounding_boxes: List[Dict[str, Any]] = []
    total_waste_area = 0
    min_area = (h * w) * 0.02
    max_area = (h * w) * 0.65

    for cnt in contours:
      area = cv2.contourArea(cnt)
      if min_area < area < max_area:
        x, y, bw, bh = cv2.boundingRect(cnt)
        # Check saturation & color entropy inside bbox
        roi_hsv = hsv[y:y+bh, x:x+bw]
        if roi_hsv.size > 0:
          sat_std = np.std(roi_hsv[:, :, 1])
          val_std = np.std(roi_hsv[:, :, 2])
          # Garbage typically has high dispersion in saturation and value (colorful plastic, wrappers, organic waste)
          if sat_std > 20 or val_std > 25:
            total_waste_area += area
            conf = round(min(0.95, 0.68 + (area / (h * w)) * 0.8), 2)
            bounding_boxes.append({
              "label": "waste_accumulation",
              "confidence": conf,
              "bbox": [int(x), int(y), int(bw), int(bh)],
            })

    debris_coverage_pct = round((total_waste_area / (h * w)) * 100, 2)
    clusters_count = len(bounding_boxes)

    if clusters_count == 0:
      severity = "low"
      summary = "No significant open garbage piles detected."
    elif clusters_count == 1:
      severity = "medium" if debris_coverage_pct < 15 else "high"
      summary = f"Detected 1 concentrated refuse pile covering ~{debris_coverage_pct}% of ground."
    else:
      severity = "critical" if debris_coverage_pct > 25 else "high"
      summary = f"Severe accumulation: {clusters_count} waste clusters detected (~{debris_coverage_pct}% area)."

    return {
      "success": True,
      "debris_clusters": clusters_count,
      "bounding_boxes": bounding_boxes,
      "coverage_percentage": debris_coverage_pct,
      "severity": severity,
      "confidence": round(float(np.mean([b["confidence"] for b in bounding_boxes])) if bounding_boxes else 0.85, 2),
      "engine": "OpenCV-EntropyColor-Waste-v1.0",
      "is_simulated": False,
      "summary": summary,
    }
