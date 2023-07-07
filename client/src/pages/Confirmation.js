import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

import { Spin, Alert, Card, Row, Col, Typography, Avatar, Divider } from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import { GET_ORDER } from "../utils/queries";
import AuthService from "../utils/auth";
import formatDateTime from "../utils/helper";

const { Title, Text } = Typography;

const Confirmation = () => {
  // Get the orderId from the URL parameters
  const { orderId } = useParams();

  // Fetch order details using the useQuery hook
  const {
    loading: orderLoading,
    data: orderData,
    error: orderError,
  } = useQuery(GET_ORDER, {
    variables: {
      orderId: orderId, // Pass the orderId as a variable to the query
    },
  });

  // Check if the user is accessing the page while logged out and display a message to inform them they must be logged in
  if (!AuthService.loggedIn()) {
    return (
      <div style={{ textAlign: "center", fontSize: "18px", marginTop: "20px" }}>
        <Spin spinning={true} size="large" />
        <p>Please log in to view the checkout</p>
      </div>
    );
  }

  // If the order is still loading, display a loading spinner
  if (orderLoading) {
    return <Spin size="large" />;
  }

  // If there's an error fetching the order details, display an error message
  if (orderError) {
    return (
      <Alert
        message="Error"
        description="Failed to fetch order details. Please try again later."
        type="error"
        showIcon
        style={{ marginTop: "8px" }}
      />
    );
  }

  // Extract the order object from the fetched data, or initialize an empty object if it doesn't exist
  const order = orderData?.order || {};

  // Define colors for different order statuses
  const statusColors = {
    pending: "#faad14",
    shipped: "#1890ff",
    delivered: "#52c41a",
    canceled: "#f5222d",
  };

  return (
    <Card>
      <Title level={3} style={{ marginBottom: "24px" }}>
        Order Confirmation
      </Title>
      <Divider />
      <Row gutter={[16, 24]}>
        {/* Display Order ID */}
        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Order ID:
          </Text>{" "}
          <Text>{order._id}</Text>
        </Col>
        {/* Display Name */}
        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Name:
          </Text>{" "}
          <Text>{order.name}</Text>
        </Col>
        {/* Display Email */}
        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Email:
          </Text>{" "}
          <Text>{order.email}</Text>
        </Col>
        {/* Display Shipping Address */}
        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Shipping Address:
          </Text>
          <div>
            <EnvironmentOutlined
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
            <Text>{order.address.street}</Text>
          </div>
          <div>
            <EnvironmentOutlined
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
            <Text>
              {order.address.city}, {order.address.state}{" "}
              {order.address.postalCode}
            </Text>
          </div>
        </Col>
        {/* Display Order Details */}
        <Col xs={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Order Details:
          </Text>
          <Row gutter={[4, 4]} style={{ marginTop: "16px" }}>
            {order.products.map((product) => (
              <Col key={product.productId._id} xs={24} sm={12} md={8}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {product.productId.title}
                  </div>
                  <div>
                    <Avatar
                      src={product.productId.image}
                      alt={product.productId.title}
                      size={80}
                      style={{ marginTop: "8px" }}
                    />
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <Text>Quantity: {product.orderQuantity}</Text>
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <Text>Price: ${product.productId.price}</Text>
                  </div>
                  <Divider />
                </div>
              </Col>
            ))}
          </Row>
        </Col>
        {/* Display Total Amount */}
        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Total Amount:
          </Text>{" "}
          <Text>${order.totalAmount}</Text>
        </Col>
        {/* Display Order Status */}
        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Status:
          </Text>{" "}
          <Text style={{ color: statusColors[order.status] }}>
            {order.status}
          </Text>
        </Col>
        {/* Display Order Placed Time */}
        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Order Placed:
          </Text>{" "}
          <ClockCircleOutlined
            style={{ marginRight: "8px", color: "#1890ff" }}
          />
          <Text>{formatDateTime(order.createdAt)}</Text>
        </Col>
        {/* Display Last Updated Time */}
        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: "18px" }}>
            Last Updated:
          </Text>{" "}
          <ClockCircleOutlined
            style={{ marginRight: "8px", color: "#1890ff" }}
          />
          <Text>{formatDateTime(order.updatedAt)}</Text>
        </Col>
      </Row>
    </Card>
  );
};

export default Confirmation;
