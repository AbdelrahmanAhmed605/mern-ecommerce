import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

import {
  Button,
  InputNumber,
  Table,
  Space,
  Spin,
  Alert,
  Typography,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

import {
  REMOVE_PROD_FROM_CART,
  UPDATE_CART_PROD_QUANTITY,
} from "../utils/mutations";
import { GET_CART } from "../utils/queries";
import AuthService from "../utils/auth";

// Component for displaying the shopping cart
const ShoppingCart = () => {
  // Query for retrieving the cart data
  const {
    loading: cartLoading,
    error: cartError,
    data: cartData,
  } = useQuery(GET_CART, {
    pollInterval: 5000, // Interval for re-fetching data every 5000ms (5 seconds)
  });
  const cart = cartData?.cart || []; // Extracts the cart from the query data

  // Mutation for removing a product from the cart
  const [
    removeProduct,
    { loading: removeProductLoading, error: removeProductError },
  ] = useMutation(REMOVE_PROD_FROM_CART);

  // Mutation for updating the quantity of a product in the cart
  const [
    updateProductQuantity,
    {
      loading: updateProductQuantityLoading,
      error: updateProductQuantityError,
    },
  ] = useMutation(UPDATE_CART_PROD_QUANTITY);

  // Handler for removing a product from the cart
  const handleRemoveProduct = (productId) => {
    removeProduct({ variables: { productId: productId } });
  };

  // Handler for changing the quantity of a product in the cart
  const handleQuantityChange = (value, productId) => {
    updateProductQuantity({
      variables: { productId: productId, quantity: value },
    });
  };

  // Check if the user is accessing the page while logged out and display a message to inform them they must be logged in
  if (!AuthService.loggedIn()) {
    return (
      <div style={{ textAlign: "center", fontSize: "18px", marginTop: "20px" }}>
        <Spin spinning={true} size="large" />
        <p>Please log in to view your shopping cart</p>
      </div>
    );
  }

  // Table columns for displaying the items in the cart
  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image, record) => (
        <Link to={`/product/${record._id}`}>
          <img
            src={image}
            alt="Product"
            style={{ width: "50px", height: "50px" }}
          />
        </Link>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Link to={`/product/${record._id}`}>
          <div>{title}</div>
          <div>Product ID: {record._id}</div>
        </Link>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <>
          <InputNumber
            min={1}
            max={record.stockQuantity}
            value={quantity}
            style={{
              width: "200px",
              marginLeft: "8px",
              marginRight: "8px",
              fontSize: "18px",
            }}
            formatter={(value) => `${value}`}
            parser={(value) => parseInt(value)}
            onChange={(value) => handleQuantityChange(value, record._id)}
            addonBefore={
              <Button
                shape="circle"
                icon={<MinusOutlined />}
                onClick={() => handleQuantityChange(quantity - 1, record._id)}
                disabled={quantity <= 1}
              />
            }
            addonAfter={
              <Button
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => handleQuantityChange(quantity + 1, record._id)}
                disabled={quantity >= record.stockQuantity}
              />
            }
          />
          {record.stockQuantity <= 20 && record.stockQuantity > 0 && (
            <div style={{ marginTop: "8px" }}>
              <Typography.Text type="danger">
                Product almost out of stock! Only {record.stockQuantity} left.
              </Typography.Text>
            </div>
          )}
          {record.stockQuantity <= 0 && (
            <div style={{ marginTop: "8px" }}>
              <Typography.Text type="danger">
                Product out of stock!
              </Typography.Text>
            </div>
          )}
        </>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price}`,
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (text, record) => `$${record.price * record.quantity}`,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button
          type="primary"
          danger
          onClick={() => handleRemoveProduct(record._id)}
          loading={removeProductLoading} // Display a loading state when removing a product
          disabled={removeProductLoading || removeProductError} // Disable the button if there's an ongoing request or error
        >
          Remove Product
        </Button>
      ),
    },
  ];

  return (
    <>
      {cartLoading && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin spinning={true} size="large" />
          <p>Loading cart...</p>
        </div>
      )}
      {cartError && (
        <Alert
          message="Error"
          description="Failed to load the cart. Please try again later."
          type="error"
          showIcon
          style={{ marginTop: "8px" }}
        />
      )}
      {updateProductQuantityError && (
        <Alert
          message="Error"
          description="Failed to update the quantity of the product. Please try again later."
          type="error"
          showIcon
          style={{ marginTop: "8px" }}
        />
      )}
      {removeProductError && (
        <Alert
          message="Error"
          description="Failed to remove the product. Please try again later."
          type="error"
          showIcon
          style={{ marginTop: "8px" }}
        />
      )}
      {cart && cart.products && (
        // Create a table with the cart's data source and display the data as rendered in the "columns" variable
        <Table
          dataSource={cart.products.map((item) => ({
            ...item.product,
            quantity: item.quantity,
          }))}
          columns={columns}
          rowKey={(record) => record._id}
          pagination={false}
          scroll={{ x: true }} // Enable horizontal scrolling
          loading={updateProductQuantityLoading} // Display a loading state when updating the quantity of a product
        />
      )}

      <div style={{ marginTop: "20px" }}>
        {cart && cart.products ? (
          <h3>Total Cart Price: ${cart.totalPrice}</h3>
        ) : (
          <h3>Total Cart Price: $0</h3>
        )}
        <Space>
          {cart && cart.products && cart.products.length > 0 ? (
            <Link to={"/checkout"}>
              <Button type="primary" style={{ marginBottom: "8px" }}>
                Checkout
              </Button>
            </Link>
          ) : (
            <Button type="primary" style={{ marginBottom: "8px" }} disabled>
              Checkout
            </Button>
          )}
        </Space>
      </div>
    </>
  );
};

export default ShoppingCart;
