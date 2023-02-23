const { ACCESS_DENIED_ERROR, BAD_USER_INPUT_ERROR } = require('../../errors');
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
const gql = require('graphql-tag');
const Author = require('./../models/Author');
const Book = require('./../models/Book');

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

  /* testing transforming population */
  // return query ? await Book.find(query).populate(transforms.author) : [];
};

const typeDef = gql`
  extend type Query {
    allBooks(author: String, genres: [String]): [Book!]!
    bookCount: Int
    allGenres: [String]
  }

  extend type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
  }

  extend type Subscription {
    bookAdded: Book!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
`;

const resolvers = {
  Query: {
    allBooks: async (root, args, context) => {
      return Object.keys(args).length > 0
        ? await booksOf(args)
        : await Book.find({}).populate('author');
    },
    bookCount: async () => (await Book.find({})).length,
    allGenres: async () => {
      const books = await Book.find({});
      const genres = books.reduce((result, { genres }) => {
        const found = genres.filter((genre) => !result.includes(genre));
        return result.concat(found);
      }, []);
      return genres;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw ACCESS_DENIED_ERROR();
      }

      let author = await Author.findOne({
        name: args.author,
      });

      let authorId = author?._id.toString();

      const existingBook = await Book.findOne({
        author: authorId,
        title: args.title,
      });

      if (existingBook) {
        throw BAD_USER_INPUT_ERROR({
          message: `The book with the title "${args.title}" by ${args.author} already exists!`,
        });
      }

      if (!author) {
        try {
          author = new Author({
            name: args.author,
            born: args.born || null,
            books: [],
          });

          authorId = author._id.toString();

          await author.validate();
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

      author.books = author.books.concat(book._id);
      await author.save();

      book = (await book.save()).populate('author');

      pubsub.publish('BOOK_ADDED', { bookAdded: book });

      return book;
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
};

module.exports = { typeDef, resolvers };
