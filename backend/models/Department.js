import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    headOfficer: {
      type: String,
      default: 'Superintendent Engineer',
    },
    activeIssuesCount: {
      type: Number,
      default: 0,
    },
    resolvedIssuesCount: {
      type: Number,
      default: 0,
    },
    avgResolutionHours: {
      type: Number,
      default: 24,
    },
    slaThresholdHours: {
      type: Number,
      default: 48,
    },
    icon: {
      type: String,
      default: 'Building2',
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model('Department', departmentSchema);
export default Department;
