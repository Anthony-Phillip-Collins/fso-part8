import gql from 'graphql-tag';
import authorDetailsFragment from '../fragments/authorDetailsFragment';

const allAuthorsQuery = gql`
  query AllAuthors {
    allAuthors {
      ...AuthorDetails
    }
  }
  ${authorDetailsFragment}
`;

export default allAuthorsQuery;
