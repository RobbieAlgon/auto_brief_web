import { supabase } from './supabase';

// Definir a URL da API com base no ambiente
const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_PRODUCTION_API_URL 
  : import.meta.env.VITE_API_URL;

export async function generateBriefing(conversation: string) {
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
}

export async function getBriefings(userId: string) {
  try {
    const { data, error } = await supabase
      .from('briefings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching briefings:', error);
    throw error;
  }
}

export async function saveBriefing(briefing: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('briefings')
      .insert([
        {
          user_id: userId,
          title: 'Novo Briefing',
          content: JSON.stringify(briefing),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving briefing:', error);
    throw error;
  }
} 