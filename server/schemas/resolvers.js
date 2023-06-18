const { AuthenticationError, UserInputError } = require("apollo-server-errors");
const { User, Product, Category, Cart, Order, Review } = require("../models");

const resolvers = {
  Query: {
    // Resolver for fetching the currently logged-in user (requires authentication)
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("Authentication required");
      }

      try {
        const currentUser = await User.findOne({ _id: context.user._id });

        if (!currentUser) {
          throw new UserInputError("User not found");
        }

        return currentUser;
      } catch (error) {
        throw new Error("Failed to fetch user");
      }
    },

    // Resolver for fetching a single user by ID
    singleUser: async (parent, { userId }) => {
      try {
        const user = await User.findById(userId);

        if (!user) {
          throw new UserInputError("User not found");
        }

        return user;
      } catch (error) {
        throw new Error("Failed to fetch user");
      }
    },

    // Resolver for fetching all products
    products: async (parent, { page = 1, pageSize = 10 }) => {
      try {
        const skip = (page - 1) * pageSize;
        const products = await Product.find()
          .populate("categories")
          .populate("user")
          .skip(skip)
          .limit(pageSize);
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
        throw new Error("Failed to fetch product");
      }
    },

    // Resolver for fetching products by user ID
    productsByUser: async (parent, { userId, page = 1, pageSize = 10 }) => {
      try {
        const skip = (page - 1) * pageSize;
        const products = await Product.find({ user: userId })
          .populate("categories")
          .populate("user")
          .skip(skip)
          .limit(pageSize);
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
          .populate("categories")
          .populate("user")
          .skip(skip)
          .limit(pageSize);
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
          .populate("categories")
          .populate("user")
          .skip(skip)
          .limit(pageSize);
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
          .populate("categories")
          .populate("user")
          .skip(skip)
          .limit(pageSize);

        return products;
      } catch (error) {
        throw new Error("Failed to fetch products");
      }
    },

    // Resolver for fetching all categories
    categories: async () => {
      try {
        const categories = await Category.find();
        return categories;
      } catch (error) {
        throw new Error("Failed to fetch categories");
      }
    },

    // Resolver for fetching a single category by ID
    category: async (parent, { id }) => {
      try {
        const category = await Category.findById(id);
        if (!category) {
          throw new UserInputError("Category not found");
        }
        return category;
      } catch (error) {
        throw new Error("Failed to fetch category");
      }
    },

    // Resolver for fetching the cart for the currently logged-in user (requires authentication)
    cart: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("Authentication required");
      }

      try {
        const cart = await Cart.findOne({ user: context.user._id }).populate({
          path: "products.product",
          model: "Product",
        });

        return cart;
      } catch (error) {
        throw new Error("Failed to fetch cart");
      }
    },

    // Resolver for fetching an order by ID for the currently logged-in user (requires authentication)
    order: async (parent, { id }, context) => {
      try {
        // Check if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const order = await Order.findById(id).populate({
          path: "products.product",
          model: "Product",
        });

        if (!order) {
          throw new UserInputError("Order not found");
        }

        return order;
      } catch (error) {
        throw new Error("Failed to fetch order");
      }
    },

    // Resolver for fetching orders for the currently logged-in user (requires authentication)
    ordersByUser: async (parent, { page = 1, pageSize = 10 }, context) => {
      try {
        // Check if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const skip = (page - 1) * pageSize;
        const orders = await Order.find({ user: context.user._id })
          .skip(skip)
          .limit(pageSize);

        return orders;
      } catch (error) {
        throw new Error("Failed to fetch orders");
      }
    },

    // Resolver for fetching reviews by user ID
    reviewsByUser: async (parent, { userId, page = 1, pageSize = 10 }) => {
      try {
        const skip = (page - 1) * pageSize;
        const reviews = await Review.find({ user: userId })
          .populate("user")
          .populate("product")
          .skip(skip)
          .limit(pageSize);
        return reviews;
      } catch (error) {
        throw new Error("Failed to fetch reviews");
      }
    },
  },

  // Developer-only resolvers

  // Resolver for fetching an order by ID (for developers only)
  developerOrder: async (parent, { orderId }) => {
    try {
      const order = await Order.findById(orderId).populate({
        path: "products.product",
        model: "Product",
      });

      if (!order) {
        throw new UserInputError("Order not found");
      }

      return order;
    } catch (error) {
      throw new Error("Failed to fetch order");
    }
  },

  // Resolver for fetching all users (for developers only)
  allUsers: async (parent, args) => {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw new Error("Failed to fetch users");
    }
  },
};

module.exports = resolvers;
