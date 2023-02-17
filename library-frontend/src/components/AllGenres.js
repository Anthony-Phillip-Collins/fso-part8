import { useState } from 'react';

const GenreButton = ({ genre, onSelect, onDeselect }) => {
  const [selected, setSelected] = useState(false);
  const id = genre.split(' ').join('').toLowerCase();

  return (
    <>
      <input
        type='checkbox'
        className='btn-check'
        id={id}
        autoComplete='off'
        onChange={() => {
          if (selected) {
            onDeselect(genre);
          } else {
            onSelect(genre);
          }
          setSelected(!selected);
        }}
        checked={selected}
      />

      <label className='btn btn-outline-primary me-1' htmlFor={id}>
        {genre}
      </label>
    </>
  );
};

const AllGenres = ({ data, onSelect, onDeselect }) => {
  if (data) {
    return (
      <>
        {data.allGenres.map((genre) => (
          <GenreButton
            genre={genre}
            key={genre}
            onSelect={onSelect}
            onDeselect={onDeselect}
          />
        ))}
      </>
    );
  }

  return null;
};

export default AllGenres;
