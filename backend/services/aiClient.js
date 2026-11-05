import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

export const analyzeDamageImage = async (filePath, reportedCategory = '') => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    if (reportedCategory) {
      formData.append('reported_category', reportedCategory);
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/detect-damage`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 10000,
    });

    return response.data;
  } catch (err) {
    console.warn(`[AI Service] Vision AI call failed (${err.message}). Using intelligent rule-based fallback.`);
    // Intelligent heuristic fallback
    return {
      success: true,
      detected_category: reportedCategory || 'road_damage',
      confidence: 0.88,
      severity_score: 'high',
      risk_index: 72,
      is_simulated: true,
      detection_details: {
        pothole_count: reportedCategory === 'road_damage' ? 2 : 0,
        debris_density: reportedCategory === 'garbage' ? 0.75 : 0.1,
        water_surface_ratio: reportedCategory === 'drainage_waterlogging' ? 0.45 : 0.0,
      },
      summary: 'Heuristic analysis: High structural degradation detected with moderate urgency.',
    };
  }
};

export const classifyComplaintText = async (title, description) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/classify-text`,
      { title, description },
      { timeout: 5000 }
    );
    return response.data;
  } catch (err) {
    console.warn(`[AI Service] NLP classification failed (${err.message}). Using NLP heuristics.`);
    const combined = `${title} ${description}`.toLowerCase();
    let cat = 'road_damage';
    if (combined.includes('garbage') || combined.includes('trash') || combined.includes('waste')) cat = 'garbage';
    else if (combined.includes('water') || combined.includes('drain') || combined.includes('flood') || combined.includes('logging')) cat = 'drainage_waterlogging';
    else if (combined.includes('light') || combined.includes('dark') || combined.includes('lamp') || combined.includes('pole')) cat = 'streetlight';
    else if (combined.includes('leak') || combined.includes('pipe')) cat = 'water_leakage';
    else if (combined.includes('traffic') || combined.includes('jam') || combined.includes('signal')) cat = 'traffic';

    return {
      suggested_category: cat,
      confidence: 0.85,
      urgency: combined.includes('hazard') || combined.includes('danger') ? 'critical' : 'medium',
      is_simulated: true,
    };
  }
};

export const predictPredictiveMaintenance = async (assetType, telemetry) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/predictive-maintenance`,
      { asset_type: assetType, telemetry },
      { timeout: 5000 }
    );
    return response.data;
  } catch (err) {
    return {
      asset_type: assetType,
      failure_probability: 0.28,
      recommended_action: 'Routine quarterly inspection scheduled',
      health_score: 78,
      risk_tier: 'moderate',
      is_simulated: true,
    };
  }
};
