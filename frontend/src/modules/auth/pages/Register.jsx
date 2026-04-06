import React from 'react';
import { useAuthPage } from '../hooks/useAuthPage';
import { useRegister } from '../hooks/useRegister';
import AuthLayout from '../components/AuthLayout';
import RegisterUI from '../components/RegisterUI';

const Register = () => {
  const authPageData = useAuthPage({ isPage: true, initialView: 'register' });
  const registerData = useRegister({ onRegisterSuccess: authPageData.handleLoginSuccess });

  return (
    <AuthLayout isPage={true} {...authPageData}>
      <RegisterUI {...registerData} onShowMessage={authPageData.handleShowMessage} />
    </AuthLayout>
  );
};

export default Register;
