import { gql } from "@apollo/client";

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

export const DELETE_USER = gql`
  mutation DeleteUser {
    deleteUser {
      _id
      email
      username
    }
  }
`;

export const CREATE_CART = gql`
  mutation CreateCart {
    createCart {
      _id
      totalPrice
    }
  }
`;

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

export const RESET_CART = gql`
  mutation ResetCart {
    resetCart {
      _id
      totalPrice
    }
  }
`;

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

export const DELETE_REVIEW = gql`
  mutation DeleteReview($deleteReviewId: ID!) {
    deleteReview(id: $deleteReviewId) {
      _id
      comment
    }
  }
`;
