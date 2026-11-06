import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Video,
  Play,
  Square,
  Upload,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  Maximize2,
  MapPin,
  Cpu,
  Radio,
  Flame,
  Car,
  Trash2,
  Droplets,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cameraService, incidentService } from '../services/api';
import { getSocket } from '../services/socket';
import { Link } from 'react-router-dom';

const INCIDENT_CATEGORIES = [
  { key: 'traffic_congestion', name: 'Traffic Congestion', icon: Car, color: 'text-amber-400' },
  { key: 'vehicle_accident', name: 'Vehicle Accident', icon: AlertTriangle, color: 'text-rose-500' },
  { key: 'illegal_parking', name: 'Illegal Parking', icon: Car, color: 'text-yellow-400' },
  { key: 'road_blockage', name: 'Road Blockage', icon: ShieldAlert, color: 'text-orange-400' },
  { key: 'pothole', name: 'Pothole & Surface Damage', icon: Radio, color: 'text-rose-400' },
  { key: 'garbage_accumulation', name: 'Garbage Accumulation', icon: Trash2, color: 'text-emerald-400' },
  { key: 'smoke_fire', name: 'Smoke & Fire', icon: Flame, color: 'text-red-500' },
  { key: 'waterlogging_flood', name: 'Waterlogging & Flooding', icon: Droplets, color: 'text-sky-400' },
  { key: 'crowd_congestion', name: 'Crowd Congestion', icon: Users, color: 'text-purple-400' },
  { key: 'unauthorized_obstruction', name: 'Unauthorized Obstruction', icon: ShieldAlert, color: 'text-pink-400' },
];

