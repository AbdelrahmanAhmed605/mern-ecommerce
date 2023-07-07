import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";

import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  Divider,
  message,
  Spin,
  Alert,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { GET_ME } from "../utils/queries";
import {
  UPDATE_USER,
  DELETE_USER,
  UPDATE_USER_PASSWORD,
} from "../utils/mutations";
import AuthService from "../utils/auth";

import { useLoginStatusStore } from "../store/userStore";

const { Title } = Typography;

const Profile = () => {
  // Store state management that checks if the user is logged in
  const isLoggedIn = useLoginStatusStore((state) => state.isLoggedIn);

  // State variables
  const [loading, setLoading] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  // Query for fetching user data
  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUser,
  } = useQuery(GET_ME);

  // Mutations for updating user information
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [updateUserPassword] = useMutation(UPDATE_USER_PASSWORD);

  // Handle updating the users profile username to the new username inputted by the user
  const handleUpdateUsername = async (values) => {
    setLoading(true);
    try {
      await updateUser({ variables: { newUsername: values.newUsername } });
      message.success("Username updated successfully.");
      setEditUsername(false);
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage = error.graphQLErrors[0].message;
        message.error(errorMessage);
      } else {
        console.error("Error updating username:", error);
        message.error("Failed to update username");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle updating the users profile email to the new email inputted by the user
  const handleUpdateEmail = async (values) => {
    setLoading(true);
    try {
      await updateUser({ variables: { newEmail: values.newEmail } });
      message.success("Email updated successfully.");
      setLoading(false);
      setEditEmail(false);
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage = error.graphQLErrors[0].message;
        message.error(errorMessage);
      } else {
        console.error("Error updating email:", error);
        message.error("Failed to update email");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle updating the users profile password to the new password inputted by the user
  const handleUpdatePassword = async (values) => {
    setLoading(true);
    try {
      await updateUserPassword({
        variables: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });
      message.success("Password updated successfully.");
      setLoading(false);
      setEditPassword(false);
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage = error.graphQLErrors[0].message;
        message.error(errorMessage);
        console.error(error.graphQLErrors);
      } else {
        console.error("Error updating password:", error);
        message.error("Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting the user's account
  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      await deleteUser();
      message.success("Account deleted successfully.");
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage = error.graphQLErrors[0].message;
        message.error(errorMessage);
      } else {
        console.error("Error deleting account:", error);
        message.error("Failed to delete account");
      }
    } finally {
      setLoading(false);
      // logs the user out and returns to the home page when they delete their account
      AuthService.logout();
    }
  };

  // useEffect hook to refetch user data when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      refetchUser();
    }
  }, [isLoggedIn, refetchUser]);

  // Check if the user is accessing the page while logged out
  if (!AuthService.loggedIn()) {
    return (
      <div style={{ textAlign: "center", fontSize: "18px", marginTop: "20px" }}>
        <Spin spinning={true} size="large" />
        <p>Please log in to view your profile information</p>
      </div>
    );
  }

  // Display a loading spinner while user's data is being fetched
  if (userLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Spin size="large" />
        <p>Loading user data...</p>
      </div>
    );
  }

  // Display an error message if an error occured while fetching the user's
  if (userError) {
    return (
      <Alert
        message="Error"
        description="Failed to retrieve your information. Please try again later."
        type="error"
        showIcon
        style={{ marginTop: "8px" }}
      />
    );
  }

  // Destructure user data
  const { me } = userData;

  return (
    <div>
      <Title level={2}>Welcome, {me.username}!</Title>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Card style={{ margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <UserOutlined style={{ fontSize: "24px", marginRight: "10px" }} />
            <span style={{ fontWeight: "bold" }}>Username:</span>
            <span style={{ marginLeft: "10px" }}>{me.username}</span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => setEditUsername(true)}
              style={{ marginLeft: "auto" }}
            />
          </div>
          {editUsername ? (
            <Form
              layout="vertical"
              onFinish={handleUpdateUsername}
              initialValues={{ newUsername: me.username }}
            >
              <Form.Item
                name="newUsername"
                rules={[
                  { required: true, message: "Please enter a new username." },
                ]}
              >
                <Input placeholder="New Username" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" loading={loading} htmlType="submit">
                  Update Username
                </Button>
              </Form.Item>
              <Button type="link" onClick={() => setEditUsername(false)}>
                Cancel
              </Button>
            </Form>
          ) : null}
        </Card>

        <Card style={{ margin: "20px auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <MailOutlined style={{ fontSize: "24px", marginRight: "10px" }} />
            <span style={{ fontWeight: "bold" }}>Email:</span>
            <span style={{ marginLeft: "10px" }}>{me.email}</span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => setEditEmail(true)}
              style={{ marginLeft: "auto" }}
            />
          </div>
          {editEmail ? (
            <Form
              layout="vertical"
              onFinish={handleUpdateEmail}
              initialValues={{ newEmail: me.email }}
            >
              <Form.Item
                name="newEmail"
                rules={[
                  { required: true, message: "Please enter a new email." },
                  { type: "email", message: "Please enter a valid email." },
                ]}
              >
                <Input placeholder="New Email" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" loading={loading} htmlType="submit">
                  Update Email
                </Button>
              </Form.Item>
              <Button type="link" onClick={() => setEditEmail(false)}>
                Cancel
              </Button>
            </Form>
          ) : null}
        </Card>

        <Card style={{ margin: "20px auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <LockOutlined style={{ fontSize: "24px", marginRight: "10px" }} />
            <span style={{ fontWeight: "bold" }}>Password:</span>
            <span style={{ marginLeft: "10px" }}>*********</span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => setEditPassword(true)}
              style={{ marginLeft: "auto" }}
            />
          </div>
          {editPassword ? (
            <Form
              layout="vertical"
              onFinish={handleUpdatePassword}
              initialValues={{ currentPassword: "", newPassword: "" }}
            >
              <Form.Item
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: "Please enter your current password.",
                  },
                ]}
              >
                <Input.Password placeholder="Current Password" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: "Please enter a new password." },
                ]}
              >
                <Input.Password placeholder="New Password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" loading={loading} htmlType="submit">
                  Update Password
                </Button>
              </Form.Item>
              <Button type="link" onClick={() => setEditPassword(false)}>
                Cancel
              </Button>
            </Form>
          ) : null}
        </Card>
      </div>

      <div style={{ textAlign: "center" }}>
        <Divider />
        <Button
          type="primary"
          danger
          loading={loading}
          icon={<DeleteOutlined />}
          onClick={handleDeleteUser}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
};

export default Profile;
