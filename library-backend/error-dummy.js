{
  errors: [
    {
      message: "Saving book with the title \"Some Title\" by Some Author failed!",
      locations: [
        {
          line: 2,
          column: 3
        }
      ],
      path: [
        "addBook"
      ],
      extensions: {
        code: "BAD_USER_INPUT",
        invalidArgs: {
          title: "Some Title",
          author: "Some Author"
        },
        error: {
          errors: {
            title: {
              name: "ValidatorError",
              message: "Error, expected `title` to be unique. Value: `Some Title`",
              properties: {
                message: "Error, expected `title` to be unique. Value: `Some Title`",
                type: "unique",
                path: "title",
                value: "Some Title"
              },
              kind: "unique",
              path: "title",
              value: "Some Title"
            }
          },
          _message: "Book validation failed",
          name: "ValidationError",
          message: "Book validation failed: title: Error, expected `title` to be unique. Value: `Some Title`"
        },
        stacktrace: [
          "GraphQLError: Saving book with the title \"Some Title\" by Some Author failed!    at Object.addBook (/Users/anthonycollins/localhost/anthonycollins.net/github/fso-part8/library-backend/index.js:164:15)",
          "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)"
        ]
      }
    }
  ],
  data: {
    addBook: null
  }
}