'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, type = 'button', onClick }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-eco hover:shadow-eco-lg',
            secondary: 'bg-white text-primary-700 border-2 border-primary-500 hover:bg-primary-50 focus:ring-primary-500',
            ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
            danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-5 py-2.5 text-base',
            lg: 'px-8 py-3 text-lg',
        };

        return (
            <motion.button
                ref={ref}
                type={type}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={disabled || isLoading}
                onClick={onClick}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                    </>
                ) : children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
