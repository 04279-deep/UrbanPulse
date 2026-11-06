import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema(
  {
    cameraId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['webcam', 'ip_camera', 'cctv_feed', 'uploaded_footage'],
      default: 'ip_camera',
    },
    district: {
      type: String,
      required: true,
      default: 'NTR', // e.g. Vijayawada
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: '' },
      landmark: { type: String, default: '' },
    },
    streamUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'error'],
      default: 'active',
    },
    resolution: {
      type: String,
      default: '1080p Full HD',
    },
    fps: {
      type: Number,
      default: 30,
    },
    detectionCategories: [
      {
        type: String,
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
    totalIncidentsDetected: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Camera = mongoose.model('Camera', cameraSchema);
export default Camera;
