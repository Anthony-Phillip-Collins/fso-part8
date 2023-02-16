import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../services/queries';
import AuthorsBirthYear from '../components/AuthorsBirthYear';
import { Container, Table } from 'react-bootstrap';

const Authors = () => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);

  if (loading) {
    return null;
  }

  const authors = data.allAuthors;

  return (
    <Container>
      <h2>authors</h2>

      <Table className='mb-4'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <AuthorsBirthYear authors={authors} />
    </Container>
  );
};

export default Authors;
