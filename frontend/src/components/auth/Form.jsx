import React from 'react';

const Form = ({ 
  onSubmit, 
  children, 
  className = '', 
  title,
  subtitle,
  error,
  ...rest 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {title}
        </h2>
      )}
      
      {subtitle && (
        <p className="text-sm text-gray-600 mb-6 text-center">
          {subtitle}
        </p>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className={`${className}`}
        {...rest}
      >
        {children}
      </form>
    </div>
  );
};

export default Form; 