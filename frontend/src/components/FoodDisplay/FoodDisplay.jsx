import React, { useContext, useState } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../context/StoreContextProvider";

const ITEMS_PER_PAGE = 12;

const FoodDisplay = ({ selectedCategory }) => {
  const { foodList } = useContext(StoreContext);

  // Filter makanan sesuai kategori
  let filtered = foodList;
  if (selectedCategory && selectedCategory !== "All") {
    filtered = foodList.filter((item) => item.category === selectedCategory);
  }

  // Pagination logic
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (filtered.length === 0)
    return <p>No food items found in "{selectedCategory}" category.</p>;

  return (
    <div className="food-display">
      <div className="food-display-list">
        {currentItems.map((food) => (
          <FoodItem
            key={food._id}
            id={food._id}
            name={food.name}
            description={food.description}
            price={food.price}
            image={food.image}
            stock={food.stock}
          />
        ))}
      </div>
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            &lt; Prev
          </button>
          <span>
            Page <b>{page}</b> of <b>{totalPages}</b>
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
