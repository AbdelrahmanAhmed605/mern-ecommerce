# MERN E-commerce

This project is a sample e-commerce website built using the MERN stack (MongoDB, Express.js, React, and Node.js). The application aims to provide users with a seamless shopping experience, offering a wide range of products and essential functionalities.

Website: [Mern E-commerce Website](https://abeds-mern-ecommerce-e78e4f542dbd.herokuapp.com/)

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Limitations](#limitations)
- [Future Implementations](#future-implementations)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Feedback and Bug Reports](#feedback-and-bug-reports)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project Overview

The sample e-commerce website is designed to create an immersive shopping experience for users. It offers a vast catalog of products, allowing users to browse through various categories and search for specific items. The intuitive search functionality enables users to quickly find the products they are looking for.

To enhance the user experience, the application incorporates real-time updates, ensuring that users are always aware of the availability of products. When a product is running low in stock, users receive immediate notifications, and if a product becomes out of stock, they are promptly informed.

One of the notable features of the application is its comprehensive product filtering system. Users can apply filters based on various criteria, such as price range, brand, or specific attributes, to refine their search results and find products that align with their preferences.

The shopping cart functionality allows users to add products, manage quantities, and review the items they have selected. The seamless integration between different sections of the application ensures that changes made in one area are instantly reflected in related areas. For instance, if a user modifies the quantity of a product in the shopping cart, the update will be immediately visible in the checkout section.

To provide users with a secure environment, the application implements user authentication. This ensures that only authenticated users can access certain features such as posting reviews, adding products to the cart, and making purchases.

Payment processing is handled through the Stripe implementation, although please note that the integration is set up to accept testing credit cards only. Detailed instructions on using the provided testing credit card details will be provided to the users.

The responsive user interface of the application offers a seamless experience across different devices and screen sizes. It provides feedback on loading processes, alerts users about errors when necessary, and adapts to deliver optimal performance.

Please feel free to explore the website and take advantage of these features for an enhanced shopping experience!

![Front Page Screenshot](README_assets/mern-ecommerce.png)

## Features

The sample e-commerce website offers the following key features:

- **Browse and Search**: Users can explore a diverse catalog of products and search for specific items.
- **Pagination**: The application includes pagination, allowing users to navigate through different pages of products.
- **Product Filters**: Users can apply filters to narrow down their search results and find products based on specific criteria.
- **Shopping Cart**: Users can add products to their shopping cart, manage quantities, and view a summary of selected items.
- **Stock Management**: The application ensures that users cannot add more quantities of a product than what is available in stock.
- **Automated Stock Quantity Updates**: When an order is made, the products that are purchased will be automatically reduced from the stock quantity. In the event of an order cancellation, the stock quantity will be replenished with the corresponding amount of each product from the canceled order.
- **Synchronized Updates**: Changes made in one section of the application are automatically reflected in other related areas. For example, modifying the quantity of a product in the shopping cart will instantly update the quantity in the checkout, ensuring a synchronized and consistent user experience.
- **Real-time Updates**: Users receive real-time updates on product availability. If a product is purchased by another user and the stock is running low, the quantity will be dynamically updated on the user's page.
- **Order History and Status**: Users can view their order history and check the status of their orders.
- **Reviews**: Users can post reviews for products and read reviews submitted by other users.
- **User Authentication**: Secure user authentication is implemented, allowing access to specific features only when logged in.
- **Responsive UI**: The application provides a responsive user interface that adapts to different screen sizes and provides feedback on loading processes and error messages.

## Limitations

It's important to consider the following limitations related to the project:

1. **Performance impact of pagination and total product count**: When querying products with pagination, obtaining the total number of products resulting from the search query requires performing an additional database action. This limitation arises from the inability to directly use the countDocuments() method on the results of the main query, which includes the applied filters. Therefore, to provide accurate pagination information, the application needs to execute a separate query to count the total number of products that match the specified filters. This additional database action can impact performance, especially when dealing with large datasets or complex filter combinations. Consider optimizing the querying and pagination mechanisms to minimize the performance impact and improve the responsiveness of the application.

2. **Trade-off between pollInterval duration and application performance**: The project utilizes a pollInterval for queries, which allows for periodic data updates. However, there is a trade-off between the pollInterval duration and application performance. Selecting a shorter duration may increase the frequency of queries, potentially slowing down the application. On the other hand, choosing a longer duration might result in users experiencing delays in receiving timely updates. It's essential to find an optimal balance based on the specific needs of the project.

3. **Order creation and payment failure**: When an order is created using a mutation, if the subsequent payment fails, the order status is changed to "canceled" using an update mutation. However, if the update mutation fails for any reason, the order will still be created, and the stock quantity of the product will be reduced. This scenario could result in a discrepancy between the order status and the actual stock availability. Robust error handling mechanisms and safeguards should be implemented to ensure accurate order status updates and prevent incorrect stock quantity reduction in such scenarios.

These limitations highlight areas where careful consideration and potential improvements can enhance the functionality, performance, and reliability of the project. Contributions and enhancements to address these limitations are encouraged to optimize the user experience and overall system integrity.

## Future Implementations

The project has potential for future enhancements and feature additions to further improve its functionality and user experience. Here are some features that could be implemented in the future:

1. **Product Availability Filtering**: Provide options for users to filter and view only products that are currently in stock. This feature can enhance the browsing experience by allowing users to focus on available products and avoid disappointment from viewing out-of-stock items.

2. **Nested Categories**: Implement nested categories to organize and structure the category hierarchy. Currently, all categories are listed together, but by introducing nested categories, you can create parent categories with subcategories, providing a more intuitive and organized navigation experience for users.

3. **Variants for Products**: Enhance the product listing by including support for products with variations such as different colors, sizes, or features. This feature allows users to view and select different versions of the same product based on their preferences, providing a more comprehensive and flexible shopping experience.

Implementing these features would contribute to the overall functionality, usability, and user satisfaction of the project. As the project evolves, incorporating these enhancements can make it more versatile and cater to a wider range of user needs.

Feel free to contribute to the project by implementing these features or suggesting other ideas that can further enrich the functionality of the application.

## Installation

As this project is a deployed website, there is no installation required. Simply access the website by visiting the provided URL.

## Usage

Website: [Mern E-commerce Website](https://abeds-mern-ecommerce-e78e4f542dbd.herokuapp.com/)

Upon entering the project, users will land on the main homepage, where they can immediately browse all the available products. The homepage showcases product listings with essential information, including the product image, price, review rating (with the number of reviews), a warning message if the product is low on stock, and an "Add To Cart" button.

Users have the flexibility to apply filters to narrow down their product search and pagination allows them to navigate through multiple pages of products.

By clicking on a product, users are taken to a dedicated single product page. Here, they can access additional information about the product, such as the description and existing product reviews. On the single product page, users can specify the desired quantity before adding the product to their cart. Users can also post their own reviews on this page.

The navigation bar provides convenient options for users to interact with the website. A search bar allows users to search for specific products, while the "Shop all" option returns users to the homepage.

If the user is logged out, the navbar displays a button that opens a pop-up modal, enabling users to sign up or log in. However, if the user is already logged in, the button is replaced with a profile icon, which triggers a dropdown menu. The dropdown menu allows users to edit their profile information, view their order history, or log out.

The navbar also features a shopping cart icon. When hovered over, it opens a small hover dropdown display, showcasing the user's products in the cart. This allows users to conveniently edit product quantities or remove items from the cart without leaving their current page. It's important to note that this hover dropdown display is available for larger screens.

For all screens, when the shopping cart icon is clicked, users are directed to their shopping cart page. The shopping cart page displays a table with all the items in the user's cart. Users can update product quantities or delete items. Clicking on a product in the cart will redirect users to the single product page for further details.

Both the shopping cart hover dropdown display and the shopping cart page contain a button that takes users to the checkout page. On the checkout page, users can enter their shipping details. However, if there are no items in the cart, users will be prompted to add items before proceeding. Once shipping details are entered, users can provide their payment information. The payment information section includes a checkbox to autofill the billing details with the shipping details, if they are the same. After entering all the required information, users can proceed to pay and finalize their order.

If the payment is successful, users will be directed to an order confirmation page, which provides details of their completed order.

Feel free to explore the website and enjoy the seamless shopping experience it offers! Let me know if there's anything else you'd like to add or modify.

## Technologies Used

The project utilizes a range of technologies to deliver its functionality and provide a seamless user experience.

### Backend Technologies

- **MongoDB with Mongoose**: The project utilizes Mongoose to define MongoDB model schemas and middlewares, allowing for efficient data management and interaction.
- **mongoose-unique-validator**: This package is used for validation checks on the model schemas, ensuring data integrity and consistency.
- **Express.js**: Express.js is employed as the server framework, enabling robust routing and handling of HTTP requests.
- **Apollo Server with Express**: Apollo Server is integrated with Express.js to implement a GraphQL server. It facilitates the definition of types, queries, and mutations, as well as the resolution of those queries and mutations using GraphQL resolvers.
- **bcrypt**: The bcrypt library is employed for encrypting user passwords, providing an additional layer of security.
- **jsonwebtoken**: jsonwebtoken is used for user authentication. It enables the generation and verification of JSON web tokens, ensuring secure communication between the client and server.
- **lodash**: Lodash is utilized to split resolvers into different files, enhancing code modularity. It allows for better organization and maintenance of the resolver logic.
- **Stripe**: The Stripe API is integrated for payment processing. It offers a secure and reliable platform to handle transactions.

### Frontend Technologies

- **React**: The frontend is developed using React for building the user interface. It enables efficient component-based development and facilitates a dynamic and interactive user experience.
- **React Router DOM**: React Router DOM is employed to enable seamless navigation and linking between different pages within the application.
- **React Responsive**: The React Responsive library is utilized to determine the user's screen size, enabling the implementation of media queries and responsive layouts. This ensures an optimal user experience across different devices and screen sizes.
- **Zustand**: Zustand is used for state management, allowing the application to maintain a single source for the state and enabling consistent data access and updates across multiple files.
- **jwt-decode**: jwt-decode is employed to decode the token received from the server-side authentication. It enables extraction of information from the token for user-specific operations.
- **@stripe/stripe-js** and **@stripe/react-stripe-js**: These Stripe libraries are used to render the necessary Stripe components and process payments securely using the Stripe API.
- **Ant Design**: Ant Design is utilized for dynamic UI components, providing a consistent and aesthetically pleasing user interface throughout the application.
- **@apollo/client**: The Apollo Client library is employed for frontend communication with the server-side resolvers. It enables easy integration with the GraphQL server, making mutations and queries from the frontend seamless and efficient.

These technologies work together to create a robust and efficient e-commerce application, delivering an engaging user experience.

## API Reference

The API in this project provides seamless integration between the server-side and client-side through a combination of GraphQL and RESTful endpoints. It enables efficient communication and data manipulation between the frontend and backend.

### Server-side Operations

On the server-side, the GraphQL API provides a set of type definitions that define the structure of the data entities and their relationships. These type definitions include types such as User, Product, Cart, Order, Review, and Category, each with its respective fields.

The API supports various queries and mutations to interact with these data entities. Some key server-side operations include:

- **User Operations**: The API allows retrieving user information, such as the currently logged-in user (me), all users (allUsers), and a single user by their ID (singleUser).
- **Product Operations**: Users can perform operations related to products, including retrieving all products (products), a single product by its ID (product), filtered products based on specific criteria (filteredProducts), and searching for products (searchProducts).
- **Cart Operations**: Users can manage their shopping cart with operations like retrieving the cart (cart), adding products to the cart (addToCart), removing products from the cart (removeFromCart), updating the quantity of products in the cart (updateCartProductQuantity), and resetting the cart (resetCart).
- **Order Operations**: Users can place orders with operations like creating a new order (createOrder), updating the status of an order (updateOrder), and retrieving orders by the user (ordersByUser).
- **Review Operations**: Users can interact with reviews by creating new reviews (createReview), updating existing reviews (updateReview), and deleting reviews (deleteReview).

Additionally, the API includes a RESTful endpoint for handling Stripe payment:
- **Stripe Payment**: A RESTful API endpoint /create-payment-intent is provided to handle the creation of a payment intent. It accepts the amount and currency as input, sanitizes the amount, and creates a payment intent using the Stripe API. The client secret of the payment intent is returned as the response.

### Client-side Operations
On the client-side, the GraphQL API is accessed through the Apollo Client library. The client-side operations include a set of queries and mutations that correspond to the server-side definitions. These operations are used to fetch data from the server and perform mutations.

Here are some examples of client-side operations:

- **CREATE_USER**: Creates a new user by providing their role, username, email, and password.
- **GET_ME**: Retrieves the currently logged-in user, including their ID, email, and username.
- **GET_PRODUCTS**: Retrieves all products, including their ID, title, price, image, stock quantity, average rating, and associated reviews.
- **GET_SINGLE_PRODUCT**: Fetches details of a single product by its ID, including its ID, title, description, image, price, stock quantity, average rating, associated categories, reviews, and user information.
- **GET_FILTERED_PRODUCTS**: Retrieves a list of filtered products based on various criteria, including category IDs, price range, rating range, sort option, and pagination.
- **GET_CART**: Retrieves the user's shopping cart, including the cart ID, products in the cart, and the total price. Each product in the cart includes its ID, title, price, image, stock quantity, and the quantity of the product in the cart.
- **ADD_PROD_TO_CART**: Adds a product to the user's cart by providing the product ID and quantity.
- **UPDATE_CART_PROD_QUANTITY**: Updates the quantity of a product in the cart. It requires the product ID and the new quantity as input.
- **CREATE_ORDER**: Places a new order by providing the product details, total amount, address, status, name, and email.
- **CREATE_REVIEW**: Creates a new review for a product. It requires the product ID, rating, and comment as input. After creating the review, it returns the review ID, associated product ID, associated user ID, comment, and rating.

These are just a few examples of the client-side operations available. Each operation corresponds to a specific server-side query or mutation and allows users to interact with the GraphQL API from the frontend.

Feel free to explore the available operations in the client-side code and utilize them to fetch data from the server and perform mutations as needed.

## Database Schema

![Database Schema](README_assets/Database_Schema.png)

## Deployment

The project is deployed and accessible on Heroku. You can visit the deployed site by clicking on the following link: [Mern E-commerce Website](https://abeds-mern-ecommerce-e78e4f542dbd.herokuapp.com/)

### Prerequisites

To access the deployed site and interact with the features, you will need:

- A compatible web browser (e.g., Chrome, Firefox, Safari)
- Internet connectivity

### Accessing the Deployed Site

To access the deployed site on Heroku, follow these steps:

1. Open a web browser.
2. Enter the following URL in the address bar: `https://your-project-name.herokuapp.com`.
3. Press Enter or Return to load the site.

### Interacting with the Site

Once you have accessed the deployed site, you can interact with its features and functionality. Here are some key actions you can perform:

- Explore the various pages and sections of the site.
- Register for an account or log in if you already have one.
- Browse and search for products.
- Add products to your cart and proceed to checkout.
- View your order history and manage your profile.

### Troubleshooting

If you encounter any issues while accessing or using the deployed site, please consider the following:

- Ensure that you have a stable internet connection.
- Clear your browser's cache and cookies, then reload the site.
- Try accessing the site from a different browser or device.

If the issue persists or you require further assistance, please open a new issue on the project's GitHub repository.

## Feedback and Bug Reports

If you have any feedback, suggestions, or bug reports related to the deployed site, I encourage you to share them with me. You can provide feedback by opening an issue on the project's GitHub repository

I appreciate your contribution to improving the site and ensuring a seamless user experience.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request. When contributing to this project, please follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct/) code of conduct.

## License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for more details.

## Contact

For any inquiries or questions, you can reach out to me:

- Name: [Abdelrahman Ahmed]
- Email: [abdelrahman.ahmed605@hotmail.com]
- GitHub: [AbdelrahmanAhmed605]([https://github.com/your-username](https://github.com/AbdelrahmanAhmed605)https://github.com/AbdelrahmanAhmed605)
