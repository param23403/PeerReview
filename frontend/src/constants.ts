export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8888/api'
  : '/.netlify/functions/api';
