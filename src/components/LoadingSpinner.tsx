import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
}

export const LoadingSpinner = ({ size = "md", className, text }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
            <div className="relative">
                {/* Outer ring */}
                <div
                    className={cn(
                        "rounded-full border-4 border-muted animate-pulse",
                        sizeClasses[size]
                    )}
                />
                {/* Spinning gradient ring */}
                <div
                    className={cn(
                        "absolute inset-0 rounded-full border-4 border-transparent animate-spin",
                        sizeClasses[size]
                    )}
                    style={{
                        borderTopColor: "hsl(var(--primary))",
                        borderRightColor: "hsl(var(--primary) / 0.3)",
                        animationDuration: "0.8s",
                    }}
                />
                {/* Inner glow dot */}
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center",
                    )}
                >
                    <div
                        className={cn(
                            "rounded-full bg-primary animate-pulse shadow-glow",
                            size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2.5 h-2.5" : "w-4 h-4"
                        )}
                    />
                </div>
            </div>
            {text && (
                <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
            )}
        </div>
    );
};

export const PageLoader = ({ text }: { text?: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text={text} />
    </div>
);

export const CardLoader = () => (
    <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="md" />
    </div>
);