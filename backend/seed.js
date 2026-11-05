import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Department from './models/Department.js';
import MaintenanceTeam from './models/MaintenanceTeam.js';
import Complaint from './models/Complaint.js';
import Infrastructure from './models/Infrastructure.js';
import MaintenanceHistory from './models/MaintenanceHistory.js';
import Notification from './models/Notification.js';
import Feedback from './models/Feedback.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urbanpulse';

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to MongoDB...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('[Seed] Connected.');
    } else {
      console.log('[Seed] Using existing active MongoDB connection.');
    }

    // Clear existing
    await User.deleteMany();
    await Department.deleteMany();
    await MaintenanceTeam.deleteMany();
    await Complaint.deleteMany();
    await Infrastructure.deleteMany();
    await MaintenanceHistory.deleteMany();
    await Notification.deleteMany();
    await Feedback.deleteMany();

    console.log('[Seed] Cleared collections.');

    // 1. Create Departments
    const departments = await Department.create([
      {
        name: 'Roads & Pavement Infrastructure',
        code: 'ROADS',
        description: 'Pothole restoration, asphalt overlay, bridge structural integrity, and sidewalk repairs.',
        contactEmail: 'roads@urbanpulse.gov',
        contactPhone: '+1 (555) 019-2831',
        headOfficer: 'Eng. Marcus Vance',
        activeIssuesCount: 4,
        resolvedIssuesCount: 48,
        avgResolutionHours: 24,
        slaThresholdHours: 48,
        icon: 'Construction',
      },
      {
        name: 'Solid Waste & Sanitation',
        code: 'WASTE',
        description: 'Municipal garbage collection, illegal dump clearance, and smart bin management.',
        contactEmail: 'sanitation@urbanpulse.gov',
        contactPhone: '+1 (555) 019-4820',
        headOfficer: 'Dr. Elena Rostova',
        activeIssuesCount: 3,
        resolvedIssuesCount: 82,
        avgResolutionHours: 12,
        slaThresholdHours: 24,
        icon: 'Trash2',
      },
      {
        name: 'Water Resources & Drainage',
        code: 'DRAINAGE',
        description: 'Stormwater canal dredging, culvert desiltation, and urban flood prevention.',
        contactEmail: 'drainage@urbanpulse.gov',
        contactPhone: '+1 (555) 019-9182',
        headOfficer: 'Eng. Tariq Al-Mansoor',
        activeIssuesCount: 3,
        resolvedIssuesCount: 31,
        avgResolutionHours: 18,
        slaThresholdHours: 36,
        icon: 'CloudRain',
      },
      {
        name: 'Water Supply & Sewerage',
        code: 'WATER',
        description: 'Potable water pipelines, underground main ruptures, and valve maintenance.',
        contactEmail: 'waterworks@urbanpulse.gov',
        contactPhone: '+1 (555) 019-7711',
        headOfficer: 'Ms. Sarah Chen',
        activeIssuesCount: 2,
        resolvedIssuesCount: 56,
        avgResolutionHours: 16,
        slaThresholdHours: 24,
        icon: 'Droplets',
      },
      {
        name: 'Electrical & Smart Lighting',
        code: 'LIGHTING',
        description: 'Smart LED poles, wiring safety, solar streetlights, and dark-spot elimination.',
        contactEmail: 'lighting@urbanpulse.gov',
        contactPhone: '+1 (555) 019-3344',
        headOfficer: 'Carlos Mendez',
        activeIssuesCount: 2,
        resolvedIssuesCount: 64,
        avgResolutionHours: 14,
        slaThresholdHours: 24,
        icon: 'Lightbulb',
      },
      {
        name: 'Traffic & Urban Mobility',
        code: 'TRAFFIC',
        description: 'Adaptive traffic signaling, pedestrian crossings, transit flow, and congestion relief.',
        contactEmail: 'traffic@urbanpulse.gov',
        contactPhone: '+1 (555) 019-5566',
        headOfficer: 'Priya Sharma',
        activeIssuesCount: 1,
        resolvedIssuesCount: 92,
        avgResolutionHours: 8,
        slaThresholdHours: 12,
        icon: 'Activity',
      },
    ]);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d._id;
    });

    // 2. Create Users
    const citizen = await User.create({
      name: 'Aiden Reed',
      email: 'citizen@urbanpulse.io',
      password: 'password123',
      role: 'citizen',
      phone: '+1 (555) 234-5678',
      address: 'Apt 4B, Metro Boulevard, Central Ward',
      civicPoints: 85,
      badges: ['Civic Champion', 'First Responder', 'Pothole Hunter'],
    });

    const authority = await User.create({
      name: 'Superintendent Vance',
      email: 'authority@urbanpulse.io',
      password: 'password123',
      role: 'authority',
      department: deptMap['ROADS'],
      phone: '+1 (555) 876-5432',
      address: 'Municipal Command Center, Sector 5',
    });

    const admin = await User.create({
      name: 'Chief Admin Reynolds',
      email: 'admin@urbanpulse.io',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 999-0000',
      address: 'City Hall Governance Tower',
    });

    // 3. Create Maintenance Teams
    const teams = await MaintenanceTeam.create([
      {
        name: 'Rapid Asphalt Squad Alpha',
        department: deptMap['ROADS'],
        leaderName: 'Frank Miller',
        contactNumber: '+1 (555) 301-8811',
        membersCount: 5,
        status: 'busy',
        currentLocation: { latitude: 28.6145, longitude: 77.2095, zone: 'Central Ward 12' },
        vehicleId: 'UP-ROAD-01',
        rating: 4.9,
      },
      {
        name: 'EcoClean Rapid Waste Patrol',
        department: deptMap['WASTE'],
        leaderName: 'Maya Patel',
        contactNumber: '+1 (555) 301-9922',
        membersCount: 4,
        status: 'available',
        currentLocation: { latitude: 28.6210, longitude: 77.2150, zone: 'Eastern District' },
        vehicleId: 'UP-WASTE-03',
        rating: 4.8,
      },
      {
        name: 'HydroCare Drainage Battalion',
        department: deptMap['DRAINAGE'],
        leaderName: 'David Kim',
        contactNumber: '+1 (555) 301-4433',
        membersCount: 6,
        status: 'busy',
        currentLocation: { latitude: 28.6080, longitude: 77.2030, zone: 'Riverside Basin' },
        vehicleId: 'UP-DRAIN-02',
        rating: 4.7,
      },
      {
        name: 'VoltShield Smart Grid Crew',
        department: deptMap['LIGHTING'],
        leaderName: 'Lucas Dubois',
        contactNumber: '+1 (555) 301-7744',
        membersCount: 3,
        status: 'available',
        currentLocation: { latitude: 28.6185, longitude: 77.2110, zone: 'North Ring' },
        vehicleId: 'UP-LIGHT-01',
        rating: 4.9,
      },
    ]);

    // 4. Create Complaints
    const complaintsData = [
      {
        ticketId: 'UP-2026-01001',
        title: 'Dangerous Pothole Cluster on Main Ring Road',
        description: 'Two deep craters right in the center express lane near the metro overpass. Causes severe vehicle swerving and tire damage.',
        category: 'road_damage',
        severity: 'critical',
        status: 'in_progress',
        location: {
          latitude: 28.6152,
          longitude: 77.2104,
          address: 'Outer Ring Rd, Near Sector 14 Metro Station',
          ward: 'Ward 12 - Civic District',
          landmark: 'Opposite Metro Pillar 42',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800', caption: 'Pothole asphalt depression' },
        ],
        reportedBy: citizen._id,
        department: deptMap['ROADS'],
        assignedTeam: teams[0]._id,
        aiAnalysis: {
          detectedCategory: 'road_damage',
          confidence: 0.94,
          predictedSeverity: 'critical',
          detectedObjects: [
            { label: 'pothole', confidence: 0.95, bbox: [120, 180, 240, 150] },
            { label: 'pavement_crack', confidence: 0.89, bbox: [320, 210, 180, 110] },
          ],
          potholeCount: 2,
          garbageDensityScore: 0,
          riskIndex: 88,
          isSimulated: false,
          analysisSummary: 'Severe road surface craters identified. Immediate tire blow-out risk to fast traffic.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Initial citizen photo report.', timestamp: new Date(Date.now() - 3600000 * 6) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AI Engine', note: 'AI confirmed high-severity road pothole with 94% confidence.', timestamp: new Date(Date.now() - 3600000 * 5) },
          { status: 'assigned', updatedBy: 'Superintendent Vance', note: 'Dispatched Rapid Asphalt Squad Alpha.', timestamp: new Date(Date.now() - 3600000 * 3) },
          { status: 'in_progress', updatedBy: 'Frank Miller', note: 'Hot-mix asphalt crew arrived on site. Compaction underway.', timestamp: new Date(Date.now() - 3600000 * 1) },
        ],
      },
      {
        ticketId: 'UP-2026-01002',
        title: 'Massive Waste Overflow Blocking Pedestrian Walkway',
        description: 'Large domestic and commercial garbage bags piled up around overflowing dumpster for over 4 days. Strong foul odor and stray dogs.',
        category: 'garbage',
        severity: 'high',
        status: 'submitted',
        location: {
          latitude: 28.6215,
          longitude: 77.2180,
          address: '4th Cross, Green Park Market Square',
          ward: 'Ward 8 - Commerce Hub',
          landmark: 'Behind Central Supermarket',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800', caption: 'Overflowing municipal refuse' },
        ],
        reportedBy: citizen._id,
        department: deptMap['WASTE'],
        aiAnalysis: {
          detectedCategory: 'garbage',
          confidence: 0.92,
          predictedSeverity: 'high',
          detectedObjects: [
            { label: 'waste_accumulation', confidence: 0.93, bbox: [80, 110, 380, 260] },
          ],
          potholeCount: 0,
          garbageDensityScore: 42,
          riskIndex: 74,
          isSimulated: false,
          analysisSummary: 'Solid waste accumulation blocking ~42% of pavement footprint.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Reported with geotagged photograph.', timestamp: new Date(Date.now() - 3600000 * 4) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AI Engine', note: 'Computer vision verified commercial refuse blockage.', timestamp: new Date(Date.now() - 3600000 * 3) },
        ],
      },
      {
        ticketId: 'UP-2026-01003',
        title: 'Deep Waterlogging & Submerged Intersection after Rain',
        description: 'Stormwater drain inlet choked with plastic and silt. Rainwater accumulated over 1.5 feet deep, causing stalled scooters and cars.',
        category: 'drainage_waterlogging',
        severity: 'critical',
        status: 'assigned',
        location: {
          latitude: 28.6092,
          longitude: 77.2045,
          address: 'Riverside Avenue at 9th Boulevard',
          ward: 'Ward 15 - Riverside Basin',
          landmark: 'Near City Government High School',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800', caption: 'Flooded street intersection' },
        ],
        reportedBy: citizen._id,
        department: deptMap['DRAINAGE'],
        assignedTeam: teams[2]._id,
        aiAnalysis: {
          detectedCategory: 'drainage_waterlogging',
          confidence: 0.96,
          predictedSeverity: 'critical',
          detectedObjects: [
            { label: 'waterlogging_pool', confidence: 0.97, bbox: [40, 200, 520, 280] },
          ],
          potholeCount: 0,
          garbageDensityScore: 0,
          riskIndex: 92,
          isSimulated: false,
          analysisSummary: 'High-risk road submergence detected. School zone perimeter affected.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Urgent citizen alert.', timestamp: new Date(Date.now() - 3600000 * 8) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AI Engine', note: 'Hydrological CV flagged critical water barrier.', timestamp: new Date(Date.now() - 3600000 * 7) },
          { status: 'assigned', updatedBy: 'Eng. Tariq Al-Mansoor', note: 'HydroCare high-capacity pumping unit assigned.', timestamp: new Date(Date.now() - 3600000 * 2) },
        ],
      },
      {
        ticketId: 'UP-2026-01004',
        title: 'Row of Non-Functional Streetlights on Outer Expressway',
        description: '6 consecutive solar LED poles completely dark for past two evenings. Extreme hazard for evening pedestrians and cyclists.',
        category: 'streetlight',
        severity: 'high',
        status: 'resolved',
        location: {
          latitude: 28.6180,
          longitude: 77.2140,
          address: 'Expressway Service Lane, Zone 4',
          ward: 'Ward 12 - Civic District',
          landmark: 'Near Public Botanical Gardens',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', caption: 'Dark street pole at night' },
        ],
        reportedBy: citizen._id,
        department: deptMap['LIGHTING'],
        assignedTeam: teams[3]._id,
        aiAnalysis: {
          detectedCategory: 'streetlight',
          confidence: 0.89,
          predictedSeverity: 'high',
          detectedObjects: [
            { label: 'non_functional_luminaire', confidence: 0.91, bbox: [160, 60, 140, 310] },
          ],
          riskIndex: 68,
          isSimulated: false,
          analysisSummary: 'Public transit corridor illuminance deficit detected.',
          processedAt: new Date(),
        },
        resolutionDetails: {
          resolvedAt: new Date(Date.now() - 3600000 * 2),
          resolutionNotes: 'Replaced faulty circuit breakers and upgraded two burnt LED driver modules.',
          afterImages: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800'],
          verifiedByCitizen: true,
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Submitted via mobile app.', timestamp: new Date(Date.now() - 3600000 * 24) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AI Engine', note: 'AI validated lighting fault.', timestamp: new Date(Date.now() - 3600000 * 23) },
          { status: 'assigned', updatedBy: 'Carlos Mendez', note: 'Assigned to VoltShield team.', timestamp: new Date(Date.now() - 3600000 * 18) },
          { status: 'in_progress', updatedBy: 'Lucas Dubois', note: 'Bucket truck dispatched.', timestamp: new Date(Date.now() - 3600000 * 8) },
          { status: 'resolved', updatedBy: 'Lucas Dubois', note: 'All 6 luminaire fixtures illuminated and tested.', timestamp: new Date(Date.now() - 3600000 * 2) },
        ],
      },
      {
        ticketId: 'UP-2026-01005',
        title: 'Pressurized Water Main Leak Flooding Footpath',
        description: 'Underground potable pipe cracked. Continuous high-pressure water stream eroding soil and foundation near bus stop.',
        category: 'water_leakage',
        severity: 'high',
        status: 'ai_verified',
        location: {
          latitude: 28.6250,
          longitude: 77.2080,
          address: 'Lincoln Way & 3rd Avenue',
          ward: 'Ward 5 - West End',
          landmark: 'Directly in front of Civic Bus Shelter 19',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1585687174574-89b93f334f6f?w=800', caption: 'Water leaking on pavement' },
        ],
        reportedBy: citizen._id,
        department: deptMap['WATER'],
        aiAnalysis: {
          detectedCategory: 'water_leakage',
          confidence: 0.93,
          predictedSeverity: 'high',
          detectedObjects: [
            { label: 'pipe_rupture_plume', confidence: 0.92, bbox: [120, 150, 310, 200] },
          ],
          riskIndex: 78,
          isSimulated: false,
          analysisSummary: 'Pressurized water pipeline breach with active ground erosion.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Citizen emergency alert.', timestamp: new Date(Date.now() - 3600000 * 3) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AI Engine', note: 'Verified potable main leak with 93% accuracy.', timestamp: new Date(Date.now() - 3600000 * 2) },
        ],
      },
      {
        ticketId: 'UP-2026-01006',
        title: 'Traffic Signal Desynchronization & Severe Gridlock',
        description: 'North-South signal timing jammed on 15-second green, creating 1.5 km vehicular backup on highway off-ramp.',
        category: 'traffic',
        severity: 'medium',
        status: 'in_progress',
        location: {
          latitude: 28.6110,
          longitude: 77.2175,
          address: 'Grand Central Plaza Crossroads',
          ward: 'Ward 8 - Commerce Hub',
          landmark: 'Plaza Rotunda',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800', caption: 'Traffic congestion at intersection' },
        ],
        reportedBy: citizen._id,
        department: deptMap['TRAFFIC'],
        aiAnalysis: {
          detectedCategory: 'traffic',
          confidence: 0.88,
          predictedSeverity: 'medium',
          riskIndex: 62,
          isSimulated: false,
          analysisSummary: 'Traffic queuing density threshold exceeded.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Reported by commuter.', timestamp: new Date(Date.now() - 3600000 * 2) },
          { status: 'in_progress', updatedBy: 'Priya Sharma', note: 'Traffic control center adjusting phase timings remotely.', timestamp: new Date(Date.now() - 3600000 * 1) },
        ],
      },
    ];

    const complaints = await Complaint.create(complaintsData);

    // 5. Create Smart Infrastructure Assets
    const assets = await Infrastructure.create([
      {
        assetId: 'SL-8842',
        name: 'Smart Luminaire Pole #8842',
        type: 'streetlight',
        department: deptMap['LIGHTING'],
        location: { latitude: 28.6180, longitude: 77.2140, address: 'Expressway Service Lane, Zone 4', zone: 'Zone 4 - North' },
        healthScore: 92,
        predictedFailureProbability: 0.08,
        riskLevel: 'low',
        status: 'operational',
        telemetry: { luxOutput: 510, powerConsumption: 85, vibrationIndex: 1.2 },
      },
      {
        assetId: 'PIPE-MAIN-04',
        name: 'Cast Iron Water Main Segment 04',
        type: 'water_pipeline',
        department: deptMap['WATER'],
        location: { latitude: 28.6250, longitude: 77.2080, address: 'Lincoln Way & 3rd Ave', zone: 'Zone 5 - West' },
        healthScore: 54,
        predictedFailureProbability: 0.68,
        riskLevel: 'critical',
        status: 'needs_maintenance',
        telemetry: { pressurePsi: 42, vibrationIndex: 4.8 },
      },
      {
        assetId: 'CULVERT-SW-12',
        name: 'Heavy Stormwater Drainage Culvert 12',
        type: 'drainage_culvert',
        department: deptMap['DRAINAGE'],
        location: { latitude: 28.6092, longitude: 77.2045, address: 'Riverside Avenue at 9th Blvd', zone: 'Zone 15 - Basin' },
        healthScore: 48,
        predictedFailureProbability: 0.74,
        riskLevel: 'critical',
        status: 'needs_maintenance',
        telemetry: { fillPercentage: 82, vibrationIndex: 3.1 },
      },
      {
        assetId: 'ROAD-SEG-104',
        name: 'Central Arterial Asphalt Segment 104',
        type: 'road_segment',
        department: deptMap['ROADS'],
        location: { latitude: 28.6152, longitude: 77.2104, address: 'Outer Ring Rd, Sec 14', zone: 'Zone 12 - Civic' },
        healthScore: 61,
        predictedFailureProbability: 0.58,
        riskLevel: 'high',
        status: 'under_repair',
        telemetry: { trafficDensityVpm: 240, vibrationIndex: 5.2 },
      },
      {
        assetId: 'BIN-SMART-901',
        name: 'Solar Compacting Smart Bin 901',
        type: 'waste_bin',
        department: deptMap['WASTE'],
        location: { latitude: 28.6215, longitude: 77.2180, address: 'Green Park Market Square', zone: 'Zone 8 - Commerce' },
        healthScore: 79,
        predictedFailureProbability: 0.22,
        riskLevel: 'low',
        status: 'operational',
        telemetry: { fillPercentage: 78, vibrationIndex: 0.9 },
      },
      {
        assetId: 'SIG-INT-208',
        name: 'Adaptive Optical Traffic Controller 208',
        type: 'traffic_signal',
        department: deptMap['TRAFFIC'],
        location: { latitude: 28.6110, longitude: 77.2175, address: 'Grand Central Plaza Crossroads', zone: 'Zone 8 - Commerce' },
        healthScore: 84,
        predictedFailureProbability: 0.18,
        riskLevel: 'low',
        status: 'operational',
        telemetry: { trafficDensityVpm: 195, vibrationIndex: 1.5 },
      },
    ]);

    // 6. Create Maintenance History for assets
    await MaintenanceHistory.create([
      {
        infrastructure: assets[0]._id,
        serviceType: 'preventive',
        description: 'Routine luminaire cleaning and solar PV panel tilt adjustment.',
        cost: 140,
        technicianName: 'Lucas Dubois',
        performedAt: new Date(Date.now() - 365 * 24 * 3600 * 1000 * 0.5),
        partsReplaced: ['LED Driver Capacitor'],
      },
      {
        infrastructure: assets[1]._id,
        complaint: complaints[4]._id,
        serviceType: 'emergency_repair',
        description: 'Pressure clamp applied to fractured sleeve.',
        cost: 1250,
        technicianName: 'Sarah Chen Crew',
        performedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        partsReplaced: ['Cast Iron Sleeve Joint', 'Rubber Flange Gasket'],
      },
    ]);

    // 7. Create Feedback
    await Feedback.create({
      complaint: complaints[3]._id,
      citizen: citizen._id,
      rating: 5,
      comment: 'Super fast response! The streetlights were back on within 24 hours. Great work by the lighting department.',
      timelinessRating: 5,
      workQualityRating: 5,
      authorityReply: 'Thank you for helping keep our streets safe, Aiden!',
    });

    // 8. Create Notifications
    await Notification.create([
      {
        recipient: citizen._id,
        title: 'Streetlight Issue Remediated',
        message: 'Your report #UP-2026-01004 has been resolved by VoltShield crew. Please take a moment to rate the repair.',
        type: 'complaint_status',
        complaint: complaints[3]._id,
        isRead: false,
      },
      {
        recipient: citizen._id,
        title: 'Asphalt Crew On Site',
        message: 'Rapid Asphalt Squad Alpha is currently remediating the pothole cluster you reported (#UP-2026-01001).',
        type: 'assignment',
        complaint: complaints[0]._id,
        isRead: false,
      },
      {
        recipient: citizen._id,
        title: 'Civic Points Credited',
        message: 'You earned +10 Civic Points for reporting infrastructure damage with validated computer vision inspection.',
        type: 'system',
        isRead: true,
      },
    ]);

    console.log('[Seed] Seeding completed successfully!');
    console.log('Sample Accounts created:');
    console.log('  Citizen:   citizen@urbanpulse.io   / password123');
    console.log('  Authority: authority@urbanpulse.io / password123');
    console.log('  Admin:     admin@urbanpulse.io     / password123');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
};

// If run directly via command line
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
