import { useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import BooksTable from '../components/BooksTable/BooksTable';
import allBooksQuery from '../graphql/queries/allBooksQuery';
import meQuery from '../graphql/queries/meQuery';
import loginService from '../services/login';

const Books = () => {
  const favouriteGenre = useRef();
  const [allBooks, { data: allBooksData }] = useLazyQuery(allBooksQuery);
  const { data: userData, refetch: refetchUser } = useQuery(meQuery);

  useEffect(() => {
    favouriteGenre.current = userData?.me?.favouriteGenre;

    if (favouriteGenre.current) {
      allBooks({ variables: { genres: [favouriteGenre.current] } });
    } else {
      refetchUser();
    }
  }, [refetchUser, allBooks, userData?.me?.favouriteGenre]);

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

      {favouriteGenre.current && allBooksData?.allBooks && (
        <>
          <p>
            Books in your favourite genre:{' '}
            <strong>{favouriteGenre.current}</strong>
          </p>
          <BooksTable books={allBooksData?.allBooks} />
        </>
      )}
    </div>
  );
};

export default Books;
