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
    console.log('refetch');
    refetch({ genres: selectedGenres });
  }, [selectedGenres]);

  if (loading) {
    return null;
  }

  const books = data.allBooks;
  const booksByGenre = books.filter(
    ({ genres }) =>
      genres.filter((genre) => selectedGenres.includes(genre)).length >=
      selectedGenres.length
  );
  const reactBooks = selectedGenres.length === 0 ? books : booksByGenre;

  return (
    <div>
      <h2>books</h2>

      <BooksTable books={books} />

      <AllGenres
        data={allGenresData}
        onSelect={onGenreSelect}
        onDeselect={onGenreDeselect}
      />
    </div>
  );
};

export default Books;
