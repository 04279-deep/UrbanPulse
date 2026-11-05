import mongoose from 'mongoose';

const maintenanceTeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    leaderName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      default: '',
    },
    membersCount: {
      type: Number,
      default: 4,
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'off_duty'],
      default: 'available',
    },
    currentLocation: {
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.2090 },
      zone: { type: String, default: 'Zone A - Central' },
    },
    vehicleId: {
      type: String,
      default: 'UP-VAN-01',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    currentAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MaintenanceTeam = mongoose.model('MaintenanceTeam', maintenanceTeamSchema);
export default MaintenanceTeam;
