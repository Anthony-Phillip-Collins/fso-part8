import gql from 'graphql-tag';

const bookDetailsFragment = gql`
  fragment BookDetails on Book {
    genres
    author {
      name
      born
      bookCount
      id
    }
    title
    id
    published
  }
`;

export default bookDetailsFragment;
