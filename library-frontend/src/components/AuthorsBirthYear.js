import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { ALL_AUTHORS, ALL_BOOKS, EDIT_AUTHOR } from '../services/queries';

export default function AuthorsBirthYear() {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const [editAuthor, { data, loading, error }] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = (event) => {
    event.preventDefault();

    editAuthor({
      variables: { name, setBornTo: parseInt(born) },
    });

    setName('');
    setBorn('');
  };

  return (
    <>
      <div>
        <h3>Set birthyear</h3>
        <form onSubmit={submit}>
          <div>
            name
            <input
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
          </div>
          <div>
            born
            <input
              type='number'
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type='submit'>update author</button>
        </form>
      </div>
    </>
  );
}
