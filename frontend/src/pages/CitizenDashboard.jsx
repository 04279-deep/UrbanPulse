import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  ExternalLink,
  ThumbsUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const res = await complaintService.getAll({ myComplaints: true });
        setComplaints(res.data.complaints || []);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyComplaints();
  }, []);

  const totalSubmitted = complaints.length;
  const activeCount = complaints.filter((c) => c.status !== 'resolved').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Civic Points Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#00F2FE]">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CITIZEN ADVOCATE PROFILE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Track your submitted infrastructure issues, earn badges, and help keep our municipal transit corridors safe and resilient.
          </p>
        </div>

        {/* Civic Score & Badges Badge */}
        <div className="flex items-center space-x-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-glow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {user?.civicPoints || 85} <span className="text-xs text-slate-400">PTS</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              {user?.badges?.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <span className="text-xs text-slate-400">Total Incidents Lodged</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">{totalSubmitted}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <span className="text-xs text-slate-400">Active / In Remediation</span>
          <div className="text-3xl font-extrabold text-[#00F2FE] font-mono mt-1">{activeCount}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <span className="text-xs text-slate-400">Successfully Remediated</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{resolvedCount}</div>
        </div>
      </div>

      {/* My Complaints Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">My Reported Infrastructure Complaints</h2>
          <Link
            to="/report"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-xs shadow-glow-sm hover:brightness-110"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            Loading your civic incidents...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-slate-400">You haven't reported any infrastructure issues yet.</p>
            <Link
              to="/report"
              className="inline-flex items-center space-x-1 text-xs text-[#00F2FE] font-bold hover:underline"
            >
              <span>Lodge your first report</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-slate-700 text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Title & Ward</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">AI Verification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#00F2FE]">
                      {c.ticketId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{c.title}</div>
                      <div className="text-[11px] text-slate-400">{c.location?.ward}</div>
                    </td>
                    <td className="py-3 px-4 capitalize font-mono">
                      {c.category?.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.severity === 'critical'
                            ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                            : c.severity === 'high'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {c.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {c.aiAnalysis ? (
                        <span className="text-emerald-400">
                          {Math.round(c.aiAnalysis.confidence * 100)}% Conf
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                          c.status === 'resolved'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/track/${c.ticketId}`}
                        className="text-xs font-semibold text-[#00F2FE] hover:underline"
                      >
                        View Timeline
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
