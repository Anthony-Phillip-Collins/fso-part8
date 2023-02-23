import gql from 'graphql-tag';
import bookDetails from '../fragments/bookDetailsFragment';

const bookAddedSubscription = gql`
  subscription {
    BookAdded {
      ...BookDetails
    }
  }
  ${bookDetails}
`;

export default bookAddedSubscription;
