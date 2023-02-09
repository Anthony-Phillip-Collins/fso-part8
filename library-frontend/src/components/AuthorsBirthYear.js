import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { ALL_AUTHORS, EDIT_AUTHOR } from '../services/queries';

export default function AuthorsBirthYear({ authors }) {
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
            <select
              value={name}
              onChange={({ target }) => setName(target.value)}
            >
              <option value='' disabled>
                Select author
              </option>
              {authors.map((author) => (
                <option value={author.name} key={author.name}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
          {name !== '' && (
            <>
              <div>
                born
                <input
                  type='number'
                  value={born}
                  onChange={({ target }) => setBorn(target.value)}
                />
              </div>
              <button type='submit'>update author</button>
            </>
          )}
        </form>
      </div>
    </>
  );
}
