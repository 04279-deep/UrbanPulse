import express from 'express';
import {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  getIncidentStats,
} from '../controllers/incidentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getIncidents).post(createIncident);
router.route('/stats').get(getIncidentStats);
router.route('/:id/status').put(protect, authorize('authority', 'admin'), updateIncidentStatus);

export default router;
