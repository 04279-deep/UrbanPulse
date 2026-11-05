import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { departmentService, teamService, analyticsService } from '../services/api';
import {
  ShieldCheck,
  Server,
  Cpu,
  Database,
  Radio,
  Building2,
  Users,
  Truck,
  Activity,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiHealth, setAiHealth] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [deptRes, teamRes, analRes] = await Promise.all([
        departmentService.getAll(),
        teamService.getAll(),
        analyticsService.getDashboard(),
      ]);
      setDepartments(deptRes.data.departments || []);
      setTeams(teamRes.data.teams || []);
      setAnalytics(analRes.data.data || null);

      // Check Python AI microservice health
      try {
        const aiRes = await axios.get('http://127.0.0.1:8000/health');
        setAiHealth(aiRes.data);
      } catch (e) {
        setAiHealth({ status: 'offline', note: 'AI Microservice offline' });
      }
    } catch (e) {
      console.warn('Admin load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#00F2FE]">
            <ShieldCheck className="w-4 h-4 text-[#00F2FE]" />
            <span>CITY CHIEF ADMINISTRATOR COMMAND SUITE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            UrbanPulse Central Command
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Platform Administrator: <strong className="text-slate-200">{user?.name}</strong> • Microservice Architecture Supervision
          </p>
        </div>

        <button
          onClick={loadAll}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Mesh Telemetry</span>
        </button>
      </div>

      {/* Microservice Mesh Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Node.js Express API */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Core Backend API</span>
            <Server className="w-4 h-4 text-[#00F2FE]" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-base font-bold text-white">Express :5000</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">HTTP REST + JWT Router Active</div>
        </div>

        {/* Python AI FastAPI */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Python AI Engine</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                aiHealth?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
            <span className="text-base font-bold text-white">FastAPI :8000</span>
          </div>
          <div className="text-[11px] text-cyan-400 font-mono">
            {aiHealth?.status === 'healthy' ? 'OpenCV + Scikit-Learn Active' : 'Fallback Active'}
          </div>
        </div>

        {/* MongoDB Database */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Database Layer</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-base font-bold text-white">MongoDB + Mongoose</span>
          </div>
          <div className="text-[11px] text-indigo-300 font-mono">9 Collections Synchronized</div>
        </div>

        {/* Socket.IO Real-time */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Real-time Stream</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-base font-bold text-white">Socket.IO Mesh</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">WebSocket Subscriptions Live</div>
        </div>
      </div>

      {/* Departments Overview */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#00F2FE]" />
            <h2 className="text-lg font-bold text-white">Municipal Engineering Departments</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">{departments.length} Divisions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-slate-700 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Superintendent</th>
                <th className="py-3 px-4">Active Tickets</th>
                <th className="py-3 px-4">Resolved Total</th>
                <th className="py-3 px-4">Avg SLA Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {departments.map((d) => (
                <tr key={d._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#00F2FE]">{d.code}</td>
                  <td className="py-3 px-4 font-semibold text-white">{d.name}</td>
                  <td className="py-3 px-4 text-slate-300">{d.headOfficer}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-red-400 font-bold">{d.activeIssuesCount}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-emerald-400 font-bold">{d.resolvedIssuesCount}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{d.avgResolutionHours} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Teams & Fleet Overview */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-[#00F2FE]" />
            <h2 className="text-lg font-bold text-white">Active Field Squads & Vehicle Fleet</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">{teams.length} Squads Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((t) => (
            <div key={t._id} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex justify-between items-start">
                <div className="font-bold text-white text-sm">{t.name}</div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                    t.status === 'available'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Lead: <strong className="text-slate-300">{t.leaderName}</strong> ({t.membersCount} crew)
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Vehicle: {t.vehicleId} • Rating: ⭐ {t.rating}
              </div>
              <div className="text-[11px] text-cyan-300 font-mono truncate">
                📍 {t.currentLocation?.zone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
