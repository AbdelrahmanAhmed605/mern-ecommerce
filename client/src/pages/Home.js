import React, { useState, useEffect } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

import {
  Row,
  Col,
  Typography,
  Button,
  Rate,
  Modal,
  message,
  Pagination,
  Spin,
  Alert,
} from "antd";
import { ShoppingOutlined } from "@ant-design/icons";

import {
  GET_FILTERED_PRODUCTS,
  GET_CATEGORIES,
  GET_ME,
  GET_CATEGORY,
} from "../utils/queries";
import { CREATE_CART, ADD_PROD_TO_CART } from "../utils/mutations";
import AuthService from "../utils/auth";

import UserForm from "../components/UserForm";
import FilterOptions from "../components/HomeFilters";
import { useSignUpAndLoginStore } from "../store/userStore";
import { useCartCreatedStore } from "../store/cartStore";

const { Title } = Typography;

const Home = () => {
  // State variables for selected filter options
  const [selectedCategories, setSelectedCategories] = useState([]); // Stores selected category IDs
  const [categoryNames, setCategoryNames] = useState(new Set()); // Stores selected category names
  const [minPrice, setMinPrice] = useState(undefined); // Stores minimum price value
  const [maxPrice, setMaxPrice] = useState(undefined); // Stores maximum price value
  const [minRating, setMinRating] = useState(undefined); // Stores minimum rating value
  const [maxRating, setMaxRating] = useState(undefined); // Stores maximum rating value
  const [sortOption, setSortOption] = useState(undefined); // Stores selected sort option
  const [page, setPage] = useState(1); // Current page number
  const [pageSize, setPageSize] = useState(12); // Number of products per page

  // Use react-responsive to determine screen size
  const isPhone = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isLaptop = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isMonitor = useMediaQuery({ minWidth: 1280 });

  // Set the backgroundSize for the cover image based on screen size
  let backgroundSize;
  if (isPhone || isTablet) {
    backgroundSize = "cover";
  } else if (isLaptop) {
    backgroundSize = "80% auto";
  } else if (isMonitor) {
    backgroundSize = "30% auto";
  }

  // store for checking the visibility of the sign up/login modal
  const userFormVisibility = useSignUpAndLoginStore(
    (state) => state.userFormVisibility
  );
  // store for setting the visiblity of the sign up/login modal
  const setUserFormVisibility = useSignUpAndLoginStore(
    (state) => state.setUserFormVisibility
  );
  // store for getting the cartCreated status which checks if a cart was just created
  const cartCreated = useCartCreatedStore((state) => state.cartCreated);
  // store for setting the cartCreated status
  const setCartCreated = useCartCreatedStore((state) => state.setCartCreated);

  // Query for fetching all categories id's and name
  const {
    loading: categoriesLoading,
    error: categoriesError,
    data: categoriesData,
  } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  // Query for fetching a specific category by its id
  const [getCategory, { loading: categoryLoading, error: categoryError }] =
    useLazyQuery(GET_CATEGORY);

  // Lazy Query for fetching all products based off a set of optional input parameters
  const [
    fetchProductsByFilter,
    {
      loading: filteredProdLoad,
      data: filteredProdData,
      error: filteredProdError,
      refetch: refetchProducts,
    },
  ] = useLazyQuery(GET_FILTERED_PRODUCTS, {
    pollInterval: 5000, // Interval for re-fetching data every 5000ms (5 seconds)
  });

  // Lazy Query for fetching the currently logged in user
  const [fetchCurrentUser, { refetch: refetchUser }] = useLazyQuery(GET_ME);

  // mutation to create a shopping cart
  const [createCart] = useMutation(CREATE_CART);

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

  // Refetches the data if there is any change (this is as a fallback option to the pollInterval)
  useEffect(() => {
    refetchProducts();
  }, [filteredProdData, refetchProducts]);

  // Fetches the names of selected categories and updates the categoryNames state
  useEffect(() => {
    const fetchCategoryNames = async () => {
      const newCategoryNames = new Set();

      for (const categoryId of selectedCategories) {
        const { data } = await getCategory({ variables: { categoryId } });
        const categoryName = data?.category?.name || "Category Not Found";
        newCategoryNames.add(categoryName);
      }

      setCategoryNames(newCategoryNames);
    };
    fetchCategoryNames();
  }, [getCategory, selectedCategories]);

  // Adds a product to the user's shopping cart. Handles user authentication, cart creation, and product addition.
  // Displays appropriate messages for success and failure.
  const handleAddToCart = async (productId) => {
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
        await refetchUser();
        setCartCreated(true);
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
    handlePaginationChange(1, pageSize);
  };

  // Resets the users selected filtering options
  const handleCategoryReset = () => {
    setSelectedCategories([]);
    setCategoryNames([]);
    handlePaginationChange(1, pageSize);
  };
  const handlePriceReset = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    handlePaginationChange(1, pageSize);
  };
  const handleRatingReset = () => {
    setMinRating(undefined);
    setMaxRating(undefined);
    handlePaginationChange(1, pageSize);
  };
  const handleResetAll = () => {
    setSelectedCategories([]);
    setCategoryNames([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setMaxRating(undefined);
    handlePaginationChange(1, pageSize);
  };

  // Array containing the products that will be presented on the page after applying filters
  const displayedProducts = filteredProdData?.filteredProducts?.products || [];
  const totalProducts = filteredProdData?.filteredProducts?.totalProducts || 0;

  // Rendered component
  return (
    <div>
      <div
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1591785944213-c8b5b7a75ec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80)`,
          backgroundSize: backgroundSize,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "300px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      />

      {/* Render the title using the fetched category name if available */}
      <Title level={1} style={{ textAlign: "center", marginBottom: "30px" }}>
        {selectedCategories.length > 0 ? (
          categoryLoading ? (
            "Loading..."
          ) : categoryError ? (
            "Error"
          ) : (
            <>
              {Array.from(categoryNames).map((categoryName, index) => (
                <React.Fragment key={categoryName}>
                  <span>{categoryName}</span>
                  {index < categoryNames.size - 1 && <span>, </span>}
                </React.Fragment>
              ))}
            </>
          )
        ) : (
          "All Products"
        )}
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
          handleResetAll={handleResetAll}
          handlePaginationChange={handlePaginationChange}
          pageSize={pageSize}
        />
      </div>

      {categoriesLoading ? ( // Display a loading spinner while categories are being fetched
        <Spin size="large" />
      ) : categoriesError ? ( // Display an error message if an error occurred while fetching categories
        <Alert
          message="Error"
          description="Failed to fetch categories. Please try again later."
          type="error"
          showIcon
        />
      ) : (
        <Row gutter={[16, 16]} justify="center">
          {filteredProdLoad ? ( // Display a loading spinner while products are being fetched
            <Spin size="large" />
          ) : filteredProdError ? ( // Display an error message if an error occurred while fetching products
            <Alert
              message="Error"
              description="Failed to fetch products. Please try again later."
              type="error"
              showIcon
            />
          ) : (
            displayedProducts.map((product) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={product._id}
                style={{ display: "flex" }}
              >
                <div
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    padding: "16px",
                    textAlign: "center",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
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
                          width: "70%",
                          borderRadius: "8px",
                        }}
                      />
                      <div style={{ margin: "20px 0px 10px 0px" }}>
                        <Typography.Text strong style={{ fontSize: "24px" }}>
                          ${product.price}
                        </Typography.Text>
                      </div>
                      <Title
                        level={5}
                        style={{ marginBottom: "4px", fontWeight: "bold" }}
                      >
                        {product.title}
                      </Title>
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
                  {product.stockQuantity <= 20 && product.stockQuantity > 0 && (
                    <div style={{ margin: "20px 0" }}>
                      <Typography.Text type="danger">
                        Product almost out of stock! Only{" "}
                        {product.stockQuantity} left.
                      </Typography.Text>
                    </div>
                  )}
                  {product.stockQuantity <= 0 && (
                    <div style={{ margin: "20px 0" }}>
                      <Typography.Text type="danger">
                        Product out of stock!
                      </Typography.Text>
                    </div>
                  )}
                  <Button
                    type="primary"
                    shape="round"
                    size="large"
                    icon={<ShoppingOutlined />}
                    onClick={() => handleAddToCart(product._id)}
                    style={{ width: "100%" }}
                    loading={addProdToCartLoad} // Display a loading state when adding a product to the cart
                    disabled={addProdToCartLoad || addProdToCartError} // Disable the button if there's an ongoing request or error
                  >
                    {addProdToCartLoad ? "Adding to Cart" : "Add to Cart"}
                  </Button>
                  {addProdToCartError && (
                    // Display an error message if there was an error adding the product to the cart
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
            ))
          )}
        </Row>
      )}
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalProducts}
        onChange={handlePaginationChange}
        style={{ marginTop: "24px", textAlign: "center", fontSize: "25px" }}
      />
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

export default Home;
