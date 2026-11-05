import React from 'react';
import { Activity, ShieldCheck, Cpu, Database, PhoneCall, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#070D1E] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0284C7] to-[#00F2FE] p-0.5">
                <div className="w-full h-full bg-[#0B132B] rounded-md flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#00F2FE]" />
                </div>
              </div>
              <span className="font-bold text-base text-white">
                Urban<span className="text-[#00F2FE]">Pulse</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Next-generation municipal infrastructure observability platform combining high-frequency computer vision, predictive maintenance models, and citizen engagement.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>All 6 Municipal AI Pipelines Operational</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/map" className="hover:text-[#00F2FE] transition-colors">
                  Interactive Smart City Map
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-[#00F2FE] transition-colors">
                  Report Infrastructure Incident
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-[#00F2FE] transition-colors">
                  Spatial Risk & KPI Dashboard
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-[#00F2FE] transition-colors">
                  Public Ticket Tracking Timeline
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & AI */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              AI Microservice Stack
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>YOLO & OpenCV Road Vision</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>TF-IDF NLP Triage Engine</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Random Forest Predictive Maintenance</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>DBSCAN Spatial Hotspot Grid</span>
              </li>
            </ul>
          </div>

          {/* Emergency & Municipal Contacts */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Emergency Hotlines
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>City Emergency Control: <strong>1800-URBAN-911</strong></span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Available 24/7 for catastrophic road cave-ins, high-pressure water main ruptures, and fallen electrical wires.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[11px]">
          <p>© 2026 UrbanPulse Platform. Built for Smart Municipal Infrastructure.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span>FastAPI AI :8000</span>
            <span>•</span>
            <span>Express Core :5000</span>
            <span>•</span>
            <span>Leaflet GIS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
