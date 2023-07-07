import React from "react";
import { useMutation } from "@apollo/client";

import { Form, Input, Button, Row, Col, message, Alert } from "antd";

import { CREATE_USER, LOGIN_USER } from "../../utils/mutations";
import AuthService from "../../utils/auth";

import { useLoginStatusStore } from "../../store/userStore";

const UserForm = () => {
  // Store to check the user's current logged in status
  const setUserLoggedIn = useLoginStatusStore((state) => state.setIsLoggedIn);

  // mutation to create a new user
  const [createUser, { loading: signupLoading, error: signupError }] = useMutation(CREATE_USER);

  // mutation to allow the user to login
  const [loginUser, { loading: loginLoading, error: loginError }] = useMutation(LOGIN_USER);

  const handleSignUpForm = async (values) => {
    values.role = "user";
    try {
      const { data } = await createUser({ variables: values });
      // Log in the user by storing the token in the AuthService utility
      AuthService.login(data.createUser.token);
      setUserLoggedIn(true);
    } catch (err) {
      if (err.graphQLErrors.length > 0) {
        const extensions = err.graphQLErrors[0].extensions;
        if (extensions && extensions.validationErrors) {
          const validationErrors = extensions.validationErrors;
          validationErrors.forEach((errorMsg) => {
            // Display a separate AntDesign message for each error
            message.error(errorMsg);
          });
        } else {
          const errorMessage = err.graphQLErrors[0].message;
          message.error(errorMessage);
        }
      } else {
        console.log(err);
      }
    }
  };

  const handleLoginForm = async (values) => {
    try {
      const { data } = await loginUser({ variables: values });
      // Log in the user by storing the token in the AuthService utility
      AuthService.login(data.login.token);
      setUserLoggedIn(true);
    } catch (err) {
      if (err.graphQLErrors.length > 0) {
        // Display the first error message from the GraphQL errors array
        const errorMessage = err.graphQLErrors[0].message;
        message.error(errorMessage);
      } else {
        console.log(err);
      }
    }
  };

  return (
    <Row gutter={16}>
      <Col span={12}>
        <div style={{ marginBottom: "24px" }}>
          <h2>Sign Up</h2>
          <Form onFinish={handleSignUpForm}>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter your email address",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please enter your username" },
                { type: "text", message: "Please enter a valid username" },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={signupLoading}
                style={{ width: "100%" }}
              >
                Sign Up
              </Button>
            </Form.Item>
            {/* Display signupError message */}
            {signupError && (
              <Alert
                message="Error"
                description="Failed to sign up. Please try again later."
                type="error"
                showIcon
                style={{ marginBottom: "16px" }}
              />
            )}
          </Form>
        </div>
      </Col>
      <Col span={12}>
        <div style={{ marginBottom: "24px" }}>
          <h2>Log In</h2>
          <Form onFinish={handleLoginForm}>
            <Form.Item
              name="usernameOrEmail"
              rules={[
                {
                  required: true,
                  message: "Please enter your username or email address",
                },
                {
                  type: "text",
                  message: "Please enter a valid username or email address",
                },
              ]}
            >
              <Input placeholder="Username or Email address" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginLoading}
                style={{ width: "100%" }}
              >
                Log In
              </Button>
            </Form.Item>
            {/* Display loginError message */}
            {loginError && (
              <Alert
                message="Error"
                description="Failed to log in. Please check your credentials and try again."
                type="error"
                showIcon
                style={{ marginBottom: "16px" }}
              />
            )}
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default UserForm;
