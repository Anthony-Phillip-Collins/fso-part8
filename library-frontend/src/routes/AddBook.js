import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getErrorMessageFromApolloGraphQL } from '../services/util';
import addBookMutation from '../graphql/mutations/addBookMutation';
import allAuthorsQuery from '../graphql/queries/allAuthorsQuery';
import allBooksQuery from '../graphql/queries/allBooksQuery';
import loginService from '../services/login';
import BooksTable from '../components/BooksTable/BooksTable';
import AuthorsTable from '../components/AuthorsTable/AuthorsTable';

const AddBook = () => {
  const { data: allBooksData } = useQuery(allBooksQuery);
  const { data: allAuthorsData } = useQuery(allAuthorsQuery);
  const [addBook, { data, error }] = useMutation(addBookMutation);

  const { setNotification } = useOutletContext();

  const [title, setTitle] = useState(Math.random().toString());
  const [author, setAuthor] = useState('Some Author');
  const [published, setPublished] = useState('1910');
  const [genre, setGenre] = useState('design');
  const [genres, setGenres] = useState(['design']);

  const updateCache = (cache, { data: { addBook } }) => {
    const bookCacheId = cache.identify(addBook);
    const authorCacheId = cache.identify(addBook.author);
    cache.modify({
      fields: {
        allBooks: (existingFieldData, { toReference }) => {
          return [...existingFieldData, toReference(bookCacheId)];
        },
        allAuthors: (existingFieldData, { toReference, readField }) => {
          const authorRef = toReference(authorCacheId);
          const authorName = readField('name', authorRef);
          const fieldData = existingFieldData.find(
            (author) => readField('name', author) === authorName
          );
          return fieldData
            ? existingFieldData
            : existingFieldData.concat(authorRef);
        },
      },
    });
  };

  const submit = async (event) => {
    event.preventDefault();

    await addBook({
      variables: { title, author, published: parseInt(published) || 0, genres },
      update: updateCache,
    });

    setTitle('');
    setPublished('');
    setAuthor('');
    setGenres([]);
    setGenre('');
  };

  const addGenre = () => {
    if (genre && genre.length > 0) {
      setGenres(genres.filter((g) => g !== genre).concat(genre));
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

      <form onSubmit={submit} className='mb-5'>
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
            <span className='badge bg-dark me-1' key={genre}>
              {genre}
            </span>
          ))}
        </div>
        <button type='submit' className='btn btn-primary mt-3'>
          create book
        </button>
      </form>

      <p className='mt-5 mb-5'>
        Tables below are just added to verify that modifying the cache works.
      </p>

      <BooksTable books={allBooksData?.allBooks} />

      <AuthorsTable authors={allAuthorsData?.allAuthors} />
    </div>
  );
};

export default AddBook;
