import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContextProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const FoodItem = ({ id, name, price, description, image, stock }) => {
  const { cartItems, addToCart, removeFromCart, foodList, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const quantityInCart = cartItems[id] || 0;

  const foodStock =
    typeof stock !== "undefined"
      ? stock
      : (foodList.find((item) => item._id === id) || {}).stock || 0;

  const handleAddToCart = () => {
    if (quantityInCart + 1 > foodStock) {
      toast.error("Stock tidak cukup!");
      return;
    }
    addToCart(id);
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container clickable" onClick={() => navigate(`/food/${id}`)}>
        <img
          className="food-item-image"
          src={image.startsWith("http") ? image : `${url}/uploads/${image}`}
          alt={`Image of ${name}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = assets.no_image_icon || "/default-food.png";
          }}
        />
        {/* STOCK BADGE */}
        <span className={`food-item-stock-badge ${foodStock === 0 ? "stock-out" : ""}`}>
          {foodStock === 0 ? "Out" : `Stock: ${foodStock}`}
        </span>
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating clickable" onClick={() => navigate(`/food/${id}`)}>
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating stars" />
        </div>
        <p className="food-item-desc">{description}</p>
        <div className="food-item-price">${price.toFixed(2)}</div>
        <div className="food-item-cart-action">
          {!cartItems[id] ? (
            <button
              className="add-btn-glow slim"
              onClick={foodStock === 0 ? null : handleAddToCart}
              disabled={foodStock === 0}
              title={foodStock === 0 ? "Stock habis" : "Tambah ke cart"}
            >
              <span className="icon-plus"></span>
            </button>
          ) : (
            <div className="food-item-counter-modern">
              <button
                className="counter-btn-modern"
                onClick={() => removeFromCart(id)}
                aria-label="Kurangi"
              >
                <span className="icon-minus"></span>
              </button>
              <span className="counter-qty-modern">{cartItems[id]}</span>
              <button
                className="counter-btn-modern"
                onClick={quantityInCart >= foodStock ? null : handleAddToCart}
                disabled={quantityInCart >= foodStock}
                aria-label="Tambah"
              >
                <span className="icon-plus"></span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
