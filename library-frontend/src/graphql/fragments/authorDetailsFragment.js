import gql from 'graphql-tag';

const authorDetailsFragment = gql`
  fragment AuthorDetails on Author {
    name
    born
    bookCount
    id
  }
`;

export default authorDetailsFragment;
