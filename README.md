# MERN E-commerce

This project is a sample e-commerce website built using the MERN stack (MongoDB, Express.js, React, and Node.js). The application aims to provide users with a seamless shopping experience, offering a wide range of products and essential functionalities.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)

## Project Overview

The sample e-commerce website is designed to create an immersive shopping experience for users. It offers a vast catalog of products, allowing users to browse through various categories and search for specific items. The intuitive search functionality enables users to quickly find the products they are looking for.

To enhance the user experience, the application incorporates real-time updates, ensuring that users are always aware of the availability of products. When a product is running low in stock, users receive immediate notifications, and if a product becomes out of stock, they are promptly informed.

One of the notable features of the application is its comprehensive product filtering system. Users can apply filters based on various criteria, such as price range, brand, or specific attributes, to refine their search results and find products that align with their preferences.

The shopping cart functionality allows users to add products, manage quantities, and review the items they have selected. The seamless integration between different sections of the application ensures that changes made in one area are instantly reflected in related areas. For instance, if a user modifies the quantity of a product in the shopping cart, the update will be immediately visible in the checkout section.

To provide users with a secure environment, the application implements user authentication. This ensures that only authenticated users can access certain features such as posting reviews, adding products to the cart, and making purchases.

Payment processing is handled through the Stripe implementation, although please note that the integration is set up to accept testing credit cards only. Detailed instructions on using the provided testing credit card details will be provided to the users.

The responsive user interface of the application offers a seamless experience across different devices and screen sizes. It provides feedback on loading processes, alerts users about errors when necessary, and adapts to deliver optimal performance.

Please feel free to explore the website and take advantage of these features for an enhanced shopping experience!

## Features

The sample e-commerce website offers the following key features:

- **Browse and Search**: Users can explore a diverse catalog of products and search for specific items.
- **Pagination**: The application includes pagination, allowing users to navigate through different pages of products.
- **Product Filters**: Users can apply filters to narrow down their search results and find products based on specific criteria.
- **Shopping Cart**: Users can add products to their shopping cart, manage quantities, and view a summary of selected items.
- **Stock Management**: The application ensures that users cannot add more quantities of a product than what is available in stock.
- **Real-time Updates**: Changes made in one section of the application seamlessly reflect in other related areas. For example, modifying the quantity of a product in the shopping cart will update the quantity in the checkout as well.
- **Order History and Status**: Users can view their order history and check the status of their orders.
- **Reviews**: Users can post reviews for products and read reviews submitted by other users.
- **User Authentication**: Secure user authentication is implemented, allowing access to specific features only when logged in.
- **Responsive UI**: The application provides a responsive user interface that adapts to different screen sizes and provides feedback on loading processes and error messages.

## Installation

As this project is a deployed website, there is no installation required. Simply access the website by visiting the provided URL.

## Usage

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
