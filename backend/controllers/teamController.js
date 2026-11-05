import MaintenanceTeam from '../models/MaintenanceTeam.js';
import Assignment from '../models/Assignment.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import { emitToUser, broadcastEvent } from '../services/socketService.js';

export const getTeams = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const teams = await MaintenanceTeam.find(filter).populate('department', 'name code');
    res.json({ success: true, count: teams.length, teams });
  } catch (error) {
    next(error);
  }
};

export const assignTeamToComplaint = async (req, res, next) => {
  try {
    const { complaintId, teamId, dispatchNotes, priority, scheduledDate } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const team = await MaintenanceTeam.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Maintenance team not found' });
    }

    const assignment = await Assignment.create({
      complaint: complaintId,
      team: teamId,
      department: team.department,
      assignedBy: req.user.id,
      priority: priority || 'medium',
      dispatchNotes: dispatchNotes || 'Dispatched for site remediation.',
      scheduledDate: scheduledDate || new Date(),
    });

    complaint.assignedTeam = teamId;
    complaint.status = 'assigned';
    complaint.statusTimeline.push({
      status: 'assigned',
      updatedBy: req.user.name,
      note: `Assigned to team: ${team.name}. Notes: ${dispatchNotes || 'Standard dispatch.'}`,
      timestamp: new Date(),
    });
    await complaint.save();

    team.status = 'busy';
    team.currentAssignment = assignment._id;
    await team.save();

    // Create notification for citizen
    await Notification.create({
      recipient: complaint.reportedBy,
      title: 'Maintenance Crew Dispatched',
      message: `Your complaint #${complaint.ticketId} has been assigned to ${team.name} (Lead: ${team.leaderName}). Field crew en route.`,
      type: 'assignment',
      complaint: complaint._id,
    });

    emitToUser(complaint.reportedBy.toString(), 'complaint_updated', complaint);
    broadcastEvent('assignment_created', {
      complaintId,
      teamName: team.name,
      status: 'assigned',
    });

    res.status(201).json({
      success: true,
      assignment,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};
