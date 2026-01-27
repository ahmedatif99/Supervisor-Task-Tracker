import { cn } from '@/lib/utils';

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
    showValue?: boolean;
}

export const CircularProgress = ({
    value,
    size = 40,
    strokeWidth = 4,
    className,
    showValue = true,
}: CircularProgressProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={value >= 90 ? 'currentColor' : value >= 75 ? 'orange' : value >= 50 ? 'yellow' : 'red'}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-500 ease-out"
                />
            </svg>
            {showValue && (
                <span className="absolute text-sm font-semibold text-foreground">
                    {Math.round(value)}%
                </span>
            )}
        </div>
    );
};