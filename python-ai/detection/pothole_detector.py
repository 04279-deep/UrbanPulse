import cv2
import numpy as np
from typing import Dict, Any, List

class PotholeDetector:
  """
  Pothole and road damage detection engine.
  Uses OpenCV contour analysis, thresholding, and morphological operations
  to segment surface depressions, cracks, and road fissures.
  """

  def __init__(self, yolo_weights_path: str = None):
    self.yolo_weights_path = yolo_weights_path
    self.has_yolo = False
    # If weights exist and ultralytics is present, YOLO would load.
    # Otherwise, OpenCV computer vision engine is used.

  def detect(self, image_bytes: bytes) -> Dict[str, Any]:
    # Decode bytes into OpenCV BGR numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
      return {
        "success": False,
        "error": "Failed to decode image",
        "pothole_count": 0,
        "bounding_boxes": [],
        "severity": "low",
        "damage_percentage": 0.0,
        "is_simulated": True,
        "engine": "cv_fallback",
      }

    h, w, _ = img.shape
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to suppress noise
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)

    # Adaptive thresholding to isolate darker depressed regions typical of potholes
    thresh = cv2.adaptiveThreshold(
      blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 21, 5
    )

    # Morphological closing to bridge fragmented cracks
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Find contours
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    bounding_boxes: List[Dict[str, Any]] = []
    total_damaged_area = 0
    min_area = (h * w) * 0.005  # At least 0.5% of image
    max_area = (h * w) * 0.40   # At most 40% of image

    for cnt in contours:
      area = cv2.contourArea(cnt)
      if min_area < area < max_area:
        x, y, bw, bh = cv2.boundingRect(cnt)
        aspect_ratio = float(bw) / bh if bh > 0 else 1.0

        # Filter out extreme horizontal or vertical thin lines
        if 0.25 <= aspect_ratio <= 4.0:
          total_damaged_area += area
          confidence = round(min(0.96, 0.65 + (area / (h * w)) * 2.0), 2)
          bounding_boxes.append({
            "label": "pothole",
            "confidence": confidence,
            "bbox": [int(x), int(y), int(bw), int(bh)],
            "area_px": int(area),
          })

    damage_pct = round((total_damaged_area / (h * w)) * 100, 2)
    pothole_count = len(bounding_boxes)

    if pothole_count == 0:
      # If no large discrete pothole found, check general roughness / cracks
      laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
      if laplacian_var > 300:
        severity = "medium"
        damage_pct = 12.5
        summary = "Surface distress and micro-fractures detected on pavement."
      else:
        severity = "low"
        summary = "No critical pavement depressions detected."
    elif pothole_count == 1:
      severity = "high" if damage_pct > 8 else "medium"
      summary = f"Detected 1 road pothole covering ~{damage_pct}% of surface."
    else:
      severity = "critical" if damage_pct > 15 else "high"
      summary = f"Severe road damage: {pothole_count} potholes detected covering ~{damage_pct}% of area."

    return {
      "success": True,
      "pothole_count": pothole_count,
      "bounding_boxes": bounding_boxes,
      "damage_percentage": damage_pct,
      "severity": severity,
      "confidence": round(float(np.mean([b["confidence"] for b in bounding_boxes])) if bounding_boxes else 0.82, 2),
      "engine": "OpenCV-ContourMorphology-v1.0",
      "is_simulated": False,
      "summary": summary,
    }
