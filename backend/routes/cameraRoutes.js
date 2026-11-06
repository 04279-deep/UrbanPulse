import express from 'express';
import { getCameras, addCamera, updateCameraStatus } from '../controllers/cameraController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getCameras).post(protect, authorize('admin', 'authority'), addCamera);
router.route('/:id/status').put(protect, authorize('admin', 'authority'), updateCameraStatus);

export default router;
