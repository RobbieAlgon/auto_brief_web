import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateBriefing = async (conversation: string) => {
  try {
    const response = await api.post('/generate-briefing', { conversation });
    return response.data;
  } catch (error) {
    console.error('Error generating briefing:', error);
    throw error;
  }
};

export default api; 