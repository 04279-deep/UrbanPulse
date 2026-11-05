import Department from '../models/Department.js';
import MaintenanceTeam from '../models/MaintenanceTeam.js';
import Complaint from '../models/Complaint.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.json({ success: true, count: departments.length, departments });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const teams = await MaintenanceTeam.find({ department: department._id });
    const complaints = await Complaint.find({ department: department._id })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      department,
      teams,
      recentComplaints: complaints,
    });
  } catch (error) {
    next(error);
  }
};
