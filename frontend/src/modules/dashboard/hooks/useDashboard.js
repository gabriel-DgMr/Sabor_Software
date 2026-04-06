import { useNavigate } from 'react-router-dom';

export const useDashboard = () => {
  const navigate = useNavigate();

  const handleNavigate = path => () => navigate(path);

  return {
    handleNavigate,
  };
};

export default useDashboard;
