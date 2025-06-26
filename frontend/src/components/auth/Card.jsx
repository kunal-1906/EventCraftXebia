import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title,
  subtitle,
  footer,
  ...rest 
}) => {
  return (
    <div 
      className={`w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      {...rest}
    >
      {title && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 