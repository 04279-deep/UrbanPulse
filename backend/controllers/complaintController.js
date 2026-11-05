import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { analyzeDamageImage, classifyComplaintText } from '../services/aiClient.js';
import { emitToRole, emitToUser, broadcastEvent } from '../services/socketService.js';
import path from 'path';

// Helper to map category to department code
const categoryToDeptCode = {
  road_damage: 'ROADS',
  garbage: 'WASTE',
  drainage_waterlogging: 'DRAINAGE',
  streetlight: 'LIGHTING',
  water_leakage: 'WATER',
  traffic: 'TRAFFIC',
  other: 'ROADS',
};

// @desc    Create new infrastructure complaint
// @route   POST /api/complaints
export const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      ward,
      landmark,
    } = req.body;

    // Generate unique Ticket ID
    const count = await Complaint.countDocuments();
    const ticketId = `UP-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        caption: file.originalname,
      }));
    } else if (req.body.imageUrl) {
      images = [{ url: req.body.imageUrl, caption: 'Report Image' }];
    }

    // Determine initial category
    let finalCategory = category || 'road_damage';
    let aiAnalysisResult = {
      detectedCategory: finalCategory,
      confidence: 0.85,
      predictedSeverity: 'medium',
      detectedObjects: [],
      riskIndex: 50,
      isSimulated: false,
      analysisSummary: 'Standard submission awaiting AI inspection.',
      processedAt: new Date(),
    };

    // Run Python AI NLP classification on text
    try {
      const nlpRes = await classifyComplaintText(title, description);
      if (nlpRes && nlpRes.suggested_category) {
        if (!category || category === 'other') {
          finalCategory = nlpRes.suggested_category;
        }
      }
    } catch (nlpErr) {
      console.warn('[AI NLP Error]:', nlpErr.message);
    }

    // Run Python AI Vision Damage Detection if image provided
    if (req.files && req.files.length > 0) {
      try {
        const primaryFilePath = path.resolve(req.files[0].path);
        const visionRes = await analyzeDamageImage(primaryFilePath, finalCategory);

        if (visionRes && visionRes.success) {
          aiAnalysisResult = {
            detectedCategory: visionRes.detected_category || finalCategory,
            confidence: visionRes.confidence || 0.88,
            predictedSeverity: visionRes.predicted_severity || 'medium',
            detectedObjects: visionRes.detected_objects || [],
            potholeCount: visionRes.pothole_count || 0,
            garbageDensityScore: visionRes.garbage_density_score || 0,
            riskIndex: visionRes.risk_index || 55,
            isSimulated: visionRes.is_simulated || false,
            analysisSummary: visionRes.analysis_summary || 'Computer Vision inspection completed.',
            processedAt: new Date(),
          };
          finalCategory = visionRes.detected_category || finalCategory;
        }
      } catch (visErr) {
        console.warn('[AI Vision Error]:', visErr.message);
      }
    }

    // Match appropriate municipal department
    const targetCode = categoryToDeptCode[finalCategory] || 'ROADS';
    const dept = await Department.findOne({ code: targetCode });

    const complaint = await Complaint.create({
      ticketId,
      title,
      description,
      category: finalCategory,
      severity: aiAnalysisResult.predictedSeverity || 'medium',
      status: 'submitted',
      location: {
        latitude: parseFloat(latitude) || 28.6139,
        longitude: parseFloat(longitude) || 77.2090,
        address: address || 'Smart City Zone A',
        ward: ward || 'Ward 12 - Civic District',
        landmark: landmark || '',
      },
      images,
      reportedBy: req.user.id,
      department: dept ? dept._id : null,
      aiAnalysis: aiAnalysisResult,
      statusTimeline: [
        {
          status: 'submitted',
          updatedBy: req.user.name,
          note: 'Complaint registered by citizen with AI automated triage.',
          timestamp: new Date(),
        },
      ],
    });

    // Increment user's civic points
    await User.findByIdAndUpdate(req.user.id, { $inc: { civicPoints: 10 } });

    // Update department active count
    if (dept) {
      await Department.findByIdAndUpdate(dept._id, { $inc: { activeIssuesCount: 1 } });
    }

    // Create Notification for citizen
    await Notification.create({
      recipient: req.user.id,
      title: 'Complaint Registered Successfully',
      message: `Your complaint #${ticketId} (${title}) has been verified by UrbanPulse AI and forwarded to ${dept ? dept.name : 'Municipal Authorities'}.`,
      type: 'complaint_status',
      complaint: complaint._id,
    });

    // Notify authority and broadcast
    emitToRole('authority', 'new_complaint', complaint);
    emitToRole('admin', 'new_complaint', complaint);
    broadcastEvent('complaint_stream_update', {
      type: 'CREATED',
      ticketId,
      category: finalCategory,
      severity: complaint.severity,
    });

    res.status(201).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints with multi-criteria filtering
