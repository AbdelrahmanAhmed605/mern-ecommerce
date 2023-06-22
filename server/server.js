require("dotenv").config(); // Load environment variables from .env file
const express = require("express"); // Import the Express framework
const { ApolloServer } = require("apollo-server-express"); // Import Apollo Server
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection"); // Import the database connection

const app = express(); // Create an instance of the Express application
const PORT = process.env.PORT || 3001; // Set the port to either the environment variable or 3001 as a default

// Create a new ApolloServer instance, providing the type definitions, resolvers, and authentication middleware
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded request bodies
app.use(express.json()); // Middleware to parse JSON request bodies

// Serve static assets from "client/build" in production mode
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// Serve the index.html file for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const startApolloServer = async () => {
  await server.start(); // Start the Apollo Server
  server.applyMiddleware({ app }); // Apply the Apollo Server middleware to the Express app

  // Open the database connection and start the server
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      ); // Log the GraphQL endpoint URL
    });
  });
};

startApolloServer();
