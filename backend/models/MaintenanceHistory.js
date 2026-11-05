import mongoose from 'mongoose';

const maintenanceHistorySchema = new mongoose.Schema(
  {
    infrastructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Infrastructure',
      required: true,
      index: true,
    },
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    serviceType: {
      type: String,
      enum: ['inspection', 'preventive', 'corrective', 'emergency_repair', 'replacement'],
      default: 'corrective',
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    technicianName: {
      type: String,
      default: 'Field Engineer',
    },
    performedAt: {
      type: Date,
      default: Date.now,
    },
    nextScheduledService: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days ahead
    },
    partsReplaced: [String],
  },
  {
    timestamps: true,
  }
);

const MaintenanceHistory = mongoose.model('MaintenanceHistory', maintenanceHistorySchema);
export default MaintenanceHistory;
