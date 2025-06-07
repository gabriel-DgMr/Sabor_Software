import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/auth/index.jsx';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            setShowLogin(true);
        }
    }, [loading, isAuthenticated]);

    const handleClose = () => {
        if (isAuthenticated) {
            setShowLogin(false);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        return (
            <>
                <AuthPage isOpen={showLogin} onClose={handleClose} canClose={isAuthenticated} />
                {children}
            </>
        );
    }

    return children;
};

export default ProtectedRoute; 