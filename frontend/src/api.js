import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  });
  
  export const predictStrategy = (data) => api.post('/api/predict', data);