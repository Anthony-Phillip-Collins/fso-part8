import gql from 'graphql-tag';
import bookDetailsFragment from '../fragments/bookDetailsFragment';

const addBookMutation = gql`
  mutation AddBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      ...BookDetails
    }
  }
  ${bookDetailsFragment}
`;

export default addBookMutation;
