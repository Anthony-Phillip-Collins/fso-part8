import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ALL_AUTHORS, EDIT_AUTHOR } from '../services/queries';
import { getErrorMessageFromApolloGraphQL } from '../services/util';

export default function AuthorsBirthYear({ authors }) {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');
  const { setNotification } = useOutletContext();

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

  useEffect(() => {
    if (error) {
      setNotification({
        text: getErrorMessageFromApolloGraphQL(error),
        isError: true,
      });
    } else if (data) {
      setNotification({
        text: `The birth year of "${data.editAuthor.name}" has been changed to ${data.editAuthor.born}.`,
        isError: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

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
