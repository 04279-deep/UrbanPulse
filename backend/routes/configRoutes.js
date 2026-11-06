import express from 'express';
import { getConfig, updateConfig, validateService } from '../controllers/configController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/settings', getConfig);
router.put('/settings', protect, authorize('admin'), updateConfig);
router.post('/validate/:service', validateService);

export default router;
