import { gql } from "@apollo/client";

export const GET_ME = gql`
  query Me {
    me {
      _id
      email
      username
      cart {
        _id
      }
    }
  }
`;

export const GET_USER = gql`
  query SingleUser($userId: ID!) {
    singleUser(userId: $userId) {
      _id
      username
      firstName
      lastName
    }
  }
`;

export const GET_PRODUCTS = gql`
  query Products {
    products {
      _id
      title
      price
      image
      averageRating
    }
  }
`;

export const GET_SINGLE_PRODUCT = gql`
  query Product($productId: ID!) {
    product(id: $productId) {
      _id
      title
      description
      image
      price
      averageRating
      categories {
        _id
        name
      }
      reviews {
        _id
        comment
      }
      user {
        _id
        username
      }
    }
  }
`;

export const GET_PRODUCTS_BY_USER = gql`
  query ProductsByUser($userId: ID!) {
    productsByUser(userId: $userId) {
      _id
      title
      price
      image
      averageRating
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory {
    productsByCategory {
      _id
      title
      price
      image
      averageRating
    }
  }
`;

export const GET_PRODUCTS_BY_PRICE_RANGE = gql`
  query ProductsByPriceRange($minPrice: Float!, $maxPrice: Float!) {
    productsByPriceRange(minPrice: $minPrice, maxPrice: $maxPrice) {
      _id
      title
      price
      image
      averageRating
    }
  }
`;

export const GET_PRODUCTS_BY_REVIEW_RATING = gql`
  query ProductsByReviewRating($minRating: Float!, $maxRating: Float!) {
    productsByReviewRating(minRating: $minRating, maxRating: $maxRating) {
      _id
      title
      price
      image
      averageRating
    }
  }
`;

export const GET_CATEGORIES = gql`
  query Categories {
    categories {
      _id
      name
    }
  }
`;

export const GET_CATEGORY = gql`
  query Category($categoryId: ID!) {
    category(id: $categoryId) {
      _id
      name
    }
  }
`;

export const GET_CART = gql`
  query Category {
    cart {
      _id
      products {
        product {
          _id
          title
          price
          image
        }
        quantity
      }
      totalPrice
    }
  }
`;

export const GET_ORDERS_BY_USER = gql`
  query OrdersByUser {
    ordersByUser {
      _id
      address
      products {
        productId {
          _id
          title
          price
          image
        }
        orderQuantity
      }
      totalAmount
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDER = gql`
  query Order($orderId: ID!) {
    order(id: $orderId) {
      _id
      address
      products {
        productId {
          _id
          title
          image
          price
        }
        orderQuantity
      }
      status
      totalAmount
      createdAt
      updatedAt
    }
  }
`;

export const GET_REVIEWS_BY_USER = gql`
  query ReviewsByUser($userId: ID!) {
    reviewsByUser(userId: $userId) {
      _id
      comment
      rating
      createdAt
      updatedAt
      product {
        _id
        title
      }
      user {
        _id
        username
      }
    }
  }
`;
