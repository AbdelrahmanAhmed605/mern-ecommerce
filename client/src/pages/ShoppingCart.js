import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button, InputNumber, Table, Space, Spin } from "antd";
import { Link } from "react-router-dom";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import {
  REMOVE_PROD_FROM_CART,
  UPDATE_CART_PROD_QUANTITY,
} from "../utils/mutations";
import { GET_CART } from "../utils/queries";

const ShoppingCart = () => {
  const [prodQuantity, setProdQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    loading: cartLoading,
    error: cartError,
    data: cartData,
  } = useQuery(GET_CART);
  const cart = cartData?.cart || [];

  const [
    removeProduct,
    { loading: removeProductLoading, error: removeProductError },
  ] = useMutation(REMOVE_PROD_FROM_CART);

  const [
    updateProductQuantity,
    {
      loading: updateProductQuantityLoading,
      error: updateProductQuantityError,
    },
  ] = useMutation(UPDATE_CART_PROD_QUANTITY);

  const handleRemoveProduct = (productId) => {
    removeProduct({ variables: { productId: productId } });
  };

  useEffect(() => {
    if (cartData && cartData.cart) {
      setTotalPrice(cartData.cart.totalPrice);
    }
  }, [cartData]);

  const handleQuantityChange = (value, productId) => {
    setProdQuantity(value);
    updateProductQuantity({
      variables: { productId: productId, quantity: value },
    });
  };

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
          style={{ marginLeft: "8px", marginRight: "8px", fontSize: "18px" }}
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
        <Table
          dataSource={cart.products.map((item) => ({
            ...item.product,
            quantity: item.quantity,
          }))}
          columns={columns}
          rowKey={(record) => record._id}
          pagination={false}
        />
      )}
      <div style={{ marginTop: "20px" }}>
        <h3>Total Cart Price: ${totalPrice}</h3>
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
