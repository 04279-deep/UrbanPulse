import SystemConfig from '../models/SystemConfig.js';
import axios from 'axios';

// Helper to mask secret API keys for safe frontend display
const maskKey = (key) => {
  if (!key || key.length < 8) return '';
  return `${key.slice(0, 5)}...${key.slice(-4)}`;
};

// @desc    Get current system API configurations & providers
// @route   GET /api/config/settings
export const getConfig = async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne({ key: 'main_system_config' });

    if (!config) {
      config = await SystemConfig.create({
        key: 'main_system_config',
        mapboxApiKey: process.env.MAPBOX_API_KEY || '',
        mapTilerApiKey: process.env.MAPTILER_API_KEY || '',
        weatherApiKey: process.env.OPENWEATHER_API_KEY || '',
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
        aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
        defaultMapProvider: 'openstreetmap',
      });
    }

    res.json({
      success: true,
      config: {
        defaultMapProvider: config.defaultMapProvider,
        mapboxConfigured: !!(config.mapboxApiKey || process.env.MAPBOX_API_KEY),
        mapboxMasked: maskKey(config.mapboxApiKey || process.env.MAPBOX_API_KEY),
        mapTilerConfigured: !!(config.mapTilerApiKey || process.env.MAPTILER_API_KEY),
        mapTilerMasked: maskKey(config.mapTilerApiKey || process.env.MAPTILER_API_KEY),
        weatherConfigured: !!(config.weatherApiKey || process.env.OPENWEATHER_API_KEY),
        weatherMasked: maskKey(config.weatherApiKey || process.env.OPENWEATHER_API_KEY),
        openaiConfigured: !!(config.openaiApiKey || process.env.OPENAI_API_KEY),
        openaiMasked: maskKey(config.openaiApiKey || process.env.OPENAI_API_KEY),
        googleMapsConfigured: !!(config.googleMapsApiKey || process.env.GOOGLE_MAPS_API_KEY),
        googleMapsMasked: maskKey(config.googleMapsApiKey || process.env.GOOGLE_MAPS_API_KEY),
        aiServiceUrl: config.aiServiceUrl || 'http://127.0.0.1:8000',
        realTimeDetectionEnabled: config.realTimeDetectionEnabled,
        serviceStatus: config.serviceStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system API keys & map configuration
// @route   PUT /api/config/settings
export const updateConfig = async (req, res, next) => {
  try {
    const {
      defaultMapProvider,
      mapboxApiKey,
      mapTilerApiKey,
      weatherApiKey,
      openaiApiKey,
      googleMapsApiKey,
      aiServiceUrl,
      realTimeDetectionEnabled,
    } = req.body;

    let config = await SystemConfig.findOne({ key: 'main_system_config' });
    if (!config) {
      config = new SystemConfig({ key: 'main_system_config' });
    }

    if (defaultMapProvider) config.defaultMapProvider = defaultMapProvider;
    if (mapboxApiKey !== undefined && !mapboxApiKey.includes('...')) config.mapboxApiKey = mapboxApiKey;
    if (mapTilerApiKey !== undefined && !mapTilerApiKey.includes('...')) config.mapTilerApiKey = mapTilerApiKey;
    if (weatherApiKey !== undefined && !weatherApiKey.includes('...')) config.weatherApiKey = weatherApiKey;
    if (openaiApiKey !== undefined && !openaiApiKey.includes('...')) config.openaiApiKey = openaiApiKey;
    if (googleMapsApiKey !== undefined && !googleMapsApiKey.includes('...')) config.googleMapsApiKey = googleMapsApiKey;
    if (aiServiceUrl) config.aiServiceUrl = aiServiceUrl;
    if (realTimeDetectionEnabled !== undefined) config.realTimeDetectionEnabled = realTimeDetectionEnabled;

    await config.save();

    res.json({
      success: true,
      message: 'System configuration updated successfully',
      config: {
        defaultMapProvider: config.defaultMapProvider,
        mapboxConfigured: !!config.mapboxApiKey,
        mapboxMasked: maskKey(config.mapboxApiKey),
        mapTilerConfigured: !!config.mapTilerApiKey,
        mapTilerMasked: maskKey(config.mapTilerApiKey),
        weatherConfigured: !!config.weatherApiKey,
        weatherMasked: maskKey(config.weatherApiKey),
        openaiConfigured: !!config.openaiApiKey,
        openaiMasked: maskKey(config.openaiApiKey),
        aiServiceUrl: config.aiServiceUrl,
        realTimeDetectionEnabled: config.realTimeDetectionEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Live validate an API key integration
// @route   POST /api/config/validate/:service
export const validateService = async (req, res, next) => {
  const { service } = req.params;
  const config = await SystemConfig.findOne({ key: 'main_system_config' });

  const start = Date.now();
  let status = 'failed';
  let latencyMs = 0;
  let message = '';

  try {
    if (service === 'mapbox') {
      const key = req.body.key || config?.mapboxApiKey || process.env.MAPBOX_API_KEY;
      if (!key) {
        return res.json({ status: 'not_configured', message: 'Mapbox Access Token is not configured' });
      }
      // Test reverse geocode
      const r = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/Vijayawada.json?access_token=${key}`,
        { timeout: 5000 }
      );
      if (r.status === 200) {
        status = 'connected';
        message = 'Mapbox API Token verified and operational';
      }
    } else if (service === 'maptiler') {
      const key = req.body.key || config?.mapTilerApiKey || process.env.MAPTILER_API_KEY;
      if (!key) {
        return res.json({ status: 'not_configured', message: 'MapTiler API Key is not configured' });
      }
      const r = await axios.get(
        `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`,
        { timeout: 5000 }
      );
      if (r.status === 200) {
        status = 'connected';
        message = 'MapTiler API Key verified and operational';
      }
    } else if (service === 'weather') {
      const key = req.body.key || config?.weatherApiKey || process.env.OPENWEATHER_API_KEY;
      if (!key) {
        return res.json({ status: 'not_configured', message: 'OpenWeather API Key is not configured' });
      }
      const r = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Vijayawada,IN&appid=${key}`,
        { timeout: 5000 }
      );
      if (r.status === 200) {
        status = 'connected';
        message = `OpenWeather API verified (Vijayawada Temp: ${Math.round(r.data.main.temp - 273.15)}°C)`;
      }
    } else if (service === 'openai') {
      const key = req.body.key || config?.openaiApiKey || process.env.OPENAI_API_KEY;
      if (!key) {
        return res.json({ status: 'not_configured', message: 'OpenAI API Key is not configured' });
      }
      const r = await axios.get('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
        timeout: 5000,
      });
      if (r.status === 200) {
        status = 'connected';
        message = 'OpenAI API connection active (GPT-4 / Vision models accessible)';
      }
    } else if (service === 'pythonAi') {
      const url = req.body.url || config?.aiServiceUrl || 'http://127.0.0.1:8000';
      const r = await axios.get(`${url}/health`, { timeout: 3000 });
      if (r.status === 200) {
        status = 'connected';
        message = `FastAPI AI Microservice active (${r.data.services?.computer_vision || 'YOLOv8 + OpenCV'})`;
      }
    } else {
      return res.status(400).json({ success: false, message: 'Unknown service identifier' });
    }

    latencyMs = Date.now() - start;

    // Cache status in config
    if (config) {
      config.serviceStatus = config.serviceStatus || {};
      config.serviceStatus[service] = {
        status,
        checkedAt: new Date(),
        latencyMs,
        error: '',
      };
      await config.save();
    }

    res.json({
      success: true,
      service,
      status,
      latencyMs,
      message,
    });
  } catch (err) {
    latencyMs = Date.now() - start;
    const errorMsg = err.response?.data?.message || err.message || 'Connection failed';

    if (config) {
      config.serviceStatus = config.serviceStatus || {};
      config.serviceStatus[service] = {
        status: 'failed',
        checkedAt: new Date(),
        latencyMs,
        error: errorMsg,
      };
      await config.save();
    }

    res.json({
      success: false,
      service,
      status: 'failed',
      latencyMs,
      message: `Verification failed: ${errorMsg}`,
    });
  }
};
