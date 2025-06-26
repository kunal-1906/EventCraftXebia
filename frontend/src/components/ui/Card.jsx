import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl border transition-all duration-200';
  
  const variants = {
    default: 'border-secondary-200 shadow-sm',
    elevated: 'border-secondary-200 shadow-lg',
    outlined: 'border-2 border-secondary-300 shadow-none',
    glass: 'backdrop-blur-md bg-white/70 border-white/20 shadow-lg',
    gradient: 'bg-gradient-to-br from-white to-secondary-50 border-secondary-200 shadow-lg',
  };
  
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const hoverEffects = hoverable ? 'hover:shadow-xl hover:-translate-y-1 transform' : '';
  const clickableEffects = clickable ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 transform active:scale-[0.98]' : '';
  
  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${paddings[padding]}
    ${hoverEffects}
    ${clickableEffects}
    ${className}
  `.trim();

  const CardComponent = clickable ? motion.div : 'div';
  const motionProps = clickable ? {
    whileHover: { scale: 1.02, y: -4 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  } : {};

  return (
    <CardComponent
      className={classes}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Card sub-components
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`border-b border-secondary-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`border-t border-secondary-200 pt-4 mt-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-secondary-900 ${className}`} {...props}>
    {children}
  </h3>
);

Card.Description = ({ children, className = '', ...props }) => (
  <p className={`text-secondary-600 ${className}`} {...props}>
    {children}
  </p>
);

export default Card;
