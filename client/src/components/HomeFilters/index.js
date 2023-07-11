import React, { useState } from "react";
import { Menu, Checkbox, InputNumber, Button, Dropdown, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./index.css";

import {
  useProductCategoriesStore,
  useProductSortingStore,
  useProductPriceStore,
  useProductRatingStore,
} from "../../store/productStore";

const FilterOptions = ({
  categories,
  handlePaginationChange,
  pageSize,
  setCategoryNames,
}) => {
  // State variables for the visibility of filter options
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false); // Controls category dropdown element visibility
  const [priceMenuVisible, setPriceMenuVisible] = useState(false); // Controls price dropdown element visibility
  const [ratingMenuVisible, setRatingMenuVisible] = useState(false); // Controls rating dropdown element visibility

  // ---------- Store state variables for selected filter options ----------

  // Get selected categories state and actions from the store
  const { selectedCategories, setSelectedCategories, clearSelectedCategories } =
    useProductCategoriesStore();
  // Get the selected sort option state and action to set the state from the store
  const { sortOption, setSortOption } = useProductSortingStore();
  // Get the selected price filters state and actions to set the states from the store
  const { minPrice, maxPrice, setMinPrice, setMaxPrice } =
    useProductPriceStore();
  // Get the selected rating filters state and actions to set the states from the store
  const { minRating, maxRating, setMinRating, setMaxRating } =
    useProductRatingStore();

  // Check if any filter options are selected
  const isFilterSelected =
    selectedCategories.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minRating !== undefined ||
    maxRating !== undefined;

  // Toggles the visibility of the dropdown menus since these event handlers are triggered by the onVisibleChange event
  const handleCategoryMenuVisibleChange = (visible) => {
    setCategoryMenuVisible(visible);
  };
  const handlePriceMenuVisibleChange = (visible) => {
    setPriceMenuVisible(visible);
  };
  const handleRatingMenuVisibleChange = (visible) => {
    setRatingMenuVisible(visible);
  };

  // ---------- Event handlers for filter options ----------

  // Toggles the users selection of categories in the dropdown
  const handleCategoryMenuClick = (item) => {
    const itemId = item._id;
    setSelectedCategories(itemId);
  };

  // Sets the users selected sorting option
  const handleSortMenuClick = (item) => {
    setSortOption(item.key);
    handlePaginationChange(1, pageSize);
  };

  // Resets the users selected filtering options
  const handleCategoryReset = () => {
    clearSelectedCategories();
    setCategoryNames([]);
    handlePaginationChange(1, pageSize);
  };
  const handlePriceReset = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    handlePaginationChange(1, pageSize);
  };
  const handleRatingReset = () => {
    setMinRating(undefined);
    setMaxRating(undefined);
    handlePaginationChange(1, pageSize);
  };
  const handleResetAll = () => {
    clearSelectedCategories();
    setCategoryNames([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setMaxRating(undefined);
    handlePaginationChange(1, pageSize);
  };

  // ---------- Dropdown menus for filter options ----------
  const categoryMenu = (
    <Menu>
      <Menu.Item key="reset" onClick={handleCategoryReset}>
        Reset
      </Menu.Item>
      {categories.map((category) => (
        <Menu.Item key={category._id}>
          <Checkbox
            checked={selectedCategories.includes(category._id)}
            onChange={() => {
              handleCategoryMenuClick(category);
              handlePaginationChange(1, pageSize);
            }}
          >
            {category.name}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const priceMenu = (
    <Menu>
      <Menu.Item key="price">
        <div>
          <label>Min Price:</label>
          <InputNumber
            min={0}
            value={minPrice}
            onChange={(value) => {
              setMinPrice(value !== "" ? value : undefined);
              handlePaginationChange(1, pageSize);
            }}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div>
          <label>Max Price:</label>
          <InputNumber
            min={0}
            value={maxPrice}
            onChange={(value) => {
              setMaxPrice(value !== "" ? value : undefined);
              handlePaginationChange(1, pageSize);
            }}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div>
          <Button onClick={handlePriceReset}>Reset</Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  const ratingMenu = (
    <Menu>
      <Menu.Item key="rating">
        <div>
          <label>Min Rating:</label>
          <InputNumber
            min={0}
            value={minRating}
            onChange={(value) => {
              setMinRating(value !== "" ? value : undefined);
              handlePaginationChange(1, pageSize);
            }}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div>
          <label>Max Rating:</label>
          <InputNumber
            min={0}
            value={maxRating}
            onChange={(value) => {
              setMaxRating(value !== "" ? value : undefined);
              handlePaginationChange(1, pageSize);
            }}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div>
          <Button onClick={handleRatingReset}>Reset</Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  const sortMenu = (
    <Menu onClick={handleSortMenuClick}>
      <Menu.Item
        key="default"
        className={sortOption === "default" ? "selected" : ""}
      >
        Default
      </Menu.Item>
      <Menu.Item
        key="priceHighToLow"
        className={sortOption === "priceHighToLow" ? "selected" : ""}
      >
        Price High to Low
      </Menu.Item>
      <Menu.Item
        key="priceLowToHigh"
        className={sortOption === "priceLowToHigh" ? "selected" : ""}
      >
        Price Low to High
      </Menu.Item>
      <Menu.Item
        key="ratingLowToHigh"
        className={sortOption === "ratingLowToHigh" ? "selected" : ""}
      >
        Rating Low to High
      </Menu.Item>
      <Menu.Item
        key="ratingHighToLow"
        className={sortOption === "ratingHighToLow" ? "selected" : ""}
      >
        Rating High to Low
      </Menu.Item>
    </Menu>
  );

  return (
    <Row justify="space-between">
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Row gutter={8}>
          {/* Category Filter */}
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Dropdown
              overlay={categoryMenu}
              visible={categoryMenuVisible}
              onVisibleChange={handleCategoryMenuVisibleChange}
            >
              <Button size="large" style={{ width: "100%" }}>
                Categories <DownOutlined />
              </Button>
            </Dropdown>
          </Col>

          {/* Price Filter */}
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Dropdown
              overlay={priceMenu}
              visible={priceMenuVisible}
              onVisibleChange={handlePriceMenuVisibleChange}
            >
              <Button size="large" style={{ width: "100%" }}>
                Price <DownOutlined />
              </Button>
            </Dropdown>
          </Col>

          {/* Rating Filter */}
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Dropdown
              overlay={ratingMenu}
              visible={ratingMenuVisible}
              onVisibleChange={handleRatingMenuVisibleChange}
            >
              <Button size="large" style={{ width: "100%" }}>
                Rating <DownOutlined />
              </Button>
            </Dropdown>
          </Col>

          {/* Reset All Filters */}
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Button
              size="large"
              onClick={handleResetAll}
              disabled={!isFilterSelected}
              style={{ width: "100%", marginTop: 8 }}
            >
              Reset All Filters
            </Button>
          </Col>
        </Row>
      </Col>

      <Col xs={24} sm={24} md={12} lg={6} xl={6}>
        {/* Sort By */}
        <Dropdown overlay={sortMenu}>
          <Button size="large" style={{ width: "100%" }}>
            Sort <DownOutlined />
          </Button>
        </Dropdown>
      </Col>
    </Row>
  );
};

export default FilterOptions;
