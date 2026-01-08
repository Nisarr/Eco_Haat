'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export function Card({ children, className = '', hover = false, glass = false }: CardProps) {
    const baseStyles = 'rounded-2xl overflow-hidden';
    const hoverStyles = hover ? 'card-hover cursor-pointer' : '';
    const glassStyles = glass
        ? 'glass'
        : 'bg-white border border-gray-100 shadow-sm';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${baseStyles} ${hoverStyles} ${glassStyles} ${className}`}
        >
            {children}
        </motion.div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50 ${className}`}>
            {children}
        </div>
    );
}
