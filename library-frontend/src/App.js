import { useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';

const App = () => {
  const [page, setPage] = useState('authors');

  // const client = new ApolloClient({
  //   uri: 'http://localhost:4000/graphql',
  //   cache: new InMemoryCache(),
  // });

  // client
  //   .query({
  //     query: ALL_AUTHORS,
  //   })
  //   .then((result) => console.log(result));

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />
    </div>
  );
};

export default App;