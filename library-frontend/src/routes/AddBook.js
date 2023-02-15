import { useMutation } from '@apollo/client';
import { useState } from 'react';
import NotificationContainer from '../components/Notification/NotificationContainer';
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS } from '../services/queries';
import { getErrorMessageFromApolloGraphQL } from '../services/util';

const AddBook = () => {
  const [addBook, { data, loading, error }] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
  });

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [published, setPublished] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  const submit = async (event) => {
    event.preventDefault();

    await addBook({
      variables: { title, author, published, genres },
    });

    setTitle('');
    setPublished('');
    setAuthor('');
    setGenres([]);
    setGenre('');
  };

  const addGenre = () => {
    if (genre && genre.length > 0) {
      setGenres(genres.concat(genre));
      setGenre('');
    }
  };

  let notification = '';

  if (error) {
    notification = getErrorMessageFromApolloGraphQL(error);
  } else if (data) {
    notification = `The book "${data.addBook.title}" by  ${data.addBook.author.name} has been added.`;
  }

  return (
    <div>
      <h2>add book</h2>

      {<NotificationContainer text={notification} isError={error} />}

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
