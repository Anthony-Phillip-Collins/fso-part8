import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import NotificationContainer from '../components/Notification/NotificationContainer';
import loginService from '../services/login';

import { useSubscription } from '@apollo/client';
import bookAddedSubscription from '../graphql/subscriptions/bookAddedSubscription';
import { addToCache } from '../services/util';

export default function Root() {
  const client = useApolloClient();
  const [token, setToken] = useState();
  const [notification, setNotification] = useState({
    text: '',
    isError: false,
  });

  useSubscription(bookAddedSubscription, {
    onData: ({
      data: {
        data: { bookAdded },
      },
    }) => {
      setNotification({
        text: `The book ${bookAdded.title} by ${bookAdded.author.name} has been added!`,
      });
    },
  });

  useSubscription(bookAddedSubscription, {
    onData: async ({
      client,
      data: {
        data: { bookAdded },
      },
    }) => {
      client.cache.modify({
        fields: {
          allBooks: (existingFieldData, util) => {
            addToCache({
              queryData: bookAdded,
              client,
              existingFieldData,
              util,
            });
          },
          allAuthors: (existingFieldData, util) => {
            addToCache({
              queryData: bookAdded.author,
              client,
              existingFieldData,
              util,
            });
          },
        },
      });

      setNotification({
        text: `The book ${bookAdded.title} by ${bookAdded.author.name} has been added!`,
      });
    },
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
              <Link to='/' className='nav-link'>
                Authors
              </Link>
              <Link to='/books' className='nav-link'>
                Books
              </Link>
              {token && (
                <>
                  <Link to='/addbook' className='nav-link'>
                    Add Book
                  </Link>
                  <Link to='/recommended' className='nav-link'>
                    Recommended
                  </Link>
                </>
              )}
            </Nav>
            <Nav>
              {token && (
                <Link className='nav-link' onClick={() => logout()}>
                  logout
                </Link>
              )}
              {!token && (
                <Link to='/login' className='nav-link'>
                  login
                </Link>
              )}
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
