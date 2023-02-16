import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Form, useOutletContext } from 'react-router-dom';
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
        <Form onSubmit={submit}>
          <div className='mb-3'>
            <select
              value={name}
              onChange={({ target }) => setName(target.value)}
              className='form-select'
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
              {/* <label className='mb-3 mt-3'>
                born
                <input
                  type='number'
                  value={born}
                  onChange={({ target }) => setBorn(target.value)}
                  className='form-control'
                />
              </label>
              <Button type='submit'>update author</Button> */}

              <div className='form-group mb-3'>
                <label htmlFor='genre'>Born</label>
                <div className='d-flex'>
                  <input
                    type='number'
                    className='form-control'
                    id='genre'
                    placeholder='Enter year'
                    value={born}
                    onChange={({ target }) => setBorn(target.value)}
                  />
                  <button
                    type='submit'
                    style={{ whiteSpace: 'nowrap' }}
                    className='btn btn-outline-primary'
                  >
                    update author
                  </button>
                </div>
              </div>
            </>
          )}
        </Form>
      </div>
    </>
  );
}
