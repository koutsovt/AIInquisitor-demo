import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'relative flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden shadow-md hover:shadow-lg active:scale-98 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-300% hover:bg-right
      text-white 
      disabled:from-slate-400 disabled:to-slate-500
      animate-gradient
    `,
    secondary: `
      bg-gradient-to-r from-blue-900 via-slate-900 to-blue-800 bg-300% hover:bg-right
      text-white 
      disabled:from-slate-400 disabled:to-slate-500
      animate-gradient
    `,
    outline: `
      bg-white/10 backdrop-blur-sm
      border-2 border-white/20
      text-white
      hover:bg-white/20
      disabled:opacity-50 disabled:hover:bg-white/10
    `
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;