import { useLazyQuery, useQuery } from '@apollo/client';
import { ALL_BOOKS, ME } from '../services/queries';
import BooksTable from '../components/BooksTable/BooksTable';
import { useEffect } from 'react';
import loginService from '../services/login';

const Books = () => {
  const [allBooks, { data: allBooksData }] = useLazyQuery(ALL_BOOKS);
  const { data: userData } = useQuery(ME);
  const favouriteGenre = userData?.me?.favouriteGenre;

  useEffect(() => {
    if (favouriteGenre) {
      allBooks({ variables: { genres: [favouriteGenre] } });
    }
  }, [favouriteGenre, allBooks]);

  const books = allBooksData?.allBooks;

  if (!loginService.getUser()) {
    return (
      <div>
        <h2>Please log in.</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>Recommended</h2>

      {favouriteGenre && (
        <p>
          Books in your favourite genre: <strong>{favouriteGenre}</strong>
        </p>
      )}

      {books && <BooksTable books={books} />}
    </div>
  );
};

export default Books;
