const difficultyStyles: Record<string, string> = {
  Beginner:                 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Intermediate:             'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Advanced:                 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Beginner to Intermediate': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
};

export default function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles = difficultyStyles[difficulty] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  return (
    <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${styles}`}>
      {difficulty}
    </span>
  );
}
