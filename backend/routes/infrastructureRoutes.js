import express from 'express';
import {
  getInfrastructureAssets,
  getInfrastructureById,
  evaluatePredictiveMaintenance,
} from '../controllers/infrastructureController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getInfrastructureAssets);
router.get('/:id', getInfrastructureById);
router.post(
  '/:id/predictive-maintenance',
  protect,
  authorize('authority', 'admin'),
  evaluatePredictiveMaintenance
);

export default router;
