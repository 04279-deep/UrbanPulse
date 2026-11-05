import axios from 'axios';

// Change to your host machine's IP (e.g. http://192.168.1.100:5000) for testing on physical phone, or 10.0.2.2 for Android emulator
export const API_BASE_URL = 'http://10.0.2.2:5000/api';

const mobileApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getComplaints = async () => {
  return await mobileApi.get('/complaints');
};

export const getComplaintById = async (id) => {
  return await mobileApi.get(`/complaints/${id}`);
};

export const submitComplaint = async (formData) => {
  return await mobileApi.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAnalyticsSummary = async () => {
  return await mobileApi.get('/analytics/dashboard');
};

export default mobileApi;
