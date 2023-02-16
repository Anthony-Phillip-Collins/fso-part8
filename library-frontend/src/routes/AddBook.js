import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import loginService from '../services/login';
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS } from '../services/queries';
import { getErrorMessageFromApolloGraphQL } from '../services/util';

const AddBook = () => {
  const [addBook, { data, error }] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
  });

  const { setNotification } = useOutletContext();

  const [title, setTitle] = useState('Some Title');
  const [author, setAuthor] = useState('Some Author');
  const [published, setPublished] = useState('1910');
  const [genre, setGenre] = useState('design');
  const [genres, setGenres] = useState([]);

  const submit = async (event) => {
    event.preventDefault();

    await addBook({
      variables: { title, author, published: parseInt(published) || 0, genres },
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

  useEffect(() => {
    if (error) {
      setNotification({
        text: getErrorMessageFromApolloGraphQL(error),
        isError: true,
      });
    } else if (data) {
      setNotification({
        text: `The book "${data.addBook.title}" by  ${data.addBook.author.name} has been added.`,
        isError: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

  if (!loginService.getUser()) {
    return (
      <div>
        <h2>You need to be logged in to add books.</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>add book</h2>

      <form onSubmit={submit}>
        <div className='form-group mb-3'>
          <label htmlFor='title'>Title</label>
          <input
            type='text'
            className='form-control'
            id='title'
            placeholder='Enter Title'
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div className='form-group mb-3'>
          <label htmlFor='author'>Author</label>
          <input
            type='text'
            className='form-control'
            id='author'
            placeholder='Enter author'
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div className='form-group mb-3'>
          <label htmlFor='published'>Published</label>
          <input
            type='text'
            className='form-control'
            id='published'
            placeholder='Enter published'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div className='form-group mb-3'>
          <label htmlFor='genre'>Genre</label>
          <div className='d-flex'>
            <input
              type='text'
              className='form-control'
              id='genre'
              placeholder='Enter genre'
              value={genre}
              onChange={({ target }) => setGenre(target.value)}
            />
            <button
              onClick={addGenre}
              type='button'
              style={{ whiteSpace: 'nowrap' }}
              className='btn btn-outline-primary'
            >
              add genre
            </button>
          </div>
        </div>
        <div>
          <span>Genres: </span>
          {genres.map((genre) => (
            <span class='badge bg-dark me-1'>{genre}</span>
          ))}
        </div>
        <button type='submit' className='btn btn-primary mt-3'>
          create book
        </button>
      </form>
    </div>
  );
};

export default AddBook;
