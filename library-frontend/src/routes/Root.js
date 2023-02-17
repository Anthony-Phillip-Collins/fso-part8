import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
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
    <>
      <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
        <Container>
          <Navbar.Toggle aria-controls='responsive-navbar-nav' />
          <Navbar.Collapse id='responsive-navbar-nav'>
            <Nav className='me-auto'>
              <Nav.Link href='/'>Authors</Nav.Link>
              <Nav.Link href='/books'>Books</Nav.Link>
              {token && (
                <>
                  <Nav.Link href='/addbook'>Add Book</Nav.Link>
                  <Nav.Link href='/recommended'>Recommended</Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              {token && <Nav.Link onClick={() => logout()}>logout</Nav.Link>}
              {!token && <Nav.Link href='/login'>login</Nav.Link>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <div className='mt-5'>
          {
            <NotificationContainer
              notification={notification}
              setNotification={setNotification}
            />
          }
          <Outlet
            context={{ token, setToken, notification, setNotification }}
          />
        </div>
      </Container>
    </>
  );
}
