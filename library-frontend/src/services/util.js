/* The ApolloServer can return either a NetworkError or a GraphQLError. Each store the location of the custom error message
 * (defined in e.g. a Mongoose Schema) in a different place. And the property (key) causing the problem also needs to be extracted
 * in order to access the error message for that property.
 */
export const getErrorMessageFromApolloGraphQL = (error) => {
  const apolloError = error?.networkError?.result?.errors[0];
  const graphQLError = error?.graphQLErrors[0];
  const errorType = graphQLError || apolloError;
  const errors = errorType?.extensions?.error?.errors;
  const key = Object.keys(errors || {})[0];
  const propError = key && errors[key];

  const defaultMessage = 'An error has ocurred, please check your input.';

  console.log('.///////////');
  console.log(
    graphQLError && 'GraphQL',
    apolloError && 'ApolloError',
    errorType
  );
  console.log('.///////////');

  return (
    propError?.properties?.message ||
    propError?.message ||
    errorType?.message ||
    defaultMessage
  );
};
