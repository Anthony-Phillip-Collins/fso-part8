import { useQuery, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';
import BooksTable from '../components/BooksTable/BooksTable';
import AllGenres from '../components/AllGenres';
import allBooksQuery from '../graphql/queries/allBooksQuery';
import allGenresQuery from '../graphql/queries/allGenresQuery';
import bookAddedSubscription from '../graphql/subscriptions/bookAddedSubscription';

const Books = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const { loading, data, refetch } = useQuery(allBooksQuery, {});

  const { data: allGenresData } = useQuery(allGenresQuery);

  const onGenreSelect = (genre) => {
    setSelectedGenres(selectedGenres.concat(genre));
  };

  const onGenreDeselect = (genre) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  const updateCache = async ({
    client,
    data: {
      data: { bookAdded },
    },
  }) => {
    const allBooksCached = async () => {
      const {
        data: { allBooks },
      } = await client.query({
        query: allBooksQuery,
      });
      return [...allBooks];
    };

    const allBooksUpdated = (await allBooksCached())
      .filter(
        (book) =>
          book.title !== bookAdded.title &&
          book.author.name !== bookAdded.author.name
      )
      .concat(bookAdded);

    /* not updating UI ?! */
    client.writeQuery({
      query: allBooksQuery,
      data: {
        allBooks: allBooksUpdated,
      },
    });

    const modifyExample = () => {
      const id = client.cache.identify(allBooksUpdated[0]);
      client.cache.modify({
        id,
        optimistic: true,
        fields: {
          title(cachedName) {
            return 'Modified Cache!';
          },
          published(cachedName) {
            return 100;
          },
          genres(cached) {
            return [cached[0]].concat('modified');
          },
        },
      });
    };

    // console.log('allBooksUpdated', allBooksUpdated);
  };

  useSubscription(bookAddedSubscription, {
    onData: async ({ client, data }) => {
      /* cache is being updated, but not updating UI ?! */
      // updateCache({ client, data });
      refetch();
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
        data={allGenresData}
        onSelect={onGenreSelect}
        onDeselect={onGenreDeselect}
      />
    </div>
  );
};

export default Books;
