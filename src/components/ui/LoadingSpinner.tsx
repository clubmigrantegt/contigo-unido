import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    className?: string;
}

export const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className={cn("h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent", className)} />
        </div>
    );
};
