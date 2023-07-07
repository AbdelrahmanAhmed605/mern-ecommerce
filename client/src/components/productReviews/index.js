import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";

import {
  List,
  Rate,
  Empty,
  Form,
  Input,
  Button,
  message,
  Divider,
  Pagination,
  Alert,
  Spin,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  GET_REVIEWS_FOR_PRODUCT,
  GET_USER_PRODUCT_REVIEW,
} from "../../utils/queries";
import {
  CREATE_REVIEW,
  UPDATE_REVIEW,
  DELETE_REVIEW,
} from "../../utils/mutations";
import AuthService from "../../utils/auth";
import formatDateTime from "../../utils/helper";

import { useLoginStatusStore } from "../../store/userStore";

const { TextArea } = Input;

const ProductReviews = ({ productId, refetchProduct }) => {
  // State variables
  const isLoggedIn = useLoginStatusStore((state) => state.isLoggedIn); // checks if the user is logged in
  const [currentPage, setCurrentPage] = useState(1); // Keep track of the current page for pagination
  const [editMode, setEditMode] = useState(false); // Enable/disable edit mode
  const [updatedRating, setUpdatedRating] = useState(0); // Store the updated rating
  const [updatedComment, setUpdatedComment] = useState(""); // Store the updated comment

  // Determines number of reviews shown per one pagination section/page
  const reviewsPerPage = 5;

  // Queries

  // contains all the reviews for the specific product
  const {
    loading: reviewsLoading,
    data: reviewsData,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery(GET_REVIEWS_FOR_PRODUCT, {
    variables: {
      productId: productId,
      page: currentPage, // Use the currentPage state variable as the value for the page
      pageSize: reviewsPerPage,
    },
  });

  // Contains the logged in user's review
  const {
    loading: userReviewLoading,
    data: userReviewData,
    error: userReviewsError,
    refetch: refetchUserReview,
  } = useQuery(GET_USER_PRODUCT_REVIEW, {
    variables: {
      productId: productId,
    },
    skip: !AuthService.loggedIn(),
  });

  // Extract data from queries
  const reviews = reviewsData?.reviewForProducts?.reviews || [];
  const totalReviews = reviewsData?.reviewForProducts?.totalReviews || 0;
  const userReview = userReviewData?.userProductReview || {};

  // Mutations
  const [
    createReview,
    { loading: createReviewLoading, error: createReviewError },
  ] = useMutation(CREATE_REVIEW);

  const [
    updateReview,
    { loading: updateReviewLoading, error: updateReviewError },
  ] = useMutation(UPDATE_REVIEW);

  const [
    deleteReview,
    { loading: deleteReviewLoading, error: deleteReviewError },
  ] = useMutation(DELETE_REVIEW, {
    refetchQueries: [
      { query: GET_USER_PRODUCT_REVIEW, variables: { productId } },
    ],
  });

  // useEffect hook to refetch userReviewData when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      refetchUserReview();
    }
  }, [isLoggedIn, refetchUserReview]);

  const [form] = Form.useForm();

  // Renders the new data when the page is changed in the Pagination component
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page); // Update the currentPage state variable
    refetchReviews({ productId: productId, page, pageSize });
  };

  // Creates the user's review when the form is submitted
  const handleReviewSubmit = async (values) => {
    // Ensures the user is logged in to create a review
    if (!AuthService.loggedIn()) {
      message.error("Please log in to post your review");
      return;
    }

    try {
      await createReview({
        variables: {
          productId: productId,
          rating: values.rating,
          comment: values.comment,
        },
      });
      form.resetFields();
      message.success("Review submitted successfully");
      // Refetch the data to ensure the page includes the new review data without refreshing the page
      await refetchUserReview();
      await refetchProduct();
      await refetchReviews();
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage = error.graphQLErrors[0].message;
        message.error(errorMessage);
        console.log(errorMessage);
      } else {
        console.error("Error posting review:", error);
        message.error("Failed to submit review");
      }
    } 
  };

  const handleUpdateReview = async (values) => {
    try {
      if (!AuthService.loggedIn()) {
        message.error("Please log in to post your review");
        return;
      }
      await updateReview({
        variables: {
          id: userReview?._id,
          rating: values.rating,
          comment: values.comment,
        },
      });
      message.success("Review submitted successfully");
      // Refetch the data to ensure the page includes the new review data without refreshing the page
      await refetchUserReview();
      await refetchProduct();
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage = error.graphQLErrors[0].message;
        message.error(errorMessage);
      } else {
        console.error("Error updating review:", error);
        message.error("Failed to submit review");
      }
    } finally {
      setEditMode(false); // Reset the edit mode after submission
    }
  };

  const handleDeleteReview = async () => {
    try {
      if (!AuthService.loggedIn()) {
        message.error("Please log in to delete your review");
        return;
      }
      await deleteReview({
        variables: {
          id: userReview?._id, // Provide the review's ID as the argument
        },
      });
      message.success("Review deleted successfully");
      // Refetch the data to ensure the page includes the new review data without refreshing the page
      await refetchUserReview();
      await refetchProduct();
      await refetchReviews();
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage = error.graphQLErrors[0].message;
        message.error(errorMessage);
      } else {
        console.error("Error deleting review:", error);
        message.error("Failed to delete review");
      }
    }
  };

  if (reviewsLoading) {
    return <div>Loading reviews...</div>;
  }

  if (reviewsError) {
    return <div>Error loading reviews</div>;
  }

  return (
    <>
      <div>
        {userReview && userReview.user ? (
          // User has posted a review for this product
          <div>
            <h3>Your Review</h3>
            <div>
              <div>
                <h5>{userReview?.user.username}</h5>
                <div>
                  {editMode ? (
                    // Edit mode is enabled (the user is attempting to update their review)
                    <Form layout="vertical" onFinish={handleUpdateReview}>
                      <Form.Item
                        name="rating"
                        label="Rating"
                        rules={[
                          {
                            required: true,
                            message: "Please provide a rating",
                          },
                        ]}
                      >
                        <Rate
                          value={updatedRating}
                          onChange={(value) => {
                            if (value === 0) {
                              setUpdatedRating(1);
                            } else {
                              setUpdatedRating(value);
                            }
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="comment"
                        label="Comment"
                        rules={[
                          {
                            required: true,
                            message: "Please provide a comment",
                          },
                        ]}
                      >
                        <TextArea
                          rows={4}
                          value={updatedComment}
                          onChange={(e) => setUpdatedComment(e.target.value)}
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={updateReviewLoading}
                      >
                        Resubmit Review
                      </Button>
                      <Button type="link" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </Form>
                  ) : (
                    // Edit mode is disabled (user is viewing their posted review but it is not trying to update it)
                    <>
                      <Rate disabled value={userReview?.rating} />
                      <span style={{ marginLeft: "8px" }}>
                        {formatDateTime(userReview?.createdAt)}
                      </span>
                      <p>{userReview?.comment}</p>
                      <div>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => setEditMode(true)}
                        >
                          Edit Review
                        </Button>
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={handleDeleteReview}
                          loading={deleteReviewLoading}
                        >
                          Delete Review
                        </Button>
                      </div>
                      {deleteReviewError && (
                        <Alert
                          message="Error"
                          description="Failed to delete the review. Please try again later."
                          type="error"
                          showIcon
                          style={{ marginBottom: "16px" }}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // User has not posted a review for this product
          <>
            <h3>Post Your Product Reviews</h3>
            <Form
              form={form}
              onFinish={handleReviewSubmit}
              layout="vertical"
              className="review-form"
            >
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: "Please provide a rating" }]}
              >
                <Rate />
              </Form.Item>
              <Form.Item
                name="comment"
                label="Comment"
                rules={[
                  { required: true, message: "Please provide a comment" },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createReviewLoading}
                  className="submit-button"
                >
                  Submit Review
                </Button>
              </Form.Item>
            </Form>
            {createReviewError && (
              <div style={{ color: "red", marginBottom: "16px" }}>
                {createReviewError.graphQLErrors.length > 0
                  ? createReviewError.graphQLErrors[0].message
                  : "Failed to submit review"}
              </div>
            )}
            {updateReviewError && (
              <Alert
                message="Error"
                description="Failed to update your review. Please try again later."
                type="error"
                showIcon
                style={{ marginBottom: "16px" }}
              />
            )}
          </>
        )}
      </div>
      <Divider />
      <div>
        <h3>Product Reviews</h3>
        {userReviewsError && (
          <Alert
            message="Error"
            description="Failed to fetch product reviews. Please try again later."
            type="error"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}
        {userReviewLoading && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Spin spinning={true} size="large" />
            <p>Loading reviews...</p>
          </div>
        )}
        {reviews.length > 0 ? (
          // Display reviews if available
          <>
            <List
              itemLayout="vertical"
              dataSource={reviews}
              renderItem={(review) => (
                <List.Item key={review._id}>
                  <List.Item.Meta
                    title={review.user.username}
                    description={
                      <div>
                        <Rate disabled value={review.rating} />
                        <span style={{ marginLeft: "8px" }}>
                          {formatDateTime(review.createdAt)}
                        </span>
                      </div>
                    }
                  />
                  <p>{review.comment}</p>
                </List.Item>
              )}
            />
            <Pagination
              current={currentPage}
              total={totalReviews}
              pageSize={reviewsPerPage}
              onChange={handlePageChange}
              style={{ marginTop: "24px", textAlign: "center" }}
            />
          </>
        ) : (
          // Display message if no reviews available
          <Empty description="No reviews yet" />
        )}
      </div>
    </>
  );
};

export default ProductReviews;
