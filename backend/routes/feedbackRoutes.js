import express from 'express';
import { submitFeedback, getFeedbackForComplaint } from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/:complaintId', getFeedbackForComplaint);

export default router;
