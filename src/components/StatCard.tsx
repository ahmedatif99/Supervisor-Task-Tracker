import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) => {
  const variants = {
    default: 'bg-card border border-border',
    primary: 'gradient-primary text-primary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
  };

  return (
    <div className={cn('stat-card', variants[variant], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium",
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              variant === 'default' 
                ? trend.positive ? 'text-success' : 'text-destructive'
                : 'opacity-80'
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          variant === 'default' ? 'bg-accent' : 'bg-white/20'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};
