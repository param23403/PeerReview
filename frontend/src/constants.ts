export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8888/.netlify/functions/api'
  : '/.netlify/functions/api';
