const { Schema, model, Types } = require("mongoose");
const validator = require("validator");

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Product name is required"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      validate: {
        validator: (value) => value >= 0,
        message: "Price must be a non-negative value",
      },
    },
    image: {
      type: String,
      validate: {
        validator: (value) => validator.isURL(value),
        message: "Invalid image URL",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

// Pre-save middleware
productSchema.pre("save", async function (next) {
  // Only proceed if the image field is modified
  if (this.isModified("image")) {
    const result = await cloudinary.uploader.upload(this.image); // Upload the image to Cloudinary
    this.image = result.secure_url; // Update the image field with the Cloudinary URL
  }
  next();
});

const Product = model("Product", productSchema);

module.exports = Product;
