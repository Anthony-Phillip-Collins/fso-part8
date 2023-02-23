const { BAD_USER_INPUT_ERROR } = require('../../errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gql = require('graphql-tag');
const User = require('./../models/User');

const typeDef = gql`
  extend type Query {
    allUsers: [User!]!
    me: User
  }

  extend type Mutation {
    createUser(
      username: String!
      password: String!
      favouriteGenre: String!
    ): User
    login(username: String!, password: String!): Token
  }

  type User {
    username: String!
    hashedPassword: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }
`;

const resolvers = {
  Query: {
    allUsers: async () => await User.find({}),
    me: async (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    createUser: async (root, { username, password, favouriteGenre }) => {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
        username,
        hashedPassword,
        favouriteGenre,
      });

      try {
        await user.save();
      } catch (error) {
        throw BAD_USER_INPUT_ERROR({
          message: `User creation failed!`,
          error,
        });
      }

      return user;
    },
    login: async (root, { username, password }) => {
      const user = await User.findOne({ username });
      const passwordCorrect =
        user === null
          ? false
          : await bcrypt.compare(password, user.hashedPassword);

      if (!(user && password) || !passwordCorrect) {
        throw BAD_USER_INPUT_ERROR({
          message: `Login failed! Check credentials!`,
        });
      }

      const userForToken = {
        username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

module.exports = { typeDef, resolvers };
