import React from 'react';
import PropTypes from 'prop-types';
import { useResetPassword } from '../hooks/useResetPassword';
import ResetPasswordUI from '../components/ResetPasswordUI';

const ResetPassword = ({ onShowMessage }) => {
  const data = useResetPassword({ onShowMessage });

  return <ResetPasswordUI {...data} />;
};

ResetPassword.propTypes = {
  onShowMessage: PropTypes.func.isRequired,
};

export default ResetPassword;
