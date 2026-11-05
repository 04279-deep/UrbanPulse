import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
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
  Compass,
  MapPin,
} from 'lucide-react';

// Bounding box strictly confining map to Andhra Pradesh State
// South: 12.4, North: 19.3, West: 76.6, East: 84.9
const AP_BOUNDS = [
  [12.4, 76.6],
  [19.3, 84.9],
];

// Approximate perimeter polygon coordinates for Andhra Pradesh State
const AP_STATE_BORDER = [
  [19.10, 84.75], // Ichchapuram / Srikakulam border (NE)
  [18.75, 84.35],
  [18.30, 83.90],
  [17.70, 83.32], // Visakhapatnam Coast
  [17.40, 82.85],
  [16.98, 82.25], // Kakinada Coast
  [16.50, 81.75],
  [16.15, 81.15], // Machilipatnam Coast
  [15.80, 80.85], // Krishna Delta / Nizampatnam
  [15.50, 80.05], // Ongole Coast
  [14.90, 80.05],
  [14.40, 80.10], // Nellore Coast
  [13.70, 80.18],
  [13.45, 80.20], // Pulicat Lake / Tada (SE AP border)
  [13.35, 79.85], // Satyavedu / Nagari
  [13.20, 79.40],
  [12.80, 78.60], // Chittoor / Palamaner
  [12.65, 78.25], // Kuppam (Southern tip of AP)
  [13.00, 78.35],
  [13.60, 77.80], // Madanapalle / Kadiri
  [13.80, 77.20], // Hindupur
  [14.20, 76.90], // Madakasira / Anantapur border (SW)
  [14.65, 77.05],
  [15.15, 77.10], // Guntakal
  [15.45, 76.95],
  [15.80, 77.05], // Adoni / Alur
  [15.95, 77.50], // Tungabhadra river entry
  [16.00, 78.20], // Kurnool North
  [16.10, 78.90], // Srisailam / Krishna River
  [16.45, 79.40], // Nagarjuna Sagar
  [16.70, 79.80], // Macherla / Palnadu
  [16.85, 80.10],
  [17.00, 80.30], // Jaggayyapeta (Krishna border)
  [17.15, 80.85], // Tiruvuru
  [17.25, 81.30], // Polavaram
  [17.55, 81.25], // Godavari river gorge
  [17.90, 81.50], // Chintoor / VR Puram
  [18.20, 82.30], // Alluri Sitarama Raju border
  [18.50, 83.00], // Araku / Manyam hills
  [18.80, 83.50], // Parvathipuram
  [19.00, 84.10],
  [19.10, 84.75], // Return to Ichchapuram
];

// Major Andhra Pradesh Cities / Regions for Quick Navigation
const AP_CITIES = [
  { name: 'All Andhra Pradesh', coords: [16.20, 80.40], zoom: 7.5, tag: 'Statewide' },
  { name: 'Vijayawada (VMC)', coords: [16.5062, 80.6480], zoom: 13, tag: 'Capital Hub' },
  { name: 'Visakhapatnam (GVMC)', coords: [17.7144, 83.3235], zoom: 13, tag: 'Port City' },
  { name: 'Guntur (GMC)', coords: [16.3120, 80.4410], zoom: 13, tag: 'Commerce' },
  { name: 'Tirupati (TMC)', coords: [13.6420, 79.4080], zoom: 13, tag: 'Pilgrim City' },
  { name: 'Kurnool (KMC)', coords: [15.8285, 78.0320], zoom: 13, tag: 'Rayalaseema' },
  { name: 'Rajahmundry (RMC)', coords: [17.0050, 81.7780], zoom: 13, tag: 'Godavari Hub' },
];

