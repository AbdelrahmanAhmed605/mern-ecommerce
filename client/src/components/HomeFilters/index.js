import React, { useState } from "react";
import { Menu, Checkbox, InputNumber, Button, Dropdown, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./index.css";

const FilterOptions = ({
  categories,
  selectedCategories,
  handleCategoryMenuClick,
  handleCategoryReset,
  minPrice,
  maxPrice,
  handlePriceReset,
  setMinPrice,
  setMaxPrice,
  minRating,
  maxRating,
  sortOption,
  handleRatingReset,
  setMinRating,
  setMaxRating,
  handleSortMenuClick,
  handleResetAll,
}) => {
  // Check if any filter options are selected
  const isFilterSelected =
    selectedCategories.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minRating !== undefined ||
    maxRating !== undefined;

  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false); // Controls category dropdown element visibility
  const [priceMenuVisible, setPriceMenuVisible] = useState(false); // Controls price dropdown element visibility
  const [ratingMenuVisible, setRatingMenuVisible] = useState(false); // Controls rating dropdown element visibility

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
            onChange={() => handleCategoryMenuClick(category)}
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
            onChange={(value) => setMinPrice(value !== "" ? value : undefined)}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div>
          <label>Max Price:</label>
          <InputNumber
            min={0}
            value={maxPrice}
            onChange={(value) => setMaxPrice(value !== "" ? value : undefined)}
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
            onChange={(value) => setMinRating(value !== "" ? value : undefined)}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div>
          <label>Max Rating:</label>
          <InputNumber
            min={0}
            value={maxRating}
            onChange={(value) => setMaxRating(value !== "" ? value : undefined)}
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
