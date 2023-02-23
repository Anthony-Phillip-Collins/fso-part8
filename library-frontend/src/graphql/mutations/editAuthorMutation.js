import gql from 'graphql-tag';

const editAuthorMutation = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      bookCount
      born
      name
    }
  }
`;

export default editAuthorMutation;
