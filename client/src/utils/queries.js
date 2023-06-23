import { gql } from "@apollo/client";

// These queries correspond to the query definitions in the Apollo Server.

// Query to get the currently logged-in user
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

// Query to get a single user by ID
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

// Query to get all products
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

// Query to get a single product by ID
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

// Query to get products by user
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

// Query to get products by category
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

// Query to get products by price range
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

// Query to get products by review rating
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

// Query to get all categories
export const GET_CATEGORIES = gql`
  query Categories {
    categories {
      _id
      name
    }
  }
`;

// Query to get a single category by ID
export const GET_CATEGORY = gql`
  query Category($categoryId: ID!) {
    category(id: $categoryId) {
      _id
      name
    }
  }
`;

// Query to get the user's shopping cart
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

// Query to get the user's orders
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

// Query to get a single order by ID
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

// Query to get reviews made by a user
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
