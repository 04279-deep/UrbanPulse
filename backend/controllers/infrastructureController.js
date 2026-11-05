import Infrastructure from '../models/Infrastructure.js';
import MaintenanceHistory from '../models/MaintenanceHistory.js';
import { predictPredictiveMaintenance } from '../services/aiClient.js';

export const getInfrastructureAssets = async (req, res, next) => {
  try {
    const { type, riskLevel, status } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (riskLevel && riskLevel !== 'all') filter.riskLevel = riskLevel;
    if (status && status !== 'all') filter.status = status;

    const assets = await Infrastructure.find(filter).populate('department', 'name code');
    res.json({ success: true, count: assets.length, assets });
  } catch (error) {
    next(error);
  }
};

export const getInfrastructureById = async (req, res, next) => {
  try {
    const asset = await Infrastructure.findById(req.params.id).populate('department', 'name code');
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Infrastructure asset not found' });
    }

    const history = await MaintenanceHistory.find({ infrastructure: asset._id }).sort({ performedAt: -1 });

    res.json({
      success: true,
      asset,
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const evaluatePredictiveMaintenance = async (req, res, next) => {
  try {
    const asset = await Infrastructure.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Call Python AI microservice
    const aiPrediction = await predictPredictiveMaintenance(asset.type, asset.telemetry);

    if (aiPrediction) {
      asset.healthScore = aiPrediction.health_score || asset.healthScore;
      asset.predictedFailureProbability = aiPrediction.failure_probability || asset.predictedFailureProbability;
      if (aiPrediction.risk_tier === 'critical') asset.riskLevel = 'critical';
      else if (aiPrediction.risk_tier === 'elevated') asset.riskLevel = 'high';
      else asset.riskLevel = 'low';

      await asset.save();
    }

    res.json({
      success: true,
      asset,
      aiPrediction,
    });
  } catch (error) {
    next(error);
  }
};
