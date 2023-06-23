const {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} = require("apollo-server-errors");
const { Product, User } = require("../../models");

const productResolvers = {
  Query: {
    // Resolver for fetching all products
    products: async (parent, { page = 1, pageSize = 10 }) => {
      try {
        const skip = (page - 1) * pageSize; // Calculate the number of documents to skip based on the current page and page size
        const products = await Product.find()
          .sort({ updatedAt: -1 }) // Sort by descending order of updatedAt field
          .skip(skip) 
          .limit(pageSize) // Retrieve only the specified number of products per page
          .populate("categories")
          .populate("user")
          .populate("reviews");
        return products;
      } catch (error) {
        throw new Error("Failed to fetch products");
      }
    },

    // Resolver for fetching a single product by ID with populated categories, user, and reviews
    product: async (parent, { id }) => {
      try {
        const product = await Product.findById(id)
          .populate("categories")
          .populate("user")
          .populate("reviews");

        if (!product) {
          throw new UserInputError("Product not found");
        }

        return product;
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        } else {
          throw new Error("Failed to fetch product");
        }
      }
    },

    // Resolver for fetching products by user ID
    productsByUser: async (parent, { userId, page = 1, pageSize = 10 }) => {
      try {
        const skip = (page - 1) * pageSize;
        const products = await Product.find({ user: userId })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .populate("categories")
          .populate("user");
        return products;
      } catch (error) {
        throw new Error("Failed to fetch products");
      }
    },

    // Resolver for fetching products by category IDs
    productsByCategory: async (
      parent,
      { categoryIds, page = 1, pageSize = 10 }
    ) => {
      try {
        const skip = (page - 1) * pageSize;
        const products = await Product.find({
          categories: { $in: categoryIds },
        })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .populate("categories")
          .populate("user");
        return products;
      } catch (error) {
        throw new Error("Failed to fetch products");
      }
    },

    // Resolver for fetching products by price range
    productsByPriceRange: async (
      parent,
      { minPrice, maxPrice, page = 1, pageSize = 10 }
    ) => {
      try {
        const skip = (page - 1) * pageSize;
        const products = await Product.find({
          price: { $gte: minPrice, $lte: maxPrice },
        })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .populate("categories")
          .populate("user");
        return products;
      } catch (error) {
        throw new Error("Failed to fetch products");
      }
    },

    // Resolver for fetching products by review rating range
    productsByReviewRating: async (
      parent,
      { minRating, maxRating, page = 1, pageSize = 10 }
    ) => {
      try {
        if (minRating > maxRating) {
          throw new UserInputError("Invalid rating range");
        }
        const skip = (page - 1) * pageSize;
        const products = await Product.find({
          averageRating: { $gte: minRating, $lte: maxRating },
        })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .populate("categories")
          .populate("user");

        return products;
      } catch (error) {
        throw new Error("Failed to fetch products");
      }
    },
  },
  Mutation: {
    // ---------- FOR ADMIN USE ----------

    // Allow an admin to add a product to the store
    createProduct: async (parent, args, context) => {
      try {
        // Check if the user is authenticated and has the "admin" role
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        if (context.user.role !== "admin") {
          throw new ForbiddenError("Only admin users can create products");
        }

        // Destructure the "quantity" field from the args and assign a default value of 0 if not provided
        const { stockQuantity = 0, ...productArgs } = args;

        // Create a new product with the provided arguments
        const product = await Product.create({
          ...productArgs,
          user: context.user._id,
          stockQuantity,
        });

        // Add the created product's ID to the user's products array
        await User.findByIdAndUpdate(context.user._id, {
          $push: { products: product._id },
        });

        return product;
      } catch (error) {
        // Handle specific validation errors and MongoDB errors
        if (error.name === "ValidationError") {
          // Validation error occurred in the model schema
          const validationErrors = Object.values(error.errors).map(
            (err) => err.message
          );
          throw new UserInputError("Validation errors", {
            validationErrors,
          });
        } else if (error.name === "MongoError" && error.code === 11000) {
          // MongoDB duplicate key error
          throw new UserInputError("Product already exists");
        } else if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          // Generic error if failed to create the product
          throw new Error("Failed to create product");
        }
      }
    },

    // Allow admins to update a products information
    updateProduct: async (parent, args, context) => {
      try {
        // Ensure the requesting user is an admin
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        if (context.user.role !== "admin") {
          throw new ForbiddenError("Only admin users can update products");
        }

        // Find and update the product with the provided ID and owned by the authenticated user
        const product = await Product.findOneAndUpdate(
          { _id: args.id, user: context.user._id },
          { ...args },
          { new: true }
        );

        if (!product) {
          throw new UserInputError(
            "Product not found or you are not authorized to update it"
          );
        }

        return product;
      } catch (error) {
        // Handle specific validation errors and MongoDB errors
        if (error.name === "ValidationError") {
          // Validation error occurred in the model schema
          const validationErrors = Object.values(error.errors).map(
            (err) => err.message
          );
          throw new UserInputError("Validation errors", {
            validationErrors,
          });
        } else if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to update product");
        }
      }
    },

    // Allow an admin to delete an existing product
    deleteProduct: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        if (context.user.role !== "admin") {
          throw new ForbiddenError("Only admin users can delete products");
        }

        const product = await Product.findOneAndDelete({
          _id: id,
          user: context.user._id,
        });
        if (!product) {
          throw new UserInputError(
            "Product not found or you are not authorized to delete it"
          );
        }

        // Remove the created product's ID to the user's products array
        await User.findByIdAndUpdate(context.user._id, {
          $pull: { products: product._id },
        });

        return product;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to delete product");
        }
      }
    },
  },
};

module.exports = productResolvers;