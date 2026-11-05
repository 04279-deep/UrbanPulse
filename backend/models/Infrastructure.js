import mongoose from 'mongoose';

const infrastructureSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'streetlight',
        'water_pipeline',
        'road_segment',
        'drainage_culvert',
        'waste_bin',
        'traffic_signal',
      ],
      required: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: '' },
      zone: { type: String, default: 'Zone A' },
    },
    installationDate: {
      type: Date,
      default: () => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 3), // 3 years ago
    },
    lastInspectionDate: {
      type: Date,
      default: Date.now,
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    predictedFailureProbability: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.15,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    status: {
      type: String,
      enum: ['operational', 'needs_maintenance', 'under_repair', 'faulty'],
      default: 'operational',
    },
    telemetry: {
      luxOutput: { type: Number, default: 420 },
      pressurePsi: { type: Number, default: 65 },
      fillPercentage: { type: Number, default: 35 },
      vibrationIndex: { type: Number, default: 2.1 },
      trafficDensityVpm: { type: Number, default: 120 },
    },
  },
  {
    timestamps: true,
  }
);

const Infrastructure = mongoose.model('Infrastructure', infrastructureSchema);
export default Infrastructure;
