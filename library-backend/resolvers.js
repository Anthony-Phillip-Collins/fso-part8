const { ApolloServerErrorCode } = require('@apollo/server/errors');
const { GraphQLError } = require('graphql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./src/utils/config');
const User = require('./src/models/User');
const Author = require('./src/models/Author');
const Book = require('./src/models/Book');

const booksOf = async ({ author, genres }) => {
  let query;

  if (genres !== undefined) {
    query =
      genres === null || genres.length === 0
        ? {}
        : { genres: { $all: genres } };
  }

  if (author) {
    const a = await Author.findOne({ name: author });
    if (a._id) {
      query = { ...query, author: a._id.toString() };
    }
  }

  return query ? await Book.find(query).populate('author') : [];
};

const resolvers = {
  Query: {
    bookCount: async () => (await Book.find({})).length,
    authorCount: async () => (await Author.find({})).length,
    allBooks: async (root, args, context) => {
      return Object.keys(args).length > 0
        ? await booksOf(args)
        : await Book.find({}).populate('author');
    },
    allAuthors: async () => await Author.find({}),
    allUsers: async () => await User.find({}),
    allGenres: async () => {
      const books = await Book.find({});
      const genres = books.reduce((result, { genres }) => {
        const found = genres.filter((genre) => !result.includes(genre));
        return result.concat(found);
      }, []);
      return genres;
    },
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

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw ACCESS_DENIED_ERROR();
      }

      const existingAuthor = await Author.findOne({
        name: args.author,
      });

      let newAuthor;
      let authorId = existingAuthor?._id.toString();

      const existingBook = await Book.findOne({
        author: authorId,
        title: args.title,
      });

      if (existingBook) {
        throw BAD_USER_INPUT_ERROR({
          message: `The book with the title "${args.title}" by ${args.author} already exists!`,
        });
      }

      if (!existingAuthor) {
        try {
          newAuthor = new Author({
            name: args.author,
            born: args.born || null,
          });

          authorId = newAuthor._id.toString();

          await newAuthor.validate();
        } catch (error) {
          throw BAD_USER_INPUT_ERROR({
            message: `Saving the author ${args.author} failed!`,
            error,
          });
        }
      }

      let book;

      try {
        book = new Book({
          ...args,
          author: authorId,
        });
        await book.validate();
      } catch (error) {
        throw BAD_USER_INPUT_ERROR({
          message: `Saving book with the title "${args.title}" by ${args.author} failed!`,
          error,
        });
      }

      if (newAuthor) {
        await newAuthor.save();
      }

      await book.save();

      return book.populate('author');
    },
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
      const b = await booksOf({ author: root.name });
      return b.length;
    },
  },
};

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

module.exports = resolvers;
