import { useNavigate, useOutletContext } from 'react-router-dom';
import LoginFormContainer from '../components/LoginForm/LoginFormContainer';

const Login = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();

  if (token) {
    navigate('/');
  } else {
    return <LoginFormContainer />;
  }
};

export default Login;
