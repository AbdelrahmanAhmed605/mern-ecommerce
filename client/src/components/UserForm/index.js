import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_USER, LOGIN_USER } from "../../utils/mutations";
import { Form, Input, Button, Row, Col, message } from "antd";
import AuthService from "../../utils/auth";
import useUserStore from "../../store/userStore";

const UserForm = () => {
  const setUserLoggedIn = useUserStore((state) => state.setIsLoggedIn);

  // mutation to create a new user
  const [createUser, { loading: signupLoading }] = useMutation(CREATE_USER);

  // mutation to add a product into the shopping cart
  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER);

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
                { required: true, message: "Please enter your email address" },
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
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default UserForm;
