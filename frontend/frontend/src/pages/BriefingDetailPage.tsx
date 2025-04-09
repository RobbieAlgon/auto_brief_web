import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Briefing {
  id: string;
  created_at: string;
  titulo: string;
  conteudo: {
    objetivo: string;
    publico_alvo: string;
    referencias: string[];
    prazos: {
      inicio: string;
      entrega: string;
      etapas_intermediarias: string;
    };
    orcamento: {
      total: number;
      por_etapa: number;
    };
    observacoes: string[];
  };
}

export default function BriefingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBriefing = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('briefings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (isMounted && data) {
          console.log('Briefing data:', data); // Para debug
          setBriefing(data);
        } else if (isMounted) {
          setError('Briefing não encontrado');
        }
      } catch (error) {
        console.error('Error fetching briefing:', error);
        if (isMounted) {
          setError('Erro ao carregar o briefing');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBriefing();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    if (!window.confirm('Tem certeza que deseja excluir este briefing?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('briefings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      navigate('/briefings');
    } catch (error) {
      console.error('Error deleting briefing:', error);
      setError('Erro ao deletar o briefing');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl">Carregando briefing...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-xl text-red-500 mb-4">{error}</div>
          <button
            onClick={() => navigate('/briefings')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Voltar para a lista
          </button>
        </div>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-xl text-gray-600 mb-4">Briefing não encontrado</div>
          <button
            onClick={() => navigate('/briefings')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Voltar para a lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{briefing.titulo}</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/briefings')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Voltar
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Excluir
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 mb-6">
            Criado em {new Date(briefing.created_at).toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">Objetivo</h2>
              <p className="text-gray-700">{briefing.conteudo.objetivo}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Público-alvo</h2>
              <p className="text-gray-700">{briefing.conteudo.publico_alvo}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Referências</h2>
              <ul className="list-disc list-inside text-gray-700">
                {briefing.conteudo.referencias.map((ref, index) => (
                  <li key={index}>{ref}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Prazos</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Início:</strong> {briefing.conteudo.prazos.inicio}</p>
                <p><strong>Entrega:</strong> {briefing.conteudo.prazos.entrega}</p>
                <p><strong>Etapas Intermediárias:</strong> {briefing.conteudo.prazos.etapas_intermediarias}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Orçamento</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Total:</strong> R$ {briefing.conteudo.orcamento.total.toFixed(2)}</p>
                <p><strong>Por Etapa:</strong> R$ {briefing.conteudo.orcamento.por_etapa.toFixed(2)}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Observações</h2>
              <ul className="list-disc list-inside text-gray-700">
                {briefing.conteudo.observacoes.map((obs, index) => (
                  <li key={index}>{obs}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 