import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import Root from './routes/Root';
import Books from './routes/Books';
import AddBook from './routes/AddBook';
import Authors from './routes/Authors';
import Recommended from './routes/Recommended';
import Login from './routes/Login';
import RootBoundary from './components/RootBoundary';

import 'bootstrap/dist/css/bootstrap.min.css';

import { setContext } from '@apollo/client/link/context';
import loginService from './services/login';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = loginService.getUser()?.token;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <RootBoundary />,
    children: [
      {
        path: '',
        element: <Authors />,
      },
      {
        path: 'books',
        element: <Books />,
      },
      {
        path: 'addbook',
        element: <AddBook />,
      },
      {
        path: 'recommended',
        element: <Recommended />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ApolloProvider client={client}>
    <RouterProvider router={router}></RouterProvider>
  </ApolloProvider>
);
