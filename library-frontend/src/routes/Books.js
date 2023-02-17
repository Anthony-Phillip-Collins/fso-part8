import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import AllGenres from '../components/AllGenres';
import { ALL_BOOKS, ALL_GENRES } from '../services/queries';

const Books = () => {
  const { loading, data } = useQuery(ALL_BOOKS, { variables: { genre: [] } });
  const { data: allGenresData } = useQuery(ALL_GENRES);

  const [selectedGenres, setSelectedGenres] = useState([]);

  const onGenreSelect = (genre) => {
    setSelectedGenres(selectedGenres.concat(genre));
  };

  const onGenreDeselect = (genre) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  if (loading) {
    return null;
  }

  const books = data.allBooks;
  const booksByGenre = books.filter(
    ({ genres }) =>
      genres.filter((genre) => selectedGenres.includes(genre)).length >=
      selectedGenres.length
  );

  return (
    <div>
      <h2>books</h2>

      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
            <th>Genres</th>
          </tr>
        </thead>
        <tbody>
          {(selectedGenres.length === 0 ? books : booksByGenre).map((book) => {
            return (
              <tr key={book.title}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
                <td>{book.genres.join(', ')}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <AllGenres
        data={allGenresData}
        onSelect={onGenreSelect}
        onDeselect={onGenreDeselect}
      />
    </div>
  );
};

export default Books;
