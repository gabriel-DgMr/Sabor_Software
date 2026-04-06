import React from 'react';
import PropTypes from 'prop-types';
import { useEmailVerification } from '../hooks/useEmailVerification';
import EmailVerificationUI from '../components/EmailVerificationUI';

const EmailVerification = ({ email, onVerificationSuccess, onBackToLogin }) => {
  const data = useEmailVerification({ email, onVerificationSuccess, onBackToLogin });

  return <EmailVerificationUI email={email} onBackToLogin={onBackToLogin} {...data} />;
};

EmailVerification.propTypes = {
  email: PropTypes.string.isRequired,
  onVerificationSuccess: PropTypes.func,
  onBackToLogin: PropTypes.func.isRequired,
};

export default EmailVerification;
