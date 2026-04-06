import React from 'react';
import PropTypes from 'prop-types';
import { useForgotPassword } from '../hooks/useForgotPassword';
import ForgotPasswordUI from '../components/ForgotPasswordUI';

const ForgotPassword = ({ onShowMessage }) => {
  const data = useForgotPassword({ onShowMessage });

  return <ForgotPasswordUI {...data} />;
};

ForgotPassword.propTypes = {
  onShowMessage: PropTypes.func.isRequired,
};

export default ForgotPassword;
