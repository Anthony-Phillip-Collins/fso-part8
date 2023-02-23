const { ApolloServerErrorCode } = require('@apollo/server/errors');
const { GraphQLError } = require('graphql');

const BAD_USER_INPUT_ERROR = ({ message, error }) =>
  new GraphQLError(message, {
    extensions: {
      code: ApolloServerErrorCode.BAD_USER_INPUT,
      http: {
        status: 400,
      },
      error,
    },
  });

const ACCESS_DENIED_ERROR = () =>
  new GraphQLError(`You have to be logged in to make changes!`, {
    extensions: {
      code: ApolloServerErrorCode.BAD_REQUEST,
      http: {
        status: 401,
      },
    },
  });

module.exports = { BAD_USER_INPUT_ERROR, ACCESS_DENIED_ERROR };
