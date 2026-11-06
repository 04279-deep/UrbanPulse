import Incident from '../models/Incident.js';
import Camera from '../models/Camera.js';
import { broadcastEvent, emitToRole } from '../services/socketService.js';

// @desc    Get all AI-detected urban incidents
// @route   GET /api/incidents
export const getIncidents = async (req, res, next) => {
  try {
    const { district, type, severity, status, limit, camera } = req.query;
    const filter = {};

    if (district && district !== 'all') filter.district = district;
    if (type && type !== 'all') filter.type = type;
    if (severity && severity !== 'all') filter.severity = severity;
    if (status && status !== 'all') filter.status = status;
    if (camera) filter.camera = camera;

    const incidents = await Incident.find(filter)
      .populate('camera', 'name cameraId district location')
      .populate('assignedTeam', 'name leaderName contactNumber')
      .sort({ detectionTime: -1 })
      .limit(Number(limit) || 100);

    res.json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new AI detected incident from live camera / CCTV feed
// @route   POST /api/incidents
export const createIncident = async (req, res, next) => {
  try {
    const {
      type,
      title,
      description,
      severity,
      confidence,
      district,
      latitude,
      longitude,
      address,
      landmark,
      cameraId,
      cameraName,
      snapshotUrl,
      boundingBoxes,
      modelUsed,
      isSimulated,
    } = req.body;

    const count = await Incident.countDocuments();
    const incidentId = `INC-2026-AP-${String(count + 101).padStart(4, '0')}`;

    let cameraRef = null;
    if (cameraId) {
      const cam = await Camera.findOne({ cameraId });
      if (cam) {
        cameraRef = cam._id;
        await Camera.findByIdAndUpdate(cam._id, {
          $inc: { totalIncidentsDetected: 1 },
          lastActive: new Date(),
        });
      }
    }

    const incident = await Incident.create({
      incidentId,
      type,
      title: title || `AI Detected ${type?.replace('_', ' ')}`,
      description: description || `Automated real-time computer vision detection event.`,
      severity: severity || 'medium',
      confidence: confidence || 88.5,
      district: district || 'NTR',
      location: {
        latitude: parseFloat(latitude) || 16.5062,
        longitude: parseFloat(longitude) || 80.6480,
        address: address || 'Vijayawada, Andhra Pradesh',
        landmark: landmark || '',
      },
      camera: cameraRef,
      cameraName: cameraName || 'Live Video Stream',
      snapshotUrl: snapshotUrl || '',
      boundingBoxes: boundingBoxes || [],
      modelUsed: modelUsed || 'YOLOv8 + OpenCV Computer Vision Engine',
      isSimulated: isSimulated || false,
      detectionTime: new Date(),
    });

    // Real-time broadcast to map and monitoring dashboards via Socket.IO
    broadcastEvent('incident_detected', incident);
    broadcastEvent('complaint_stream_update', {
      type: 'AI_INCIDENT_ALERT',
      incidentId,
      incidentType: type,
      severity,
      district,
    });

    res.status(201).json({
      success: true,
      incident,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update incident status (e.g. verified, dispatched, resolved)
// @route   PUT /api/incidents/:id/status
export const updateIncidentStatus = async (req, res, next) => {
  try {
    const { status, assignedTeamId, notes } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    incident.status = status || incident.status;
    if (assignedTeamId) incident.assignedTeam = assignedTeamId;
    if (notes) incident.notes = notes;
    if (status === 'resolved') {
      incident.resolutionTime = new Date();
    }

    await incident.save();

    broadcastEvent('incident_status_changed', {
      incidentId: incident.incidentId,
      status: incident.status,
    });

    res.json({
      success: true,
      incident,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated camera & incident monitoring stats
// @route   GET /api/incidents/stats
export const getIncidentStats = async (req, res, next) => {
  try {
    const totalCameras = await Camera.countDocuments();
    const activeCameras = await Camera.countDocuments({ status: 'active' });
    const totalIncidents = await Incident.countDocuments();
    const criticalIncidents = await Incident.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } });
    const resolvedIncidents = await Incident.countDocuments({ status: 'resolved' });

    // District-wise aggregation across AP
    const districtAgg = await Incident.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 }, critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);

    // Type aggregation
    const typeAgg = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Severity aggregation
    const severityAgg = await Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    // Recent 10 incidents
    const recentDetections = await Incident.find()
      .sort({ detectionTime: -1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        totalCameras: totalCameras || 6,
        activeCameras: activeCameras || 6,
        totalIncidents,
        criticalIncidents,
        resolvedIncidents,
        districtBreakdown: districtAgg.map((d) => ({ district: d._id || 'Unknown', count: d.count, critical: d.critical })),
        typeBreakdown: typeAgg.map((t) => ({ type: t._id, count: t.count })),
        severityBreakdown: severityAgg.map((s) => ({ severity: s._id, count: s.count })),
        recentDetections,
      },
    });
  } catch (error) {
    next(error);
  }
};
