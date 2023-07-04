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
          .sort({ createdAt: -1 }) // Sort by descending order of createdAt field
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

    // Resolver for fetching filtered products based on various input parameters
    // - categoryIds: array of category IDs to filter by
    // - minPrice, maxPrice: price range to filter by
    // - minRating, maxRating: rating range to filter by
    // - sortOption: sorting option for the products
    // - page, pageSize: pagination parameters for the result set
    filteredProducts: async (parent, args) => {
      try {
        // Destructuring input arguments
        const {
          categoryIds,
          minPrice,
          maxPrice,
          minRating,
          maxRating,
          sortOption,
          page = 1,
          pageSize = 10,
        } = args;

        const skip = (page - 1) * pageSize; // Calculate skip value for pagination

        let filter = {}; // Object to hold filter criteria

        if (categoryIds && categoryIds.length > 0) {
          // Filter by category IDs if provided
          filter.categories = { $in: categoryIds };
        }

        if (minPrice != null && maxPrice != null) {
          // Filter by price range if both minPrice and maxPrice are provided
          if (minPrice > maxPrice) {
            throw new UserInputError("Invalid price range");
          }
          filter.price = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice != null) {
          // Filter by minimum price if only minPrice is provided
          filter.price = { $gte: minPrice };
        } else if (maxPrice != null) {
          // Filter by maximum price if only maxPrice is provided
          filter.price = { $lte: maxPrice };
        }

        if (minRating != null && maxRating != null) {
          // Filter by rating range if both minRating and maxRating are provided
          if (minRating > maxRating) {
            throw new UserInputError("Invalid rating range");
          }
          filter.averageRating = { $gte: minRating, $lte: maxRating };
        } else if (minRating != null) {
          // Filter by minimum rating if only minRating is provided
          filter.averageRating = { $gte: minRating };
        } else if (maxRating != null) {
          // Filter by maximum rating if only maxRating is provided
          filter.averageRating = { $lte: maxRating };
        }

        let sortCriteria = { createdAt: -1 }; // Default sorting by createdAt

        // Modify sortCriteria based on the sortOption
        if (sortOption === "priceHighToLow") {
          sortCriteria = { price: -1, createdAt: -1 };
        } else if (sortOption === "priceLowToHigh") {
          sortCriteria = { price: 1, createdAt: -1 };
        } else if (sortOption === "reviewLowToHigh") {
          sortCriteria = { averageRating: 1, createdAt: -1 };
        } else if (sortOption === "reviewHighToLow") {
          sortCriteria = { averageRating: -1, createdAt: -1 };
        }

        const productsQuery = Product.find(filter)
          .sort(sortCriteria) // Apply the modified sortCriteria
          .skip(skip)
          .limit(pageSize)
          .populate("categories")
          .populate("user");
        
        const [products, numProducts] = await Promise.all([
          productsQuery.exec(),
          Product.countDocuments(filter), // returns the number of documents obtained from the filtered results
        ]);


        if (!products) {
          throw new UserInputError(
            "Could not find any products with given filters"
          );
        }

        return {
          products,
          numProducts,
        };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        } else {
          throw new Error("Failed to fetch products");
        }
      }
    },

    // Resolver for searching products based on a search term
    // - searchTerm: the term to search for in the product titles
    searchProducts: async (parent, { searchTerm }) => {
      try {
        const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern
        const products = await Product.find({ title: { $regex: regex } })
          .populate("categories")
          .populate("user");
        return products;
      } catch (error) {
        throw new Error("Failed to search products");
      }
    },

    // Resolver for fetching products by user ID
    productsByUser: async (parent, { userId, page = 1, pageSize = 10 }) => {
      try {
        const skip = (page - 1) * pageSize;
        const products = await Product.find({ user: userId })
          .sort({ createdAt: -1 })
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
