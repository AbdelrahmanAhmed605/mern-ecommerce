import { gql } from "@apollo/client";

// These mutations correspond to the mutation definitions in the Apollo Server.

// Mutation for user login
export const LOGIN_USER = gql`
  mutation Login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password) {
      token
      user {
        _id
        email
        username
        role
      }
    }
  }
`;

// Mutation for creating a new user
export const CREATE_USER = gql`
  mutation createUser(
    $role: String!
    $username: String!
    $firstName: String!
    $lastName: String!
    $email: String!
    $address: String!
    $phone: String!
    $password: String!
  ) {
    createUser(
      role: $role
      username: $username
      firstName: $firstName
      lastName: $lastName
      email: $email
      address: $address
      phone: $phone
      password: $password
    ) {
      token
      user {
        _id
        email
        username
      }
    }
  }
`;

// Mutation for updating a user
export const UPDATE_USER = gql`
  mutation UpdateUser(
    $username: String
    $firstName: String
    $lastName: String
    $email: String
    $address: String
    $phone: String
  ) {
    updateUser(
      username: $username
      firstName: $firstName
      lastName: $lastName
      email: $email
      address: $address
      phone: $phone
    ) {
      _id
      email
      username
    }
  }
`;

// Mutation for deleting a user 
export const DELETE_USER = gql`
  mutation DeleteUser {
    deleteUser {
      _id
      email
      username
    }
  }
`;

// Mutation for creating a new cart
export const CREATE_CART = gql`
  mutation CreateCart {
    createCart {
      _id
      totalPrice
    }
  }
`;

// Mutation for adding a product to the cart
export const ADD_PROD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      _id
      products {
        product {
          _id
        }
        quantity
      }
      totalPrice
    }
  }
`;

// Mutation for removing a product from the cart
export const REMOVE_PROD_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      _id
      products {
        quantity
        product {
          _id
        }
      }
      totalPrice
    }
  }
`;

// Mutation for updating the quantity of a product in the cart
export const UPDATE_CART_PROD_QUANTITY = gql`
  mutation UpdateCartProductQuantity($productId: ID!, $quantity: Int!) {
    updateCartProductQuantity(productId: $productId, quantity: $quantity) {
      _id
      totalPrice
      products {
        quantity
        product {
          _id
        }
      }
    }
  }
`;

// Mutation for resetting the cart
export const RESET_CART = gql`
  mutation ResetCart {
    resetCart {
      _id
      totalPrice
    }
  }
`;

// Mutation for creating a new order
export const CREATE_ORDER = gql`
  input OrderProductInput {
    productId: ID!
    orderQuantity: Int!
  }

  mutation CreateOrder(
    $products: [OrderProductInput!]!
    $totalAmount: Float!
    $address: String!
    $status: String!
  ) {
    createOrder(
      products: $products
      totalAmount: $totalAmount
      address: $address
      status: $status
    ) {
      _id
      products {
        orderQuantity
        productId {
          _id
        }
      }
      status
      totalAmount
      user {
        _id
      }
    }
  }
`;

// Mutation for creating a new product review
export const CREATE_REVIEW = gql`
  mutation CreateReview($productId: ID!, $rating: Float!, $comment: String!) {
    createReview(productId: $productId, rating: $rating, comment: $comment) {
      _id
      product {
        _id
      }
      user {
        _id
      }
      comment
      rating
    }
  }
`;

// Mutation for updating a review
export const UPDATE_REVIEW = gql`
  mutation UpdateReview(
    $updateReviewId: ID!
    $rating: Float
    $comment: String
  ) {
    updateReview(id: $updateReviewId, rating: $rating, comment: $comment) {
      _id
      rating
      comment
    }
  }
`;

// Mutation for deleting a review
export const DELETE_REVIEW = gql`
  mutation DeleteReview($deleteReviewId: ID!) {
    deleteReview(id: $deleteReviewId) {
      _id
      comment
    }
  }
`;
