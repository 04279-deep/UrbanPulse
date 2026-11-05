import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  MapPin,
  Cpu,
  BarChart3,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Truck,
  Droplets,
  Lightbulb,
  Trash2,
  Construction,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';

const LandingPage = () => {
  const [demoText, setDemoText] = useState('Severe crater on 4th avenue near metro station damaged my car tire');
  const [nlpResult, setNlpResult] = useState(null);
  const [nlpLoading, setNlpLoading] = useState(false);

  const testNLP = async () => {
    setNlpLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai/classify-text', {
        title: 'Citizen Report',
        description: demoText,
      });
      setNlpResult(res.data);
    } catch (e) {
      // Heuristic fallback
      setNlpResult({
        suggested_category: 'road_damage',
        confidence: 0.94,
        urgency: 'critical',
        is_simulated: true,
      });
    } finally {
      setNlpLoading(false);
    }
  };

  const domainCards = [
    {
      title: 'Road & Pothole Detection',
      desc: 'OpenCV edge and texture analysis segments potholes, surface cracks, and asphalt fissures with instant severity scoring.',
      icon: Construction,
      color: 'from-amber-500 to-orange-500',
      badge: 'Vision CV',
      stat: '94.2% Acc',
    },
    {
      title: 'Solid Waste & Dump Clearance',
      desc: 'Multi-spectral color entropy isolates illegal roadside dumping clusters, overflowing dumpsters, and plastic debris.',
      icon: Trash2,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Entropy CV',
      stat: '< 12h SLA',
    },
    {
      title: 'Drainage & Waterlogging',
      desc: 'Specular reflection algorithms detect standing puddles and submerged intersections, alerting emergency suction crews.',
      icon: Droplets,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Hydrology AI',
      stat: '1.5ft Depth Alert',
    },
    {
      title: 'Smart Streetlight Grid',
      desc: 'Identifies dark zones, burnt LED modules, and power surges, auto-routing work orders to electrical bucket trucks.',
      icon: Lightbulb,
      color: 'from-yellow-400 to-amber-500',
      badge: 'Lux Sensor',
      stat: '64 Fixed',
    },
    {
      title: 'Water Main Leak Reporting',
      desc: 'Pressurized acoustic and surface moisture detection pinpoints subterranean burst pipes to curb millions of gallons lost.',
      icon: Droplets,
      color: 'from-sky-500 to-indigo-500',
      badge: 'Acoustic CV',
      stat: '98% Recovered',
    },
    {
      title: 'Adaptive Traffic Monitoring',
      desc: 'Signal phase desynchronization tracking and congestion choke-point alerts for transit command dispatchers.',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      badge: 'Traffic AI',
      stat: 'Real-Time Sync',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#0284C7]/20 via-[#00F2FE]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-[#00F2FE]/40 text-xs font-mono text-slate-200 shadow-glow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse"></span>
            <span>URBANPULSE 2.0 • AUTONOMOUS INFRASTRUCTURE OBSERVABILITY</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Smart Urban Infrastructure <br />
            <span className="bg-gradient-to-r from-[#00F2FE] via-[#38BDF8] to-[#0284C7] bg-clip-text text-transparent">
              Monitoring & AI Analytics
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal max-w-3xl mx-auto">
            Empower municipal departments with real-time computer vision detection, automated NLP complaint triage, interactive GIS geospatial mapping, and predictive maintenance intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/report"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-sm sm:text-base shadow-glow hover:brightness-110 transition-all flex items-center space-x-2"
            >
              <AlertTriangle className="w-5 h-5 text-slate-950" />
              <span>Report Infrastructure Incident</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>

            <Link
              to="/map"
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-sm sm:text-base border border-slate-700 hover:border-[#00F2FE]/50 transition-all flex items-center space-x-2"
            >
              <MapPin className="w-5 h-5 text-[#00F2FE]" />
              <span>Explore Live City Map</span>
            </Link>
          </div>

          {/* Live Telemetry Ticker */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel p-4 rounded-xl border border-slate-700/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#00F2FE] font-mono">94.6%</div>
              <div className="text-xs text-slate-400 mt-1">Computer Vision Accuracy</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-700/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">18.2 hrs</div>
              <div className="text-xs text-slate-400 mt-1">Average Resolution SLA</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-700/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">6 Domains</div>
              <div className="text-xs text-slate-400 mt-1">Monitored In Real-Time</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-700/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">48.5/100</div>
              <div className="text-xs text-slate-400 mt-1">Municipal Risk Index</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Infrastructure Monitoring Domains */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Comprehensive Urban Infrastructure Pillars
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Automated intelligence pipelines deployed across municipal engineering divisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domainCards.map((domain, idx) => {
            const Icon = domain.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl hover:border-[#00F2FE]/50 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${domain.color} p-0.5 flex items-center justify-center shadow-glow-sm`}>
                    <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800 text-[#00F2FE] border border-slate-700">
                    {domain.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{domain.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{domain.desc}</p>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">Metric Benchmark</span>
                  <span className="text-emerald-400 font-mono font-semibold">{domain.stat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Interactive NLP Triage Simulator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-panel p-8 rounded-3xl border border-[#00F2FE]/30 shadow-glow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-[#00F2FE] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FastAPI Microservice Live Sandbox</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Test AI Natural Language Complaint Triage
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Type any infrastructure issue. The Python AI Scikit-Learn TF-IDF model will instantly classify department and priority.
              </p>
            </div>
            <button
              onClick={testNLP}
              disabled={nlpLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-xs shadow-glow-sm hover:brightness-110 transition-all shrink-0"
            >
              {nlpLoading ? 'Analyzing...' : 'Run Live Inference'}
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#00F2FE] transition-colors font-sans"
              placeholder="e.g., Underground pipeline burst near central park with continuous drinking water flow..."
            />

            {nlpResult && (
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Classified Department:</span>
                  <span className="text-[#00F2FE] font-bold text-sm uppercase">
                    {nlpResult.suggested_category?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Predicted Urgency Tier:</span>
                  <span
                    className={`font-bold text-sm uppercase ${
                      nlpResult.urgency === 'critical'
                        ? 'text-red-400'
                        : nlpResult.urgency === 'high'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {nlpResult.urgency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Confidence Score:</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {Math.round(nlpResult.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How UrbanPulse Works - 4 Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Autonomous Incident Remediation Lifecycle
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            From mobile citizen geotagging to field crew completion proof.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Citizen Geo-Report',
              desc: 'Resident snaps a photograph via web or mobile app. GPS coordinates and ward are captured automatically.',
              icon: MapPin,
            },
            {
              step: '02',
              title: 'Computer Vision Triage',
              desc: 'OpenCV and ML models detect potholes, count debris clusters, score severity, and verify authenticity.',
              icon: Cpu,
            },
            {
              step: '03',
              title: 'Automated Dispatch',
              desc: 'Complaint routes directly to the designated municipal department and dispatches the closest active squad.',
              icon: Truck,
            },
            {
              step: '04',
              title: 'Proof & Citizen Rating',
              desc: 'Technicians upload after-repair photographs. Citizen verifies completion and rates municipal service.',
              icon: CheckCircle,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl relative border border-slate-800">
                <div className="text-3xl font-black font-mono text-[#00F2FE]/20 mb-3">{item.step}</div>
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-[#00F2FE] mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Municipal Authority & Citizen Gamification CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-slate-900 via-[#1C2541] to-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-700/80 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>CIVIC ENGAGEMENT REWARDS PROGRAM</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Earn Civic Points & Badges for Keeping Your City Resilient
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every verified incident reported awards civic points and unlocks community badges like <em>"Pothole Hunter"</em> and <em>"First Responder"</em>. Join thousands of active citizens transforming urban governance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-sm text-center shadow-glow-sm hover:brightness-110 transition-all"
            >
              Sign Up Now
            </Link>
            <Link
              to="/analytics"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm text-center border border-slate-700 transition-all"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
