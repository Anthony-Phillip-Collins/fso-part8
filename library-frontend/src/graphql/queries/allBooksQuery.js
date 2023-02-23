import gql from 'graphql-tag';
import bookDetails from '../fragments/bookDetailsFragment';

const allBooksQuery = gql`
  query AllBooks($genres: [String], $author: String) {
    allBooks(genres: $genres, author: $author) {
      ...BookDetails
    }
  }
  ${bookDetails}
`;

export default allBooksQuery;
