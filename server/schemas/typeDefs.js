const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Auth {
    token: String!
    user: User
  }

  type User {
    _id: ID!
    username: String!
    firstName: String!
    lastName: String!
    email: String!
    address: String!
    phone: String!
    cart: Cart!
    orders: [Order!]!
    reviews: [Review!]!
    products: [Product!]!
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    _id: ID!
    title: String!
    description: String!
    price: Float!
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

    products: [Product!]!
    product(id: ID!): Product
    productsByUser(userId: ID!): [Product!]!
    productsByCategory(categoryIds: [ID!]): [Product!]!
    productsByPriceRange(minPrice: Float!, maxPrice: Float!): [Product!]!
    productsByReviewRating(rating: Float!): [Product!]!

    categories: [Category!]!
    category(id: ID!): Category

    cart(id: ID!): Cart
    cartByUser(userId: ID!): Cart

    order(id: ID!): Order
    ordersByUser(userId: ID!): [Order!]!

    review(id: ID!): Review
    reviewsByUser(userId: ID!): [Review!]!
  }
  type Mutation {
    login(email: String!, password: String!): Auth

    createUser(
      username: String!
      firstName: String!
      lastName: String!
      email: String!
      address: String!
      phone: String!
    ): Auth

    updateUser(
      id: ID!
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
      image: String!
      categories: [ID!]!
      userId: ID
    ): Product

    updateProduct(
      id: ID!
      title: String
      description: String
      price: Float
      image: String
      categories: [ID!]
      userId: ID
    ): Product

    deleteProduct(id: ID!): Product

    createCategory(name: String!): Category
    updateCategory(id: ID!, name: String): Category
    deleteCategory(id: ID!): Category

    createCart(userId: ID!): Cart
    addToCart(cartId: ID!, productId: ID!, quantity: Int!): Cart
    removeFromCart(cartId: ID!, productId: ID!): Cart
    updateCartProductQuantity(cartId: ID!, productId: ID!, quantity: Int!): Cart
    deleteCart(id: ID!): Cart

    createOrder(
      userId: ID!
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
    ): Order

    deleteOrder(id: ID!): Order

    createReview(
      userId: ID!
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
