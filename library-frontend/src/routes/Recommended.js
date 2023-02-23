import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import BooksTable from '../components/BooksTable/BooksTable';
import allBooksQuery from '../graphql/queries/allBooksQuery';
import meQuery from '../graphql/queries/meQuery';
import loginService from '../services/login';

const Books = () => {
  const favouriteGenre = useRef();
  const [allBooks, { data: allBooksData }] = useLazyQuery(allBooksQuery);
  // const { data: allBooksData, refetch } = useQuery(allBooksQuery, {
  //   variables: {
  //     genres: favouriteGenre.current ? [favouriteGenre.current] : [],
  //   },
  // });

  const { data: userData, refetch: refetchUser } = useQuery(meQuery);

  const client = useApolloClient();
  const userCache = client.readQuery({
    query: meQuery,
  });

  const booksCache = client.readQuery({
    query: allBooksQuery,
    variables: { genres: [favouriteGenre.current] },
  });

  const books = allBooksData?.allBooks;

  useEffect(() => {
    favouriteGenre.current = userCache?.me?.favouriteGenre;

    if (favouriteGenre.current) {
      console.log('LAZY');
      allBooks({ variables: { genres: [favouriteGenre.current] } });
    } else {
      refetchUser();
    }

    console.log(
      'userCache',
      userCache,
      'booksCache',
      booksCache,
      'allBooksData',
      allBooksData,
      'favouriteGenre',
      favouriteGenre.current
    );
  }, [refetchUser, userCache, userData, allBooksData, booksCache]);

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
