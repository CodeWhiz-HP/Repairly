import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "font-display font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-electricAqua text-deepCarbon hover:bg-[#80FFF9] shadow-[0_0_15px_rgba(38,255,242,0.3)]",
    secondary: "bg-gunmetal text-electricAqua border border-electricAqua/20 hover:border-electricAqua/50 hover:bg-slateSteel",
    outline: "bg-transparent border border-slateSteel text-softGray hover:border-softGray hover:text-white",
    danger: "bg-errorRed/10 text-errorRed border border-errorRed/20 hover:bg-errorRed/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};