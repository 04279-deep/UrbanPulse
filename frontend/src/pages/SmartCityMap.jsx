import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { complaintService, analyticsService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Layers,
  Filter,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

// Custom SVG DivIcon generator
const createCustomMarker = (severity, status, category) => {
  let bgColor = '#0284C7'; // default blue
  let pulseClass = '';

  if (status === 'resolved') {
    bgColor = '#10B981'; // emerald
  } else if (severity === 'critical') {
    bgColor = '#EF4444'; // red
    pulseClass = 'animate-ping';
  } else if (severity === 'high') {
    bgColor = '#F59E0B'; // amber
  }

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8">
      ${severity === 'critical' && status !== 'resolved' ? `<span class="${pulseClass} absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>` : ''}
      <div style="background-color: ${bgColor};" class="relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
        ${category === 'road_damage' ? '🛣️' : category === 'garbage' ? '🗑️' : category === 'drainage_waterlogging' ? '🌊' : category === 'streetlight' ? '💡' : category === 'water_leakage' ? '🚰' : '🚦'}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to dynamically re-center map if needed
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
};

const SmartCityMap = () => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showHotspots, setShowHotspots] = useState(true);
  const [center, setCenter] = useState([28.6145, 77.2104]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, analRes] = await Promise.all([
        complaintService.getAll(),
        analyticsService.getDashboard(),
      ]);
      setComplaints(compRes.data.complaints || []);
      setAnalytics(analRes.data.data || null);
    } catch (e) {
      console.warn('Failed to load map data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && c.severity !== selectedSeverity) return false;
    if (selectedStatus === 'active' && c.status === 'resolved') return false;
    if (selectedStatus === 'resolved' && c.status !== 'resolved') return false;
    return true;
  });

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full flex flex-col overflow-hidden">
      {/* Top Filter and Controls Bar */}
      <div className="bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Title & Quick Stats */}
          <div className="flex items-center space-x-3">
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] animate-pulse"></span>
              <span>Smart City Infrastructure GIS</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {filteredComplaints.length} Incidents Displayed
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#00F2FE]"
            >
              <option value="all">All Domains</option>
              <option value="road_damage">Road & Potholes</option>
              <option value="garbage">Solid Waste</option>
              <option value="drainage_waterlogging">Drainage & Floods</option>
              <option value="streetlight">Streetlights</option>
              <option value="water_leakage">Water Main Leaks</option>
              <option value="traffic">Traffic Flow</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#00F2FE]"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High & Critical</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#00F2FE]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="resolved">Resolved Remediations</option>
            </select>

            {/* Hotspots Toggle */}
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                showHotspots
                  ? 'bg-red-950/40 border-red-500/50 text-red-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Hotspot Layer</span>
            </button>

            <button
              onClick={loadData}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Refresh Map"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Map Body */}
      <div className="relative flex-1 w-full h-full z-10">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* High-contrast CartoDB Dark Matter tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <ChangeMapView coords={center} />

          {/* Hotspot Circles */}
          {showHotspots &&
            analytics?.riskHotspots?.map((spot, idx) => (
              <Circle
                key={`hotspot-${idx}`}
                center={[spot.latitude || 28.6145, spot.longitude || 77.2104]}
                radius={350 + spot.complaint_count * 50}
                pathOptions={{
                  color: spot.risk_index > 70 ? '#EF4444' : '#F59E0B',
                  fillColor: spot.risk_index > 70 ? '#EF4444' : '#F59E0B',
                  fillOpacity: 0.18,
                  weight: 2,
                  dashArray: '4, 8',
                }}
              >
                <Popup>
                  <div className="p-2 text-xs font-sans">
                    <div className="font-bold text-slate-900 text-sm mb-1">{spot.ward}</div>
                    <div className="text-slate-600">Risk Index: <strong>{spot.risk_index}/100</strong></div>
                    <div className="text-slate-600">Status: <span className="text-red-600 font-semibold">{spot.status}</span></div>
                    <div className="text-slate-600">Active Issues: {spot.complaint_count}</div>
                  </div>
                </Popup>
              </Circle>
            ))}

          {/* Complaint Markers */}
          {filteredComplaints.map((c) => (
            <Marker
              key={c._id}
              position={[c.location.latitude, c.location.longitude]}
              icon={createCustomMarker(c.severity, c.status, c.category)}
            >
              <Popup>
                <div className="p-2 max-w-xs text-xs font-sans text-slate-900 space-y-2">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-mono font-bold text-xs text-blue-700">{c.ticketId}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : c.severity === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </div>

                  {c.images && c.images.length > 0 && (
                    <img
                      src={c.images[0].url}
                      alt="Damage"
                      className="w-full h-28 object-cover rounded-lg border"
                    />
                  )}

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                    <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{c.description}</p>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    📍 {c.location.address || c.location.ward}
                  </div>

                  {c.aiAnalysis && (
                    <div className="p-1.5 bg-slate-100 rounded text-[10px] font-mono text-slate-700">
                      AI Verified: {Math.round(c.aiAnalysis.confidence * 100)}% Conf • Risk Score: {c.aiAnalysis.riskIndex}
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 capitalize">
                      Status: {c.status.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/track/${c.ticketId}`}
                      className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-bold"
                    >
                      <span>Track</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating City Health Widget */}
        <div className="absolute bottom-6 left-6 z-20 hidden md:block">
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-2xl space-y-2 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>City Risk Matrix</span>
              <span className="text-[#00F2FE]">Live Telemetry</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-black text-amber-400 font-mono">
                {analytics?.summary?.cityRiskIndex || 48.5}
                <span className="text-xs text-slate-400">/100</span>
              </div>
              <div className="text-[11px] text-slate-300 leading-tight">
                Moderate Risk <br />
                <span className="text-emerald-400 font-semibold">
                  {analytics?.summary?.resolutionRate || 85}% Resolution Rate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Legend */}
        <div className="absolute bottom-6 right-6 z-20">
          <div className="glass-panel p-3 rounded-2xl border border-slate-700/80 shadow-2xl text-[11px] font-mono space-y-1.5">
            <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Incident Legend</div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              <span>Critical Emergency</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>High Severity</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-sky-500"></span>
              <span>Medium / Nominal</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Remediated & Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCityMap;
