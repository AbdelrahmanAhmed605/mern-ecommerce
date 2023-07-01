import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  Row,
  Col,
  Button,
  Rate,
  InputNumber,
  Divider,
  message,
  Modal,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

import { GET_SINGLE_PRODUCT, GET_ME } from "../utils/queries";
import { CREATE_CART, ADD_PROD_TO_CART } from "../utils/mutations";
import AuthService from "../utils/auth";
import UserForm from "../components/UserForm";

const SingleProduct = () => {
  const { productId } = useParams();
  const [prodQuantity, setProdQuantity] = useState(1);
  const [isUserFormVisible, setIsUserFormVisible] = useState(false); // Controls login/sign up form visibility

  const { loading: productLoading, data: productData } = useQuery(
    GET_SINGLE_PRODUCT,
    {
      variables: {
        productId: productId,
      },
    }
  );
  const product = productData?.product || {};

  // Lazy Query for fetching the currently logged in user
  const [
    fetchCurrentUser,
    { loading: currentUserLoading, data: currentUserData },
  ] = useLazyQuery(GET_ME);

  // mutation to create a shopping cart
  const [createCart, { loading: cartLoading, error: cartError }] =
    useMutation(CREATE_CART);

  // mutation to add a product into the shopping cart
  const [
    addProdToCart,
    { loading: addProdToCartLoad, error: addProdToCartError },
  ] = useMutation(ADD_PROD_TO_CART);

  const handleQuantityChange = (value) => {
    setProdQuantity(value);
  };

  // Adds a product to the user's shopping cart. Handles user authentication, cart creation, and product addition.
  // Displays appropriate messages for success and failure.
  const handleAddToCart = async () => {
    // Check if the user is currently logged in
    if (!AuthService.loggedIn()) {
      setIsUserFormVisible(true); // Display the user form or login/signup modal if user is not logged in

      // Repeatedly check if the user is logged in and only continue with the function once the login is successful
      await new Promise((resolve) => {
        const checkUserInterval = setInterval(() => {
          if (AuthService.loggedIn()) {
            clearInterval(checkUserInterval); // Stop checking the login status
            setIsUserFormVisible(false); // Hide the user form or login/signup modal
            resolve(); // Fulfill the promise and resume execution
          }
        }, 500); // Check every 500 milliseconds if the user is logged in
      });
    }

    try {
      const { data } = await fetchCurrentUser(); // Fetch the current user after successful login
      const userData = data;

      // If user doesn't have a cart, create one
      if (!userData.me.cart) {
        await createCart();
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
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "16px", textAlign: "center" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} lg={12}>
          <img
            src={product.image}
            alt={product.title}
            style={{
              width: "100%",
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
                defaultValue={product.averageRating || 0}
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
                  />
                }
              />
            </div>
            <Divider />
            <Button
              type="primary"
              shape="round"
              size="large"
              onClick={handleAddToCart}
              style={{ width: "100%", fontSize: "20px" }}
            >
              Add to Cart
            </Button>
          </div>
        </Col>
      </Row>
      <Modal
        title="Login"
        visible={isUserFormVisible}
        onCancel={() => setIsUserFormVisible(false)}
        footer={null}
      >
        <UserForm />
      </Modal>
    </div>
  );
};

export default SingleProduct;
