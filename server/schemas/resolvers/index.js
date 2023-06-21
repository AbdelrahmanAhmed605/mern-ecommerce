const { merge } = require("lodash");
const userResolvers = require("./userResolvers");
const productResolvers = require("./productResolvers");
const categoryResolvers = require("./categoryResolvers");
const cartResolvers = require("./cartResolvers");
const orderResolvers = require("./orderResolvers");
const {
  reviewResolvers,
  updateProductAverageRating,
} = require("./reviewResolvers");

updateProductAverageRating;

const resolvers = merge(
  userResolvers,
  productResolvers,
  categoryResolvers,
  cartResolvers,
  orderResolvers,
  reviewResolvers
);

module.exports = resolvers;
