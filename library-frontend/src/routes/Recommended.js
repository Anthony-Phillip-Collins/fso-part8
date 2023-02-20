import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import { ALL_AUTHORS, ALL_BOOKS, ALL_GENRES, ME } from '../services/queries';
import BooksTable from '../components/BooksTable/BooksTable';
import { useEffect } from 'react';
import loginService from '../services/login';

const Books = () => {
  const [allBooks, { data: allBooksData }] = useLazyQuery(ALL_BOOKS);
  const { data: userData, refetch: refetchUserData } = useQuery(ME);
  const client = useApolloClient();

  const allAuthors = client.readQuery({
    query: ALL_AUTHORS,
  });

  const me = client.readQuery({
    query: ME,
  });

  useEffect(() => {
    console.log('Recommended mounted', allAuthors?.allAuthors, me, userData);
    if (me?.me?.favouriteGenre) {
      console.log('Load Books');
      allBooks({ variables: { genres: [me?.me?.favouriteGenre] } });
    } else {
      console.log('Me Refetch', me?.me?.username);
      refetchUserData();
    }
  }, [allBooks, refetchUserData, allAuthors, me, userData]);

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

      {me?.me?.favouriteGenre && (
        <p>
          Books in your favourite genre:{' '}
          <strong>{me?.me?.favouriteGenre}</strong>
        </p>
      )}

      {books && <BooksTable books={books} />}
    </div>
  );
};

export default Books;
