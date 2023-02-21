import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import BooksTable from '../components/BooksTable/BooksTable';
import AllGenres from '../components/AllGenres';
import { ALL_BOOKS, ALL_GENRES } from '../services/queries';

const Books = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const { loading, data, refetch } = useQuery(ALL_BOOKS, {});

  const { data: allGenresData } = useQuery(ALL_GENRES);

  const onGenreSelect = (genre) => {
    setSelectedGenres(selectedGenres.concat(genre));
  };

  const onGenreDeselect = (genre) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  useEffect(() => {
    refetch({ genres: selectedGenres });
  }, [refetch, selectedGenres]);

  if (loading) {
    return null;
  }

  return (
    <div>
      <h2>books</h2>

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
