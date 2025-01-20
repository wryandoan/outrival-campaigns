import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

export function Button({ 
  children, 
  variant = 'primary', 
  icon: Icon,
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = "flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium transition-colors";
  
  const variants = {
    primary: "text-dark-600 bg-dark-100 hover:bg-dark-200 dark:bg-dark-100 dark:hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-dark-200 dark:focus:ring-offset-dark-50",
    secondary: "text-dark-600 bg-dark-100 hover:bg-dark-200 dark:bg-dark-100 dark:hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-dark-200 dark:focus:ring-offset-dark-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
}