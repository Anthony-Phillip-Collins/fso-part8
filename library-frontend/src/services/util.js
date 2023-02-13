export const getErrorMessageFromApolloGraphQL = (error) => {
  const apolloError = error?.networkError?.result?.errors[0];
  const graphQLError = error?.graphQLErrors[0];
  const errors = (graphQLError || apolloError)?.extensions?.error?.errors;
  const key = Object.keys(errors || {})[0];
  return (graphQLError || apolloError)?.extensions?.error?.errors[key]?.message;
};
