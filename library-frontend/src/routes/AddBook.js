import { useMutation } from '@apollo/client';
import { useState } from 'react';
import NotificationContainer from '../components/Notification/NotificationContainer';
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS } from '../services/queries';
import { getErrorMessageFromApolloGraphQL } from '../services/util';

const AddBook = () => {
  const [addBook, { data, loading, error }] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
  });

  const [title, setTitle] = useState('Som');
  const [author, setAuthor] = useState('Some Author');
  const [published, setPublished] = useState('2019');
  const [genre, setGenre] = useState('Some Genre');
  const [genres, setGenres] = useState([]);

  const submit = async (event) => {
    event.preventDefault();

    await addBook({
      variables: { title, author, published: parseInt(published), genres },
    });

    setTitle('');
    setPublished('');
    setAuthor('');
    setGenres([]);
    setGenre('');
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre('');
  };

  if (error) {
    // console.log(1, error);
    // console.log(2.1, error.networkError);
    // console.log(
    //   2.2,
    //   error.networkError?.result?.errors[0]?.extensions?.error?.errors?.name
    //     ?.message
    // );
    // console.log(3, error.graphQLErrors[0] || 'No GQL Errors');
    // console.log(4, error.clientErrors);
    // console.log(5, error.message);
    // console.log(6, Object.keys(error.graphQLErrors[0]));
    // console.log(
    //   'Network Error',
    //   Object.keys(
    //     error.networkError?.result?.errors[0]?.extensions?.error?.errors || {}
    //   )
    // );
    // console.log(
    //   'GraphQL Error',
    //   Object.keys(error.graphQLErrors[0]?.extensions?.error?.errors) || {}
    // );
    // console.log('C', getErrorMessageFromApolloGraphQL(error));
  }

  return (
    <div>
      <h2>add book</h2>

      {error && (
        <NotificationContainer
          text={getErrorMessageFromApolloGraphQL(error)}
          isError={true}
        />
      )}

      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type='button'>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type='submit'>create book</button>
      </form>
    </div>
  );
};

export default AddBook;
