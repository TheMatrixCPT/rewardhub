
interface PrizeProgressProps {
  current: number;
  required: number;
}

export const PrizeProgress = ({ current, required }: PrizeProgressProps) => {
  const percentage = Math.min((current / required) * 100, 100);

  return (
    <div className="w-full bg-secondary h-2 rounded-full mt-1">
      <div
        className="bg-primary h-2 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
