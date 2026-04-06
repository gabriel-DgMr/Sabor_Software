import React from 'react';
import PropTypes from 'prop-types';
import { useAuthPage } from '../hooks/useAuthPage';
import { useLogin } from '../hooks/useLogin';
import { useRegister } from '../hooks/useRegister';
import AuthLayout from '../components/AuthLayout';
import LoginUI from '../components/LoginUI';
import RegisterUI from '../components/RegisterUI';
import EmailVerification from './EmailVerification';
import ForgotPassword from './ForgotPassword';

const AuthPage = ({ isOpen, onClose }) => {
  const authPageData = useAuthPage({ isOpen, onClose });
  const loginData = useLogin({ onLoginSuccess: authPageData.handleLoginSuccess });
  const registerData = useRegister({
    onRegisterSuccess: () => {
      const email = localStorage.getItem('pendingVerificationEmail') || '';
      authPageData.setPendingVerificationEmail(email);
      authPageData.setView(email ? 'verify-email' : 'login');
    },
  });

  const renderContent = () => {
    switch (authPageData.view) {
      case 'login':
        return (
          <LoginUI
            {...loginData}
            onShowForgotPassword={() => authPageData.setView('forgot-password')}
            onShowVerification={() => {
              authPageData.setPendingVerificationEmail(
                localStorage.getItem('pendingVerificationEmail') || ''
              );
              authPageData.setView('verify-email');
            }}
          />
        );
      case 'register':
        return <RegisterUI {...registerData} onShowMessage={authPageData.handleShowMessage} />;
      case 'verify-email':
        return (
          <EmailVerification
            email={authPageData.pendingVerificationEmail}
            onBackToLogin={authPageData.handleBackToLogin}
            onVerificationSuccess={authPageData.handleVerificationSuccess}
          />
        );
      case 'forgot-password':
        return <ForgotPassword onShowMessage={authPageData.handleShowMessage} />;
      default:
        return null;
    }
  };

  return (
    <AuthLayout isOpen={isOpen} onClose={onClose} {...authPageData}>
      {renderContent()}
    </AuthLayout>
  );
};

AuthPage.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AuthPage;
