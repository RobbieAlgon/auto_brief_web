import { useState } from 'react';
import { generateBriefing } from '../lib/api';

interface TextInputProps {
  onBriefingGenerated: (briefing: any) => void;
}

export function TextInput({ onBriefingGenerated }: TextInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const briefing = await generateBriefing(text.trim());
      onBriefingGenerated(briefing);
      setText('');
    } catch (error) {
      console.error('Error generating briefing:', error);
      alert('Failed to generate briefing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium
            ${loading || !text.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? 'Generating...' : 'Generate Briefing'}
        </button>
      </form>
    </div>
  );
} 