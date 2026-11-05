import Feedback from '../models/Feedback.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const { complaintId, rating, comment, timelinessRating, workQualityRating } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const feedback = await Feedback.create({
      complaint: complaintId,
      citizen: req.user.id,
      rating: Number(rating) || 5,
      comment: comment || '',
      timelinessRating: Number(timelinessRating) || 5,
      workQualityRating: Number(workQualityRating) || 5,
    });

    // Reward citizen with civic bonus points for closing feedback loop
    await User.findByIdAndUpdate(req.user.id, { $inc: { civicPoints: 5 } });

    res.status(201).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackForComplaint = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ complaint: req.params.complaintId })
      .populate('citizen', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedback.length, feedback });
  } catch (error) {
    next(error);
  }
};
