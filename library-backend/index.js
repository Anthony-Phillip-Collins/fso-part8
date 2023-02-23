const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

const { ApolloServer } = require('@apollo/server');
const { ApolloServerErrorCode } = require('@apollo/server/errors');

const { expressMiddleware } = require('@apollo/server/express4');
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');

const { PORT, JWT_SECRET } = require('./src/utils/config');
const jwt = require('jsonwebtoken');
const connectToDb = require('./src/utils/connectToDb');

const User = require('./src/models/User');
const Author = require('./src/models/Author');
const Book = require('./src/models/Book');

// const typeDefs = require('./schema-old');
// const resolvers = require('./resolvers');

const { typeDefs, resolvers } = require('./schema');

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

  let _a = a.map((authorData) => new Author({ ...authorData }));

  let _b = books.map((book) => {
    const author = _a.find((author) => author.name === book.author);
    delete book.id;
    return { ...book, author: author._id.toString() };
  });

  _b = _b.map((bookData) => new Book({ ...bookData }));
  _a = _a.map((author) => {
    author.books = _b
      .filter((book) => book.author.toString() === author._id.toString())
      .map(({ _id }) => _id.toString());
    author.save();
    return author;
  });

  _b.forEach((book) => book.save());
};

connect();

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
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

  await server.start();

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;
        const bearer = 'bearer ';

        if (auth && auth.toLowerCase().startsWith(bearer)) {
          const decodedToken = jwt.verify(
            auth.substring(bearer.length),
            JWT_SECRET
          );

          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
    })
  );

  const PORT = 4000;

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  );
};

start();
