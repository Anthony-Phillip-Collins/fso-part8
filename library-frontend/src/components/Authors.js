import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../services/queries';
import AuthorsBirthYear from './AuthorsBirthYear';

const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);

  if (!props.show || loading) {
    return null;
  }

  const authors = data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AuthorsBirthYear authors={authors} />
    </div>
  );
};

export default Authors;
