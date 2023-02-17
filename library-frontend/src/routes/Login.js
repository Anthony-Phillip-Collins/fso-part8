import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LoginFormContainer from '../components/LoginForm/LoginFormContainer';

const Login = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return <>{!token && <LoginFormContainer />}</>;
};

export default Login;
