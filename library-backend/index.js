const { ApolloServer } = require('@apollo/server');
const { ApolloServerErrorCode } = require('@apollo/server/errors');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { PORT } = require('./src/utils/config');
const jwt = require('jsonwebtoken');
const connectToDb = require('./src/utils/connectToDb');

const User = require('./src/models/User');
const Author = require('./src/models/Author');
const Book = require('./src/models/Book');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

let { authors, books } = require('./src/data/dummies');

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
