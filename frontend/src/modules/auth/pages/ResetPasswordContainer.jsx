import React from 'react';
import { useResetPasswordContainer } from '../hooks/useResetPasswordContainer';
import ResetPasswordContainerUI from '../components/ResetPasswordContainerUI';

const ResetPasswordContainer = () => {
  const data = useResetPasswordContainer();
  return <ResetPasswordContainerUI {...data} />;
};

export default ResetPasswordContainer;
