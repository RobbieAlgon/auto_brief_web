interface BriefingDisplayProps {
  briefing: {
    structured_briefing: {
      key_points: string[];
      action_items: string[];
      summary: string;
      sentiment: string;
      priority: string;
    };
  } | null;
}

export function BriefingDisplay({ briefing }: BriefingDisplayProps) {
  if (!briefing) return null;

  const { key_points, action_items, summary, sentiment, priority } = 
    typeof briefing.structured_briefing === 'string' 
      ? JSON.parse(briefing.structured_briefing)
      : briefing.structured_briefing;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p className="text-gray-700">{summary}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Key Points</h3>
          <ul className="list-disc pl-5 space-y-1">
            {key_points.map((point: string, index: number) => (
              <li key={index} className="text-gray-700">{point}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Action Items</h3>
          <ul className="list-disc pl-5 space-y-1">
            {action_items.map((item: string, index: number) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Sentiment</h3>
            <p className="text-gray-700">{sentiment}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Priority</h3>
            <p className="text-gray-700">{priority}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 