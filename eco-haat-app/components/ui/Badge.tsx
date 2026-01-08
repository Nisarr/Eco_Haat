'use client';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'eco';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}: BadgeProps) {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        eco: 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-300',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span className={`
      inline-flex items-center font-medium rounded-full
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
            {children}
        </span>
    );
}

// Status-specific badges
export function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
    const configs = {
        pending: { variant: 'warning' as const, icon: '⏳', label: 'Pending' },
        approved: { variant: 'success' as const, icon: '✅', label: 'Approved' },
        rejected: { variant: 'danger' as const, icon: '❌', label: 'Rejected' },
    };

    const config = configs[status];

    return (
        <Badge variant={config.variant}>
            <span className="mr-1">{config.icon}</span>
            {config.label}
        </Badge>
    );
}

// Eco rating display
export function EcoRating({ score }: { score: number }) {
    const getColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-lime-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-orange-600';
    };

    const getEmoji = (score: number) => {
        if (score >= 80) return '🌿';
        if (score >= 60) return '🌱';
        if (score >= 40) return '🍃';
        return '🌾';
    };

    return (
        <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${getColor(score)}`}>
                <span>{getEmoji(score)}</span>
                <span className="font-bold text-lg">{score}%</span>
            </div>
            <span className="text-xs text-gray-500">Eco Score</span>
        </div>
    );
}
