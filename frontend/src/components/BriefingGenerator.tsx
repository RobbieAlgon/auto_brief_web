import { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { generateBriefing } from '../lib/api';
import { useBriefings } from '../contexts/BriefingContext';

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
  const { createBriefing } = useBriefings();

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

  const handleGenerate = async () => {
    if (!conversation.trim()) return;

    setLoading(true);
    try {
      const generatedBriefing = await generateBriefing(conversation);
      setBriefing(generatedBriefing);
      setEditedBriefing(generatedBriefing);
      await createBriefing('Novo Briefing', JSON.stringify(generatedBriefing));
      setConversation('');
    } catch (error) {
      console.error('Error generating briefing:', error);
      alert('Failed to generate briefing. Please try again.');
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
    <div className="space-y-8">
      <div className="space-y-4">
        <Textarea
          placeholder="Digite sua conversa aqui..."
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
          className="min-h-[200px]"
        />
        <Button
          onClick={handleGenerate}
          disabled={loading || !conversation.trim()}
          className="w-full"
        >
          {loading ? 'Gerando...' : 'Gerar Briefing'}
        </Button>
      </div>

      {editedBriefing && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Briefing Gerado</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Objetivo</label>
              <Textarea
                value={editedBriefing.objetivo}
                onChange={(e) => handleInputChange('objetivo', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Público-alvo</label>
              <Textarea
                value={editedBriefing.publico_alvo}
                onChange={(e) => handleInputChange('publico_alvo', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Referências</label>
              <Textarea
                value={editedBriefing.referencias.join('\n')}
                onChange={(e) => handleInputChange('referencias', e.target.value.split('\n'))}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data de Início</label>
                <input
                  type="date"
                  value={editedBriefing.prazos.inicio}
                  onChange={(e) => handleInputChange('prazos', { ...editedBriefing.prazos, inicio: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de Entrega</label>
                <input
                  type="date"
                  value={editedBriefing.prazos.entrega}
                  onChange={(e) => handleInputChange('prazos', { ...editedBriefing.prazos, entrega: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Etapas Intermediárias</label>
                <input
                  type="text"
                  value={editedBriefing.prazos.etapas_intermediarias}
                  onChange={(e) => handleInputChange('prazos', { ...editedBriefing.prazos, etapas_intermediarias: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Orçamento Total</label>
                <input
                  type="number"
                  value={editedBriefing.orcamento.total}
                  onChange={(e) => handleInputChange('orcamento', { ...editedBriefing.orcamento, total: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Orçamento por Etapa</label>
                <input
                  type="number"
                  value={editedBriefing.orcamento.por_etapa}
                  onChange={(e) => handleInputChange('orcamento', { ...editedBriefing.orcamento, por_etapa: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <Textarea
                value={editedBriefing.observacoes.join('\n')}
                onChange={(e) => handleInputChange('observacoes', e.target.value.split('\n'))}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={saveBriefing} className="flex-1">
              Salvar Briefing
            </Button>
            <Button onClick={exportToPDF} className="flex-1">
              Exportar PDF
            </Button>
          </div>
        </div>
      )}

      {savedBriefings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Briefings Salvos</h2>
          <div className="grid gap-4">
            {savedBriefings.map((savedBriefing) => (
              <div key={savedBriefing.id} className="p-4 border rounded-lg">
                <h3 className="font-bold">{savedBriefing.titulo}</h3>
                <p className="text-sm text-gray-500">
                  Criado em: {new Date(savedBriefing.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 