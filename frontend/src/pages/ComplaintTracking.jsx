import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService, feedbackService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Cpu,
  Truck,
  ThumbsUp,
  Star,
  Shield,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const ComplaintTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticketQuery, setTicketQuery] = useState(id || 'UP-2026-01001');
  const [complaint, setComplaint] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [timeliness, setTimeliness] = useState(5);
  const [workQuality, setWorkQuality] = useState(5);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchComplaint = async (searchId) => {
    if (!searchId) return;
    setLoading(true);
    setError('');

    try {
      const res = await complaintService.getById(searchId);
      setComplaint(res.data.complaint);

      // Fetch feedback
      try {
        const fbRes = await feedbackService.getForComplaint(res.data.complaint._id);
        setFeedbacks(fbRes.data.feedback || []);
      } catch (fbErr) {
        console.warn('Feedback fetch notice:', fbErr);
      }
    } catch (err) {
      setError('Ticket ID not found. Try UP-2026-01001, UP-2026-01002, UP-2026-01003 or UP-2026-01004.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setTicketQuery(id);
      fetchComplaint(id);
    } else {
      fetchComplaint('UP-2026-01001');
    }
  }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaint(ticketQuery.trim());
  };

  const handleUpvote = async () => {
    if (!complaint || !user) return;
    try {
      const res = await complaintService.upvote(complaint._id);
      setComplaint({
        ...complaint,
        upvotes: res.data.hasUpvoted
          ? [...complaint.upvotes, user.id || user._id]
          : complaint.upvotes.filter((u) => u !== (user.id || user._id)),
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user || !complaint) return;

    try {
      await feedbackService.submit({
        complaintId: complaint._id,
        rating,
        comment,
        timelinessRating: timeliness,
        workQualityRating: workQuality,
      });

      setFeedbackSuccess(true);
      const fbRes = await feedbackService.getForComplaint(complaint._id);
      setFeedbacks(fbRes.data.feedback || []);
    } catch (e) {
      console.warn(e);
    }
  };

  const statusSteps = [
    { key: 'submitted', label: 'Incident Lodged', icon: Clock },
    { key: 'ai_verified', label: 'AI Computer Vision', icon: Cpu },
    { key: 'assigned', label: 'Squad Dispatched', icon: Truck },
    { key: 'in_progress', label: 'Active Remediation', icon: AlertTriangle },
    { key: 'resolved', label: 'Verified Remediated', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepKey) => {
    if (!complaint) return 'upcoming';
    const order = ['submitted', 'ai_verified', 'assigned', 'in_progress', 'resolved'];
    const currentIdx = order.indexOf(complaint.status);
    const stepIdx = order.indexOf(stepKey);

    if (complaint.status === 'rejected') return stepKey === 'submitted' ? 'complete' : 'rejected';
    if (stepIdx <= currentIdx) return 'complete';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search Bar */}
      <div>
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#00F2FE] mb-1">
          <Clock className="w-4 h-4" />
          <span>TRANSPARENT PUBLIC INCIDENT AUDIT</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Track Infrastructure Ticket</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor real-time status, computer vision analysis, assigned municipal squads, and technician notes.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ticketQuery}
              onChange={(e) => setTicketQuery(e.target.value)}
              placeholder="Enter Ticket ID (e.g. UP-2026-01001)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F2FE]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-sm shadow-glow-sm hover:brightness-110 transition-all shrink-0"
          >
            Track Status
          </button>
        </form>
      </div>

      {loading && (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs font-mono text-slate-400">Querying UrbanPulse Ledger...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
          {error}
        </div>
      )}

      {complaint && !loading && (
        <div className="space-y-8">
          {/* Main Ticket Summary Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs text-[#00F2FE] font-bold">
                  TICKET ID: {complaint.ticketId}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {complaint.title}
                </h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <span>Reported by {complaint.reportedBy?.name || 'Citizen'}</span>
                  <span>•</span>
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{complaint.location?.ward}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    complaint.severity === 'critical'
                      ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                      : complaint.severity === 'high'
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {complaint.severity} Severity
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase font-mono ${
                    complaint.status === 'resolved'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-cyan-950/60 text-[#00F2FE] border border-cyan-500/30'
                  }`}
                >
                  {complaint.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {statusSteps.map((step, idx) => {
                  const status = getStepStatus(step.key);
                  const Icon = step.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        status === 'complete'
                          ? 'bg-slate-800/90 border-[#00F2FE]/40 text-[#00F2FE]'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          status === 'complete'
                            ? 'bg-[#00F2FE] text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200">{step.label}</div>
                      <div className="text-[9px] font-mono mt-0.5 capitalize text-slate-400">
                        {status === 'complete' ? 'Done' : 'Pending'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photos & AI Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Reported Photo */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Reported Photograph</span>
                {complaint.images && complaint.images.length > 0 ? (
                  <img
                    src={complaint.images[0].url}
                    alt="Report evidence"
                    className="w-full h-56 object-cover rounded-2xl border border-slate-700"
                  />
                ) : (
                  <div className="h-56 bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500 border border-slate-800">
                    No photo uploaded
                  </div>
                )}
              </div>

              {/* AI Diagnostic Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300">
                  AI Computer Vision Verification
                </span>
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Detected Defect:</span>
                    <span className="text-[#00F2FE] font-bold uppercase">
                      {complaint.aiAnalysis?.detectedCategory || complaint.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Detection Confidence:</span>
                    <span className="text-emerald-400 font-bold">
                      {Math.round((complaint.aiAnalysis?.confidence || 0.92) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Spatial Risk Index:</span>
                    <span className="text-amber-400 font-bold">
                      {complaint.aiAnalysis?.riskIndex || 68}/100
                    </span>
                  </div>
                  {complaint.aiAnalysis?.potholeCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extracted Potholes:</span>
                      <span className="text-red-400 font-bold">
                        {complaint.aiAnalysis.potholeCount} craters
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-sans italic">
                    "{complaint.aiAnalysis?.analysisSummary}"
                  </div>
                </div>

                {/* Assigned Team Card */}
                {complaint.assignedTeam && (
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">
                        {complaint.assignedTeam.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Lead: {complaint.assignedTeam.leaderName} • {complaint.assignedTeam.contactNumber}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      Dispatched
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Upvote & Community Validation */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleUpvote}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <ThumbsUp className="w-4 h-4 text-[#00F2FE]" />
                <span>Upvote Community Priority ({complaint.upvotes?.length || 0})</span>
              </button>

              <div className="text-xs text-slate-400">
                Department:{' '}
                <strong className="text-slate-200">
                  {complaint.department?.name || 'Roads & Infrastructure'}
                </strong>
              </div>
            </div>
          </div>

          {/* Audit Timeline Log */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-4">
            <h3 className="font-bold text-base text-white">Immutable Remediation Audit Trail</h3>
            <div className="space-y-4">
              {complaint.statusTimeline?.map((item, idx) => (
                <div key={idx} className="flex space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#00F2FE] mt-1.5 shrink-0"></div>
                  <div>
                    <div className="font-semibold text-slate-200 uppercase tracking-wide">
                      {item.status.replace('_', ' ')} •{' '}
                      <span className="text-slate-400 font-normal">
                        by {item.updatedBy || 'System'}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{item.note}</p>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback Form (if resolved or closed) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-4">
            <h3 className="font-bold text-base text-white">Citizen Quality & Timeliness Feedback</h3>
            <p className="text-xs text-slate-400">
              Your feedback directly impacts municipal squad performance ratings and department SLA bonuses.
            </p>

            {feedbackSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs">
                Thank you! Your rating and comments have been recorded on the public governance ledger. (+5 Civic Points awarded)
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Overall Satisfaction Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1.5 rounded-lg ${
                          rating >= star ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-slate-400 ml-2">{rating}/5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Remediation Feedback Comment
                  </label>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Was the repair neat, timely, and complete?"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#00F2FE]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-xs shadow-glow-sm hover:brightness-110"
                >
                  Submit Citizen Feedback
                </button>
              </form>
            )}

            {/* Existing Feedback List */}
            {feedbacks.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-300">Recorded Citizen Reviews</span>
                {feedbacks.map((fb) => (
                  <div key={fb._id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{fb.citizen?.name || 'Citizen'}</span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300">{fb.comment}</p>
                    {fb.authorityReply && (
                      <div className="mt-2 pl-3 border-l-2 border-[#00F2FE] text-[11px] text-cyan-300">
                        <strong>Authority Response:</strong> {fb.authorityReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintTracking;
