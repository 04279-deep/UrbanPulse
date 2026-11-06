import React, { useState, useEffect } from 'react';
import {
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  ExternalLink,
  Map,
  CloudRain,
  Cpu,
  Sparkles,
  Shield,
  Layers,
  Activity,
  Globe,
  Camera,
  Check,
} from 'lucide-react';
import { configService } from '../services/api';

const Settings = () => {
  const [config, setConfig] = useState({
    defaultMapProvider: 'openstreetmap',
    mapboxApiKey: '',
    mapTilerApiKey: '',
    weatherApiKey: '',
    openaiApiKey: '',
    googleMapsApiKey: '',
    aiServiceUrl: 'http://127.0.0.1:8000',
    realTimeDetectionEnabled: true,
  });

  const [maskedKeys, setMaskedKeys] = useState({});
  const [configuredFlags, setConfiguredFlags] = useState({});
  const [validationStates, setValidationStates] = useState({});
  const [validating, setValidating] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load configuration on mount
  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await configService.getSettings();
      if (res.data && res.data.config) {
        const c = res.data.config;
        setConfig((prev) => ({
          ...prev,
          defaultMapProvider: c.defaultMapProvider || 'openstreetmap',
          aiServiceUrl: c.aiServiceUrl || 'http://127.0.0.1:8000',
          realTimeDetectionEnabled: c.realTimeDetectionEnabled ?? true,
        }));

        setMaskedKeys({
          mapbox: c.mapboxMasked,
          maptiler: c.mapTilerMasked,
          weather: c.weatherMasked,
          openai: c.openaiMasked,
          googleMaps: c.googleMapsMasked,
        });

        setConfiguredFlags({
          mapbox: c.mapboxConfigured,
          maptiler: c.mapTilerConfigured,
          weather: c.weatherConfigured,
          openai: c.openaiConfigured,
          googleMaps: c.googleMapsConfigured,
        });

        if (c.serviceStatus) {
          setValidationStates(c.serviceStatus);
        }
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Validate single service
  const handleValidate = async (serviceName) => {
    setValidating((prev) => ({ ...prev, [serviceName]: true }));
    try {
      let keyVal = '';
      if (serviceName === 'mapbox') keyVal = config.mapboxApiKey;
      if (serviceName === 'maptiler') keyVal = config.mapTilerApiKey;
      if (serviceName === 'weather') keyVal = config.weatherApiKey;
      if (serviceName === 'openai') keyVal = config.openaiApiKey;
      if (serviceName === 'googleMaps') keyVal = config.googleMapsApiKey;
      if (serviceName === 'pythonAi') keyVal = config.aiServiceUrl;

      const res = await configService.validateService(serviceName, { key: keyVal });
      setValidationStates((prev) => ({
        ...prev,
        [serviceName]: res.data,
      }));
    } catch (err) {
      setValidationStates((prev) => ({
        ...prev,
        [serviceName]: {
          status: 'failed',
          message: err.response?.data?.message || err.message || 'Validation request failed',
        },
      }));
    } finally {
      setValidating((prev) => ({ ...prev, [serviceName]: false }));
    }
  };

  // Save full configuration
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await configService.updateSettings(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      await loadConfig();
    } catch (err) {
      alert(`Save failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (serviceName) => {
    const val = validationStates[serviceName];
    if (validating[serviceName]) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono bg-blue-950/60 text-blue-300 border border-blue-800">
          <RefreshCw className="w-3 h-3 animate-spin text-[#00F2FE]" />
          <span>Validating...</span>
        </span>
      );
    }

    if (val?.status === 'connected') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Connected {val.latencyMs ? `(${val.latencyMs}ms)` : ''}</span>
        </span>
      );
    }

    if (val?.status === 'failed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono bg-rose-950/60 text-rose-400 border border-rose-800">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Failed</span>
        </span>
      );
    }

    if (configuredFlags[serviceName]) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-[#00F2FE] border border-cyan-800">
          <Check className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span>Configured</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800/80 text-slate-400 border border-slate-700">
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span>Not Configured</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#00F2FE] p-0.5 shadow-glow-sm flex items-center justify-center">
                <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#00F2FE]" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  System API & Infrastructure Settings
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  SECURE CREDENTIAL MANAGEMENT • LIVE STATUS VALIDATION • NO EXPOSED KEYS
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl">
              Configure cloud providers, mapping engines, meteorological feeds, and the Python AI computer vision service.
              Keys are securely encrypted and kept on the backend.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadConfig}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-glow-sm hover:shadow-glow hover:brightness-110 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Save confirmation banner */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>System configurations saved successfully and hot-reloaded across services.</span>
            </div>
          </div>
        )}

        {/* Section 1: GIS Map Provider Settings */}
        <div className="bg-[#111C44]/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <Map className="w-6 h-6 text-[#00F2FE]" />
              <div>
                <h2 className="text-lg font-bold text-white">GIS & Base Map Provider</h2>
                <p className="text-xs text-slate-400">
                  Select which tile provider renders Andhra Pradesh roads and satellite terrain.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
              Zero-Key Fallback Active
            </span>
          </div>

          {/* Provider Selection Radio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* OpenStreetMap */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                config.defaultMapProvider === 'openstreetmap'
                  ? 'bg-slate-800/90 border-[#00F2FE] shadow-glow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-[#00F2FE]" />
                  <span>OpenStreetMap</span>
                </span>
                <input
                  type="radio"
                  name="defaultMapProvider"
                  value="openstreetmap"
                  checked={config.defaultMapProvider === 'openstreetmap'}
                  onChange={(e) => setConfig({ ...config, defaultMapProvider: e.target.value })}
                  className="accent-[#00F2FE]"
                />
              </div>
              <p className="text-xs text-slate-400 mb-2">
                100% Free worldwide standard tiles. No API key required, zero watermarks.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                RECOMMENDED & DEFAULT
              </span>
            </label>

            {/* Esri Satellite */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                config.defaultMapProvider === 'esri'
                  ? 'bg-slate-800/90 border-[#00F2FE] shadow-glow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Esri World Imagery</span>
                </span>
                <input
                  type="radio"
                  name="defaultMapProvider"
                  value="esri"
                  checked={config.defaultMapProvider === 'esri'}
                  onChange={(e) => setConfig({ ...config, defaultMapProvider: e.target.value })}
                  className="accent-[#00F2FE]"
                />
              </div>
              <p className="text-xs text-slate-400 mb-2">
                High-resolution satellite aerial imagery. Free public service, no tokens needed.
              </p>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
                SATELLITE VIEW
              </span>
            </label>

            {/* Mapbox */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                config.defaultMapProvider === 'mapbox'
                  ? 'bg-slate-800/90 border-[#00F2FE] shadow-glow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Mapbox GL</span>
                </span>
                <input
                  type="radio"
                  name="defaultMapProvider"
                  value="mapbox"
                  checked={config.defaultMapProvider === 'mapbox'}
                  onChange={(e) => setConfig({ ...config, defaultMapProvider: e.target.value })}
                  className="accent-[#00F2FE]"
                />
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Custom vector styles & dark navigation. Requires your Mapbox Access Token.
              </p>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800">
                TOKEN REQUIRED
              </span>
            </label>
          </div>

          {/* Mapbox Token Field */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                <span>Mapbox Access Token (pk.ey...)</span>
              </label>
              {getStatusBadge('mapbox')}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={maskedKeys.mapbox || 'pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOi...'}
                value={config.mapboxApiKey}
                onChange={(e) => setConfig({ ...config, mapboxApiKey: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00F2FE]"
              />
              <button
                type="button"
                onClick={() => handleValidate('mapbox')}
                disabled={validating.mapbox}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 whitespace-nowrap"
              >
                Test Token
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Where to obtain: Sign up at Mapbox and generate a Default Public Token.</span>
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[#00F2FE] hover:underline"
              >
                <span>account.mapbox.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {validationStates.mapbox?.message && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono ${
                  validationStates.mapbox.status === 'connected'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                }`}
              >
                {validationStates.mapbox.message}
              </div>
            )}
          </div>

          {/* MapTiler Key Field */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                <span>MapTiler Cloud API Key</span>
              </label>
              {getStatusBadge('maptiler')}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={maskedKeys.maptiler || 'Enter MapTiler key...'}
                value={config.mapTilerApiKey}
                onChange={(e) => setConfig({ ...config, mapTilerApiKey: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00F2FE]"
              />
              <button
                type="button"
                onClick={() => handleValidate('maptiler')}
                disabled={validating.maptiler}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 whitespace-nowrap"
              >
                Test Key
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Where to obtain: Create a free MapTiler Cloud account for 100k requests/mo.</span>
              <a
                href="https://cloud.maptiler.com/account/keys/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[#00F2FE] hover:underline"
              >
                <span>cloud.maptiler.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {validationStates.maptiler?.message && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono ${
                  validationStates.maptiler.status === 'connected'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                }`}
              >
                {validationStates.maptiler.message}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: AI Computer Vision & Microservice Settings */}
        <div className="bg-[#111C44]/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <Cpu className="w-6 h-6 text-[#00F2FE]" />
              <div>
                <h2 className="text-lg font-bold text-white">Python AI Computer Vision Service</h2>
                <p className="text-xs text-slate-400">
                  FastAPI service running YOLOv8 object detection, OpenCV contour analysis, and Scikit-learn NLP.
                </p>
              </div>
            </div>
            {getStatusBadge('pythonAi')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-200">AI Microservice Endpoint URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.aiServiceUrl}
                  onChange={(e) => setConfig({ ...config, aiServiceUrl: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00F2FE]"
                />
                <button
                  type="button"
                  onClick={() => handleValidate('pythonAi')}
                  disabled={validating.pythonAi}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 whitespace-nowrap"
                >
                  Ping Health
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Default: <code className="text-[#00F2FE]">http://127.0.0.1:8000</code> (FastAPI Uvicorn instance)
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-[#00F2FE]" />
                  <span>Real-Time Incident Stream Ingestion</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Continuously ingest frames from connected webcams and CCTV streams, generating automated incident alerts.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={config.realTimeDetectionEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, realTimeDetectionEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00F2FE]"></div>
              </label>
            </div>
          </div>

          {validationStates.pythonAi?.message && (
            <div
              className={`p-3 rounded-lg text-xs font-mono ${
                validationStates.pythonAi.status === 'connected'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800'
              }`}
            >
              <div>{validationStates.pythonAi.message}</div>
              {validationStates.pythonAi.services && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-300">
                  <div>• Detector: {validationStates.pythonAi.services.yolov8_detector}</div>
                  <div>• CV Engine: {validationStates.pythonAi.services.computer_vision}</div>
                  <div>• NLP: {validationStates.pythonAi.services.nlp_classification}</div>
                  <div>• Severity ML: {validationStates.pythonAi.services.severity_prediction}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Weather & Meteorological Services */}
        <div className="bg-[#111C44]/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <CloudRain className="w-6 h-6 text-sky-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Weather & Flood Forecasting API</h2>
                <p className="text-xs text-slate-400">
                  OpenWeatherMap integration used for road moisture and waterlogging predictive maintenance.
                </p>
              </div>
            </div>
            {getStatusBadge('weather')}
          </div>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">OpenWeatherMap API Key</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={maskedKeys.weather || 'Enter OpenWeatherMap API key...'}
                value={config.weatherApiKey}
                onChange={(e) => setConfig({ ...config, weatherApiKey: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00F2FE]"
              />
              <button
                type="button"
                onClick={() => handleValidate('weather')}
                disabled={validating.weather}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 whitespace-nowrap"
              >
                Test Key
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Where to obtain: Free tier provides 1,000 API calls per day.</span>
              <a
                href="https://home.openweathermap.org/api_keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[#00F2FE] hover:underline"
              >
                <span>openweathermap.org</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {validationStates.weather?.message && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono ${
                  validationStates.weather.status === 'connected'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                }`}
              >
                {validationStates.weather.message}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Generative AI & OpenAI Configuration */}
        <div className="bg-[#111C44]/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Large Language Model / Generative AI</h2>
                <p className="text-xs text-slate-400">
                  Optional external OpenAI integration for semantic citizen feedback analysis (local NLP engine active as fallback).
                </p>
              </div>
            </div>
            {getStatusBadge('openai')}
          </div>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">OpenAI API Key (sk-...)</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={maskedKeys.openai || 'sk-proj-...'}
                value={config.openaiApiKey}
                onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00F2FE]"
              />
              <button
                type="button"
                onClick={() => handleValidate('openai')}
                disabled={validating.openai}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 whitespace-nowrap"
              >
                Test Key
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Where to obtain: Create an API key in your OpenAI developer dashboard.</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[#00F2FE] hover:underline"
              >
                <span>platform.openai.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {validationStates.openai?.message && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono ${
                  validationStates.openai.status === 'connected'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                }`}
              >
                {validationStates.openai.message}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Bottom Save Action Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="text-xs text-slate-400">
            All API keys are verified with secure server-side proxy requests.
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 text-sm font-bold flex items-center space-x-2 shadow-glow-sm hover:shadow-glow hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;