// @route   GET /api/complaints
export const getComplaints = async (req, res, next) => {
  try {
    const { category, severity, status, ward, search, myComplaints } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (severity && severity !== 'all') {
      filter.severity = severity;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (ward && ward !== 'all') {
      filter['location.ward'] = ward;
    }
    if (myComplaints === 'true' && req.user) {
      filter.reportedBy = req.user.id;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('reportedBy', 'name email avatar civicPoints')
      .populate('department', 'name code headOfficer')
      .populate('assignedTeam', 'name leaderName contactNumber status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID or Ticket ID
// @route   GET /api/complaints/:id
export const getComplaintById = async (req, res, next) => {
  try {
    let complaint;
    if (req.params.id.startsWith('UP-')) {
      complaint = await Complaint.findOne({ ticketId: req.params.id });
    } else {
      complaint = await Complaint.findById(req.params.id);
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint = await complaint.populate([
      { path: 'reportedBy', select: 'name email phone avatar' },
      { path: 'department', select: 'name code contactEmail contactPhone headOfficer' },
      { path: 'assignedTeam', select: 'name leaderName contactNumber status vehicleId' },
    ]);

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note, assignedTeamId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const prevStatus = complaint.status;
    complaint.status = status;

    if (assignedTeamId) {
      complaint.assignedTeam = assignedTeamId;
    }

    if (status === 'resolved') {
      complaint.resolutionDetails.resolvedAt = new Date();
      complaint.resolutionDetails.resolutionNotes = note || 'Issue remediated by field repair crew.';
      if (complaint.department) {
        await Department.findByIdAndUpdate(complaint.department, {
          $inc: { activeIssuesCount: -1, resolvedIssuesCount: 1 },
        });
      }
    }

    complaint.statusTimeline.push({
      status,
      updatedBy: req.user.name,
      note: note || `Status updated from ${prevStatus} to ${status}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Trigger citizen notification
    await Notification.create({
      recipient: complaint.reportedBy,
      title: `Complaint #${complaint.ticketId} Updated`,
      message: `Your report status changed to "${status.replace('_', ' ').toUpperCase()}". Note: ${note || 'Status verified by municipal office.'}`,
      type: 'complaint_status',
      complaint: complaint._id,
    });

    emitToUser(complaint.reportedBy.toString(), 'complaint_updated', complaint);
    broadcastEvent('complaint_stream_update', {
      type: 'STATUS_CHANGED',
      ticketId: complaint.ticketId,
      status,
    });

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote a complaint
// @route   POST /api/complaints/:id/upvote
export const upvoteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const index = complaint.upvotes.indexOf(req.user.id);
    if (index === -1) {
      complaint.upvotes.push(req.user.id);
    } else {
      complaint.upvotes.splice(index, 1);
    }

    await complaint.save();

    res.json({
      success: true,
      upvotesCount: complaint.upvotes.length,
      hasUpvoted: index === -1,
    });
  } catch (error) {
    next(error);
  }
};
