const {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} = require("apollo-server-errors");
const { signToken } = require("../../utils/auth");
const { User } = require("../../models");

const userResolvers = {
  Query: {
    // Resolver for fetching the currently logged-in user (requires authentication)
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      try {
        const currentUser = await User.findOne({
          _id: context.user._id,
        }).populate("cart");

        if (!currentUser) {
          throw new UserInputError("User not found");
        }

        return currentUser;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to fetch user");
        }
      }
    },

    // Resolver for fetching a single user by ID
    singleUser: async (parent, { userId }) => {
      try {
        const user = await User.findById(userId).populate("products");

        if (!user) {
          throw new UserInputError("User not found");
        }

        return user;
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        } else {
          throw new Error("Failed to fetch user");
        }
      }
    },

    // ---------- FOR DEVELOPER AND ADMIN USE -----------

    // Resolver for fetching all users
    allUsers: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        // Check if the user has admin or developer role
        if (context.user.role === "user") {
          throw new ForbiddenError("You are not authorized to view users");
        }

        const users = await User.find();
        return users;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to fetch users");
        }
      }
    },
  },
  Mutation: {
    // Resolver for user login
    login: async (parent, { usernameOrEmail, password }) => {
      // Find the user by username or email
      const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });

      // Throw an error if the user is not found
      if (!user) {
        throw new AuthenticationError("Incorrect username/email or password");
      }

      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);
      // Throw an error if the password is incorrect
      if (!correctPw) {
        throw new AuthenticationError("Incorrect username/email or password");
      }

      // Generate a token for the authenticated user
      const token = signToken(user);

      // Return the token and user information
      return { token, user };
    },

    // Create a new user
    createUser: async (parent, args) => {
      try {
        // Give the user a "user" role unless provided otherwise
        const role = args.role || "user";

        // Check if the username already exists
        const existingUsername = await User.findOne({
          username: args.username,
        });
        if (existingUsername) {
          throw new UserInputError("Username already in use", {
            invalidArgs: { username: args.username },
          });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ email: args.email });
        if (existingEmail) {
          throw new UserInputError("Email already in use", {
            invalidArgs: { email: args.email },
          });
        }

        // Create a new user in the database
        const user = await User.create({ ...args, role });

        const token = signToken(user);

        // Returning the token and the user
        return { token, user };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        } else if (error.name === "ValidationError") {
          // Handling validation errors
          const errorMessages = Object.values(error.errors).map(
            (validationError) => validationError.message
          );

          // Throwing a validation error with the custom error messages
          const errorMessage =
            errorMessages.length > 0 ? errorMessages : "Validation error";
          throw new UserInputError(errorMessage, {
            invalidArgs: args,
            validationErrors: errorMessages,
          });
        } else {
          // Throwing a generic error message when failed to create a user
          throw new Error("Failed to create user");
        }
      }
    },

    // Update existing user's information
    updateUser: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Ensure user does not change username to an already existing one
        const existingUsername = await User.findOne({
          username: args.username,
        });
        if (existingUsername) {
          throw new UserInputError("Username already in use", {
            invalidArgs: { username: args.username },
          });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ email: args.email });
        if (existingEmail) {
          throw new UserInputError("Email already in use", {
            invalidArgs: { email: args.email },
          });
        }

        const user = await User.findByIdAndUpdate(context.user._id, args, {
          new: true,
        });

        if (!user) {
          throw new UserInputError("User not found");
        }

        return user;
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        } else if (error.name === "ValidationError") {
          // Handling validation errors
          const errorMessages = Object.values(error.errors).map(
            (validationError) => validationError.message
          );

          // Throwing a validation error with the custom error messages
          const errorMessage =
            errorMessages.length > 0 ? errorMessages[0] : "Validation error";
          throw new UserInputError(errorMessage, {
            invalidArgs: args,
            validationErrors: errorMessages,
          });
        } else {
          // Throwing a generic error message when failed to create a user
          throw new Error("Failed to create user");
        }
      }
    },

    // Delete existing user
    deleteUser: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const user = await User.findByIdAndDelete(context.user._id);
        return user;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new Error("Failed to delete user");
      }
    },

    // ---------- FOR ADMIN USE ----------

    // Allow admin to delete existing users
    adminDeleteUser: async (parent, { userId }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        if (context.user.role !== "admin") {
          throw new ForbiddenError("Only admin users can delete other users");
        }

        const user = await User.findByIdAndDelete(userId);
        return user;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to delete user");
        }
      }
    },
  },
};

module.exports = userResolvers;
