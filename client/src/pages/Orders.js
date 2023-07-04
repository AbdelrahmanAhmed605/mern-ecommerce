import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import {
  Spin,
  Result,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Divider,
  Pagination,
  Tag,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { GET_ORDERS_BY_USER } from "../utils/queries";
import formatDateTime from "../utils/helper";
import AuthService from "../utils/auth";

const { Title, Text } = Typography;

const Orders = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // State variable to keep track of the current page

  // Fetch order details using the useQuery hook
  const {
    loading: ordersLoading,
    data: ordersData,
    error: ordersError,
    refetch,
  } = useQuery(GET_ORDERS_BY_USER, {
    variables: {
      page: currentPage, // Use the currentPage state variable as the initial page value
      pageSize: 4,
    },
  });

  // Extract the order object from the fetched data, or initialize an empty array if it doesn't exist
  const orders = ordersData?.ordersByUser?.orders || [];
  const totalOrders = ordersData?.ordersByUser?.totalOrders || 0;

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page); // Update the currentPage state variable
    refetch({ page, pageSize });
  };

  // Define colors for different order statuses
  const statusColors = {
    pending: "#faad14",
    shipped: "#1890ff",
    delivered: "#52c41a",
    canceled: "#f5222d",
  };

  // Check if the user is accessing the page while logged out and display a message to inform them they must be logged in
  if (!AuthService.loggedIn()) {
    return (
      <div style={{ textAlign: "center", fontSize: "18px", marginTop: "20px" }}>
        <Spin spinning={true} size="large" />
        <p>Please log in to view your orders</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>My Orders</Title>
      {orders && ordersLoading ? (
        <div
          style={{ textAlign: "center", fontSize: "18px", marginTop: "20px" }}
        >
          <Spin size="large" />
        </div>
      ) : orders && ordersError ? (
        <Result status="error" title="Error loading orders" />
      ) : (
        <>
          {orders && orders.length === 0 ? (
            <Result
              status="info"
              title="You have no orders yet"
              extra={<Link to="/">Start shopping</Link>}
            />
          ) : (
            <>
              <Row gutter={[16, 16]} justify="center">
                {orders.map((order) => (
                  <Col key={order._id} xs={24} sm={12} md={8} lg={6}>
                    <Link to={`/confirmation/${order._id}`} target="_blank">
                      <Card
                        style={{
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Title level={4} style={{ marginBottom: "12px" }}>
                            {order.name}
                          </Title>
                          <Text strong>Order ID: </Text>
                          <Text>{order._id}</Text> {/* Display the order ID */}
                          <Divider style={{ margin: "16px 0" }} />
                          <Text strong>Date Ordered: </Text>
                          <Text>{formatDateTime(order.createdAt)}</Text>
                          <br />
                          <Text strong>Last Updated: </Text>
                          <Text>{formatDateTime(order.updatedAt)}</Text>
                          <Divider style={{ margin: "16px 0" }} />
                          <Text strong>Products:</Text>
                          {order.products.map((product) => (
                            <div
                              key={product.productId._id}
                              style={{ marginTop: "16px" }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  margin: "8px 0",
                                }}
                              >
                                <Avatar src={product.productId.image} />
                                <Text style={{ marginLeft: "8px" }}>
                                  {product.productId.title}
                                </Text>
                              </div>
                              <div>
                                <Text strong>Quantity: </Text>
                                <Text>{product.orderQuantity}</Text>
                              </div>
                              <div>
                                <Text strong>Price: </Text>
                                <Text>${product.productId.price}</Text>
                              </div>
                              <Divider style={{ margin: "8px 0" }} />
                            </div>
                          ))}
                          <Text strong>Total Amount: </Text>
                          <Text>${order.totalAmount}</Text>
                        </div>
                        <div>
                          <Divider style={{ margin: "16px 0" }} />
                          <Text strong>Status: </Text>
                          <Tag
                            color={statusColors[order.status]}
                            style={{ marginTop: "16px" }}
                          >
                            {order.status}
                          </Tag>
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
              <Pagination
                current={currentPage}
                total={totalOrders}
                pageSize={4}
                onChange={handlePageChange}
                style={{ marginTop: "24px", textAlign: "center" }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
