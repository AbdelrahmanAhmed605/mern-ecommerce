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
      stockQuantity
      averageRating
      reviews {
        _id
      }
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
      stockQuantity
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

export const GET_FILTERED_PRODUCTS = gql`
  query FilteredProducts(
    $categoryIds: [ID!]
    $minPrice: Float
    $maxPrice: Float
    $minRating: Float
    $maxRating: Float
    $sortOption: String
    $page: Int
    $pageSize: Int
  ) {
    filteredProducts(
      categoryIds: $categoryIds
      minPrice: $minPrice
      maxPrice: $maxPrice
      minRating: $minRating
      maxRating: $maxRating
      sortOption: $sortOption
      page: $page
      pageSize: $pageSize
    ) {
      products {
        _id
        title
        price
        image
        stockQuantity
        averageRating
        reviews {
          _id
        }
      }
      totalProducts
    }
  }
`;

export const GET_PRODUCTS_BY_SEARCH = gql`
  query SearchProducts($searchTerm: String!, $page: Int, $pageSize: Int) {
    searchProducts(searchTerm: $searchTerm, page: $page, pageSize: $pageSize) {
      products {
        _id
        title
        price
        image
        stockQuantity
        averageRating
        reviews {
          _id
        }
      }
      totalProducts
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
      stockQuantity
      averageRating
      reviews {
        _id
      }
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
          stockQuantity
        }
        quantity
      }
      totalPrice
    }
  }
`;

// Query to get the user's orders
export const GET_ORDERS_BY_USER = gql`
  query OrdersByUser($page: Int, $pageSize: Int) {
    ordersByUser(page: $page, pageSize: $pageSize) {
      orders {
        _id
        address {
          city
          postalCode
          state
          street
        }
        createdAt
        email
        name
        products {
          orderQuantity
          productId {
            _id
            title
            price
            image
          }
        }
        status
        totalAmount
        updatedAt
      }
      totalOrders
    }
  }
`;

// Query to get a single order by ID
export const GET_ORDER = gql`
  query Order($orderId: ID!) {
    order(id: $orderId) {
      _id
      email
      name
      address {
        street
        state
        city
        postalCode
      }
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

// Query to get reviews for a specific product
export const GET_REVIEWS_FOR_PRODUCT = gql`
  query ReviewForProducts($productId: ID!, $page: Int, $pageSize: Int) {
    reviewForProducts(productId: $productId, page: $page, pageSize: $pageSize) {
      reviews {
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
      totalReviews
    }
  }
`;

export const GET_USER_PRODUCT_REVIEW = gql`
  query UserProductReview($productId: ID!) {
    userProductReview(productId: $productId) {
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
