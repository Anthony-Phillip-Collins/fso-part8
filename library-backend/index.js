const { ApolloServer } = require('@apollo/server');
const { ApolloServerErrorCode } = require('@apollo/server/errors');
const { startStandaloneServer } = require('@apollo/server/standalone');
const connectToDb = require('./src/utils/connectToDb');
const Author = require('./src/models/Author');
const Book = require('./src/models/Book');
let { authors, books } = require('./src/data/dummies');
const { GraphQLError } = require('graphql');
const { PORT } = require('./src/utils/config');

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
  }

  type Mutation {
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
  },
  Mutation: {
    addBook: async (root, args, contextValue) => {
      console.log('contextValue', contextValue);

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
        throw new GraphQLError(
          `The book with the title "${args.title}" by ${args.author} already exists!`,
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: {
                status: 400,
              },
            },
          }
        );
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
          throw new GraphQLError(`Saving the author ${args.author} failed!`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: {
                status: 400,
              },
              error,
            },
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
        console.log(error);

        throw new GraphQLError(
          `Saving book with the title "${args.title}" by ${args.author} failed!`,
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: {
                status: 400,
              },
              error,
            },
          }
        );
      }

      if (newAuthor) {
        await newAuthor.save();
      }

      await book.save();

      return book.populate('author');
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        throw new Error(`The author ${args.name} doesn't exist!`);
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    switch (formattedError.extensions.code) {
      case ApolloServerErrorCode.BAD_USER_INPUT:
        if (formattedError.message.includes('$published')) {
          return {
            ...formattedError,
            message: 'Please provide the year the book was published!',
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
    /* Transforming args sent by client before they reach validation. */
    req.body.variables.published = parseInt(req.body.variables.published) || 0;
    return { foo: 'bar' };
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
