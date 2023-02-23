import { Table } from 'react-bootstrap';

const AuthorsTable = ({ authors }) => {
  if (!authors) return null;

  return (
    <>
      <h2>Authors</h2>
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
    </>
  );
};

export default AuthorsTable;
