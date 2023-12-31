const {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} = require("apollo-server-errors");
const { Order, Product, Cart, User } = require("../../models");

const orderResolvers = {
  Query: {
    // Resolver for fetching an order by ID for the currently logged-in user (requires authentication)
    order: async (parent, { id }, context) => {
      try {
        // Check if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const order = await Order.findById(id).populate({
          path: "products.productId",
          model: "Product",
        });

        if (!order) {
          throw new UserInputError("Order not found");
        }

        return order;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to fetch order");
        }
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
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize) // Retrieve only the specified number of orders per page
          .populate({
            path: "products.productId",
            model: "Product",
          });

        const totalOrders = await Order.countDocuments({
          user: context.user._id,
        });

        return { orders, totalOrders };
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new Error("Failed to fetch orders");
      }
    },

    // ---------- FOR DEVELOPER AND ADMIN USE -----------

    // Resolver for fetching an order by ID
    developerOrder: async (parent, { orderId }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        // Check if the user has admin or developer role
        if (context.user.role === "user") {
          throw new ForbiddenError(
            "You are not authorized to view user's orders"
          );
        }

        const order = await Order.findById(orderId).populate({
          path: "products.productId",
          model: "Product",
        });

        if (!order) {
          throw new UserInputError("Order not found");
        }

        return order;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to fetch order");
        }
      }
    },
  },
  Mutation: {
    // allow a user to create an order
    createOrder: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Check if the products in the order are all available in stock
        const productUpdates = args.products.map(async (productInput) => {
          const { productId, orderQuantity } = productInput;
          // Find the product by ID
          const product = await Product.findById(productId);
          if (!product) {
            throw new UserInputError(`Product with ID ${productId} not found`);
          }

          // Return error if product is not in sufficient stock
          if (product.stockQuantity < orderQuantity) {
            throw new UserInputError(
              `Insufficient stock for product '${product.title}'. Only ${product.stockQuantity} units left in stock.`
            );
          }

          return {
            product,
            orderQuantity,
          };
        });

        // Wait for all product updates to complete
        const productsToUpdate = await Promise.all(productUpdates);

        // Create the order with the provided arguments and assign it to the authenticated user
        const order = await Order.create({
          ...args,
          user: context.user._id,
        });

        // Update the purchased product's stock quantities after the order is successfully created
        const productUpdatesAfterOrder = productsToUpdate.map(
          async (productUpdate) => {
            const { product, orderQuantity } = productUpdate;
            // Subtract the ordered quantity from the product's stock quantity
            product.stockQuantity -= orderQuantity;
            await product.save();
          }
        );

        // Wait for all product updates after order creation to complete
        await Promise.all(productUpdatesAfterOrder);

        return order;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to create order");
        }
      }
    },

    // Mutation to update the status of the order on the front-end if a payment process was failed
    updateOrder: async (parent, { orderId, newStatus }) => {
      try {
        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
          throw new UserInputError("Order not found");
        }

        // Check if the status is being updated to "canceled"
        if (newStatus === "canceled" && order.status !== "canceled") {
          // Update the status to "canceled"
          order.status = "canceled";
          await order.save();
        }

        // Retrieve the products in the canceled order
        const productsInOrder = order.products;

        // Update the stock quantities of the products in the canceled order
        const productUpdatesAfterCancellation = productsInOrder.map(
          async (productInOrder) => {
            const { productId, orderQuantity } = productInOrder;
            // Find the product by ID
            const foundProduct = await Product.findById(productId);
            if (!foundProduct) {
              throw new UserInputError(
                `Product with ID ${productId} not found`
              );
            }

            // Add the canceled order quantity back to the product's stock quantity
            foundProduct.stockQuantity += orderQuantity;
            await foundProduct.save();
          }
        );

        // Wait for all product updates after order cancellation to complete
        await Promise.all(productUpdatesAfterCancellation);

        return order;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to update order");
        }
      }
    },

    // ---------- FOR DEVELOPER AND ADMIN USE ----------

    // Update an order's existing information
    devUpdatedOrder: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        // Check if the user has admin or developer role
        if (context.user.role === "user") {
          throw new ForbiddenError("You are not authorized to update orders");
        }

        // Find the order by ID
        const order = await Order.findById(args.id);
        if (!order) {
          throw new UserInputError(
            "Order not found or you are not authorized to update it"
          );
        }

        // Check if the status is being updated to "canceled"
        if (args.status === "canceled" && order.status !== "canceled") {
          // Update the status to "canceled"
          order.status = "canceled";
          await order.save();

          // Retrieve the products in the canceled order
          const productsInOrder = order.products;

          // Update the stock quantities of the products in the canceled order
          const productUpdatesAfterCancellation = productsInOrder.map(
            async (productInOrder) => {
              const { productId, orderQuantity } = productInOrder;
              // Find the product by ID
              const foundProduct = await Product.findById(productId);
              if (!foundProduct) {
                throw new UserInputError(
                  `Product with ID ${productId} not found`
                );
              }

              // Add the canceled order quantity back to the product's stock quantity
              foundProduct.stockQuantity += orderQuantity;
              await foundProduct.save();
            }
          );

          // Wait for all product updates after order cancellation to complete
          await Promise.all(productUpdatesAfterCancellation);
        } else {
          // Update the order with the other provided arguments
          await Order.findByIdAndUpdate(args.id, args);
        }

        return order;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to update order");
        }
      }
    },
  },
};

module.exports = orderResolvers;
