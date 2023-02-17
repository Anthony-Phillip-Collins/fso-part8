import { gql } from '@apollo/client';

export const ME = gql`
  query me {
    me {
      username
      favouriteGenre
    }
  }
`;

export const ALL_AUTHORS = gql`
  query allAuthors {
    allAuthors {
      bookCount
      born
      name
    }
  }
`;

export const ALL_BOOKS = gql`
  query allBooks($genres: [String], $author: String) {
    allBooks(genres: $genres, author: $author) {
      genres
      author {
        name
        born
        bookCount
      }
      title
      id
      published
    }
  }
`;

export const ALL_GENRES = gql`
  query allGenres {
    allGenres
  }
`;

export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      author {
        name
      }
      genres
      published
      title
    }
  }
`;

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      bookCount
      born
      name
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;
