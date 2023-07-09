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
    email: String!
    cart: Cart
    products: [Product!]
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    _id: ID!
    title: String!
    averageRating: Float
    description: String!
    price: Float!
    stockQuantity: Int!
    image: String!
    categories: [Category!]!
    user: User
    reviews: [Review!]!
    createdAt: String!
    updatedAt: String!
  }

  type productPagination {
    products: [Product!]!
    totalProducts: Int!
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
    name: String!
    email: String!
    totalAmount: Float!
    address: OrderAddress!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type OrderProduct {
    productId: Product!
    orderQuantity: Int!
  }

  type OrderAddress {
    street: String!
    city: String!
    state: String!
    postalCode: String!
  }

  type OrderPagination {
    orders: [Order!]!
    totalOrders: Int!
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

  type ReviewPagination {
    reviews: [Review!]!
    totalReviews: Int!
  }

  type Query {
    me: User
    allUsers: [User!]!
    singleUser(userId: ID!): User

    products(page: Int, pageSize: Int): [Product!]!
    product(id: ID!): Product
    filteredProducts(
      categoryIds: [ID!]
      minPrice: Float
      maxPrice: Float
      minRating: Float
      maxRating: Float
      sortOption: String
      page: Int
      pageSize: Int
    ): productPagination!
    searchProducts(
      searchTerm: String!
      page: Int
      pageSize: Int
    ): productPagination!
    productsByUser(userId: ID!, page: Int, pageSize: Int): [Product!]!

    categories: [Category!]!
    category(id: ID!): Category

    cart: Cart

    order(id: ID!): Order
    ordersByUser(page: Int, pageSize: Int): OrderPagination!
    developerOrder(orderId: ID!): Order

    reviewsByUser(userId: ID!, page: Int, pageSize: Int): [Review!]!
    userProductReview(productId: ID!): Review
    reviewForProducts(
      productId: ID!
      page: Int
      pageSize: Int
    ): ReviewPagination!
    developerReview(reviewId: ID!): Review
  }
  type Mutation {
    login(usernameOrEmail: String!, password: String!): Auth

    createUser(
      role: String!
      username: String!
      password: String!
      email: String!
    ): Auth
    updateUser(newUsername: String, newEmail: String): User
    updateUserPassword(currentPassword: String!, newPassword: String!): User
    deleteUser: User
    adminDeleteUser(userId: ID!): User

    createProduct(
      title: String!
      description: String!
      price: Float!
      stockQuantity: Int!
      image: String!
      categories: [ID!]!
    ): Product
    updateProduct(
      id: ID!
      title: String
      description: String
      price: Float
      stockQuantity: Int
      image: String
      categories: [ID!]
    ): Product
    deleteProduct(id: ID!): Product

    createCategory(name: String!): Category
    updateCategory(id: ID!, name: String): Category
    deleteCategory(id: ID!): Category

    createCart: Cart
    addToCart(productId: ID!, quantity: Int!): Cart
    removeFromCart(productId: ID!): Cart
    updateCartProductQuantity(productId: ID!, quantity: Int!): Cart
    resetCart: Cart

    createOrder(
      name: String!
      email: String!
      products: [OrderProductInput!]!
      totalAmount: Float!
      address: OrderAddressInput!
      status: String!
    ): Order
    updateOrder(orderId: ID!, newStatus: String!): Order
    devUpdatedOrder(
      id: ID!
      name: String
      email: String
      products: [OrderProductInput!]
      totalAmount: Float
      address: OrderAddressInput
      status: String
    ): Order

    createReview(productId: ID!, rating: Float!, comment: String!): Review
    updateReview(id: ID!, rating: Float, comment: String): Review
    deleteReview(id: ID!): Review
    developerDeleteReview(reviewId: ID!): Review
  }

  input OrderProductInput {
    productId: ID!
    orderQuantity: Int!
  }
  input OrderAddressInput {
    street: String!
    city: String!
    state: String!
    postalCode: String!
  }
`;

module.exports = typeDefs;
