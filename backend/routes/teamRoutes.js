import express from 'express';
import { getTeams, assignTeamToComplaint } from '../controllers/teamController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTeams);
router.post('/assign', protect, authorize('authority', 'admin'), assignTeamToComplaint);

export default router;
