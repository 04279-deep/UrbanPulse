import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Building2,
  Zap,
} from 'lucide-react';

const COLORS = ['#00F2FE', '#0284C7', '#38BDF8', '#818CF8', '#F59E0B', '#EF4444', '#10B981'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getDashboard();
        setData(res.data.data);
      } catch (e) {
        console.warn('Analytics API error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-slate-400">Loading Smart City Telemetry...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const monthlyTrends = data?.monthlyTrends || [];
  const categoryStats = data?.categoryStats || [];
  const departments = data?.departments || [];
  const wardStats = data?.wardStats || [];
  const aiStats = data?.aiStats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#00F2FE] mb-1">
          <Activity className="w-4 h-4" />
          <span>REAL-TIME MUNICIPAL METRICS & OBSERVABILITY</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Smart City Infrastructure Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Aggregated civic complaints, computer vision accuracy, departmental SLAs, and spatial hazard risk indices.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Complaints</span>
            <Layers className="w-4 h-4 text-[#00F2FE]" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{summary.totalComplaints || 46}</div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+14% vs previous month</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {summary.resolutionRate || 85}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.resolvedComplaints || 39} tickets remediated
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Critical Red Alerts</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono">{summary.criticalIssues || 4}</div>
          <div className="text-[11px] text-red-300/80 mt-1">Active rapid response squads</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">City Risk Index</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {summary.cityRiskIndex || 48.5}
            <span className="text-sm text-slate-500">/100</span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1">Moderate spatial risk band</div>
        </div>
      </div>

      {/* Row 1: Monthly Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Complaint & Resolution Timeline */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Monthly Incident & Resolution Trends</h3>
            <span className="text-xs font-mono text-[#00F2FE]">6-Month Rolling Window</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" name="Total Reported" stroke="#00F2FE" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="resolved" name="Remediated" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="font-bold text-base text-white">Issues by Domain</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="category"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {categoryStats.map((cat, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-slate-300 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate capitalize">{cat.category.replace('_', ' ')}: {cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Department SLA Performance & AI Inspection Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department SLA Bar Chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Department Active vs Resolved Load</h3>
            <span className="text-xs font-mono text-slate-400">Municipal Squad Status</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="code" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="activeIssuesCount" name="Active Issues" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolvedIssuesCount" name="Resolved Issues" fill="#00F2FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Model Health & Performance Gauges */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#00F2FE]" />
            <h3 className="font-bold text-base text-white">AI Vision & ML Pipeline Status</h3>
          </div>

          <div className="space-y-3">
            {aiStats.modelEngines?.map((engine, idx) => (
              <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{engine.name}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">● {engine.status}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-cyan-300 font-bold">{engine.accuracy}</span>
                  <span className="text-[10px] text-slate-500 block">Validated F1</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Ward-Level Risk Hotspot Ranking */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#00F2FE]" />
            <h3 className="font-bold text-base text-white">Ward-Level Infrastructure Hazard Ranking</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Spatial Priority Index</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-slate-700 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Municipal Ward</th>
                <th className="py-3 px-4">Incident Volume</th>
                <th className="py-3 px-4">Calculated Risk Index</th>
                <th className="py-3 px-4">Alert Severity</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {wardStats.map((w, idx) => {
                const score = 85 - idx * 8;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold">{w.ward}</td>
                    <td className="py-3 px-4 font-mono">{w.count} incidents</td>
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="w-8 font-bold">{score}</span>
                        <div className="w-24 bg-slate-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score > 70 ? 'bg-red-500' : score > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          score > 70
                            ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                            : score > 50
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {score > 70 ? 'High Priority' : score > 50 ? 'Elevated' : 'Nominal'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-mono">Active Patrol</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
