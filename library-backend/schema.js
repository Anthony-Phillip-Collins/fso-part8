const { merge } = require('lodash');

const {
  typeDef: Author,
  resolvers: authorResolvers,
} = require('./src/schema/author');

const {
  typeDef: Book,
  resolvers: bookResolvers,
} = require('./src/schema/book');

const {
  typeDef: User,
  resolvers: userResolvers,
} = require('./src/schema/User');

const Query = `
  type Query {
    _empty: String
  }
`;

const Mutation = `
  type Mutation {
    _empty: String
  }
`;

const Subscription = `
  type Subscription {
    _empty: String
  }
`;

const resolvers = {};

module.exports = {
  typeDefs: [Query, Mutation, Subscription, Author, Book, User],
  resolvers: merge(resolvers, authorResolvers, bookResolvers, userResolvers),
};
