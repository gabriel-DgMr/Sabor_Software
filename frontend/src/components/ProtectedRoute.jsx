import PropTypes from 'prop-types';
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
                <AuthPage canClose={isAuthenticated} isOpen={showLogin} onClose={handleClose} />
                {children}
            </>
        );
    }

    return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute; 