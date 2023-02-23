import gql from 'graphql-tag';

const meQuery = gql`
  query Me {
    me {
      username
      favouriteGenre
    }
  }
`;

export default meQuery;
