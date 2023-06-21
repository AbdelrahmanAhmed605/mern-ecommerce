const {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} = require("apollo-server-errors");
const { Category, Product } = require("../../models");

const categoryResolvers = {
  Query: {
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
    category: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        const category = await Category.findById(id);
        if (!category) {
          throw new UserInputError("Category not found");
        }
        return category;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError
        ) {
          throw error;
        } else {
          throw new Error("Failed to fetch category");
        }
      }
    },
  },
  Mutation: {
    // ---------- FOR DEVELOPER AND ADMIN USE ----------
      
    // Create a new category
    createCategory: async (parent, { name }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        if (context.user.role === "user") {
          throw new ForbiddenError(
            "You are not authorized to create categories"
          );
        }

        const category = await Category.create({ name });
        return category;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to create category");
        }
      }
    },

    // Update an existing category
    updateCategory: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        if (context.user.role === "user") {
          throw new ForbiddenError(
            "Only admin or developer users can update categories"
          );
        }

        const category = await Category.findByIdAndUpdate(args.id, args, {
          new: true,
        });
        if (!category) {
          throw new UserInputError(
            "Category not found or you are not authorized to update it"
          );
        }

        return category;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to update category");
        }
      }
    },

    // Delete an existing category
    deleteCategory: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }

        if (context.user.role === "user") {
          throw new ForbiddenError(
            "Only admin or developer users can delete categories"
          );
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
          throw new UserInputError(
            "Category not found or you are not authorized to delete it"
          );
        }

        // Remove the deleted category from products that contain it
        await Product.updateMany(
          { categories: category._id },
          { $pull: { categories: category._id } }
        );

        return category;
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof UserInputError ||
          error instanceof ForbiddenError
        ) {
          throw error;
        } else {
          throw new Error("Failed to delete category");
        }
      }
    },
  },
};

module.exports = categoryResolvers;