// Custom SVG DivIcon generator
const createCustomMarker = (severity, status, category) => {
  let bgColor = '#0284C7';
  let pulseClass = '';

  if (status === 'resolved') {
    bgColor = '#10B981';
  } else if (severity === 'critical') {
    bgColor = '#EF4444';
    pulseClass = 'animate-ping';
  } else if (severity === 'high') {
    bgColor = '#F59E0B';
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

// Map controller to adjust view dynamically
const ChangeMapView = ({ coords, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, zoom || map.getZoom());
    }
  }, [coords, zoom, map]);
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
  const [showAPBorder, setShowAPBorder] = useState(true);

  // Center on Andhra Pradesh capital corridor (Vijayawada / Amaravati)
  const [center, setCenter] = useState([16.20, 80.40]);
  const [currentZoom, setCurrentZoom] = useState(7.5);
  const [activeCityName, setActiveCityName] = useState('All Andhra Pradesh');

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

  const handleCitySelect = (city) => {
    setActiveCityName(city.name);
    setCenter(city.coords);
    setCurrentZoom(city.zoom);
  };

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
      {/* Top Filter & City Navigation Bar */}
      <div className="bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 z-20 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Title & AP State Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#00F2FE] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center font-black text-xs text-[#00F2FE]">
                AP
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center space-x-2">
                <span>Andhra Pradesh Smart Infrastructure GIS</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">
                CONFINED TO ANDHRA PRADESH STATE BOUNDARIES • 26 DISTRICTS
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-[#00F2FE] border border-slate-700 font-mono">
              {filteredComplaints.length} AP Incidents
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Domain Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-[#00F2FE]"
            >
              <option value="all">All Domains</option>
              <option value="road_damage">Road & Potholes</option>
              <option value="garbage">Solid Waste</option>
              <option value="drainage_waterlogging">Drainage & Floods</option>
              <option value="streetlight">Smart Lighting</option>
              <option value="water_leakage">Potable Mains</option>
              <option value="traffic">Traffic Flow</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-[#00F2FE]"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Emergency</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-[#00F2FE]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Triage</option>
              <option value="resolved">Remediated</option>
            </select>

            {/* AP Boundary Toggle */}
            <button
              onClick={() => setShowAPBorder(!showAPBorder)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                showAPBorder
                  ? 'bg-cyan-950/40 border-[#00F2FE]/50 text-[#00F2FE]'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Compass className="w-3 h-3 text-[#00F2FE]" />
              <span>AP Border</span>
            </button>

            {/* Hotspots Toggle */}
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                showHotspots
                  ? 'bg-red-950/40 border-red-500/50 text-red-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Flame className="w-3 h-3 text-red-400" />
              <span>Hotspots</span>
            </button>

            <button
              onClick={loadData}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Refresh AP Incidents"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Andhra Pradesh City Quick-Zoom Carousel Bar */}
        <div className="max-w-7xl mx-auto flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-[#00F2FE]" />
            <span>AP Cities:</span>
          </span>
          {AP_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCitySelect(city)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1 border ${
                activeCityName === city.name
                  ? 'bg-[#00F2FE] text-slate-950 font-bold border-[#00F2FE] shadow-glow-sm'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <span>{city.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Body Strictly Locked to Andhra Pradesh */}
      <div className="relative flex-1 w-full h-full z-10">
        <MapContainer
          center={center}
          zoom={currentZoom}
          minZoom={7}
          maxZoom={18}
          maxBounds={AP_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Voyager / Dark Matter Carto Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <ChangeMapView coords={center} zoom={currentZoom} />

          {/* Andhra Pradesh State Border Outline */}
          {showAPBorder && (
            <Polygon
              positions={AP_STATE_BORDER}
              pathOptions={{
                color: '#00F2FE',
                weight: 3,
                dashArray: '5, 8',
                fillColor: '#0284C7',
                fillOpacity: 0.05,
              }}
            >
              <Popup>
                <div className="p-2 text-xs font-sans text-slate-900">
                  <div className="font-bold text-sm text-blue-900">Andhra Pradesh State</div>
                  <div className="text-slate-600">Capital Region: Amaravati / Vijayawada</div>
                  <div className="text-slate-600">Districts: 26 Municipal Zones</div>
                </div>
              </Popup>
            </Polygon>
          )}

          {/* Hazard Hotspots in Andhra Pradesh */}
          {showHotspots &&
            analytics?.riskHotspots?.map((spot, idx) => (
              <Circle
                key={`hotspot-${idx}`}
                center={[spot.latitude || 16.5062, spot.longitude || 80.6480]}
                radius={400 + spot.complaint_count * 60}
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
                    <div className="text-slate-600">Active Issues in AP: {spot.complaint_count}</div>
                  </div>
                </Popup>
              </Circle>
            ))}

          {/* Andhra Pradesh Complaint Markers */}
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
                      alt="AP Incident Evidence"
                      className="w-full h-28 object-cover rounded-lg border"
                    />
                  )}

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                    <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{c.description}</p>
                  </div>

                  <div className="text-[11px] text-slate-700 font-mono">
                    📍 {c.location.address || c.location.ward}
                  </div>

                  {c.aiAnalysis && (
                    <div className="p-1.5 bg-slate-100 rounded text-[10px] font-mono text-slate-700">
                      AI Verified: {Math.round(c.aiAnalysis.confidence * 100)}% Conf • Risk Index: {c.aiAnalysis.riskIndex}/100
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
                      <span>Track Status</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Andhra Pradesh State Telemetry Card */}
        <div className="absolute bottom-6 left-6 z-20 hidden md:block">
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-2xl space-y-2 min-w-[260px]">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Andhra Pradesh GIS</span>
              <span className="text-[#00F2FE]">Live Geofence</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-black text-amber-400 font-mono">
                {analytics?.summary?.cityRiskIndex || 48.5}
                <span className="text-xs text-slate-400">/100</span>
              </div>
              <div className="text-[11px] text-slate-300 leading-tight">
                Statewide Risk Index <br />
                <span className="text-emerald-400 font-semibold">
                  {analytics?.summary?.resolutionRate || 85}% Resolution SLA
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-700">
              Active Focus: <strong className="text-white">{activeCityName}</strong>
            </div>
          </div>
        </div>

        {/* Floating Legend */}
        <div className="absolute bottom-6 right-6 z-20">
          <div className="glass-panel p-3 rounded-2xl border border-slate-700/80 shadow-2xl text-[11px] font-mono space-y-1.5">
            <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">AP Defect Legend</div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              <span>Critical Emergency</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-sky-500"></span>
              <span>Medium / Nominal</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Remediated & Closed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCityMap;
