import gql from 'graphql-tag';
import bookDetails from '../fragments/bookDetailsFragment';

const bookAddedSubscription = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${bookDetails}
`;

export default bookAddedSubscription;
