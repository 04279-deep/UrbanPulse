import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintService, teamService, infrastructureService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Shield,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Sliders,
  Send,
  Zap,
  ExternalLink,
} from 'lucide-react';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [teams, setTeams] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [statusNote, setStatusNote] = useState('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Dispatch Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // AI Evaluation Loading State
  const [evaluatingAssetId, setEvaluatingAssetId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, teamRes, assetRes] = await Promise.all([
        complaintService.getAll(),
        teamService.getAll(),
        infrastructureService.getAll(),
      ]);
      setComplaints(compRes.data.complaints || []);
      setTeams(teamRes.data.teams || []);
      setAssets(assetRes.data.assets || []);
    } catch (e) {
      console.warn('Authority load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await complaintService.updateStatus(selectedComplaint._id, {
        status: newStatus,
        note: statusNote,
      });
      setStatusModalOpen(false);
      loadData();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDispatchTeam = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedTeamId) return;

    try {
      await teamService.assign({
        complaintId: selectedComplaint._id,
        teamId: selectedTeamId,
        dispatchNotes,
      });
      setDispatchModalOpen(false);
      loadData();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleEvaluateAI = async (assetId) => {
    setEvaluatingAssetId(assetId);
    try {
      await infrastructureService.evaluatePredictiveMaintenance(assetId);
      loadData();
    } catch (err) {
      console.warn('Predictive maintenance audit failed:', err);
    } finally {
      setEvaluatingAssetId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#00F2FE]">
            <Shield className="w-4 h-4 text-[#00F2FE]" />
            <span>MUNICIPAL AUTHORITY COMMAND PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Department Operations & Dispatch Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Officer: <strong className="text-slate-200">{user?.name}</strong> • Division: {user?.department?.name || 'Roads & Infrastructure'}
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Incident Queue */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Active Infrastructure Incidents</h2>
          <span className="text-xs font-mono text-slate-400">{complaints.length} Total Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-slate-700 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Defect Details</th>
                <th className="py-3 px-4">AI Verification</th>
                <th className="py-3 px-4">Assigned Crew</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                    <div className="text-[11px] text-slate-400">
                      📍 {c.location?.address || c.location?.ward}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-cyan-300 font-bold">
                      {Math.round((c.aiAnalysis?.confidence || 0.88) * 100)}% Conf
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Risk Index: {c.aiAnalysis?.riskIndex || 60}/100
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {c.assignedTeam ? (
                      <span className="text-slate-200 font-medium">{c.assignedTeam.name}</span>
                    ) : (
                      <span className="text-amber-400 font-mono text-[11px]">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                        c.status === 'resolved'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'in_progress'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setDispatchModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#00F2FE] font-mono text-[11px] border border-slate-700"
                    >
                      Dispatch
                    </button>
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setNewStatus(c.status);
                        setStatusModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#0284C7] hover:bg-[#0284C7]/80 text-white font-mono text-[11px]"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predictive Maintenance & Infrastructure Assets Audit */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Predictive Maintenance & Asset Health Monitor</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Machine Learning Gradient Boosting engine predicts failure probabilities from sensor telemetry.
            </p>
          </div>
          <span className="text-xs font-mono text-[#00F2FE]">FastAPI :8000 ML Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-slate-700 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Name & Type</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Health Score</th>
                <th className="py-3 px-4">Failure Probability</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4 text-right">Run AI Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {assets.map((asset) => (
                <tr key={asset._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">{asset.assetId}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{asset.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{asset.type.replace('_', ' ')}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{asset.location?.zone}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#00F2FE]">
                    {asset.healthScore}/100
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`font-bold ${
                        asset.predictedFailureProbability > 0.5 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {Math.round(asset.predictedFailureProbability * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        asset.riskLevel === 'critical'
                          ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                          : asset.riskLevel === 'high'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {asset.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEvaluateAI(asset._id)}
                      disabled={evaluatingAssetId === asset._id}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-[11px] hover:brightness-110 shadow-glow-sm"
                    >
                      {evaluatingAssetId === asset._id ? 'Auditing...' : 'Run Audit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {statusModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              Update Status: {selectedComplaint.ticketId}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#00F2FE]"
              >
                <option value="submitted">Submitted</option>
                <option value="ai_verified">AI Verified</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Technician / Remediation Note
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Work done, materials used, inspection results..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-xs"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              Dispatch Squad: {selectedComplaint.ticketId}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Maintenance Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#00F2FE]"
              >
                <option value="">-- Choose Squad --</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} (Lead: {t.leaderName} • {t.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dispatch Instructions
              </label>
              <textarea
                rows={3}
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="Special equipment needed, priority instructions..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDispatchModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispatchTeam}
                disabled={!selectedTeamId}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
