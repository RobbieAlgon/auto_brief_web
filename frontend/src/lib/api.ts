const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_PRODUCTION_API_URL 
  : import.meta.env.VITE_API_URL;

export const generateBriefing = async (conversation: string) => {
  try {
    const response = await fetch(`${API_URL}/generate-briefing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate briefing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating briefing:', error);
    throw error;
  }
}; 