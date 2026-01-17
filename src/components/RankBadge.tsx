import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RankBadge = ({ rank, size = 'md' }: RankBadgeProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const getVariant = () => {
    switch (rank) {
      case 1:
        return 'rank-badge-gold';
      case 2:
        return 'rank-badge-silver';
      case 3:
        return 'rank-badge-bronze';
      default:
        return 'rank-badge-default';
    }
  };

  return (
    <div className={cn('rank-badge', sizeClasses[size], getVariant())}>
      {rank <= 3 ? (
        <Trophy className={cn(
          size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
        )} />
      ) : (
        rank
      )}
    </div>
  );
};
