import React, { useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useParams, Link } from "react-router-dom";

import {
  Row,
  Col,
  Button,
  Rate,
  Pagination,
  message,
  Modal,
  Typography,
  Spin,
  Alert,
} from "antd";
import { ShoppingOutlined } from "@ant-design/icons";

import { GET_PRODUCTS_BY_SEARCH, GET_ME } from "../utils/queries";
import { ADD_PROD_TO_CART, CREATE_CART } from "../utils/mutations";
import AuthService from "../utils/auth";

import { useSignUpAndLoginStore } from "../store/userStore";
import UserForm from "../components/UserForm";

const { Title, Text } = Typography;

const SearchProducts = () => {
  // Retrieve the search term from URL parameters
  const { searchTerm } = useParams();

  // State variables
  const [page, setPage] = useState(1); // Current page number
  const [pageSize, setPageSize] = useState(10); // Number of products per page

  // Retrieve user form visibility state and setter function from the custom store
  const userFormVisibility = useSignUpAndLoginStore(
    (state) => state.userFormVisibility
  );
  const setUserFormVisibility = useSignUpAndLoginStore(
    (state) => state.setUserFormVisibility
  );

  // Query for fetching all categories id's and name
  const {
    loading: searchProductsLoading,
    data: searchProductsData,
    error: searchProductsError,
  } = useQuery(GET_PRODUCTS_BY_SEARCH, {
    variables: {
      searchTerm: searchTerm,
      page,
      pageSize,
    },
  });

  // Lazy Query for fetching the currently logged-in user
  const [fetchCurrentUser] = useLazyQuery(GET_ME);

  // Mutation to create a shopping cart
  const [createCart] = useMutation(CREATE_CART);

  // Mutation to add a product into the shopping cart
  const [
    addProdToCart,
    { loading: addProdToCartLoad, error: addProdToCartError },
  ] = useMutation(ADD_PROD_TO_CART);

  // Retrieve products and total count from the search result data
  const products = searchProductsData?.searchProducts?.products || [];
  const totalProducts = searchProductsData?.searchProducts?.totalProducts || 0;

  // Function to handle adding a product to the cart
  const handleAddToCart = async (productId) => {
    // Check if the user is currently logged in
    if (!AuthService.loggedIn()) {
      setUserFormVisibility(true); // Display the user form or login/signup modal if the user is not logged in

      // Repeatedly check if the user is logged in and only continue with the function once the login is successful
      await new Promise((resolve) => {
        const checkUserInterval = setInterval(() => {
          if (AuthService.loggedIn()) {
            clearInterval(checkUserInterval); // Stop checking the login status
            setUserFormVisibility(false); // Hide the user form or login/signup modal
            resolve(); // Fulfill the promise and resume execution
          }
        }, 500); // Check every 500 milliseconds if the user is logged in
      });
    }

    try {
      const { data } = await fetchCurrentUser(); // Fetch the current user after successful login
      const userData = data;

      // If the user doesn't have a cart, create one
      if (!userData.me.cart) {
        await createCart();
      }

      // Add the product to the cart
      await addProdToCart({
        variables: {
          productId: productId,
          quantity: 1,
        },
      });

      // Show success message or perform further actions
      message.success("Product added to cart");
    } catch (error) {
      // Show error message if an issue occurred during the process
      console.error(error);
      message.error("Failed to add product to cart");
    }
  };

  // Function to handle pagination change
  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <div>
      {/* Search Results Header */}
      <div
        style={{
          backgroundColor: "#d5d0d0",
          padding: "16px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <Title
          level={3}
          style={{
            margin: 0,
            color: "#333",
            fontSize: "24px",
            marginBottom: "8px",
          }}
        >
          Search Results for: {searchTerm}
        </Title>
      </div>

      {/* Loading State */}
      {searchProductsLoading && (
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Spin size="large" />
        </div>
      )}

      {/* Error State */}
      {searchProductsError && (
        <Alert
          message="Error"
          description="Failed to fetch search results. Please try again later."
          type="error"
          showIcon
          style={{ marginBottom: "24px" }}
        />
      )}

      {/* Products */}
      {products.length > 0 ? (
        <>
          <Row gutter={[16, 16]} justify="center">
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                <div
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    padding: "16px",
                    textAlign: "center",
                    backgroundColor: "#fff",
                  }}
                >
                  <Link
                    to={`/product/${product._id}`}
                    style={{
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        cursor: "pointer",
                        marginBottom: "16px",
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          alignItems: "center",
                        }}
                      >
                        <Title
                          level={5}
                          style={{ marginBottom: "0", fontWeight: "bold" }}
                        >
                          {product.title}
                        </Title>
                        <Text
                          strong
                          style={{ marginBottom: "0", fontWeight: "bold" }}
                        >
                          ${product.price}
                        </Text>
                      </div>
                      <div style={{ marginBottom: "4px" }}>
                        <Rate
                          allowHalf
                          disabled
                          defaultValue={product.averageRating || 0}
                          style={{ color: "#ffd700", marginRight: "8px" }}
                        />
                        <span>({product.reviews.length})</span>
                      </div>
                    </div>
                  </Link>
                  <Button
                    type="primary"
                    shape="round"
                    size="large"
                    icon={<ShoppingOutlined />}
                    onClick={() => handleAddToCart(product._id)}
                    style={{ width: "100%" }}
                    loading={addProdToCartLoad}
                    disabled={addProdToCartLoad || addProdToCartError}
                  >
                    {addProdToCartLoad ? "Adding to Cart" : "Add to Cart"}
                  </Button>
                  {addProdToCartError && (
                    <Alert
                      message="Error"
                      description="Failed to add product to cart. Please try again later."
                      type="error"
                      showIcon
                      style={{ marginTop: "8px" }}
                    />
                  )}
                </div>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <Pagination
            current={page}
            pageSize={pageSize}
            total={totalProducts}
            onChange={handlePaginationChange}
            style={{ marginTop: "24px", textAlign: "center" }}
          />
        </>
      ) : (
        // Message displays when there are no search results
        <div
          style={{
            padding: "16px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <Title level={4}>
            Sorry, no results were found for: {searchTerm}
          </Title>
        </div>
      )}

      {/* User Login Modal */}
      <Modal
        title="Login"
        visible={userFormVisibility}
        onCancel={() => setUserFormVisibility(false)}
        footer={null}
      >
        <UserForm />
      </Modal>
    </div>
  );
};

export default SearchProducts;
