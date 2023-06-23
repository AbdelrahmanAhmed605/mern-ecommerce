// Function to format the date fields of our queries so it can be displayed in user-friendly format
const formatDateTime = (timestamp) => {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString();
};

export default formatDateTime;
