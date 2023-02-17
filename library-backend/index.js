const { ApolloServer } = require('@apollo/server');
const { ApolloServerErrorCode } = require('@apollo/server/errors');
const { startStandaloneServer } = require('@apollo/server/standalone');
const connectToDb = require('./src/utils/connectToDb');
const Author = require('./src/models/Author');
const Book = require('./src/models/Book');
let { authors, books } = require('./src/data/dummies');
const { GraphQLError } = require('graphql');
const { PORT, JWT_SECRET } = require('./src/utils/config');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* Set to true to delete all documents and repopulate database from dummies */
const RESET_DB = true;

const connect = async () => {
  try {
    await connectToDb();
    console.log('connected to MongoDB');

    if (RESET_DB) {
      resetDb();
    }
  } catch (error) {
    console.log('error connection to MongoDB:', error.message);
  }
};

const resetDb = async () => {
  await Author.deleteMany({});
  await Book.deleteMany({});

  const a = authors.map((author) => {
    return {
      name: author.name,
      born: author.born || null,
    };
  });

  Author.insertMany(a, function (error, authorDocs) {
    const b = books.map((book) => {
      const author = authorDocs.find((author) => author.name === book.author);
      return {
        title: book.title,
        published: book.published,
        author: author._id.toString(),
        genres: book.genres,
      };
    });

    Book.insertMany(b, async function (error, bookDocs) {
      authors = authorDocs;
      books = await Book.find({}).populate('author');
    });
  });
};

connect();

const typeDefs = `
  type User {
    username: String!
    hashedPassword: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
  }

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    allUsers: [User!]!
    allGenres: [String]
    me: User
  }

  type Mutation {
    createUser(username: String!, password:String!, favouriteGenre: String!): User
    login(username: String!, password: String!): Token
    addBook(title: String!, published: Int!, author: String!, genres: [String!]!): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const booksOf = async ({ author, genre }) => {
  let query;
  if (author) {
    const a = await Author.findOne({ name: author });
    query = { author: a._id.toString() };

    if (genre) {
      query.genres = genre;
    }
  } else if (genre) {
    query = { genres: genre };
  }
  return query ? await Book.find(query).populate('author') : [];
};

const resolvers = {
  Query: {
    bookCount: async () => (await Book.find({})).length,
    authorCount: async () => (await Author.find({})).length,
    allBooks: async (root, args) =>
      Object.keys(args).length > 0
        ? await booksOf(args)
        : await Book.find({}).populate('author'),
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    switch (formattedError.extensions.code) {
      case ApolloServerErrorCode.BAD_USER_INPUT:
        if (formattedError.message.includes('$published')) {
          return {
            ...formattedError,
            message:
              'Please provide the year the book was published! (Must be a number)',
          };
        }
        break;
      case ApolloServerErrorCode.INTERNAL_SERVER_ERROR:
        return {
          ...formattedError,
          message: 'There has been a server error!',
        };
    }

    return formattedError;
  },
});

startStandaloneServer(server, {
  listen: { port: PORT },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    const bearer = 'bearer ';
    if (auth && auth.toLowerCase().startsWith(bearer)) {
      const decodedToken = jwt.verify(
        auth.substring(bearer.length),
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
