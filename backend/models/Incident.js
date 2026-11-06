import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'traffic_congestion',
        'vehicle_accident',
        'illegal_parking',
        'road_blockage',
        'pothole',
        'garbage_accumulation',
        'smoke_fire',
        'waterlogging_flood',
        'crowd_congestion',
        'unauthorized_obstruction',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['detected', 'verified', 'dispatched', 'resolved', 'false_alarm'],
      default: 'detected',
      index: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: '' },
      landmark: { type: String, default: '' },
    },
    camera: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camera',
      default: null,
    },
    cameraName: {
      type: String,
      default: 'Live Detection Feed',
    },
    snapshotUrl: {
      type: String,
      default: '',
    },
    boundingBoxes: [
      {
        label: String,
        confidence: Number,
        bbox: [Number], // [x, y, width, height]
      },
    ],
    modelUsed: {
      type: String,
      default: 'YOLOv8 + OpenCV Computer Vision Engine',
    },
    isSimulated: {
      type: Boolean,
      default: false,
    },
    detectionTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceTeam',
      default: null,
    },
    resolutionTime: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

incidentSchema.index({ district: 1, type: 1, status: 1 });
incidentSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
