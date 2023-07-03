const { Schema, model } = require("mongoose");
const validator = require("validator");

const orderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
        validate: {
          validator: function (value) {
            return /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(value);
          },
          message: "Invalid postal code format",
        },
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // Stores the quantity of a particular product in the order (in case the user buys multiple quantities of the same product)
        orderQuantity: {
          type: Number,
          default: 1,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "canceled"], // Status can only have the values "pending", "shipped", "delivered", or "canceled"
      default: "pending", // Default status is "pending" if not specified
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  this.name = this.name.toLowerCase(); // Convert the name to lowercase
  next();
});

const Order = model("Order", orderSchema);
module.exports = Order;
