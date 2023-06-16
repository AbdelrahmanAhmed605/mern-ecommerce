const { Schema, model, Types } = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Must use a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          // ensures the passord is more than 8 characters and contains a special character
          return (
            value.length >= 8 && /[~`!@#$%^&*()-_+=,.?'":{}|<>]/.test(value)
          );
        },
        message:
          "Password must be at least 8 characters long and contain a special character",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => {
          // Custom validation: Check if the value is a valid mobile phone number
          return validator.isMobilePhone(value);
        },
        message: "Please enter a valid phone number",
      },
        },
    // stores items in the users shopping cart
    cart: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cart",
      },
        ],
    // stores the users purchased orders
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
        ],
    // stores the users product reviews
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
        ],
    // stores the users uploaded products that they have submitted to the marketplace
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

// ---------- MIDDLEWARE ----------

// Middleware function that is executed before saving a user document.
userSchema.pre("save", async function (next) {
  // Trim leading and trailing spaces from the firstName and lastName fields
  this.firstName = this.firstName.trim();
  this.lastName = this.lastName.trim();

  // encrypts/hashes the user's inputted password using the bcrypt library
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// ---------- SCHEMA METHODS ----------

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);

module.exports = User;
