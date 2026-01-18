import React from 'react';
import { Navigate } from 'react-router-dom';

const FindPartnerPage: React.FC = () => {
    // Redirect to swipe page as that seems to be the main matching interface
    // based on the sidebar configuration
    return <Navigate to="/matching/swipe" replace />;
};

export default FindPartnerPage;
