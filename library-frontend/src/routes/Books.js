import { useQuery, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';
import BooksTable from '../components/BooksTable/BooksTable';
import AllGenres from '../components/AllGenres';
import allBooksQuery from '../graphql/queries/allBooksQuery';
import bookAddedSubscription from '../graphql/subscriptions/bookAddedSubscription';

const Books = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const { loading, data, refetch } = useQuery(allBooksQuery, { variables: [] });

  const allGenresData = () => {
    return data.allBooks.reduce((genres, book) => {
      return genres.concat(book.genres.filter((g) => !genres.includes(g)));
    }, []);
  };

  const onGenreSelect = (genre) => {
    setSelectedGenres(selectedGenres.concat(genre));
  };

  const onGenreDeselect = (genre) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  useSubscription(bookAddedSubscription, {
    onData: async ({
      client,
      data: {
        data: { bookAdded },
      },
    }) => {
      client.cache.modify({
        fields: {
          allBooks: (existingFieldData, { toReference }) => {
            const bookCacheId = client.cache.identify(bookAdded);
            return [...existingFieldData, toReference(bookCacheId)];
          },
        },
      });
    },
  });

  useEffect(() => {
    refetch({ genres: selectedGenres });
  }, [refetch, selectedGenres]);

  if (loading) {
    return null;
  }

  return (
    <div>
      <BooksTable books={data?.allBooks} />

      <AllGenres
        allGenres={allGenresData()}
        onSelect={onGenreSelect}
        onDeselect={onGenreDeselect}
      />
    </div>
  );
};

export default Books;
