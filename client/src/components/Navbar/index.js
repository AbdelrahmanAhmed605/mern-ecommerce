import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";

import {
  Menu,
  Input,
  Dropdown,
  Button,
  Modal,
  Row,
  Col,
  InputNumber,
  Alert,
  Spin,
} from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  OrderedListOutlined,
  LogoutOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { GET_CART } from "../../utils/queries";
import {
  UPDATE_CART_PROD_QUANTITY,
  REMOVE_PROD_FROM_CART,
} from "../../utils/mutations";
import AuthService from "../../utils/auth";

import UserForm from "../UserForm";
import {
  useLoginStatusStore,
  useSignUpAndLoginStore,
} from "../../store/userStore";

const { Search } = Input;

const Navbar = () => {
  const navigate = useNavigate();
  // State for checking the user's screen size
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  // store for checking the users logged in status
  const isLoggedIn = useLoginStatusStore((state) => state.isLoggedIn);
  // store for checking the visibility of the sign up/login modal
  const userFormVisibility = useSignUpAndLoginStore(
    (state) => state.userFormVisibility
  );
  // store for setting the visiblity of the sign up/login modal
  const setUserFormVisibility = useSignUpAndLoginStore(
    (state) => state.setUserFormVisibility
  );

  // Query to get shopping cart data
  const {
    loading: cartLoading,
    data: cartData,
    error: cartError,
    refetch: cartRefetch,
  } = useQuery(GET_CART);
  const cart = cartData?.cart || [];

  // mutation to change the quanitity of a product in the shopping cart
  const [
    updateProdQuantity,
    {error: prodQuantityError },
  ] = useMutation(UPDATE_CART_PROD_QUANTITY);

  // mutation to remove a product in the shopping cart
  const [
    removeProduct,
    { loading: removeProductLoading, error: removeProductError },
  ] = useMutation(REMOVE_PROD_FROM_CART);

  const handleSearch = (searchTerm) => {
    navigate(`/products/${searchTerm}`);
  };

  // useEffect hook to refetch userReviewData when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      cartRefetch();
    }
  }, [isLoggedIn, cartRefetch]);

  useEffect(() => {
    // Function to handle window resize event
    const handleResize = () => {
      setWindowSize(window.innerWidth);
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to allow user to log out of their account
  const handleLogout = () => {
    AuthService.logout();
  };

  // Function to display the User Form to allow users to sign up/login
  const handleUserForm = async () => {
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
      cartRefetch();
    }
  };

  // Allows user to remove a product from their shopping cart
  const handleRemoveProduct = (productId) => {
    removeProduct({ variables: { productId: productId } });
  };

  // Allows the user to change the quantity of a product in their shopping cart
  // Handler for changing the quantity of a product in the cart
  const handleQuantityChange = (newQuantity, productId) => {
    updateProdQuantity({
      variables: { productId: productId, quantity: newQuantity },
    });
  };

  // Menu options for user actions (e.g., account settings, user orders, logout)
  const userMenu = (
    <Menu>
      {/* User settings option */}
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        {/* Link to the user settings page */}
        <Link
          to="/user/profile"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Settings
        </Link>
      </Menu.Item>
      {/* My Orders option */}
      <Menu.Item key="orders" icon={<OrderedListOutlined />}>
        {/* Link to the user's orders page */}
        <Link
          to="/user/orders"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          My Orders
        </Link>
      </Menu.Item>
      {/* Logout option */}
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: "16px" }}>
      <Row gutter={[16, 16]} align="middle">
        <Col span={8}>
          <Link
            to="/"
            style={{
              color: "inherit",
              textDecoration: "none",
              fontSize: "18px",
            }}
          >
            Shop All
          </Link>
        </Col>
        <Col xs={16} sm={16} md={16} lg={8}>
          <Search
            placeholder="Search for products"
            enterButton
            style={{ width: "100%" }}
            onSearch={handleSearch}
          />
        </Col>
        <Col xs={24} sm={24} md={16} lg={8} style={{ textAlign: "right" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: windowSize >= 992 ? "flex-end" : "flex-start",
            }}
          >
            {/* User icon and User dropdown menu */}
            {/* If the user is logged in then display the user menu options */}
            {isLoggedIn ? (
              <Dropdown overlay={userMenu} trigger={["hover"]}>
                <UserOutlined
                  style={{
                    fontSize: "22px",
                    marginRight: "20px",
                    cursor: "pointer",
                  }}
                />
              </Dropdown>
            ) : (
              // If the user is not logged in, don't display user options and instead place a button that opens up the user form
              <Button
                type="primary"
                icon={<UserOutlined />}
                style={{ marginRight: "20px" }}
                onClick={() => handleUserForm()}
              >
                Signup/Login
              </Button>
            )}

            {/* Shopping cart icon and dropdown */}
            <Dropdown
              overlay={
                // Only allow the dropdown for larger screens as it covers a large portion of the screen for smaller devices which could distract users
                windowSize >= 768 ? (
                  <>
                    {isLoggedIn ? (
                      // If the user is logged in, display the user's cart total amount, and cart products and their quantities
                      <div
                        style={{
                          width: "400px",
                          padding: "16px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          background: "#fff",
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          {cartLoading && (
                            <div
                              style={{ textAlign: "center", marginTop: "20px" }}
                            >
                              <Spin spinning={true} size="large" />
                              <p>Loading your shopping cart...</p>
                            </div>
                          )}
                          {cartError && (
                            <Alert
                              message="Error"
                              description="Failed to fetch your shopping cart. Please try again later."
                              type="error"
                              showIcon
                              style={{ marginBottom: "16px" }}
                            />
                          )}
                          {cart && cart.products && cart.products.length > 0 ? (
                            // Render each product in the cart
                            cart.products.map((item) => (
                              <div
                                key={item.product._id}
                                style={{
                                  display: "flex",
                                  marginBottom: "16px",
                                  alignItems: "center",
                                }}
                              >
                                {/* Product image */}
                                <Link to={`/product/${item.product._id}`}>
                                  <img
                                    src={item.product.image}
                                    alt={item.product.title}
                                    style={{
                                      width: "80px",
                                      marginRight: "16px",
                                      objectFit: "contain",
                                    }}
                                  />
                                </Link>
                                <div>
                                  {/* Product title */}
                                  <p
                                    style={{
                                      fontWeight: "bold",
                                      fontSize: "18px",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    {item.product.title}
                                  </p>
                                  {/* Product quantity and dropwdown to allow user to change quantity */}
                                  <div style={{ marginBottom: "4px" }}>
                                    <span style={{ fontWeight: "bold" }}>
                                      Price: ${item.product.price}
                                    </span>{" "}
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <span
                                        style={{
                                          marginRight: "8px",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        Quantity:
                                      </span>
                                      <InputNumber
                                        min={1}
                                        value={item.quantity}
                                        style={{ fontSize: "18px" }}
                                        formatter={(value) => `${value}`}
                                        parser={(value) => parseInt(value)}
                                        onChange={(value) =>
                                          handleQuantityChange(
                                            value,
                                            item.product._id
                                          )
                                        }
                                        addonBefore={
                                          <Button
                                            shape="circle"
                                            icon={<MinusOutlined />}
                                            onClick={() =>
                                              handleQuantityChange(
                                                item.quantity - 1,
                                                item.product._id
                                              )
                                            }
                                            disabled={item.quantity <= 1}
                                          />
                                        }
                                        addonAfter={
                                          <Button
                                            shape="circle"
                                            icon={<PlusOutlined />}
                                            onClick={() =>
                                              handleQuantityChange(
                                                item.quantity + 1,
                                                item.product._id
                                              )
                                            }
                                          />
                                        }
                                      />
                                    </div>
                                    {prodQuantityError && (
                                      <Alert
                                        message="Error"
                                        description="Failed to update the quantity of the product. Please try again later."
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: "16px" }}
                                      />
                                    )}
                                  </div>
                                  {/* Total price of the product including quantity of the product */}
                                  <p style={{ marginBottom: "4px" }}>
                                    Total: ${item.product.price * item.quantity}
                                  </p>
                                  {/* Button to remove the product from the cart */}
                                  <Button
                                    type="primary"
                                    style={{ marginBottom: "8px" }}
                                    onClick={() =>
                                      handleRemoveProduct(item.product._id)
                                    }
                                    danger
                                    loading={removeProductLoading}
                                  >
                                    Remove Product
                                  </Button>
                                  {removeProductError && (
                                    <Alert
                                      message="Error"
                                      description="Failed to delete the review. Please try again later."
                                      type="error"
                                      showIcon
                                      style={{ marginBottom: "16px" }}
                                    />
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            // Rendered when the cart is empty
                            <p style={{ fontWeight: "bold", fontSize: "18px" }}>
                              Your cart is empty
                            </p>
                          )}
                        </div>
                        {/* Order Value */}
                        {cart && (
                          <p style={{ marginTop: "16px" }}>
                            Order Value: ${cart.totalPrice}
                          </p>
                        )}
                        {/* Buttons to take user to checkout page or view their shopping cart in a different page */}
                        <div style={{ marginTop: "16px" }}>
                          {cart && cart.products && cart.products.length > 0 ? (
                            <Link to={"/checkout"}>
                              <Button
                                type="primary"
                                style={{ marginBottom: "8px" }}
                              >
                                Checkout
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              type="primary"
                              style={{ marginBottom: "8px" }}
                              disabled
                            >
                              Checkout
                            </Button>
                          )}
                          <Link to={"/user/cart"}>
                            <Button style={{ backgroundColor: "#fff" }}>
                              Shopping Bag
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      // Rendered when the user is not logged in
                      <div
                        style={{
                          width: "400px",
                          padding: "16px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          background: "#fff",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <p style={{ fontWeight: "bold", fontSize: "18px" }}>
                          Please sign up or login to view your cart
                        </p>
                        <Button
                          type="primary"
                          style={{ marginTop: "16px" }}
                          onClick={() => {
                            handleUserForm();
                          }}
                        >
                          Signup/Login
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <></>
                )
              }
              trigger={["hover"]}
            >
              {/* Cart icon and number identifying how many products are in the cart */}
              <Link
                to={`/user/cart`}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <div className="cart-icon">
                  <ShoppingCartOutlined
                    style={{ fontSize: "22px", cursor: "pointer" }}
                  />
                  {cart && cart.products && cart.products.length > 0 && (
                    <span>{cart.products.length}</span>
                  )}
                </div>
              </Link>
            </Dropdown>

            <Modal
              title="Login"
              visible={userFormVisibility}
              onCancel={() => setUserFormVisibility(false)}
              footer={null}
            >
              <UserForm />
            </Modal>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Navbar;
