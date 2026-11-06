import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main_system_config',
      unique: true,
    },
    // Map Providers
    defaultMapProvider: {
      type: String,
      enum: ['openstreetmap', 'mapbox', 'maptiler', 'esri', 'carto'],
      default: 'openstreetmap',
    },
    mapboxApiKey: {
      type: String,
      default: '',
    },
    mapTilerApiKey: {
      type: String,
      default: '',
    },
    googleMapsApiKey: {
      type: String,
      default: '',
    },
    // Weather API
    weatherApiKey: {
      type: String,
      default: '',
    },
    // OpenAI API
    openaiApiKey: {
      type: String,
      default: '',
    },
    // Python AI Microservice
    aiServiceUrl: {
      type: String,
      default: 'http://127.0.0.1:8000',
    },
    // System Features
    realTimeDetectionEnabled: {
      type: Boolean,
      default: true,
    },
    detectionIntervalMs: {
      type: Number,
      default: 2000,
    },
    // Service validation cache
    serviceStatus: {
      mapbox: { status: { type: String, default: 'not_configured' }, checkedAt: Date, latencyMs: Number, error: String },
      maptiler: { status: { type: String, default: 'not_configured' }, checkedAt: Date, latencyMs: Number, error: String },
      weather: { status: { type: String, default: 'not_configured' }, checkedAt: Date, latencyMs: Number, error: String },
      openai: { status: { type: String, default: 'not_configured' }, checkedAt: Date, latencyMs: Number, error: String },
      pythonAi: { status: { type: String, default: 'connected' }, checkedAt: Date, latencyMs: Number, error: String },
    },
  },
  {
    timestamps: true,
  }
);

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
export default SystemConfig;
