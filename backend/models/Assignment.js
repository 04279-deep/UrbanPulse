import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceTeam',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['dispatched', 'en_route', 'on_site', 'work_completed', 'cancelled'],
      default: 'dispatched',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    dispatchNotes: {
      type: String,
      default: '',
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    completionProofUrls: [String],
    resolutionSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
