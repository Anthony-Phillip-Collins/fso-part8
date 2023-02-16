import { useQuery } from '@apollo/client';
import { Table } from 'react-bootstrap';
import { ALL_BOOKS } from '../services/queries';

const Books = () => {
  const { loading, data } = useQuery(ALL_BOOKS);

  if (loading) {
    return null;
  }

  const books = data.allBooks;

  return (
    <div>
      <h2>books</h2>

      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Books;
