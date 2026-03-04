import { ScoreBreakdown } from '../types';

interface Props {
  score: ScoreBreakdown;
}

const criteria: { key: keyof ScoreBreakdown['criteria']; label: string }[] = [
  { key: 'architecture', label: 'Architecture' },
  { key: 'innovation', label: 'Innovation' },
  { key: 'technical', label: 'Technical' },
  { key: 'presentation', label: 'Presentation' },
];

export default function ScoreCard({ score }: Props) {
  const c = score.criteria;
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Round {score.round}</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
          {score.subtotal} pts
        </span>
      </div>
      <div className="space-y-2">
        {criteria.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3 text-sm">
            <span className="w-36 text-gray-500 shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((c[key] / 25) * 100, 100)}%` }}
              />
            </div>
            <span className="w-8 text-right font-medium text-gray-700">{c[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
