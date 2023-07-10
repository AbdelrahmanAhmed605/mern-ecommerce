import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

import {
  Row,
  Col,
  Button,
  Rate,
  InputNumber,
  Divider,
  message,
  Modal,
  Spin,
  Alert,
} from "antd";
import {
  MinusOutlined,
  PlusOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

import { GET_SINGLE_PRODUCT, GET_ME } from "../utils/queries";
import { CREATE_CART, ADD_PROD_TO_CART } from "../utils/mutations";
import AuthService from "../utils/auth";

import UserForm from "../components/UserForm";
import ProductReviews from "../components/productReviews";
import { useSignUpAndLoginStore } from "../store/userStore";
import { useCartCreatedStore } from "../store/cartStore";

const SingleProduct = () => {
  const { productId } = useParams(); // Retrieves the productId from the URL parameters
  const [prodQuantity, setProdQuantity] = useState(1); // Manages the quantity of the product with a default value of 1
  // Retrieves the user form visibility state from the userStore
  const userFormVisibility = useSignUpAndLoginStore(
    (state) => state.userFormVisibility
  );
  // Retrieves the function to set the user form visibility state from the userStore
  const setUserFormVisibility = useSignUpAndLoginStore(
    (state) => state.setUserFormVisibility
  );
  // store for getting the cartCreated status which checks if a cart was just created
  const cartCreated = useCartCreatedStore((state) => state.cartCreated);
  // store for setting the cartCreated status
  const setCartCreated = useCartCreatedStore((state) => state.setCartCreated);

  // Query to get the product data
  const {
    loading: productLoading,
    data: productData,
    error: productError,
    refetch: refetchProduct,
  } = useQuery(GET_SINGLE_PRODUCT, {
    variables: {
      productId: productId,
    },
    pollInterval: 3000, // Interval for re-fetching data every 3000ms (3 seconds)
  });
  const product = productData?.product || {};

  // Lazy Query for fetching the currently logged in user
  const [fetchCurrentUser] = useLazyQuery(GET_ME);

  // mutation to create a shopping cart
  const [createCart] = useMutation(CREATE_CART);

  // mutation to add a product into the shopping cart
  const [
    addProdToCart,
    { loading: addProdToCartLoad, error: addProdToCartError },
  ] = useMutation(ADD_PROD_TO_CART);

  useEffect(() => {
    refetchProduct();
  }, [productData, refetchProduct]);

  // Handles the user changing the quantity of the product they want to add
  const handleQuantityChange = (value) => {
    setProdQuantity(value);
  };

  // Adds a product to the user's shopping cart. Handles user authentication, cart creation, and product addition.
  // Displays appropriate messages for success and failure.
  const handleAddToCart = async () => {
    // Check if the user is currently logged in
    if (!AuthService.loggedIn()) {
      setUserFormVisibility(true); // Display the user form or login/signup modal if user is not logged in

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

      // If user doesn't have a cart or a a new one was not created, then creat one and set the cartCreated status
      // to true so when the user adds another product, we don't have to create a cart again
      if (!userData.me.cart && !cartCreated) {
        await createCart();
        setCartCreated(true); // Changes the cartCreated status to true as this store will be used in other files to refetch the cart once it has been created
      }

      // Add the product to the cart
      await addProdToCart({
        variables: {
          productId: productId,
          quantity: prodQuantity,
        },
      });

      // Success message or further action
      message.success("Product added to cart");
    } catch (error) {
      // Error message if an issue occurred during the process
      console.error(error);
      message.error("Failed to add product to cart");
    }
  };

  if (productLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (productError) {
    return (
      <Alert
        message="Error"
        description="Failed to fetch the product. Please try again later."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: "16px", textAlign: "center" }}>
      {product.stockQuantity <= 20 && product.stockQuantity > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Alert
            message={`Product almost out of stock! Only ${product.stockQuantity} left in stock`}
            type="warning"
            showIcon
            style={{ fontSize: "18px" }}
          />
        </div>
      )}
      {product.stockQuantity <= 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Alert
            message={`Product out of stock!`}
            type="warning"
            showIcon
            style={{ fontSize: "18px" }}
          />
        </div>
      )}
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} lg={12}>
          <img
            src={product.image}
            alt={product.title}
            style={{
              width: "70%",
              maxWidth: "400px",
              borderRadius: "8px",
            }}
          />
        </Col>
        <Col xs={24} lg={12}>
          <div style={{ padding: "16px" }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              {product.title}
            </h2>
            <p style={{ fontSize: "18px", marginBottom: "16px" }}>
              {product.description}
            </p>
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Rate
                allowHalf
                disabled
                value={product.averageRating || 0}
                style={{
                  color: "#ffd700",
                  marginRight: "8px",
                  fontSize: "20px",
                }}
              />
              <span style={{ fontSize: "16px" }}>
                ({product.reviews.length})
              </span>
            </div>
            <Divider />
            <p
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Price: ${product.price}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              Quantity:
              <InputNumber
                min={1}
                max={product.stockQuantity}
                value={prodQuantity}
                style={{
                  marginLeft: "8px",
                  marginRight: "8px",
                  fontSize: "18px",
                }}
                formatter={(value) => `${value}`}
                parser={(value) => parseInt(value)}
                onChange={(value) => handleQuantityChange(value)}
                addonBefore={
                  <Button
                    shape="circle"
                    icon={<MinusOutlined />}
                    onClick={() => handleQuantityChange(prodQuantity - 1)}
                    disabled={prodQuantity <= 1}
                  />
                }
                addonAfter={
                  <Button
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={() => handleQuantityChange(prodQuantity + 1)}
                    disabled={prodQuantity >= product.stockQuantity}
                  />
                }
              />
            </div>
            <Divider />
            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={handleAddToCart}
              style={{ width: "100%", fontSize: "20px" }}
              loading={addProdToCartLoad}
              disabled={addProdToCartLoad || addProdToCartError}
            >
              Add to Cart
            </Button>
            {addProdToCartError && (
              <div style={{ marginTop: "8px" }}>
                <Alert
                  message="Error"
                  description="Failed to add product to cart. Please try again later."
                  type="error"
                  showIcon
                />
              </div>
            )}
          </div>
        </Col>
      </Row>
      <ProductReviews productId={productId} refetchProduct={refetchProduct} />
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

export default SingleProduct;
