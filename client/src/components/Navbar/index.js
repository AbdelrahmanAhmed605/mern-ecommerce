import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { GET_CATEGORIES, GET_CART } from "../../utils/queries";
import {
  UPDATE_CART_PROD_QUANTITY,
  REMOVE_PROD_FROM_CART,
} from "../../utils/mutations";
import UserForm from "../UserForm";
import AuthService from "../../utils/auth";
import { Menu, Input, Dropdown, Button, Modal } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  OrderedListOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
const { Search } = Input;

const Navbar = () => {
  const navigate = useNavigate();
  // State for showing/hiding the shopping cart
  const [cartVisible, setCartVisible] = useState(false);
  // State for showing/hiding the user form (login/signup modal)
  const [isUserFormVisible, setIsUserFormVisible] = useState(false);

  // Query to get categories data
  const { loading: categoriesLoading, data: categoriesData } =
    useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  // Query to get shopping cart data
  const {
    loading: cartLoading,
    data: cartData,
    refetch: cartRefetch,
  } = useQuery(GET_CART);
  const cart = cartData?.cart || [];

  // mutation to change the quanitity of a product in the shopping cart
  const [
    updateProdQuantity,
    { loading: prodQuantityLoading, error: prodQuantityError },
  ] = useMutation(UPDATE_CART_PROD_QUANTITY);

  // mutation to remove a product in the shopping cart
  const [
    removeProduct,
    { loading: removeProductLoading, error: removeProductError },
  ] = useMutation(REMOVE_PROD_FROM_CART);

  const handleSearch = (searchTerm) => {
    navigate(`/products/${searchTerm}`);
  };

  // Function to allow user to log out of their account
  const handleLogout = () => {
    AuthService.logout();
  };

  // Function to display the User Form to allow users to sign up/login
  const handleUserForm = async () => {
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
      cartRefetch();
    }
  };

  // Allows user to remove a product from their shopping cart
  const handleRemoveProduct = (productId) => {
    removeProduct({ variables: { productId: productId } });
  };

  // Allows the user to change the quantity of a product in their shopping cart
  const handleUpdateProdQuantity = async (event, item) => {
    const newQuantity = parseInt(event.target.value);
    updateProdQuantity({
      variables: {
        productId: item.product._id,
        quantity: newQuantity,
      },
    });
  };

  // Turns on the visibility of the cart dropdown to allow the user to see it
  const handleCartDropdownOpen = () => {
    setCartVisible(true);
  };
  // Turns off the visibility of the cart dropdown to hide it from the user
  const handleCartDropdownClose = () => {
    setCartVisible(false);
  };

  // Menu list displaying all categories
  const categoriesMenu = (
    <Menu>
      {categories &&
        categories.map((category) => (
          // Each category item in the menu
          <Menu.Item key={category.id}>
            {/* Link to the category page */}
            <Link
              to={`/categories/${category.id}`}
              style={{
                color: "inherit",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              {category.name}
            </Link>
          </Menu.Item>
        ))}
    </Menu>
  );

  // Menu options for user actions (e.g., account settings, user orders, logout)
  const userMenu = (
    <Menu>
      {/* User settings option */}
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        {/* Link to the user settings page */}
        <Link
          to="/user/settings"
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div>
        {/* Link to the home page */}
        <Link
          to="/"
          style={{
            color: "inherit",
            textDecoration: "none",
            fontSize: "18px",
            marginRight: "20px",
          }}
        >
          Shop
        </Link>

        {/* Dropdown menu for categories */}
        <Dropdown overlay={categoriesMenu} trigger={["hover"]}>
          <Link
            to="#"
            style={{
              color: "inherit",
              textDecoration: "none",
              fontSize: "18px",
            }}
          >
            Categories <DownOutlined />
          </Link>
        </Dropdown>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Search input*/}
        <Search
          placeholder="Search"
          enterButton
          style={{ marginRight: "20px", width: "200px" }}
          onSearch={handleSearch}
        />

        {/* User icon and User dropdown menu */}
        {/* If the user is logged in then display the user menu options */}
        {AuthService.loggedIn() ? (
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
            // If the user is logged in, display the user's cart total amount, and cart products and their quantities
            AuthService.loggedIn() ? (
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
                onMouseEnter={handleCartDropdownOpen}
                onMouseLeave={handleCartDropdownClose}
              >
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
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
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          style={{
                            width: "80px",
                            marginRight: "16px",
                            objectFit: "contain",
                          }}
                        />
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
                          <p style={{ marginBottom: "4px" }}>
                            <span style={{ fontWeight: "bold" }}>
                              Price: ${item.product.price}
                            </span>{" "}
                            (Quantity:{" "}
                            <select
                              value={item.quantity}
                              style={{ marginLeft: "8px" }}
                              onChange={(event) =>
                                handleUpdateProdQuantity(event, item)
                              }
                            >
                              {/* Generate quantity options from 1 to 10 */}
                              {Array.from({ length: 10 }, (_, index) => (
                                <option key={index + 1} value={index + 1}>
                                  {index + 1}
                                </option>
                              ))}
                            </select>
                            )
                          </p>
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
                          >
                            Remove Product
                          </Button>
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
                  <Button type="primary" style={{ marginBottom: "8px" }}>
                    Checkout
                  </Button>
                  <Button style={{ backgroundColor: "#fff" }}>
                    Shopping Bag
                  </Button>
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
                    setCartVisible(false);
                    handleUserForm();
                  }}
                >
                  Signup/Login
                </Button>
              </div>
            )
          }
          trigger={["hover"]}
        >
          {/* Cart icon and number identifying how many products are in the cart */}
          <div className="cart-icon">
            <ShoppingCartOutlined
              style={{ fontSize: "22px", cursor: "pointer" }}
            />
            {cart && cart.products && cart.products.length > 0 && (
              <span>{cart.products.length}</span>
            )}
          </div>
        </Dropdown>

        <Modal
          title="Login"
          visible={isUserFormVisible}
          onCancel={() => setIsUserFormVisible(false)}
          footer={null}
        >
          <UserForm />
        </Modal>
      </div>
    </div>
  );
};

export default Navbar;
