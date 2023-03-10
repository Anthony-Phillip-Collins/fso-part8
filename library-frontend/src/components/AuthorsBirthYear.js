import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Form, useOutletContext } from 'react-router-dom';
import { getErrorMessageFromApolloGraphQL } from '../services/util';
import allAuthorsQuery from '../graphql/queries/allAuthorsQuery';
import editAuthorMutation from '../graphql/mutations/editAuthorMutation';

export default function AuthorsBirthYear({ authors }) {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');
  const { setNotification } = useOutletContext();

  const [editAuthor, { data, error }] = useMutation(editAuthorMutation, {
    // refetchQueries: [{ query: allAuthorsQuery }],

    update(cache, { data }) {
      const { allAuthors } = cache.readQuery({
        query: allAuthorsQuery,
      });

      cache.writeQuery({
        query: allAuthorsQuery,
        data: {
          allAuthors: allAuthors.map((author) => {
            return author.name === data.editAuthor.name
              ? { ...author, born: data.editAuthor.born }
              : author;
          }),
        },
      });
    },
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
        <h3>Set year of birth</h3>
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
