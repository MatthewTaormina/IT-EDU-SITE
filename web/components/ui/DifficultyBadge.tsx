const difficultyStyles: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800',
  'Beginner to Intermediate': 'bg-teal-100 text-teal-800',
};

export default function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles = difficultyStyles[difficulty] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${styles}`}>
      {difficulty}
    </span>
  );
}
