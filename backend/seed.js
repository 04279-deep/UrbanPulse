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

    // 1. Create Andhra Pradesh Municipal Departments
    const departments = await Department.create([
      {
        name: 'AP Roads & Buildings Department (R&B)',
        code: 'ROADS',
        description: 'State highways, urban arterial corridors, flyovers, and pothole restoration across Andhra Pradesh.',
        contactEmail: 'roads@ap.urbanpulse.gov.in',
        contactPhone: '+91 (0866) 248-1234',
        headOfficer: 'Chief Engineer K. Sudhakar Rao',
        activeIssuesCount: 4,
        resolvedIssuesCount: 52,
        avgResolutionHours: 20,
        slaThresholdHours: 48,
        icon: 'Construction',
      },
      {
        name: 'AP Municipal Administration & Waste Management (MAUD)',
        code: 'WASTE',
        description: 'Solid waste disposal, Swachh Andhra sanitation, and smart transfer stations.',
        contactEmail: 'sanitation@ap.urbanpulse.gov.in',
        contactPhone: '+91 (0866) 248-5678',
        headOfficer: 'Dr. Ch. Lakshmi Narayana',
        activeIssuesCount: 3,
        resolvedIssuesCount: 88,
        avgResolutionHours: 12,
        slaThresholdHours: 24,
        icon: 'Trash2',
      },
      {
        name: 'AP Water Resources & Stormwater Drainage',
        code: 'DRAINAGE',
        description: 'Krishna & Godavari canal drainages, storm culverts, and urban flood remediation.',
        contactEmail: 'drainage@ap.urbanpulse.gov.in',
        contactPhone: '+91 (0866) 248-9101',
        headOfficer: 'Eng. P. Venkataswamy',
        activeIssuesCount: 3,
        resolvedIssuesCount: 36,
        avgResolutionHours: 16,
        slaThresholdHours: 36,
        icon: 'CloudRain',
      },
      {
        name: 'AP Public Health & Municipal Water Supply',
        code: 'WATER',
        description: 'Potable water distribution pipelines, reservoir pumping, and trunk main repairs.',
        contactEmail: 'waterworks@ap.urbanpulse.gov.in',
        contactPhone: '+91 (0866) 248-3344',
        headOfficer: 'Smt. G. Radhika',
        activeIssuesCount: 2,
        resolvedIssuesCount: 61,
        avgResolutionHours: 14,
        slaThresholdHours: 24,
        icon: 'Droplets',
      },
      {
        name: 'AP Discoms Smart Street Lighting (EPDCL / CPDCL / SPDCL)',
        code: 'LIGHTING',
        description: 'Energy-efficient LED street poles, central control monitoring systems (CCMS), and highway dark spots.',
        contactEmail: 'lighting@ap.urbanpulse.gov.in',
        contactPhone: '+91 (0866) 248-7788',
        headOfficer: 'Sri M. Ramesh Babu',
        activeIssuesCount: 2,
        resolvedIssuesCount: 74,
        avgResolutionHours: 12,
        slaThresholdHours: 24,
        icon: 'Lightbulb',
      },
      {
        name: 'AP Urban Mobility & Traffic Command',
        code: 'TRAFFIC',
        description: 'Smart signal corridors, junction redesign, bus transit lanes, and congestion relief.',
        contactEmail: 'traffic@ap.urbanpulse.gov.in',
        contactPhone: '+91 (0866) 248-9900',
        headOfficer: 'B. Sreenivasulu, IPS',
        activeIssuesCount: 1,
        resolvedIssuesCount: 98,
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
      name: 'K. Sai Krishna',
      email: 'citizen@urbanpulse.io',
      password: 'password123',
      role: 'citizen',
      phone: '+91 98480 12345',
      address: 'Flat 302, Benz Circle, Vijayawada, Andhra Pradesh',
      civicPoints: 95,
      badges: ['Amaravati First Responder', 'Swachh AP Star', 'Pothole Sentinel'],
    });

    const authority = await User.create({
      name: 'Superintendent K. Sudhakar Rao',
      email: 'authority@urbanpulse.io',
      password: 'password123',
      role: 'authority',
      department: deptMap['ROADS'],
      phone: '+91 98480 54321',
      address: 'AP R&B Zonal Office, MG Road, Vijayawada',
    });

    const admin = await User.create({
      name: 'Principal Secretary Dr. K. Vijay Anand',
      email: 'admin@urbanpulse.io',
      password: 'password123',
      role: 'admin',
      phone: '+91 98480 99999',
      address: 'AP Secretariat, Velagapudi, Amaravati',
    });

    // 3. Create Andhra Pradesh Maintenance Teams
    const teams = await MaintenanceTeam.create([
      {
        name: 'Amaravati Rapid Asphalt Squad (VMC)',
        department: deptMap['ROADS'],
        leaderName: 'P. Sambasiva Rao',
        contactNumber: '+91 98481 11222',
        membersCount: 6,
        status: 'busy',
        currentLocation: { latitude: 16.5062, longitude: 80.6480, zone: 'Vijayawada Central' },
        vehicleId: 'AP-16-TX-1001',
        rating: 4.9,
      },
      {
        name: 'Vizag Coastal Cleanliness Squad (GVMC)',
        department: deptMap['WASTE'],
        leaderName: 'M. Durga Prasad',
        contactNumber: '+91 98482 33444',
        membersCount: 5,
        status: 'available',
        currentLocation: { latitude: 17.6868, longitude: 83.2185, zone: 'Visakhapatnam Beach Ward' },
        vehicleId: 'AP-31-WZ-2003',
        rating: 4.8,
      },
      {
        name: 'Guntur Storm Drainage Battalion (GMC)',
        department: deptMap['DRAINAGE'],
        leaderName: 'T. Nageswara Rao',
        contactNumber: '+91 98483 55666',
        membersCount: 7,
        status: 'busy',
        currentLocation: { latitude: 16.3067, longitude: 80.4365, zone: 'Guntur Brodipet' },
        vehicleId: 'AP-07-DR-3005',
        rating: 4.7,
      },
      {
        name: 'Tirupati Smart Lighting Crew (TMC / SPDCL)',
        department: deptMap['LIGHTING'],
        leaderName: 'K. Venkateswarlu',
        contactNumber: '+91 98484 77888',
        membersCount: 4,
        status: 'available',
        currentLocation: { latitude: 13.6288, longitude: 79.4192, zone: 'Tirupati Alipiri Corridor' },
        vehicleId: 'AP-03-LT-4008',
        rating: 4.9,
      },
    ]);

    // 4. Create Andhra Pradesh Municipal Complaints with Precise Geotags
    const complaintsData = [
      {
        ticketId: 'UP-2026-01001',
        title: 'Severe Asphalt Depression & Potholes near Benz Circle Flyover',
        description: 'Large pothole cluster on Vijayawada-Chennai national highway stretch near Benz Circle. Causes high-speed braking and severe tire rim damage.',
        category: 'road_damage',
        severity: 'critical',
        status: 'in_progress',
        location: {
          latitude: 16.5015,
          longitude: 80.6530,
          address: 'Benz Circle NH-16 Junction, MG Road',
          ward: 'VMC Ward 14 - Benz Circle Zone, Vijayawada',
          landmark: 'Opposite Jyothi Mall & Flyover Pillar 18',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800', caption: 'Pothole cluster on NH-16' },
        ],
        reportedBy: citizen._id,
        department: deptMap['ROADS'],
        assignedTeam: teams[0]._id,
        aiAnalysis: {
          detectedCategory: 'road_damage',
          confidence: 0.95,
          predictedSeverity: 'critical',
          detectedObjects: [
            { label: 'pothole', confidence: 0.96, bbox: [120, 180, 240, 150] },
            { label: 'pavement_crack', confidence: 0.91, bbox: [320, 210, 180, 110] },
          ],
          potholeCount: 3,
          garbageDensityScore: 0,
          riskIndex: 91,
          isSimulated: false,
          analysisSummary: 'Computer vision identified 3 major craters across high-density NH-16 vehicular corridor in Vijayawada.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Citizen mobile report with geotagged photograph.', timestamp: new Date(Date.now() - 3600000 * 5) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AP AI Engine', note: 'AI validated critical asphalt crater cluster with 95% confidence.', timestamp: new Date(Date.now() - 3600000 * 4) },
          { status: 'assigned', updatedBy: 'Superintendent K. Sudhakar Rao', note: 'Dispatched Amaravati Rapid Asphalt Squad (VMC).', timestamp: new Date(Date.now() - 3600000 * 2) },
          { status: 'in_progress', updatedBy: 'P. Sambasiva Rao', note: 'Hot-mix asphalt paver and compactor deployed on site.', timestamp: new Date(Date.now() - 3600000 * 1) },
        ],
      },
      {
        ticketId: 'UP-2026-01002',
        title: 'Commercial Waste Dump Overflowing on RK Beach Promenade',
        description: 'Large accumulation of discarded plastic packaging and food waste spilling over bins near Visakhapatnam submarine museum sidewalk.',
        category: 'garbage',
        severity: 'high',
        status: 'submitted',
        location: {
          latitude: 17.7144,
          longitude: 83.3235,
          address: 'Beach Road, Near Kursura Submarine Museum',
          ward: 'GVMC Ward 21 - RK Beach Coastal Zone, Visakhapatnam',
          landmark: 'Opposite INS Kursura Memorial',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800', caption: 'Waste accumulation near beachfront' },
        ],
        reportedBy: citizen._id,
        department: deptMap['WASTE'],
        aiAnalysis: {
          detectedCategory: 'garbage',
          confidence: 0.93,
          predictedSeverity: 'high',
          detectedObjects: [
            { label: 'waste_accumulation', confidence: 0.94, bbox: [90, 120, 370, 240] },
          ],
          potholeCount: 0,
          garbageDensityScore: 48,
          riskIndex: 78,
          isSimulated: false,
          analysisSummary: 'Multi-spectral color entropy detected 48% debris coverage on coastal tourist walkway.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Reported by morning coastal runner.', timestamp: new Date(Date.now() - 3600000 * 3) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AP AI Engine', note: 'CV confirmed tourist beach garbage dump.', timestamp: new Date(Date.now() - 3600000 * 2) },
        ],
      },
      {
        ticketId: 'UP-2026-01003',
        title: 'Deep Waterlogging & Choked Canal at Brodipet 4th Line',
        description: 'Stormwater canal inlet choked with plastic silt after seasonal rains. Water stagnant at 1.8 feet height, blocking school buses and ambulances.',
        category: 'drainage_waterlogging',
        severity: 'critical',
        status: 'assigned',
        location: {
          latitude: 16.3120,
          longitude: 80.4410,
          address: '4th Line, Brodipet Main Road',
          ward: 'GMC Ward 9 - Brodipet Central, Guntur',
          landmark: 'Near Hindu College High School Junction',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800', caption: 'Flooded street in Guntur' },
        ],
        reportedBy: citizen._id,
        department: deptMap['DRAINAGE'],
        assignedTeam: teams[2]._id,
        aiAnalysis: {
          detectedCategory: 'drainage_waterlogging',
          confidence: 0.97,
          predictedSeverity: 'critical',
          detectedObjects: [
            { label: 'waterlogging_pool', confidence: 0.98, bbox: [40, 180, 540, 300] },
          ],
          potholeCount: 0,
          garbageDensityScore: 0,
          riskIndex: 94,
          isSimulated: false,
          analysisSummary: 'Hydrological specular engine flagged high-risk road submergence in Guntur urban core.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Emergency citizen notification.', timestamp: new Date(Date.now() - 3600000 * 6) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AP AI Engine', note: 'Verified water depth critical threshold.', timestamp: new Date(Date.now() - 3600000 * 5) },
          { status: 'assigned', updatedBy: 'Eng. P. Venkataswamy', note: 'Assigned Guntur Storm Drainage Battalion with high-volume pump.', timestamp: new Date(Date.now() - 3600000 * 1) },
        ],
      },
      {
        ticketId: 'UP-2026-01004',
        title: 'Dark Zone: 8 Non-Functional Smart LED Poles on Alipiri Link Road',
        description: 'Consecutive LED luminaires dark on pilgrim bypass road towards Tirumala foothills. Heavy pedestrian pilgrim safety hazard at night.',
        category: 'streetlight',
        severity: 'high',
        status: 'resolved',
        location: {
          latitude: 13.6420,
          longitude: 79.4080,
          address: 'Alipiri Bypass Road, Near Footpath Arch',
          ward: 'TMC Ward 4 - Alipiri Pilgrim Corridor, Tirupati',
          landmark: '100m from Garuda Statue Circle',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', caption: 'Dark streetlight pole in Tirupati' },
        ],
        reportedBy: citizen._id,
        department: deptMap['LIGHTING'],
        assignedTeam: teams[3]._id,
        aiAnalysis: {
          detectedCategory: 'streetlight',
          confidence: 0.90,
          predictedSeverity: 'high',
          detectedObjects: [
            { label: 'non_functional_luminaire', confidence: 0.92, bbox: [150, 70, 160, 320] },
          ],
          riskIndex: 72,
          isSimulated: false,
          analysisSummary: 'Lux deficit verified on primary Tirumala pilgrim pathway.',
          processedAt: new Date(),
        },
        resolutionDetails: {
          resolvedAt: new Date(Date.now() - 3600000 * 2),
          resolutionNotes: 'SPDCL maintenance crew replaced circuit breakers and swapped out burnt LED modules.',
          afterImages: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800'],
          verifiedByCitizen: true,
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Reported by pilgrim visitor.', timestamp: new Date(Date.now() - 3600000 * 24) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AP AI Engine', note: 'AI validated lighting fault.', timestamp: new Date(Date.now() - 3600000 * 22) },
          { status: 'assigned', updatedBy: 'Sri M. Ramesh Babu', note: 'Dispatched Tirupati Smart Lighting Crew.', timestamp: new Date(Date.now() - 3600000 * 16) },
          { status: 'in_progress', updatedBy: 'K. Venkateswarlu', note: 'Bucket crane on site replacing power supplies.', timestamp: new Date(Date.now() - 3600000 * 6) },
          { status: 'resolved', updatedBy: 'K. Venkateswarlu', note: 'All 8 smart LED poles re-energized and verified via CCMS.', timestamp: new Date(Date.now() - 3600000 * 2) },
        ],
      },
      {
        ticketId: 'UP-2026-01005',
        title: 'Tungabhadra Water Pipeline Rupture Gushing onto Bellary Road',
        description: 'Potable supply pipe fractured underground near Kurnool C-Camp. Continuous high-pressure water stream flooding road and eroding sidewalk foundation.',
        category: 'water_leakage',
        severity: 'high',
        status: 'ai_verified',
        location: {
          latitude: 15.8285,
          longitude: 78.0320,
          address: 'Bellary Road, Near C-Camp Centre',
          ward: 'KMC Ward 11 - C-Camp District, Kurnool',
          landmark: 'Adjacent to Kurnool Medical College Hostel Gate',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1585687174574-89b93f334f6f?w=800', caption: 'Water main leak in Kurnool' },
        ],
        reportedBy: citizen._id,
        department: deptMap['WATER'],
        aiAnalysis: {
          detectedCategory: 'water_leakage',
          confidence: 0.94,
          predictedSeverity: 'high',
          detectedObjects: [
            { label: 'pipe_rupture_plume', confidence: 0.93, bbox: [110, 140, 320, 210] },
          ],
          riskIndex: 82,
          isSimulated: false,
          analysisSummary: 'Pressurized water main breach detected with continuous pavement soil erosion.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Citizen emergency alert.', timestamp: new Date(Date.now() - 3600000 * 4) },
          { status: 'ai_verified', updatedBy: 'UrbanPulse AP AI Engine', note: 'Verified drinking water pipeline burst with 94% confidence.', timestamp: new Date(Date.now() - 3600000 * 3) },
        ],
      },
      {
        ticketId: 'UP-2026-01006',
        title: 'Traffic Signal Freeze & Godavari Bridge Bottleneck',
        description: 'Optical traffic controller jammed on red at Rajahmundry side of Godavari bridge, causing a 2.5 km vehicle queue towards Kovvur.',
        category: 'traffic',
        severity: 'medium',
        status: 'in_progress',
        location: {
          latitude: 17.0050,
          longitude: 81.7780,
          address: 'Godavari Fourth Bridge Approach Road',
          ward: 'RMC Ward 6 - Danavaipeta Zone, Rajahmundry',
          landmark: 'East Godavari Bridge Toll Plaza',
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800', caption: 'Traffic queue near Godavari bridge' },
        ],
        reportedBy: citizen._id,
        department: deptMap['TRAFFIC'],
        aiAnalysis: {
          detectedCategory: 'traffic',
          confidence: 0.89,
          predictedSeverity: 'medium',
          riskIndex: 65,
          isSimulated: false,
          analysisSummary: 'Traffic queuing density threshold exceeded on Godavari inter-district bridge corridor.',
          processedAt: new Date(),
        },
        statusTimeline: [
          { status: 'submitted', updatedBy: citizen.name, note: 'Commuter report.', timestamp: new Date(Date.now() - 3600000 * 2) },
          { status: 'in_progress', updatedBy: 'B. Sreenivasulu, IPS', note: 'Traffic control center switching controller to manual adaptive cycle.', timestamp: new Date(Date.now() - 3600000 * 1) },
        ],
      },
    ];

    const complaints = await Complaint.create(complaintsData);

    // 5. Create Andhra Pradesh Smart Infrastructure Assets
    const assets = await Infrastructure.create([
      {
        assetId: 'AP-SL-TPT-01',
        name: 'Tirupati Alipiri Smart Luminaire #01',
        type: 'streetlight',
        department: deptMap['LIGHTING'],
        location: { latitude: 13.6420, longitude: 79.4080, address: 'Alipiri Pilgrim Corridor', zone: 'Tirupati TMC' },
        healthScore: 94,
        predictedFailureProbability: 0.06,
        riskLevel: 'low',
        status: 'operational',
        telemetry: { luxOutput: 530, powerConsumption: 78, vibrationIndex: 1.1 },
      },
      {
        assetId: 'AP-PIPE-KNL-08',
        name: 'Kurnool Tungabhadra Intake Trunk Main #08',
        type: 'water_pipeline',
        department: deptMap['WATER'],
        location: { latitude: 15.8285, longitude: 78.0320, address: 'Bellary Road, C-Camp', zone: 'Kurnool KMC' },
        healthScore: 51,
        predictedFailureProbability: 0.72,
        riskLevel: 'critical',
        status: 'needs_maintenance',
        telemetry: { pressurePsi: 38, vibrationIndex: 5.1 },
      },
      {
        assetId: 'AP-DRAIN-GNT-14',
        name: 'Guntur Brodipet Primary Storm Culvert #14',
        type: 'drainage_culvert',
        department: deptMap['DRAINAGE'],
        location: { latitude: 16.3120, longitude: 80.4410, address: 'Brodipet Main Road', zone: 'Guntur GMC' },
        healthScore: 46,
        predictedFailureProbability: 0.78,
        riskLevel: 'critical',
        status: 'needs_maintenance',
        telemetry: { fillPercentage: 86, vibrationIndex: 3.4 },
      },
      {
        assetId: 'AP-ROAD-VJA-16',
        name: 'Vijayawada Benz Circle Arterial Corridor #16',
        type: 'road_segment',
        department: deptMap['ROADS'],
        location: { latitude: 16.5015, longitude: 80.6530, address: 'NH-16 Benz Circle', zone: 'Vijayawada VMC' },
        healthScore: 62,
        predictedFailureProbability: 0.55,
        riskLevel: 'high',
        status: 'under_repair',
        telemetry: { trafficDensityVpm: 260, vibrationIndex: 5.5 },
      },
      {
        assetId: 'AP-BIN-VZG-22',
        name: 'Visakhapatnam RK Beach Solar Smart Bin #22',
        type: 'waste_bin',
        department: deptMap['WASTE'],
        location: { latitude: 17.7144, longitude: 83.3235, address: 'Beach Promenade', zone: 'Visakhapatnam GVMC' },
        healthScore: 82,
        predictedFailureProbability: 0.19,
        riskLevel: 'low',
        status: 'operational',
        telemetry: { fillPercentage: 80, vibrationIndex: 0.8 },
      },
      {
        assetId: 'AP-SIG-RJY-04',
        name: 'Rajahmundry Godavari Bridge Traffic Sensor #04',
        type: 'traffic_signal',
        department: deptMap['TRAFFIC'],
        location: { latitude: 17.0050, longitude: 81.7780, address: 'Fourth Bridge Toll Plaza', zone: 'Rajahmundry RMC' },
        healthScore: 86,
        predictedFailureProbability: 0.15,
        riskLevel: 'low',
        status: 'operational',
        telemetry: { trafficDensityVpm: 210, vibrationIndex: 1.4 },
      },
    ]);

    // 6. Maintenance History
    await MaintenanceHistory.create([
      {
        infrastructure: assets[0]._id,
        serviceType: 'preventive',
        description: 'Tirupati Alipiri luminaire cleaning and solar driver inspection.',
        cost: 1800,
        technicianName: 'K. Venkateswarlu',
        performedAt: new Date(Date.now() - 365 * 24 * 3600 * 1000 * 0.4),
        partsReplaced: ['LED Driver Module'],
      },
      {
        infrastructure: assets[1]._id,
        complaint: complaints[4]._id,
        serviceType: 'emergency_repair',
        description: 'High-pressure collar clamp applied to cracked cast-iron sleeve.',
        cost: 14500,
        technicianName: 'Kurnool Municipal Field Crew',
        performedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        partsReplaced: ['200mm Heavy Cast Sleeve', 'EPDM Gasket'],
      },
    ]);

    // 7. Feedback
    await Feedback.create({
      complaint: complaints[3]._id,
      citizen: citizen._id,
      rating: 5,
      comment: 'Prompt resolution on the Alipiri pilgrim corridor! Streetlights are bright and safe now. Great work by Tirupati municipal squad.',
      timelinessRating: 5,
      workQualityRating: 5,
      authorityReply: 'Thank you Sai Krishna for supporting public safety in Tirupati!',
    });

    // 8. Notifications
    await Notification.create([
      {
        recipient: citizen._id,
        title: 'Tirupati Alipiri Streetlights Restored',
        message: 'Your report #UP-2026-01004 has been successfully resolved by SPDCL Tirupati crew.',
        type: 'complaint_status',
        complaint: complaints[3]._id,
        isRead: false,
      },
      {
        recipient: citizen._id,
        title: 'Vijayawada Benz Circle Asphalt Repair Underway',
        message: 'Amaravati Rapid Asphalt Squad is actively remediating potholes on Benz Circle (#UP-2026-01001).',
        type: 'assignment',
        complaint: complaints[0]._id,
        isRead: false,
      },
      {
        recipient: citizen._id,
        title: 'Civic Points Credited',
        message: 'You earned +10 Civic Points for reporting infrastructure damage with validated computer vision in Andhra Pradesh.',
        type: 'system',
        isRead: true,
      },
    ]);

    console.log('[Seed] Andhra Pradesh seeding completed successfully!');
    console.log('Sample Accounts:');
    console.log('  Citizen:   citizen@urbanpulse.io   / password123 (K. Sai Krishna - Vijayawada)');
    console.log('  Authority: authority@urbanpulse.io / password123 (AP R&B Superintendent)');
    console.log('  Admin:     admin@urbanpulse.io     / password123 (AP State Secretariat)');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
