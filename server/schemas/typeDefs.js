const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Auth {
    token: String!
    user: User
  }

  type User {
    _id: ID!
    role: String! 
    username: String!
    firstName: String!
    lastName: String!
    email: String!
    address: String!
    phone: String!
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    _id: ID!
    title: String!
    averageRating: Float!
    description: String!
    price: Float!
    quantity: Int!
    image: String!
    categories: [Category!]!
    user: User
    reviews: [Review!]!
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    _id: ID!
    name: String!
  }

  type Cart {
    _id: ID!
    user: User!
    products: [CartProduct!]!
    totalPrice: Float!
    createdAt: String!
    updatedAt: String!
  }

  type CartProduct {
    product: Product!
    quantity: Int!
  }

  type Order {
    _id: ID!
    user: User!
    products: [OrderProduct!]!
    totalAmount: Float!
    address: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type OrderProduct {
    product: Product!
    quantity: Int!
  }

  type Review {
    _id: ID!
    user: User!
    product: Product!
    rating: Float!
    comment: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    me: User
    allUsers: [User!]!
    singleUser(userId: ID!): User

    products(page: Int, pageSize: Int): [Product!]!
    product(id: ID!): Product
    productsByUser(userId: ID!, page: Int, pageSize: Int): [Product!]!
    productsByCategory(
      categoryIds: [ID!]
      page: Int
      pageSize: Int
    ): [Product!]!
    productsByPriceRange(
      minPrice: Float!
      maxPrice: Float!
      page: Int
      pageSize: Int
    ): [Product!]!
    productsByReviewRating(
      minRating: Float!
      maxRating: Float!
      page: Int
      pageSize: Int
    ): [Product!]!

    categories: [Category!]!
    category(id: ID!): Category

    cart: Cart

    order(id: ID!): Order
    ordersByUser(page: Int, pageSize: Int): [Order!]!
    developerOrder(orderId: ID!): Order

    reviewsByUser(userId: ID!, page: Int, pageSize: Int): [Review!]!
  }
  type Mutation {
    login(usernameOrEmail: String!, password: String!): Auth

    createUser(
      role: String!
      username: String!
      firstName: String!
      lastName: String!
      email: String!
      address: String!
      phone: String!
    ): Auth

    updateUser(
      username: String
      firstName: String
      lastName: String
      email: String
      address: String
      phone: String
    ): User

    deleteUser: User

    createProduct(
      title: String!
      description: String!
      price: Float!
      quantity: Int!
      image: String!
      categories: [ID!]!
    ): Product

    updateProduct(
      id: ID!
      title: String
      description: String
      price: Float
      quantity: Int
      image: String
      categories: [ID!]
    ): Product

    deleteProduct(id: ID!): Product

    createCategory(name: String!): Category
    updateCategory(id: ID!, name: String): Category
    deleteCategory(id: ID!): Category

    createCart(): Cart
    addToCart(cartId: ID!, productId: ID!, quantity: Int!): Cart
    removeFromCart(cartId: ID!, productId: ID!): Cart
    updateCartProductQuantity(cartId: ID!, productId: ID!, quantity: Int!): Cart
    deleteCart(id: ID!): Cart

    createOrder(
      products: [OrderProductInput!]!
      totalAmount: Float!
      address: String!
      status: String!
    ): Order

    updateOrder(
      id: ID!
      products: [OrderProductInput!]
      totalAmount: Float
      address: String
      status: String
      userId: ID!
    ): Order

    createReview(
      productId: ID!
      rating: Float!
      comment: String!
    ): Review

    updateReview(id: ID!, rating: Float, comment: String): Review
    deleteReview(id: ID!): Review
  }

  input OrderProductInput {
    productId: ID!
    quantity: Int!
  }
`;

module.exports = typeDefs;