const LiveCameraMonitoring = () => {
  // Video & Stream State
  const [streamSource, setStreamSource] = useState('webcam'); // 'webcam', 'cctv_preset', 'video_upload'
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);

  // Municipal AP Camera presets
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  // AI Detection State
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectionResults, setDetectionResults] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [stats, setStats] = useState({
    totalCameras: 6,
    activeCameras: 6,
    totalIncidents: 0,
    criticalIncidents: 0,
    resolvedIncidents: 0,
    districtBreakdown: [],
  });

  const [inferenceLatency, setInferenceLatency] = useState(0);
  const [fps, setFps] = useState(0);

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsCalcTimeRef = useRef(Date.now());

  // Load municipal cameras & stats on mount
  const loadInitialData = async () => {
    try {
      const [camRes, statsRes] = await Promise.all([
        cameraService.getAll(),
        incidentService.getStats(),
      ]);

      if (camRes.data?.cameras) {
        setCameras(camRes.data.cameras);
        if (camRes.data.cameras.length > 0 && !selectedCamera) {
          setSelectedCamera(camRes.data.cameras[0]);
        }
      }

      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats);
        if (statsRes.data.stats.recentDetections) {
          setRecentDetections(statsRes.data.stats.recentDetections);
        }
      }
    } catch (err) {
      console.warn('Failed to load initial camera data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Socket.IO real-time listener for incoming incident alerts
    const socket = getSocket();
    if (socket) {
      const handleIncidentAlert = (incident) => {
        setRecentDetections((prev) => [incident, ...prev.slice(0, 19)]);
        setStats((prev) => ({
          ...prev,
          totalIncidents: prev.totalIncidents + 1,
          criticalIncidents:
            incident.severity === 'critical' ? prev.criticalIncidents + 1 : prev.criticalIncidents,
        }));
      };

      socket.on('incident_detected', handleIncidentAlert);
      return () => {
        socket.off('incident_detected', handleIncidentAlert);
      };
    }
  }, []);

  // Check camera permissions and enumerate video input devices
  const checkPermissionsAndEnumerate = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'camera' });
          setPermissionStatus(status.state);
          status.onchange = () => setPermissionStatus(status.state);
        } catch (e) {
          // Some browsers do not support { name: 'camera' } query
        }
      }
    } catch (err) {
      console.warn('Permission/device enumeration error:', err);
    }
  };

  useEffect(() => {
    checkPermissionsAndEnumerate();
  }, []);

  // Start Webcam Stream
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setPermissionStatus('granted');
    } catch (err) {
      console.error('Failed to acquire webcam stream:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
      }
      setCameraActive(false);
    }
  };

  // Stop Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  // Switch Stream Source
  const handleSelectSource = (src) => {
    stopCamera();
    setStreamSource(src);
    if (src === 'webcam') {
      startCamera();
    }
  };

  // Handle uploaded CCTV video file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setStreamSource('video_upload');
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.play();
      }
    }
  };

  // Draw Bounding Boxes on Overlay Canvas
  const drawDetections = useCallback((detections) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (!detections || !detections.detected_objects) return;

    detections.detected_objects.forEach((obj) => {
      const [ymin, xmin, ymax, xmax] = obj.box;
      const x = xmin * width;
      const y = ymin * height;
      const w = (xmax - xmin) * width;
      const h = (ymax - ymin) * height;

      // Color coding based on severity
      let strokeColor = '#00F2FE'; // default cyan
      let fillColor = 'rgba(0, 242, 254, 0.15)';

      if (obj.severity === 'critical') {
        strokeColor = '#EF4444'; // Red
        fillColor = 'rgba(239, 68, 68, 0.2)';
      } else if (obj.severity === 'high') {
        strokeColor = '#F59E0B'; // Amber
        fillColor = 'rgba(245, 158, 11, 0.2)';
      } else if (obj.severity === 'medium') {
        strokeColor = '#0284C7'; // Blue
        fillColor = 'rgba(2, 132, 199, 0.15)';
      }

      // Draw box
      ctx.lineWidth = 3;
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;
      ctx.strokeRect(x, y, w, h);
      ctx.fillRect(x, y, w, h);

      // Label background
      const labelText = `${obj.label} • ${Math.round(obj.confidence * 100)}%`;
      ctx.font = 'bold 12px monospace';
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillStyle = strokeColor;
      ctx.fillRect(x, y - 22, textWidth + 12, 22);

      // Label text
      ctx.fillStyle = '#0B132B';
      ctx.fillText(labelText, x + 6, y - 6);
    });
  }, []);

  // Frame Capture & Inference Loop
  const captureAndDetect = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended || !cameraActive || !isDetecting) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.7);

    const currentCam =
      streamSource === 'cctv_preset' && selectedCamera
        ? selectedCamera
        : {
            cameraId: 'CAM-AP-WEBCAM-01',
            name: 'Connected Real-Time Terminal Cam (Andhra Pradesh)',
            district: 'NTR',
            location: {
              latitude: 16.5062,
              longitude: 80.648,
              address: 'M.G. Road Corridor, Vijayawada, AP',
            },
          };

    const startTime = performance.now();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/ai/detect-frame-base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64Image,
          camera_id: currentCam.cameraId || 'CAM-AP-01',
          camera_name: currentCam.name,
          district: currentCam.district || 'NTR',
          latitude: currentCam.location?.latitude || 16.5062,
          longitude: currentCam.location?.longitude || 80.648,
          address: currentCam.location?.address || 'Vijayawada Capital Hub',
          auto_persist: true,
        }),
      });

      const data = await response.json();
      const endTime = performance.now();
      setInferenceLatency(Math.round(endTime - startTime));

      setDetectionResults(data);
      drawDetections(data);

      // Track FPS
      frameCountRef.current += 1;
      const now = Date.now();
      if (now - lastFpsCalcTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsCalcTimeRef.current = now;
      }
    } catch (err) {
      console.warn('Inference request failed:', err);
    }
  }, [cameraActive, isDetecting, streamSource, selectedCamera, drawDetections]);

  // Set up detection interval (every 1.5 seconds)
  useEffect(() => {
    if (cameraActive && isDetecting) {
      detectionIntervalRef.current = setInterval(captureAndDetect, 1500);
      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }
  }, [cameraActive, isDetecting, captureAndDetect]);

  // Capture Still Screenshot
  const handleCaptureScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `UrbanPulse-Evidence-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Telemetry */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#00F2FE] p-0.5 shadow-glow-sm flex items-center justify-center">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#00F2FE]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Live AI Camera Monitoring Studio
                </h1>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-rose-950/60 text-rose-400 border border-rose-800 px-2 py-0.5 rounded-full font-bold">
                  LIVE CV FEED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                ANDHRA PRADESH URBAN INCIDENT DETECTION • YOLOv8 DEEP LEARNING + OPENCV MULTI-SPECTRAL
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/map"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>Open on GIS Map</span>
            </Link>
            <Link
              to="/settings"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Camera Settings</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111C44]/70 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Connected AP Cameras</span>
              <Camera className="w-4 h-4 text-[#00F2FE]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.totalCameras}</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">
              ● {stats.activeCameras} Active & Online
            </div>
          </div>

          <div className="bg-[#111C44]/70 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total AI Incidents</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">{stats.totalIncidents}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Autonomous Detections
            </div>
          </div>

          <div className="bg-[#111C44]/70 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Critical Alerts</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {stats.criticalIncidents}
            </div>
            <div className="text-[11px] text-rose-400 font-mono mt-1">
              Urgent Municipal Remediations
            </div>
          </div>

          <div className="bg-[#111C44]/70 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>CV Inference Latency</span>
              <Zap className="w-4 h-4 text-[#00F2FE]" />
            </div>
            <div className="text-2xl font-black text-[#00F2FE] font-mono">
              {inferenceLatency > 0 ? `${inferenceLatency}ms` : 'Ready'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              YOLOv8n Neural Forward Pass
            </div>
          </div>
        </div>

        {/* Main Monitoring Viewport & Feed Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Viewport (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Source Switcher Toolbar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleSelectSource('webcam')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    streamSource === 'webcam'
                      ? 'bg-[#00F2FE] text-slate-950 shadow-glow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Local Webcam / Terminal</span>
                </button>

                <button
                  onClick={() => handleSelectSource('cctv_preset')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    streamSource === 'cctv_preset'
                      ? 'bg-[#00F2FE] text-slate-950 shadow-glow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>AP Municipal Feeds ({cameras.length})</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    streamSource === 'video_upload'
                      ? 'bg-[#00F2FE] text-slate-950 shadow-glow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload CCTV Video</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                  className="hidden"
                />
              </div>

              {/* Camera selection dropdown if multiple webcams */}
              {streamSource === 'webcam' && availableDevices.length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value);
                    if (cameraActive) startCamera();
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                >
                  {availableDevices.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId}>
                      {dev.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              )}

              {/* Start/Stop Camera Controls */}
              <div className="flex items-center space-x-2">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 shadow-md transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Stream</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1 shadow-md transition-all"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Stream</span>
                  </button>
                )}

                <button
                  onClick={handleCaptureScreenshot}
                  disabled={!cameraActive}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50"
                  title="Capture Evidence Snapshot"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Permission Banner if Denied */}
            {permissionStatus === 'denied' && streamSource === 'webcam' && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong>Camera Access Blocked:</strong> Please click the camera icon in your browser's
                  URL bar to allow webcam permissions, or choose an authorized AP Municipal Feed above.
                </div>
              </div>
            )}

            {/* Primary Video Container with Canvas Overlay */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border border-slate-800 shadow-2xl flex items-center justify-center">
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                loop={streamSource === 'video_upload'}
                className="w-full h-full object-cover"
              />

              {/* High-frequency Computer Vision Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />

              {/* If camera is inactive */}
              {!cameraActive && (
                <div className="absolute inset-0 bg-[#0B132B]/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center border border-slate-700 shadow-xl">
                    <Camera className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Live Video Stream Inactive</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Start your local webcam, load recorded CCTV footage, or pick an Andhra Pradesh Municipal Feed to start real-time incident detection.
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-xs shadow-glow-sm hover:shadow-glow transition-all"
                  >
                    Start Real-Time Camera
                  </button>
                </div>
              )}

              {/* Top HUD Telemetry Bar Overlay */}
              {cameraActive && (
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>
                      {streamSource === 'cctv_preset' && selectedCamera
                        ? selectedCamera.name
                        : streamSource === 'video_upload'
                        ? 'CCTV Video Playback File'
                        : 'Webcam Live • 1080p'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-[#00F2FE]">
                      YOLOv8: {inferenceLatency}ms
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom HUD Overlay for Detected Incidents */}
              {cameraActive && detectionResults?.primary_incident && (
                <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
                  <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-rose-500/60 shadow-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-600 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-2">
                          <span>{detectionResults.primary_incident.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white uppercase">
                            {detectionResults.primary_incident.severity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {detectionResults.primary_incident.description} • Confidence:{' '}
                          <span className="text-[#00F2FE] font-mono font-bold">
                            {Math.round(detectionResults.primary_incident.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                      Dispatched to Hub
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 10 Detection Categories Matrix */}
            <div className="bg-[#111C44]/70 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#00F2FE]" />
                  <span>10 Automatic Urban Incident Detectors</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  REAL-TIME COMPUTER VISION INFERENCE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {INCIDENT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isDetected =
                    detectionResults?.detected_objects?.some(
                      (o) => o.incident_type === cat.key || o.label.toLowerCase().includes(cat.key.split('_')[0])
                    ) || false;

                  return (
                    <div
                      key={cat.key}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        isDetected
                          ? 'bg-rose-950/40 border-rose-500 shadow-glow-sm'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${cat.color}`} />
                      <div className="text-[11px] font-semibold text-slate-200 truncate">
                        {cat.name}
                      </div>
                      <div
                        className={`text-[9px] font-mono mt-0.5 ${
                          isDetected ? 'text-rose-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {isDetected ? 'ACTIVE ALERT' : 'Monitoring'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: AP CCTV Stream Switcher & Live Alerts Feed */}
          <div className="space-y-4">
            {/* AP Municipal Cameras Preset Switcher */}
            <div className="bg-[#111C44]/70 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Andhra Pradesh City Feeds</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">6 Online</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {cameras.map((cam) => (
                  <button
                    key={cam.cameraId}
                    onClick={() => {
                      setSelectedCamera(cam);
                      setStreamSource('cctv_preset');
                      setCameraActive(true);
                      if (videoRef.current) {
                        videoRef.current.srcObject = null;
                        // Use simulated cctv stream url
                        videoRef.current.src = cam.streamUrl || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800';
                        videoRef.current.play();
                      }
                    }}
                    className={`w-full p-2.5 rounded-lg text-left transition-all border flex items-center justify-between ${
                      selectedCamera?.cameraId === cam.cameraId && streamSource === 'cctv_preset'
                        ? 'bg-slate-800 border-[#00F2FE] shadow-glow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{cam.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        📍 {cam.district} • {cam.location?.landmark || 'City Center'}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-mono">
                      1080p
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Incidents Alert Stream Feed */}
            <div className="bg-[#111C44]/70 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Real-Time Incident Stream</span>
                </div>
                <span className="text-[10px] font-mono text-[#00F2FE]">Socket.IO Live</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto no-scrollbar">
                {recentDetections.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    Awaiting incident detection frames...
                  </div>
                ) : (
                  recentDetections.map((inc) => (
                    <div
                      key={inc._id || inc.incidentId}
                      className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#00F2FE] font-bold">
                          {inc.incidentId}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            inc.severity === 'critical'
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                              : inc.severity === 'high'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                              : 'bg-blue-950/80 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-200">{inc.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{inc.description}</div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                        <span>📍 {inc.district} District</span>
                        <span>{Math.round(inc.confidence * 100)}% Conf</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Andhra Pradesh 26-District Incident Breakdown Table */}
        <div className="bg-[#111C44]/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#00F2FE]" />
                <span>Andhra Pradesh 26-District Infrastructure Incident Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                REGIONAL SURVEILLANCE OVERVIEW • MUNICIPAL AUTHORITY DISPATCH SQUADS
              </p>
            </div>
            <Link
              to="/analytics"
              className="text-xs text-[#00F2FE] hover:underline flex items-center space-x-1"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">District</th>
                  <th className="pb-2">Headquarters / Zone</th>
                  <th className="pb-2">Active Surveillance Cams</th>
                  <th className="pb-2">Incident Count</th>
                  <th className="pb-2">Vulnerability Index</th>
                  <th className="pb-2">Municipal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2.5 font-bold text-white">NTR</td>
                  <td className="py-2.5">Vijayawada Urban Corridor</td>
                  <td className="py-2.5">1 Active (Benz Circle)</td>
                  <td className="py-2.5 text-amber-400 font-bold">4 Detections</td>
                  <td className="py-2.5">68/100 (High)</td>
                  <td className="py-2.5 text-emerald-400">Squad Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Visakhapatnam</td>
                  <td className="py-2.5">GVMC Coastal Belt</td>
                  <td className="py-2.5">1 Active (RK Beach)</td>
                  <td className="py-2.5 text-amber-400 font-bold">3 Detections</td>
                  <td className="py-2.5">52/100 (Medium)</td>
                  <td className="py-2.5 text-emerald-400">Squad Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Guntur</td>
                  <td className="py-2.5">GMC Commercial Zone</td>
                  <td className="py-2.5">1 Active (Brodipet)</td>
                  <td className="py-2.5 text-amber-400 font-bold">2 Detections</td>
                  <td className="py-2.5">49/100 (Medium)</td>
                  <td className="py-2.5 text-emerald-400">Squad Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Tirupati</td>
                  <td className="py-2.5">TMC Pilgrim Bypass</td>
                  <td className="py-2.5">1 Active (Alipiri Corridor)</td>
                  <td className="py-2.5 text-amber-400 font-bold">1 Detection</td>
                  <td className="py-2.5">38/100 (Nominal)</td>
                  <td className="py-2.5 text-emerald-400">Squad Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Kurnool</td>
                  <td className="py-2.5">KMC Bellary Arterial</td>
                  <td className="py-2.5">1 Active (C-Camp)</td>
                  <td className="py-2.5 text-amber-400 font-bold">2 Detections</td>
                  <td className="py-2.5">58/100 (Medium)</td>
                  <td className="py-2.5 text-emerald-400">Squad Active</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">East Godavari</td>
                  <td className="py-2.5">Rajahmundry Bridge Toll</td>
                  <td className="py-2.5">1 Active (Godavari Bridge)</td>
                  <td className="py-2.5 text-amber-400 font-bold">1 Detection</td>
                  <td className="py-2.5">42/100 (Nominal)</td>
                  <td className="py-2.5 text-emerald-400">Squad Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCameraMonitoring;