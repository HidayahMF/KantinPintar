import React, { useContext } from "react";
import "./FoodList.css";
import FoodItem from "./FoodItem";
import { StoreContext } from "../../context/StoreContextProvider";

const FoodList = ({ selectedCategory }) => {
  const { foodList, url } = useContext(StoreContext);

  // Filter berdasarkan kategori
  const filteredFoods = selectedCategory && selectedCategory !== "All"
    ? foodList.filter((food) => food.category === selectedCategory)
    : foodList;

  return (
    <div className="food-list">
      {filteredFoods.length > 0 ? (
        filteredFoods.map((food) => (
          <FoodItem
            key={food._id}
            id={food._id}
            name={food.name}
            price={food.price}
            description={food.description}
            image={`${url}/uploads/${food.image}`}
            stock={food.stock}
          />
        ))
      ) : (
        <p>There are no foods or drinks in this category.</p>
      )}
    </div>
  );
};

export default FoodList;
