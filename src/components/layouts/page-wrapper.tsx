import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  paddingTop?: string;
  paddingX?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className = '',
  paddingTop = '', // 80px để tránh navbar fixed
  paddingX = ''
}) => {
  return (
    <div className={`min-h-screen ${paddingTop} ${paddingX} ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
