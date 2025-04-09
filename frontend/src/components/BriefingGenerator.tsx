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
      const briefing = await generateBriefing(conversation);
      await createBriefing(briefing);
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
    <div className="space-y-4">
      <Textarea
        placeholder="Enter your conversation here..."
        value={conversation}
        onChange={(e) => setConversation(e.target.value)}
        className="min-h-[200px]"
      />
      <Button
        onClick={handleGenerate}
        disabled={loading || !conversation.trim()}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Briefing'}
      </Button>
    </div>
  );
} 