import { useQuery } from '@apollo/client';
import AuthorsBirthYear from '../components/AuthorsBirthYear';
import { Container } from 'react-bootstrap';
import allAuthorsQuery from '../graphql/queries/allAuthorsQuery';
import AuthorsTable from '../components/AuthorsTable/AuthorsTable';

const Authors = () => {
  const { loading, data } = useQuery(allAuthorsQuery);

  if (loading) {
    return null;
  }

  return (
    <Container>
      <AuthorsTable authors={data?.allAuthors} />

      <AuthorsBirthYear authors={data?.allAuthors} />
    </Container>
  );
};

export default Authors;
