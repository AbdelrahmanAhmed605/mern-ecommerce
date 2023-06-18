const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Added index to improve query performance when searching for orders by a particular user
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // Stores the quantity of a particular product in the order (in case the user buys multiple quantities of the same product)
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered"], // Status can only have the values "pending", "shipped", or "delivered"
      default: "pending", // Default status is "pending" if not specified
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);
module.exports = Order;