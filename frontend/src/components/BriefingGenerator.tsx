import { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { useAuth } from '../contexts/AuthContext';

// Definir a URL da API com base no ambiente
const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_PRODUCTION_API_URL 
  : import.meta.env.VITE_API_URL;

interface Briefing {
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
}

interface SavedBriefing {
  id: string;
  titulo: string;
  conteudo: Briefing;
  created_at: string;
}

export function BriefingGenerator() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [editedBriefing, setEditedBriefing] = useState<Briefing | null>(null);
  const [savedBriefings, setSavedBriefings] = useState<SavedBriefing[]>([]);
  const [loadingBriefings, setLoadingBriefings] = useState(true);

  useEffect(() => {
    if (user) {
      loadSavedBriefings();
    }
  }, [user]);

  const loadSavedBriefings = async () => {
    try {
      const response = await axios.get(`${API_URL}/briefings/${user?.id}`);
      setSavedBriefings(response.data);
    } catch (error) {
      console.error('Error loading briefings:', error);
      alert('Erro ao carregar briefings salvos');
    } finally {
      setLoadingBriefings(false);
    }
  };

  const generateBriefing = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/generate-briefing`, {
        conversation,
        user_id: user.id
      });
      setBriefing(response.data);
      setEditedBriefing(response.data);
    } catch (error) {
      console.error('Error generating briefing:', error);
      alert('Erro ao gerar briefing. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const saveBriefing = async () => {
    if (!user || !editedBriefing) return;
    
    try {
      const response = await axios.post(`${API_URL}/briefings`, {
        briefing: editedBriefing,
        user_id: user.id
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Add the new briefing to the list
      setSavedBriefings(prev => [response.data, ...prev]);
      alert('Briefing salvo com sucesso!');
    } catch (error) {
      console.error('Error saving briefing:', error);
      alert('Erro ao salvar briefing');
    }
  };

  const handleInputChange = (
    field: string,
    value: string | string[] | number | object
  ) => {
    if (!editedBriefing) return;
    
    setEditedBriefing({
      ...editedBriefing,
      [field]: value
    });
  };

  const exportToPDF = () => {
    if (!editedBriefing) return;

    const doc = new jsPDF();
    
    // Configurações iniciais
    const lineHeight = 7;
    let y = 20;
    
    // Título
    doc.setFontSize(20);
    doc.text('Briefing', 105, y, { align: 'center' });
    y += lineHeight * 2;
    
    // Reset font size for content
    doc.setFontSize(12);
    
    // Objetivo
    doc.setFont('helvetica', 'bold');
    doc.text('Objetivo:', 20, y);
    doc.setFont('helvetica', 'normal');
    const objetivoLines = doc.splitTextToSize(editedBriefing.objetivo, 170);
    doc.text(objetivoLines, 20, y + lineHeight);
    y += lineHeight * (objetivoLines.length + 2);
    
    // Público-alvo
    doc.setFont('helvetica', 'bold');
    doc.text('Público-alvo:', 20, y);
    doc.setFont('helvetica', 'normal');
    const publicoAlvoLines = doc.splitTextToSize(editedBriefing.publico_alvo, 170);
    doc.text(publicoAlvoLines, 20, y + lineHeight);
    y += lineHeight * (publicoAlvoLines.length + 2);
    
    // Referências
    doc.setFont('helvetica', 'bold');
    doc.text('Referências:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += lineHeight;
    editedBriefing.referencias.forEach(ref => {
      doc.text(`• ${ref}`, 25, y);
      y += lineHeight;
    });
    y += lineHeight;
    
    // Prazos
    doc.setFont('helvetica', 'bold');
    doc.text('Prazos:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += lineHeight;
    doc.text(`Início: ${editedBriefing.prazos.inicio}`, 25, y);
    y += lineHeight;
    doc.text(`Entrega: ${editedBriefing.prazos.entrega}`, 25, y);
    y += lineHeight;
    doc.text(`Etapas Intermediárias: ${editedBriefing.prazos.etapas_intermediarias}`, 25, y);
    y += lineHeight * 2;
    
    // Orçamento
    doc.setFont('helvetica', 'bold');
    doc.text('Orçamento:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += lineHeight;
    doc.text(`Total: R$ ${editedBriefing.orcamento.total.toFixed(2)}`, 25, y);
    y += lineHeight;
    doc.text(`Por Etapa: R$ ${editedBriefing.orcamento.por_etapa.toFixed(2)}`, 25, y);
    y += lineHeight * 2;
    
    // Observações
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += lineHeight;
    editedBriefing.observacoes.forEach(obs => {
      doc.text(`• ${obs}`, 25, y);
      y += lineHeight;
    });
    
    // Salvar o PDF
    doc.save('briefing.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <textarea
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
          placeholder="Cole aqui a conversa com o cliente..."
          className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <div className="flex space-x-4 mt-4">
          <button
            onClick={generateBriefing}
            disabled={loading || !conversation.trim()}
            className={`px-6 py-2 rounded-lg text-white font-medium
              ${loading || !conversation.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? 'Gerando briefing...' : 'Gerar Briefing'}
          </button>
          {editedBriefing && (
            <button
              onClick={saveBriefing}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Salvar Briefing
            </button>
          )}
        </div>
      </div>

      {editedBriefing && (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          <div>
            <h3 className="text-lg font-semibold mb-2">Objetivo</h3>
            <textarea
              value={editedBriefing.objetivo}
              onChange={(e) => handleInputChange('objetivo', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Público-alvo</h3>
            <textarea
              value={editedBriefing.publico_alvo}
              onChange={(e) => handleInputChange('publico_alvo', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Referências</h3>
            {editedBriefing.referencias.map((ref, index) => (
              <input
                key={index}
                type="text"
                value={ref}
                onChange={(e) => {
                  const newRefs = [...editedBriefing.referencias];
                  newRefs[index] = e.target.value;
                  handleInputChange('referencias', newRefs);
                }}
                className="w-full p-2 border rounded mb-2"
              />
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Prazos</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Data de Início</label>
                <input
                  type="text"
                  value={editedBriefing.prazos.inicio}
                  onChange={(e) => handleInputChange('prazos', {
                    ...editedBriefing.prazos,
                    inicio: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Data de Entrega</label>
                <input
                  type="text"
                  value={editedBriefing.prazos.entrega}
                  onChange={(e) => handleInputChange('prazos', {
                    ...editedBriefing.prazos,
                    entrega: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Etapas Intermediárias</label>
                <input
                  type="text"
                  value={editedBriefing.prazos.etapas_intermediarias}
                  onChange={(e) => handleInputChange('prazos', {
                    ...editedBriefing.prazos,
                    etapas_intermediarias: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Orçamento</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Total</label>
                <input
                  type="number"
                  value={editedBriefing.orcamento.total}
                  onChange={(e) => handleInputChange('orcamento', {
                    ...editedBriefing.orcamento,
                    total: parseFloat(e.target.value)
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Por Etapa</label>
                <input
                  type="number"
                  value={editedBriefing.orcamento.por_etapa}
                  onChange={(e) => handleInputChange('orcamento', {
                    ...editedBriefing.orcamento,
                    por_etapa: parseFloat(e.target.value)
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Observações</h3>
            {editedBriefing.observacoes.map((obs, index) => (
              <input
                key={index}
                type="text"
                value={obs}
                onChange={(e) => {
                  const newObs = [...editedBriefing.observacoes];
                  newObs[index] = e.target.value;
                  handleInputChange('observacoes', newObs);
                }}
                className="w-full p-2 border rounded mb-2"
              />
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={exportToPDF}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Baixar PDF
            </button>
          </div>
        </div>
      )}

      {loadingBriefings ? (
        <div className="text-center mt-8">Carregando briefings salvos...</div>
      ) : savedBriefings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Briefings Salvos</h2>
          <div className="space-y-4">
            {savedBriefings.map((briefing) => (
              <div
                key={briefing.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold">{briefing.titulo}</h3>
                <p className="text-sm text-gray-500">
                  Criado em: {new Date(briefing.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => {
                    setEditedBriefing(briefing.conteudo);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 