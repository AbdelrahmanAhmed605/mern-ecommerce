import React, { useState, useEffect } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import {
  GET_FILTERED_PRODUCTS,
  GET_CATEGORIES,
  GET_ME,
} from "../utils/queries";
import { CREATE_CART, ADD_PROD_TO_CART } from "../utils/mutations";
import AuthService from "../utils/auth";
import UserForm from "../components/UserForm";
import FilterOptions from "../components/HomeFilters";

import {
  Row,
  Col,
  Typography,
  Button,
  Rate,
  Space,
  Dropdown,
  Menu,
  Checkbox,
  InputNumber,
  Modal,
  message,
  Pagination,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
const { Title } = Typography;

const Home = () => {
  // State variables for selected filter options
  const [selectedCategories, setSelectedCategories] = useState([]); // Stores selected category IDs
  const [minPrice, setMinPrice] = useState(undefined); // Stores minimum price value
  const [maxPrice, setMaxPrice] = useState(undefined); // Stores maximum price value
  const [minRating, setMinRating] = useState(undefined); // Stores minimum rating value
  const [maxRating, setMaxRating] = useState(undefined); // Stores maximum rating value
  const [sortOption, setSortOption] = useState(undefined); // Stores selected sort option
  const [isUserFormVisible, setIsUserFormVisible] = useState(false); // Controls login/sign up form visibility
  const [page, setPage] = useState(1); // Current page number
  const [pageSize, setPageSize] = useState(10); // Number of products per page

  // Query for fetching all categories id's and name
  const {
    loading: categoriesLoading,
    data: categoriesData,
    refetch: categoriesRefetch,
  } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  // Lazy Query for fetching all products based off a set of optional input parameters
  const [
    fetchProductsByFilter,
    { loading: filteredProdLoad, data: filteredProdData },
  ] = useLazyQuery(GET_FILTERED_PRODUCTS);

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

  // Fetch filtered products when user selected filter options change
  useEffect(() => {
    fetchProductsByFilter({
      variables: {
        categoryIds: selectedCategories,
        minPrice,
        maxPrice,
        minRating,
        maxRating,
        sortOption,
        page,
        pageSize,
      },
    });
  }, [
    selectedCategories,
    minPrice,
    maxPrice,
    minRating,
    maxRating,
    sortOption,
    page,
    pageSize,
    fetchProductsByFilter,
  ]);

  // Adds a product to the user's shopping cart. Handles user authentication, cart creation, and product addition.
  // Displays appropriate messages for success and failure.
  const handleAddToCart = async (productId) => {
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
          quantity: 1,
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

  // Function to handle pagination change
  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  // ---------- Event handlers for filter options ----------

  // Toggles the users selection of categories in the dropdown
  const handleCategoryMenuClick = (item) => {
    const itemId = item._id;
    setSelectedCategories((prevSelectedCategories) => {
      if (prevSelectedCategories.includes(itemId)) {
        return prevSelectedCategories.filter((id) => id !== itemId); // Remove selected category
      } else {
        return [...prevSelectedCategories, itemId]; // Add selected category
      }
    });
  };

  // Sets the users selected sorting option
  const handleSortMenuClick = (item) => {
    setSortOption(item.key);
  };

  // Resets the users selected filtering options
  const handleCategoryReset = () => {
    setSelectedCategories([]);
  };
  const handlePriceReset = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };
  const handleRatingReset = () => {
    setMinRating(undefined);
    setMaxRating(undefined);
  };

  // Array containing the products that will be presented on the page after applying filters
  const displayedProducts = filteredProdData?.filteredProducts?.products || [];
  const totalProducts = filteredProdData?.filteredProducts?.numProducts || 0;

  // Rendered component
  return (
    <div>
      <div
        style={{
          backgroundImage: `url('https://media.istockphoto.com/id/1395567847/photo/girl-in-an-oversized-hoodie-wearing-wireless-headphones-face-in-profile-neon-pink-and-blue.jpg?s=170667a&w=0&k=20&c=EFy1iYwswqz-Dhl8T7PxoLF2pIpJllhi7PM1f8M9zF8=')`,
          backgroundSize: "cover",
          backgroundPosition: "20% 30%",
          backgroundRepeat: "no-repeat",
          height: "300px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      />

      <Title level={1} style={{ textAlign: "center", marginBottom: "32px" }}>
        New Arrivals
      </Title>

      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <FilterOptions
          categories={categories}
          selectedCategories={selectedCategories}
          handleCategoryMenuClick={handleCategoryMenuClick}
          handleCategoryReset={handleCategoryReset}
          minPrice={minPrice}
          maxPrice={maxPrice}
          handlePriceReset={handlePriceReset}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          minRating={minRating}
          maxRating={maxRating}
          handleRatingReset={handleRatingReset}
          setMinRating={setMinRating}
          setMaxRating={setMaxRating}
          sortOption={sortOption}
          handleSortMenuClick={handleSortMenuClick}
        />
      </div>

      <Row gutter={[16, 16]} justify="center">
        {displayedProducts.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
            <div
              style={{
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "16px",
                textAlign: "center",
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
                    }}
                  >
                    <h3 style={{ marginBottom: "4px", fontWeight: "bold" }}>
                      {product.title}
                    </h3>
                    <p style={{ marginBottom: "4px", fontWeight: "bold" }}>
                      ${product.price}
                    </p>
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
                size="small"
                onClick={() => handleAddToCart(product._id)}
                style={{ width: "100%" }}
              >
                Add to Cart
              </Button>
            </div>
          </Col>
        ))}
      </Row>
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalProducts}
        onChange={handlePaginationChange}
        style={{ marginTop: "24px", textAlign: "center" }}
      />
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

export default Home;
