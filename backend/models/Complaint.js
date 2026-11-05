import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide complaint title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed description'],
    },
    category: {
      type: String,
      enum: [
        'road_damage',
        'garbage',
        'drainage_waterlogging',
        'streetlight',
        'water_leakage',
        'traffic',
        'other',
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'ai_verified',
        'assigned',
        'in_progress',
        'resolved',
        'rejected',
      ],
      default: 'submitted',
      index: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        default: 'Location recorded via GPS',
      },
      ward: {
        type: String,
        default: 'Ward 12 - Civic District',
      },
      landmark: {
        type: String,
        default: '',
      },
    },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceTeam',
      default: null,
    },
    aiAnalysis: {
      detectedCategory: { type: String, default: 'unverified' },
      confidence: { type: Number, default: 0.0 },
      predictedSeverity: { type: String, default: 'medium' },
      detectedObjects: [
        {
          label: String,
          confidence: Number,
          bbox: [Number],
        },
      ],
      potholeCount: { type: Number, default: 0 },
      garbageDensityScore: { type: Number, default: 0 },
      riskIndex: { type: Number, default: 50 },
      isSimulated: { type: Boolean, default: false },
      analysisSummary: { type: String, default: 'Awaiting AI inspection' },
      processedAt: { type: Date, default: null },
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    statusTimeline: [
      {
        status: { type: String, required: true },
        updatedBy: { type: String, default: 'System' },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resolutionDetails: {
      resolvedAt: { type: Date, default: null },
      resolutionNotes: { type: String, default: '' },
      afterImages: [String],
      verifiedByCitizen: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for geospatial and status queries
complaintSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
complaintSchema.index({ category: 1, status: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
