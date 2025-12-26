import React from 'react';

interface LoadingProps {
    className?: string;
    size?: number | string;
}

export const Loading: React.FC<LoadingProps> = ({ className = "", size = 40 }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src="/loading.svg"
                alt="Loading..."
                style={{ width: size, height: size }}
                className="animate-in fade-in duration-300"
            />
        </div>
    );
};

export default Loading;
