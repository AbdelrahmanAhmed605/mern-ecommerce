import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button, InputNumber, Table, Space, Spin } from "antd";
import { Link } from "react-router-dom";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import {
  REMOVE_PROD_FROM_CART,
  UPDATE_CART_PROD_QUANTITY,
} from "../utils/mutations";
import { GET_CART } from "../utils/queries";

// Component for displaying the shopping cart
const ShoppingCart = () => {
  // Query for retrieving the cart data
  const {
    loading: cartLoading,
    error: cartError,
    data: cartData,
  } = useQuery(GET_CART);
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

  // Table columns for displaying the items in the cart
  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image, record) => (
        <Link to={`/product/${record._id}`} target="_blank">
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
        <Link to={`/product/${record._id}`} target="_blank">
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
        <InputNumber
          min={1}
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
            />
          }
        />
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
        >
          Remove Product
        </Button>
      ),
    },
  ];

  // Conditional rendering based on the cart loading state
  if (cartLoading) return <p>Loading...</p>;
  if (cartError) return <p>Error: {cartError.message}</p>;

  return (
    <>
      {cartLoading && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin spinning={true} size="large" />
          <p>Loading cart...</p>
        </div>
      )}
      {cart && (
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
