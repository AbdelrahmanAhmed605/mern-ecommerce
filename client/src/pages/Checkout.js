import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";

import {
  Row,
  Col,
  Button,
  Form,
  message,
  Collapse,
  Card,
  Input,
  Checkbox,
  Alert,
  Spin,
  Typography,
} from "antd";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { GET_CART } from "../utils/queries";
import {
  CREATE_ORDER,
  UPDATE_ORDER,
  REMOVE_PROD_FROM_CART,
  RESET_CART,
} from "../utils/mutations";
import AuthService from "../utils/auth";

// Create collapsible panels which for content sections to expand and collapse as needed.
const { Panel } = Collapse;

// Load the Stripe library in the background to ensure it is available before rendering the Stripe-related components, such as Elements and CardElement.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Checkout = () => {
  // Shipping information state
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });
  // State for checkbox indicating whether billing info is the same as shipping info
  const [sameAsShipping, setSameAsShipping] = useState(false);
  // State indicating whether the user has completed filling the shipping information
  const [shippingInfoCompleted, setShippingInfoCompleted] = useState(false);
  // Tax Rate applied to product purchase
  const taxRate = 0.05;

  const navigate = useNavigate();

  // Query to get the cart data
  const {
    loading: cartLoading,
    data: cartData,
    error: cartError,
  } = useQuery(GET_CART, {
    pollInterval: 5000, // Interval for re-fetching data every 5000ms (5 seconds)
  });
  const cart = cartData?.cart || [];

  // Form instance for handling form operations
  const [form] = Form.useForm();
  // Stripe instance for handling payment operations
  const stripe = useStripe();
  // Elements instance for working with Stripe Elements
  const elements = useElements();
  // Loading state for displaying loading indicators
  const [loading, setLoading] = useState(false);

  // mutation to add a product into the shopping cart
  const [createOrder, { loading: orderLoading, error: orderError }] =
    useMutation(CREATE_ORDER);

  // mutation to update the status of an error (this will be used to cancel the order if a payment error occurs)
  const [updateOrder] = useMutation(UPDATE_ORDER);

  // mutation to remove a product in the shopping cart
  const [
    removeProduct,
    { loading: removeProductLoading, error: removeProductError },
  ] = useMutation(REMOVE_PROD_FROM_CART);

  // mutation to reset the user's shopping cart and remove all products after they have completed their purchase
  const [resetCart] = useMutation(RESET_CART);

  // Calculate delivery cost based on order value
  const deliveryCost = cart.totalPrice > 100 ? 0 : 10;

  // Calculate total price including order value, delivery cost, and estimated tax
  let totalPrice =
    cart.totalPrice && typeof cart.totalPrice === "number"
      ? cart.totalPrice + deliveryCost + taxRate * cart.totalPrice
      : 0.0;

  // Formats the total price to 2 decimal places to ensure it is in the correct format when sent to the backend for Stripe payment processing
  let formattedTotalPrice = totalPrice.toFixed(2);

  // Validation rules for the postal code field
  const postalCodeValidationRules = [
    {
      required: true,
      message: "Please enter a postal code",
    },
    {
      pattern: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
      message: "Please enter a valid postal code in the format A1A 1A1",
    },
  ];

  // Allows user to remove a product from their shopping cart
  const handleRemoveProduct = async (productId) => {
    await removeProduct({ variables: { productId: productId } });
  };

  // Handle changes the Shipping Information form
  const handleShippingFormChange = (fieldName, value) => {
    // Set shippingInfoCompleted to false to indicate that shipping information is incomplete
    setShippingInfoCompleted(false);
    setShippingInfo((prevShippingInfo) => ({
      ...prevShippingInfo,
      [fieldName]: value,
    }));
  };

  // Handles the completion of the Shipping Information form to allow the user to proceed to the Payment Details form
  const handleShippingInfoFinish = () => {
    setShippingInfoCompleted(true);
  };

  // Handle checkbox change to apply the Billing address information based off the Shipping Address
  const handleCheckboxChange = (e) => {
    setSameAsShipping(e.target.checked);

    if (e.target.checked) {
      // Copy shippingInfo values to form fields
      form.setFieldsValue(shippingInfo);
    } else {
      // Reset form fields
      form.resetFields();
    }
  };

  // Handle card payment and database order creation when the user attempts to purchase their order
  const handleCardPayment = async (values) => {
    setLoading(true);
    if (!AuthService.loggedIn()) {
      message.error("Please log in to complete the order");
      return;
    }

    try {
      let orderId; // stores the ID of the created order

      // Promise for creating an order
      const orderPromise = new Promise(async (resolve, reject) => {
        try {
          // Create order
          const { data: orderData } = await createOrder({
            variables: {
              products: cartData.cart.products.map((item) => ({
                productId: item.product._id,
                orderQuantity: item.quantity,
              })),
              totalAmount: parseFloat(formattedTotalPrice),
              address: {
                street: shippingInfo.address,
                city: shippingInfo.city,
                state: shippingInfo.state,
                postalCode: shippingInfo.postalCode,
              },
              status: "pending",
              name: shippingInfo.name,
              email: shippingInfo.email,
            },
          });

          orderId = orderData.createOrder._id;
          resolve(orderId); // If order is created, resolve the promise
        } catch (error) {
          reject(error); // If order creation fails, reject the promise. The error will be passed to the catch block
        }
      });

      // Promise for creating a payment
      const paymentPromise = new Promise(async (resolve, reject) => {
        try {
          // Create payment intent
          const response = await fetch("/api/payments/create-payment-intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: formattedTotalPrice,
              currency: "cad",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to create payment intent");
          }

          const { client_secret } = await response.json();

          // Process the payment using Stripe API
          const { error: paymentError } = await stripe.confirmCardPayment(
            client_secret,
            {
              payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                  name: values.cardName,
                  address: {
                    line1: values.address,
                    city: values.city,
                    state: values.state,
                    postal_code: values.postalCode,
                  },
                },
              },
            }
          );

          // Checks if the error occured from the Stripe API call
          if (paymentError) {
            reject(paymentError);
          } else {
            resolve(); // If the payment was successful, resolve the promise
          }
        } catch (error) {
          // If a payment error occured, cancel the order and reject the promise
          await updateOrder({
            variables: {
              orderId: orderId,
              newStatus: "canceled",
            },
          });

          reject(error);
        }
      });

      // Wait for both promises to complete before proceeding (success message should only appear if both the order AND the payment were successfully completed)
      await Promise.all([orderPromise, paymentPromise]);
      message.success("Order Complete");

      // Once the Order is created and payment successful, we can reset the user's cart and remove all the products inside
      await resetCart({ refetchQueries: [{ query: GET_CART }] });

      // Redirect the user to a confirmation page
      navigate(`/confirmation/${orderId}`);
    } catch (error) {
      // Checks if the error is related to a GraphQL error during order creation
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage = error.graphQLErrors[0].message;
        message.error(errorMessage);
      } else {
        console.error("Failed to create payment", error);
        message.error("Failed to create payment");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if the user is accessing the page while logged out and display a message to inform them they must be logged in
  if (!AuthService.loggedIn()) {
    return (
      <div style={{ textAlign: "center", fontSize: "18px", marginTop: "20px" }}>
        <Spin spinning={true} size="large" />
        <p>Please log in to view the checkout</p>
      </div>
    );
  }

  // Determine when the panels can be opened. The Shipping Information panel can only be opened if there are
  // items in the cart. The Payment Details panel can only be opened if the Shipping Information is completely filled
  const collapseActiveKey =
    (cart.products ?? []).length === 0
      ? ["1"]
      : (cart.products ?? []).length > 0 && shippingInfoCompleted
      ? ["1", "2", "3"]
      : ["1", "2"];

  return (
    <Row gutter={24}>
      <Col xs={24} lg={{ span: 8, push: 16 }}>
        <Card title="Order Summary">
          <p>Order value: ${cart.totalPrice}</p>
          <p>Delivery cost: ${deliveryCost}</p>
          <p>Est Tax: ${(0.05 * cart.totalPrice).toFixed(2)}</p>
          <p>Total Price: ${formattedTotalPrice}</p>
        </Card>

        <Alert
          message="Important Information"
          description={
            <div style={{ marginTop: "24px" }}>
              <p>
                Please note that this is a sample website for demonstration
                purposes and does not actually sell real products. It is
                designed to accept only testing card details, so no actual
                payments will be processed. To successfully test the payment
                process, please use the following card details:
              </p>
              <ul>
                <li>Card Name: Test Card</li>
                <li>Card Number: 4242 4242 4242 4242</li>
                <li>Expiry Date: 12/37</li>
                <li>CVV: 111</li>
                <li>postalCode Code: 11111</li>
              </ul>
              <p>
                You can enter these card details when prompted during the
                checkout process to simulate a successful payment.
              </p>
            </div>
          }
          type="info"
          showIcon
        />
      </Col>
      <Col xs={24} lg={{ span: 16, pull: 8 }}>
        <Collapse activeKey={collapseActiveKey}>
          <Panel header="Review Order" key="1">
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

            {cart && cart.products && cart.products.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                Your cart is empty. Please add products to the cart to complete
                your order.
              </div>
            ) : (
              <div style={{ display: "flex", overflowX: "auto" }}>
                {cart &&
                  cart.products &&
                  cart.products.map((item) => (
                    <div
                      key={item.product._id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginRight: "30px",
                      }}
                    >
                      <Link
                        to={`/product/${item.product._id}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          style={{
                            width: "80px",
                            objectFit: "contain",
                          }}
                        />
                        <p>{item.product.title}</p>
                      </Link>

                      <p>X{item.quantity}</p>
                      {item.product.stockQuantity <= 20 &&
                        item.product.stockQuantity > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            <Typography.Text type="danger">
                              Product almost out of stock! Only{" "}
                              {item.product.stockQuantity} left.
                            </Typography.Text>
                          </div>
                        )}
                      {item.product.stockQuantity <= 0 && (
                        <div style={{ marginTop: "8px" }}>
                          <Typography.Text type="danger">
                            Product out of stock!
                          </Typography.Text>
                        </div>
                      )}
                      <p>${item.product.price * item.quantity}</p>
                      <Button
                        type="primary"
                        onClick={() => handleRemoveProduct(item.product._id)}
                        danger
                        loading={removeProductLoading}
                        disabled={removeProductLoading || removeProductError}
                      >
                        Remove Product
                      </Button>
                      {removeProductError && (
                        <Alert
                          message="Error"
                          description="Failed to remove product from cart. Please try again later."
                          type="error"
                          showIcon
                          style={{ marginTop: "8px" }}
                        />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </Panel>
          <Panel header="Shipping Information" key="2">
            <Form onFinish={handleShippingInfoFinish}>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your name",
                      },
                    ]}
                  >
                    <Input
                      value={shippingInfo.name}
                      onChange={(e) =>
                        handleShippingFormChange("name", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your email",
                      },
                    ]}
                  >
                    <Input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        handleShippingFormChange("email", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your address",
                      },
                    ]}
                  >
                    <Input
                      value={shippingInfo.address}
                      onChange={(e) =>
                        handleShippingFormChange("address", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your city",
                      },
                    ]}
                  >
                    <Input
                      value={shippingInfo.city}
                      onChange={(e) =>
                        handleShippingFormChange("city", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="state"
                    label="State"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your state/province",
                      },
                    ]}
                  >
                    <Input
                      value={shippingInfo.state}
                      onChange={(e) =>
                        handleShippingFormChange("state", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="postalCode"
                    label="Postal Code"
                    rules={postalCodeValidationRules}
                  >
                    <Input
                      value={shippingInfo.postalCode}
                      onChange={(e) =>
                        handleShippingFormChange("postalCode", e.target.value)
                      }
                      placeholder="format: A1A 1A1"
                    />
                  </Form.Item>

                  <Button type="primary" htmlType="submit">
                    Save and Continue
                  </Button>
                </Col>
              </Row>
            </Form>
          </Panel>
          <Panel
            header="Payment Information"
            key="3"
            disabled={!shippingInfoCompleted}
          >
            {loading && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Spin spinning={true} size="large" />
                <p>Processing payment...</p>
              </div>
            )}
            <Form form={form} onFinish={handleCardPayment}>
              <Row gutter={24}>
                <Col span={24}>
                  {/* Checkbox to set fields and disable */}
                  <Form.Item>
                    <Checkbox onChange={handleCheckboxChange}>
                      Same as Shipping Address
                    </Checkbox>
                  </Form.Item>

                  <Form.Item name="address" label="Billing Address">
                    <Input disabled={sameAsShipping} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="city" label="City">
                    <Input disabled={sameAsShipping} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="state" label="State">
                    <Input disabled={sameAsShipping} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="postalCode" label="Postal Code">
                    <Input disabled={sameAsShipping} />
                  </Form.Item>
                </Col>
              </Row>

              <Col span={12}>
                <Form.Item name="cardName" label="Name on Card">
                  <Input />
                </Form.Item>
              </Col>
              {/* Stripe payment elements */}
              <Form.Item label="Card Details">
                <CardElement />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                disabled={!stripe || !elements || loading}
                loading={orderLoading}
              >
                {orderLoading ? "Processing" : "Pay"}
              </Button>
              {orderError && (
                <Alert
                  message="Error"
                  description="Failed to create order. Please try again later."
                  type="error"
                  showIcon
                  style={{ marginTop: "8px" }}
                />
              )}
            </Form>
          </Panel>
        </Collapse>
      </Col>
    </Row>
  );
};

const CheckoutWithStripe = () => (
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
);

export default CheckoutWithStripe;
