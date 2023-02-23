import gql from 'graphql-tag';

const allGenresQuery = gql`
  query AllGenres {
    allGenres
  }
`;

export default allGenresQuery;
