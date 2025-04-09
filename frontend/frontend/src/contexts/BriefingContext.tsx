import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Briefing {
  id: string;
  created_at: string;
  title: string;
  content: string;
}

interface BriefingContextType {
  briefings: Briefing[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  createBriefing: (title: string, content: string) => Promise<void>;
  deleteBriefing: (id: string) => Promise<void>;
}

const BriefingContext = createContext<BriefingContextType | undefined>(undefined);

export function BriefingProvider({ children }: { children: ReactNode }) {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 6;

  const fetchBriefings = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      
      const { data, error, count } = await supabase
        .from('briefings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * itemsPerPage, pageNum * itemsPerPage - 1);

      if (error) throw error;
      
      if (data) {
        if (pageNum === 1) {
          setBriefings(data);
        } else {
          setBriefings(prev => [...prev, ...data]);
        }
        setHasMore(data.length === itemsPerPage);
      }
    } catch (error) {
      console.error('Error fetching briefings:', error);
      setError('Erro ao carregar briefings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefings(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBriefings(nextPage);
    }
  };

  const createBriefing = async (title: string, content: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('briefings')
        .insert([{ title, content }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setBriefings(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error creating briefing:', error);
      setError('Erro ao criar briefing');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBriefing = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('briefings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBriefings(prev => prev.filter(briefing => briefing.id !== id));
    } catch (error) {
      console.error('Error deleting briefing:', error);
      setError('Erro ao deletar briefing');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    briefings,
    loading,
    error,
    hasMore,
    loadMore,
    createBriefing,
    deleteBriefing,
  };

  return (
    <BriefingContext.Provider value={value}>
      {children}
    </BriefingContext.Provider>
  );
}

export function useBriefings() {
  const context = useContext(BriefingContext);
  if (context === undefined) {
    throw new Error('useBriefings must be used within a BriefingProvider');
  }
  return context;
} 