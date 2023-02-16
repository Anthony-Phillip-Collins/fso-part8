import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { LOGIN } from '../../services/queries';
import loginService from '../../services/login';
import LoginForm from './LoginForm';
import { Button } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';

export default function LoginFormContainer() {
  const [login, { data, error }] = useMutation(LOGIN);
  const client = useApolloClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState();
  const { setToken } = useOutletContext();

  const onLogin = async () => {
    await login({ variables: { username, password } });
  };

  useEffect(() => {
    const usr = {
      username: username || loginService.getUser()?.username,
      token: data?.login?.value || loginService.getUser()?.token,
    };
    if (usr.token) {
      setToken(usr.token);
      setUser(usr);
      loginService.setUser(usr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (user) {
    return (
      <>
        <h1>Logged in as: {user.username}</h1>
        <Button
          onClick={() => {
            setUser(null);
            loginService.logout();
            client.resetStore();
          }}
        >
          Logout
        </Button>
      </>
    );
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
