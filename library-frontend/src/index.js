import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

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

const authLink = setContext((_, { headers }) => {
  const token = loginService.getUser()?.token;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new GraphQLWsLink(createClient({ url: 'ws://localhost:4000' }));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const options = {};

const client = new ApolloClient({
  cache: new InMemoryCache(options),
  link: splitLink,
  connectToDevTools: true,
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
