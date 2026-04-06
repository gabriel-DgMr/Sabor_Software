import React from 'react';
import { useAuthPage } from '../hooks/useAuthPage';
import { useLogin } from '../hooks/useLogin';
import AuthLayout from '../components/AuthLayout';
import LoginUI from '../components/LoginUI';

const Login = () => {
  const authPageData = useAuthPage({ isPage: true, initialView: 'login' });
  const loginData = useLogin({ onLoginSuccess: authPageData.handleLoginSuccess });

  return (
    <AuthLayout isPage={true} {...authPageData}>
      <LoginUI
        {...loginData}
        onShowForgotPassword={() => authPageData.setView('forgot-password')}
        onShowVerification={() => authPageData.setView('verify-email')}
      />
    </AuthLayout>
  );
};

export default Login;
