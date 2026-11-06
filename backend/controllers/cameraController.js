import Camera from '../models/Camera.js';

export const getCameras = async (req, res, next) => {
  try {
    const { district, status, type } = req.query;
    const filter = {};
    if (district && district !== 'all') filter.district = district;
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;

    let cameras = await Camera.find(filter).sort({ name: 1 });

    // If no cameras exist yet, seed initial AP CCTV network
    if (cameras.length === 0) {
      cameras = await Camera.create([
        {
          cameraId: 'CAM-AP-VJA-01',
          name: 'Benz Circle Traffic Cam Alpha (VMC)',
          type: 'ip_camera',
          district: 'NTR',
          location: { latitude: 16.5015, longitude: 80.6530, address: 'Benz Circle NH-16, MG Road, Vijayawada', landmark: 'Flyover Pillar 18' },
          streamUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
          status: 'active',
          resolution: '1080p Full HD (60 FPS)',
          detectionCategories: ['traffic_congestion', 'vehicle_accident', 'illegal_parking'],
          totalIncidentsDetected: 4,
        },
        {
          cameraId: 'CAM-AP-VZG-02',
          name: 'RK Beach Promenade Surveillance (GVMC)',
          type: 'cctv_feed',
          district: 'Visakhapatnam',
          location: { latitude: 17.7144, longitude: 83.3235, address: 'Beach Road Promenade, Visakhapatnam', landmark: 'Submarine Museum' },
          streamUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800',
          status: 'active',
          resolution: '4K Ultra HD (30 FPS)',
          detectionCategories: ['garbage_accumulation', 'crowd_congestion'],
          totalIncidentsDetected: 3,
        },
        {
          cameraId: 'CAM-AP-GNT-03',
          name: 'Brodipet Commercial Junction Cam (GMC)',
          type: 'ip_camera',
          district: 'Guntur',
          location: { latitude: 16.3120, longitude: 80.4410, address: 'Brodipet Main Road, Guntur', landmark: 'Hindu College High School' },
          streamUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
          status: 'active',
          resolution: '1080p Full HD',
          detectionCategories: ['waterlogging_flood', 'road_blockage'],
          totalIncidentsDetected: 2,
        },
        {
          cameraId: 'CAM-AP-TPT-04',
          name: 'Alipiri Pilgrim Corridor Optical Feed (TMC)',
          type: 'cctv_feed',
          district: 'Tirupati',
          location: { latitude: 13.6420, longitude: 79.4080, address: 'Alipiri Bypass Road, Tirupati', landmark: 'Footpath Arch' },
          streamUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
          status: 'active',
          resolution: '1080p Low-Light Night Vision',
          detectionCategories: ['streetlight', 'crowd_congestion'],
          totalIncidentsDetected: 1,
        },
        {
          cameraId: 'CAM-AP-KNL-05',
          name: 'C-Camp Bellary Road Arterial Cam (KMC)',
          type: 'ip_camera',
          district: 'Kurnool',
          location: { latitude: 15.8285, longitude: 78.0320, address: 'Bellary Road, C-Camp, Kurnool', landmark: 'Medical College Gate' },
          streamUrl: 'https://images.unsplash.com/photo-1585687174574-89b93f334f6f?w=800',
          status: 'active',
          resolution: '1080p Full HD',
          detectionCategories: ['water_leakage', 'pothole'],
          totalIncidentsDetected: 2,
        },
        {
          cameraId: 'CAM-AP-RJY-06',
          name: 'Godavari Fourth Bridge Flow Sensor (RMC)',
          type: 'ip_camera',
          district: 'East Godavari',
          location: { latitude: 17.0050, longitude: 81.7780, address: 'Fourth Bridge Toll Plaza, Rajahmundry', landmark: 'Toll Barrier 3' },
          streamUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
          status: 'active',
          resolution: '1080p Adaptive Optical',
          detectionCategories: ['traffic_congestion', 'vehicle_accident'],
          totalIncidentsDetected: 1,
        },
      ]);
    }

    res.json({
      success: true,
      count: cameras.length,
      cameras,
    });
  } catch (error) {
    next(error);
  }
};

export const addCamera = async (req, res, next) => {
  try {
    const { name, type, district, latitude, longitude, address, landmark, streamUrl, resolution } = req.body;
    const count = await Camera.countDocuments();
    const cameraId = `CAM-AP-${(district || 'GEN').substring(0, 3).toUpperCase()}-${String(count + 1).padStart(2, '0')}`;

    const camera = await Camera.create({
      cameraId,
      name,
      type: type || 'ip_camera',
      district: district || 'NTR',
      location: {
        latitude: parseFloat(latitude) || 16.5062,
        longitude: parseFloat(longitude) || 80.6480,
        address: address || 'Andhra Pradesh',
        landmark: landmark || '',
      },
      streamUrl: streamUrl || '',
      resolution: resolution || '1080p Full HD',
      status: 'active',
    });

    res.status(201).json({
      success: true,
      camera,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCameraStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const camera = await Camera.findById(req.params.id);
    if (!camera) return res.status(404).json({ success: false, message: 'Camera not found' });

    camera.status = status || camera.status;
    camera.lastActive = new Date();
    await camera.save();

    res.json({ success: true, camera });
  } catch (error) {
    next(error);
  }
};
