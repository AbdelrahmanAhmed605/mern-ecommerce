const { AuthenticationError, UserInputError } = require("apollo-server-errors");
const { User, Product, Category, Cart, Order, Review } = require("../models");

const resolvers = {
  Query: {
    // Resolver for fetching the currently logged-in user (requires authentication)
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
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
        const skip = (page - 1) * pageSize; // Calculate the number of documents to skip based on the current page and page size
        const products = await Product.find()
          .populate("categories")
          .populate("user")
          .skip(skip)
          .limit(pageSize); // Retrieve only the specified number of products per page
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
        throw new AuthenticationError("You need to be logged in!");
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

        // Create a new user in the database
        const user = await User.create({ ...args, role });

        const token = signToken(user);

        // Returning the token and the user
        return { token, user };
      } catch (error) {
        if (error.name === "MongoError" && error.code === 11000) {
          // Handling duplicate key errors for username, email, or other unique fields
          const uniqueFieldErrors = Object.keys(error.keyPattern).map(
            (field) => {
              const errorMessage = userSchema.path(field).options.uniqueError;
              return new UserInputError(errorMessage, {
                invalidArgs: { [field]: args[field] },
              });
            }
          );

          // Throwing the unique field errors individually
          if (uniqueFieldErrors.length > 0) {
            throw uniqueFieldErrors[0];
          } else {
            // Throwing a general duplicate field value error
            throw new UserInputError("Duplicate field value", {
              invalidArgs: args,
            });
          }
        } else if (error.name === "ValidationError") {
          // Handling validation errors
          const errorMessages = Object.values(error.errors).map(
            (validationError) => validationError.message
          );

          // Throwing a validation error with the custom message provided in the User model schema
          throw new UserInputError("Validation error", {
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

        const user = await User.findByIdAndUpdate(context.user._id, args, {
          new: true,
        });

        if (!user) {
          throw new UserInputError("User not found");
        }

        return user;
      } catch (error) {
        if (error.name === "MongoError" && error.code === 11000) {
          // Handling duplicate key errors for username, email, or other unique fields
          const uniqueFieldErrors = Object.keys(error.keyPattern).map(
            (field) => {
              const errorMessage = userSchema.path(field).options.uniqueError;
              return new UserInputError(errorMessage, {
                invalidArgs: { [field]: args[field] },
              });
            }
          );

          // Throwing the unique field errors individually
          if (uniqueFieldErrors.length > 0) {
            throw uniqueFieldErrors[0];
          } else {
            // Throwing a general duplicate field value error
            throw new UserInputError("Duplicate field value", {
              invalidArgs: args,
            });
          }
        } else if (error.name === "ValidationError") {
          // Handling validation errors
          const errorMessages = Object.values(error.errors).map(
            (validationError) => validationError.message
          );

          // Throwing a validation error with the custom message provided in the User model schema
          throw new UserInputError("Validation error", {
            invalidArgs: args,
            validationErrors: errorMessages,
          });
        } else {
          // Throwing a generic error message when failed to update a user
          throw new Error("Failed to update user");
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
        throw new Error("Failed to delete user");
      }
    },

    // Create a shopping cart for the user
    createCart: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Create a new cart with initial values
        const cart = await Cart.create({
          user: context.user._id,
          products: [],
          totalPrice: 0,
        });

        // Return the created cart
        return cart;
      } catch (error) {
        throw new Error("Failed to create cart");
      }
    },

    // Add a product with a specified quantity to the shopping cart
    addToCart: async (parent, { cartId, productId, quantity }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Find the product by its ID and check the product exists
        const product = await Product.findById(productId);
        if (!product) {
          throw new Error("Product not found");
        }

        // Update the cart by adding the product and its quantity as well as updating the total price of the cart
        const cart = await Cart.findOneAndUpdate(
          { _id: cartId, user: context.user._id },
          {
            $push: { products: { product: productId, quantity } },
            $inc: { totalPrice: quantity * product.price }, // Increment the total price by the added quantity multiplied by the product's price
          },
          { new: true }
        );

        return cart;
      } catch (error) {
        throw new Error("Failed to add item to cart");
      }
    },

    // Remove a product from the cart
    removeFromCart: async (parent, { cartId, productId }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const product = await Product.findById(productId);
        if (!product) {
          throw new Error("Product not found");
        }

        // Find the cart by its ID and ensure it exists
        const cart = await Cart.findById(cartId);
        if (!cart) {
          throw new Error("Cart not found");
        }

        // Find the product to be removed from the cart
        const removedProduct = cart.products.find(
          (productItem) => productItem.product.toString() === productId
        );
        // If the product to be removed is not found in the cart, throw an error
        if (!removedProduct) {
          throw new Error("Product not found in cart");
        }

        // Calculate the reduction in the total price based on the removed product's quantity and price
        const totalPriceReduction = removedProduct.quantity * product.price;
        // Update the total price of the cart by subtracting the reduction
        cart.totalPrice -= totalPriceReduction;

        // Remove the product from the cart's products array
        cart.products = cart.products.filter(
          (productItem) => productItem.product.toString() !== productId
        );

        // Save the updated cart
        await cart.save();
        return cart;
      } catch (error) {
        throw new Error("Failed to remove item from cart");
      }
    },

    // Update the quantity of a product in the cart
    updateCartProductQuantity: async (
      parent,
      { cartId, productId, quantity },
      context
    ) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const product = await Product.findById(productId);
        if (!product) {
          throw new Error("Product not found");
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
          throw new Error("Cart not found");
        }

        // Find the product in the cart to update its quantity
        const changedProduct = cart.products.find(
          (productItem) => productItem.product.toString() === productId
        );
        // If the product is not found in the cart, throw an error
        if (!changedProduct) {
          throw new Error("Product not found in cart");
        }

        // Calculate the change in the total price based on the difference between the new quantity and the old quantity, multiplied by the product's price
        const totalPriceChange =
          (quantity - changedProduct.quantity) * product.price;
        // Update the total price of the cart by adding the price change
        cart.totalPrice += totalPriceChange;
        // Update the quantity of the changed product in the cart
        changedProduct.quantity = quantity;

        await cart.save();

        return cart;
      } catch (error) {
        throw new Error("Failed to update product quantity in cart");
      }
    },

    // Delete the user's cart
    deleteCart: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Find and delete the cart matching the provided ID and owned by the authenticated user
        const cart = await Cart.findOneAndDelete({
          _id: id,
          user: context.user._id,
        });
        // If the cart is not found or the user is not authorized to delete it, throw an error
        if (!cart) {
          throw new Error(
            "Cart not found or you are not authorized to delete it"
          );
        }

        return cart;
      } catch (error) {
        throw new Error("Failed to delete cart");
      }
    },

    // Create an order when the user purchases the items in their cart
    createOrder: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Create the order with the provided arguments and assign it to the authenticated user
        const order = await Order.create({
          ...args,
          user: context.user._id,
        });

        // Check if the products in the order are all available in stock. If there is enough quantities of the
        // products in stock, then complete the order and update the stock
        const productUpdates = args.products.map(async (productInput) => {
          const { productId, orderQuantity } = productInput;
          // Find the product by ID
          const product = await Product.findById(productId);
          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }

          // Check if the product has sufficient quantity in stock
          if (product.quantity < orderQuantity) {
            throw new Error(
              `Insufficient quantity for product ${product.title}`
            );
          }

          // Subtract the ordered quantity from the product's stock quantity
          product.quantity -= orderQuantity;
          await product.save();
        });

        // Wait for all product updates to complete
        await Promise.all(productUpdates);

        return order;
      } catch (error) {
        throw new Error("Failed to create order");
      }
    },

    // Create a user review for a product
    createReview: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Create a review with the provided arguments and assign it to the authenticated user
        const review = await Review.create({
          ...args,
          user: context.user._id,
        });
        return review;
      } catch (error) {
        throw new Error("Failed to create review");
      }
    },

    // Allow a user to update their existing review
    updateReview: async (parent, { id, rating, comment }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Find and update the review matching the provided ID and authenticated user
        const review = await Review.findOneAndUpdate(
          { _id: id, user: context.user._id },
          { $set: { rating: rating, comment: comment } },
          { new: true }
        );
        if (!review) {
          throw new Error(
            "Review not found or you are not authorized to update it"
          );
        }

        return review;
      } catch (error) {
        throw new Error("Failed to update review");
      }
    },

    // Allow a user to delete their review
    deleteReview: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Find and delete the review matching the provided ID and authenticated user
        const review = await Review.findOneAndDelete({
          _id: id,
          user: context.user._id,
        });
        if (!review) {
          throw new Error(
            "Review not found or you are not authorized to delete it"
          );
        }

        return review;
      } catch (error) {
        throw new Error("Failed to delete review");
      }
    },

    // ---------- FOR ADMIN USE ----------

    // Allow an admin to add a product to the store
    createProduct: async (parent, args, context) => {
      try {
        // Check if the user is authenticated and has the "admin" role
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        if (context.user.role !== "admin") {
          throw new AuthenticationError("Only admin users can create products");
        }

        // Destructure the "quantity" field from the args and assign a default value of 0 if not provided
        const { quantity = 0, ...productArgs } = args;

        // Create a new product with the provided arguments
        const product = await Product.create({
          ...productArgs,
          user: context.user._id,
          quantity,
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
          throw new AuthenticationError("Only admin users can update products");
        }

        // Find and update the product with the provided ID and owned by the authenticated user
        const product = await Product.findOneAndUpdate(
          { _id: args.id, user: context.user._id },
          { ...args },
          { new: true }
        );

        if (!product) {
          throw new Error(
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
          throw new AuthenticationError("Only admin users can delete products");
        }

        const product = await Product.findOneAndDelete({
          _id: id,
          user: context.user._id,
        });
        if (!product) {
          throw new Error(
            "Product not found or you are not authorized to delete it"
          );
        }

        return product;
      } catch (error) {
        throw new Error("Failed to delete product");
      }
    },
  },
};

module.exports = resolvers;
