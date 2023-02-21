import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { ALL_BOOKS, ME } from '../services/queries';
import BooksTable from '../components/BooksTable/BooksTable';
import loginService from '../services/login';

const Books = () => {
  const client = useApolloClient();
  const favouriteGenre = useRef();
  const [allBooks, { data: allBooksData }] = useLazyQuery(ALL_BOOKS);
  const { data: userData, refetch: refetchUser } = useQuery(ME);
  const userCache = client.readQuery({
    query: ME,
  });
  const books = allBooksData?.allBooks;

  useEffect(() => {
    favouriteGenre.current = userCache?.me?.favouriteGenre;

    if (favouriteGenre.current) {
      allBooks({ variables: { genres: [favouriteGenre.current] } });
    } else {
      refetchUser();
    }
  }, [allBooks, refetchUser, userCache, userData, allBooksData]);

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

      {favouriteGenre.current && books && (
        <>
          <p>
            Books in your favourite genre:{' '}
            <strong>{favouriteGenre.current}</strong>
          </p>
          <BooksTable books={books} />
        </>
      )}
    </div>
  );
};

export default Books;
