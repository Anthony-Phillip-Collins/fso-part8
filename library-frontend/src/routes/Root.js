import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Outlet, useNavigate } from 'react-router-dom';
import NotificationContainer from '../components/Notification/NotificationContainer';
import loginService from '../services/login';

export default function Root() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [token, setToken] = useState();
  const [notification, setNotification] = useState({
    text: '',
    isError: false,
  });

  const logout = () => {
    loginService.logout();
    client.resetStore();
    setToken(null);
  };

  useEffect(() => {
    setToken(loginService.getUser()?.token);
  }, []);

  return (
    <Container>
      <div className='mt-5 mb-5'>
        <Button onClick={() => navigate('/')}>authors</Button>
        <Button onClick={() => navigate('/books')}>books</Button>
        {token && (
          <>
            <Button onClick={() => navigate('/addbook')}>add book</Button>
            <Button onClick={() => logout()}>logout</Button>
          </>
        )}
        {!token && <Button onClick={() => navigate('/login')}>login</Button>}
      </div>

      <div className='mt-5'>
        {
          <NotificationContainer
            notification={notification}
            setNotification={setNotification}
          />
        }
        <Outlet context={{ token, setToken, notification, setNotification }} />
      </div>
    </Container>
  );
}
