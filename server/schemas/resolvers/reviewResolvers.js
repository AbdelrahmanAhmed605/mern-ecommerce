const {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} = require("apollo-server-errors");
const { Review, Product } = require("../../models");

// Helper function to update the average rating of a product
const updateProductAverageRating = async (productId) => {
  const product = await Product.findById(productId).populate("reviews");

  if (!product) {
    throw new UserInputError("Product not found");
  }

  // Calculate the average rating
  if (product.reviews.length > 0) {
    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    product.averageRating = totalRating / product.reviews.length;
  } else {
    product.averageRating = 0; // No reviews, set average rating to 0
  }

  await product.save();
};

const reviewResolvers = {
  Query: {
    // Resolver for fetching reviews by user ID
    reviewsByUser: async (parent, { userId, page = 1, pageSize = 10 }) => {
      try {
        const skip = (page - 1) * pageSize;
        const reviews = await Review.find({ user: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize) // Retrieve only the specified number of reviews per page
          .populate("user")
          .populate("product");
        return reviews;
      } catch (error) {
        throw new Error("Failed to fetch reviews");
      }
    },

    // Resolver for fetching a user's review for a specific product ID
    userProductReview: async (parent, { productId }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const review = await Review.findOne({
          product: productId,
          user: context.user._id,
        })
          .populate("user")
          .populate("product");

        return review;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        } else {
          throw new Error("Failed to fetch review");
        }
      }
    },

    // Resolver for fetching reviews by product ID
    reviewForProducts: async (
      parent,
      { productId, page = 1, pageSize = 10 }
    ) => {
      try {
        const skip = (page - 1) * pageSize;
        let reviews = await Review.find({ product: productId })
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(pageSize)
          .populate("user")
          .populate("product");

        const totalReviews = await Review.countDocuments({
          product: productId,
        });

        return { reviews, totalReviews };
      } catch (error) {
        throw new Error("Failed to fetch reviews");
      }
    },

    // ---------- FOR DEVELOPER AND ADMIN USE -----------

    developerReview: async (parent, { reviewId }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        // Check if the user has admin or developer role
        if (context.user.role === "user") {
          throw new ForbiddenError(
            "You are not authorized to view this review"
          );
        }

        const review = await Review.findById(reviewId)
          .populate("user")
          .populate("product");

        if (!review) {
          throw new UserInputError("Review not found");
        }

        return review;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to fetch review");
        }
      }
    },
  },
  Mutation: {
    // Create a user review for a product
    createReview: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Check if the user has already reviewed the product
        const existingReview = await Review.findOne({
          product: args.productId,
          user: context.user._id,
        });
        if (existingReview) {
          throw new UserInputError("You have already reviewed this product.");
        }

        // Create a review with the provided arguments and assign it to the authenticated user
        const review = await Review.create({
          ...args,
          product: args.productId,
          user: context.user._id,
        });

        // Add the review to the product's reviews array
        const product = await Product.findByIdAndUpdate(
          args.productId,
          { $push: { reviews: review._id } },
          { new: true }
        );

        // Update the product's average rating
        await updateProductAverageRating(args.productId);

        return review;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to create review");
        }
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
          throw new UserInputError(
            "Review not found or you are not authorized to update it"
          );
        }

        // Update the product's average rating
        await updateProductAverageRating(review.product);

        return review;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to update review");
        }
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
          throw new UserInputError(
            "Review not found or you are not authorized to delete it"
          );
        }

        // Add the review to the product's reviews array
        const product = await Product.findByIdAndUpdate(
          review.product,
          { $pull: { reviews: review._id } },
          { new: true }
        );

        // Update the product's average rating
        await updateProductAverageRating(review.product);

        return review;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to delete review");
        }
      }
    },

    // ---------- FOR DEVELOPER AND ADMIN USE ----------

    // Allow developers and admins to delete user's reviews
    developerDeleteReview: async (parent, { reviewId }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        // Check if the user has admin or developer role
        if (context.user.role === "user") {
          throw new ForbiddenError("You are not authorized to delete reviews");
        }

        // Find and delete the review matching the provided ID
        const review = await Review.findOneAndDelete({
          _id: reviewId,
        });
        if (!review) {
          throw new UserInputError(
            "Review not found or you are not authorized to delete it"
          );
        }

        // Add the review to the product's reviews array
        const product = await Product.findByIdAndUpdate(
          review.product,
          { $pull: { reviews: review._id } },
          { new: true }
        );

        // Update the product's average rating
        await updateProductAverageRating(review.product);

        return review;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof ForbiddenError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to delete review");
        }
      }
    },
  },
};

module.exports.updateProductAverageRating = updateProductAverageRating;

module.exports.reviewResolvers = reviewResolvers;
