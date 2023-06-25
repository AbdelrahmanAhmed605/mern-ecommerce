const { Schema, model, Types } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "developer", "admin"],
      default: "user",
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username '{VALUE}' already exists."],
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [20, "Username must be less than 20 characters long"],
      validate: {
        validator: (value) => /^[a-zA-Z0-9_.-]+$/.test(value),
        message:
          "Username can only contain letters, numbers, underscores, dashes, and periods",
      },
      index: true,
    },
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
      required: [true, "Email is required"],
      unique: [true, "Email '{VALUE}' already exists."],
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Must use a valid email address",
      },
      index: true,
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
      unique: [true, "Phone Number '{VALUE}' already exists."],
      validate: {
        validator: (value) => {
          // Custom validation: Check if the value is a valid mobile phone number
          return validator.isMobilePhone(value);
        },
        message: "Please enter a valid phone number",
      },
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
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

// ---------- PLUGINS ----------

// Apply the uniqueValidator plugin to the userSchema
userSchema.plugin(uniqueValidator);

const User = model("User", userSchema);

module.exports = User;
