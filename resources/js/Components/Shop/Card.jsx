import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg p-5 shadow-soft ${className}`}>
      {children}
    </div>
  );
};

export default Card;