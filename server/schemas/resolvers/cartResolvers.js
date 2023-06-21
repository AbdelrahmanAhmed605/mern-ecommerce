const { AuthenticationError, UserInputError } = require("apollo-server-errors");
const { Cart, User, Product } = require("../../models");

const cartResolvers = {
  Query: {
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
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new Error("Failed to fetch cart");
      }
    },
  },
  Mutation: {
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

        // Update the user's cart reference
        await User.findByIdAndUpdate(context.user._id, { cart: cart._id });

        // Return the created cart
        return cart;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new Error("Failed to create cart");
      }
    },

    // Add a product with a specified quantity to the shopping cart
    addToCart: async (parent, { productId, quantity }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Find the product by its ID and check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
          throw new UserInputError("Product not found");
        }

        const user = await User.findById(context.user._id);
        const cartId = user.cart;

        // Check if the product already exists in the cart
        const existingProduct = await Cart.findOne(
          { _id: cartId, "products.product": productId },
          { "products.$": 1 }
        );

        let cart;

        if (existingProduct) {
          // If the product exists, update its quantity
          const existingQuantity = existingProduct.products[0].quantity;
          const newQuantity = existingQuantity + quantity;

          cart = await Cart.findOneAndUpdate(
            { _id: cartId, "products.product": productId },
            {
              $set: { "products.$.quantity": newQuantity },
              $inc: { totalPrice: quantity * product.price }, // Increment the total price by the added quantity multiplied by the product's price
            },
            { new: true }
          );
        } else {
          // If the product does not exist, add it to the cart
          cart = await Cart.findOneAndUpdate(
            { _id: cartId, user: context.user._id },
            {
              $push: { products: { product: productId, quantity } },
              $inc: { totalPrice: quantity * product.price }, // Increment the total price by the added quantity multiplied by the product's price
            },
            { new: true }
          );
        }

        if (!cart) {
          throw new UserInputError("Cart not found");
        }

        return cart;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        }
        throw new Error("Failed to add item to cart");
      }
    },

    // Remove a product from the cart
    removeFromCart: async (parent, { productId }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const product = await Product.findById(productId);
        if (!product) {
          throw new UserInputError("Product not found");
        }

        const user = await User.findById(context.user._id);
        const cartId = user.cart;
        // Find the cart by its ID and ensure it exists
        const cart = await Cart.findById(cartId);
        if (!cart) {
          throw new UserInputError("Cart not found");
        }

        // Find the product to be removed from the cart
        const removedProduct = cart.products.find(
          (productItem) => productItem.product.toString() === productId
        );
        // If the product to be removed is not found in the cart, throw an error
        if (!removedProduct) {
          throw new UserInputError("Product not found in cart");
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
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to remove item from cart");
        }
      }
    },

    // Update the quantity of a product in the cart
    updateCartProductQuantity: async (
      parent,
      { productId, quantity },
      context
    ) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const product = await Product.findById(productId);
        if (!product) {
          throw new UserInputError("Product not found");
        }

        const user = await User.findById(context.user._id);
        const cartId = user.cart;
        const cart = await Cart.findById(cartId);
        if (!cart) {
          throw new UserInputError("Cart not found");
        }

        // Find the product in the cart to update its quantity
        const changedProduct = cart.products.find(
          (productItem) => productItem.product.toString() === productId
        );
        // If the product is not found in the cart, throw an error
        if (!changedProduct) {
          throw new UserInputError("Product not found in cart");
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
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to update product quantity in cart");
        }
      }
    },

    // Delete the user's cart
    deleteCart: async (parent, agrs, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const user = await User.findById(context.user._id);
        const cartId = user.cart;
        // Find and delete the cart matching the provided ID and owned by the authenticated user
        const cart = await Cart.findOneAndDelete({
          _id: cartId,
          user: context.user._id,
        });
        // If the cart is not found or the user is not authorized to delete it, throw an error
        if (!cart) {
          throw new UserInputError(
            "Cart not found or you are not authorized to delete it"
          );
        }

        return cart;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to delete cart");
        }
      }
    },
  },
};

module.exports = cartResolvers;
