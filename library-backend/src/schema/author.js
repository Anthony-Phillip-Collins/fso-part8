const { ACCESS_DENIED_ERROR, BAD_USER_INPUT_ERROR } = require('../../errors');
const gql = require('graphql-tag');
const Author = require('./../models/Author');

const typeDef = gql`
  extend type Query {
    allAuthors: [Author!]!
    authorCount: Int
  }

  extend type Mutation {
    editAuthor(name: String!, setBornTo: Int!): Author
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    books: [Book!]
    id: ID!
  }
`;

const resolvers = {
  Query: {
    allAuthors: async () => await Author.find({}).populate('books'),
    authorCount: async () => (await Author.find({})).length,
  },
  Mutation: {
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw ACCESS_DENIED_ERROR();
      }

      const author = await Author.findOne({ name: args.name });
      if (!author) {
        throw BAD_USER_INPUT_ERROR({
          message: `The author ${args.name} doesn't exist!`,
        });
      }
      author.born = args.setBornTo;
      return await author.save();
    },
  },
  Author: {
    bookCount: async (root) => {
      /* querying books like this cause n+1 problem, using an array of book ids on Author instead */
      // const b = await booksOf({ author: root.name });
      // return b.length;
      return root.books.length;
    },
  },
};

module.exports = { typeDef, resolvers };
