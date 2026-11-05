import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  upvoteComplaint,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router
  .route('/')
  .post(protect, upload.array('images', 5), createComplaint)
  .get(getComplaints);

router.route('/:id').get(getComplaintById);

router
  .route('/:id/status')
  .put(protect, authorize('authority', 'admin'), updateComplaintStatus);

router.route('/:id/upvote').post(protect, upvoteComplaint);

export default router;
