import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { LOGIN } from '../../services/queries';
// import { useDispatch } from 'react-redux';
// import { login } from '../../app/reducers/userSlice';
// import useNotification from '../../hooks/useNotification';
import loginService from '../../services/login';
import LoginForm from './LoginForm';
import { Button } from 'react-bootstrap';

export default function LoginFormContainer() {
  const [login, { data, loading, error }] = useMutation(LOGIN);
  const client = useApolloClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    await login({ variables: { username, password } });
  };

  if (loginService.getUser()) {
    return (
      <>
        <h1>Logged in as: {loginService.getUser().username}</h1>
        <Button
          onClick={() => {
            setUsername('');
            setPassword('');
            loginService.logout();
            client.resetStore();
          }}
        >
          Logout
        </Button>
      </>
    );
  } else if (error) {
    return <h1>Login Error</h1>;
  } else if (data) {
    loginService.setUser({ username, token: data.login.value });
  }

  return (
    <LoginForm
      onSubmit={onLogin}
      username={username}
      password={password}
      setUsername={setUsername}
      setPassword={setPassword}
    />
  );
}
