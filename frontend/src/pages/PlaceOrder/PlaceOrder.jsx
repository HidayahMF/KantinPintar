import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContextProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, foodList, cartItems, url, setCartItems } =
    useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart", { replace: true });
    }
   
  }, [token, getTotalCartAmount, navigate]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!token) {
      alert("Please login first.");
      return;
    }

    const orderItems = (foodList || [])
      .filter((item) => cartItems && cartItems[item._id] > 0)
      .map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: cartItems[item._id],
        image: item.image,
        category: item.category,
      }));

    if (orderItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const totalAmount = getTotalCartAmount();
    const orderData = {
      address: data,
      items: orderItems,
      amount: totalAmount + 2, 
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.session_url) {
        setCartItems && setCartItems({});
        localStorage.removeItem("cartItems"); 
        window.location.href = response.data.session_url;
      } else if (response.data.success) {
        setCartItems && setCartItems({});
        localStorage.removeItem("cartItems");
        alert("Order successfully created!");
        navigate("/myorders");
      } else {
        alert("Failed to process order.");
      }
    } catch (error) {
      console.error("An error occurred with the order:", error);
      alert(
        error?.response?.data?.message ||
          "An error occurred while processing the order."
      );
    }
  };

  if (!cartItems || !foodList) return <div>Loading...</div>;

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Shipping Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          type="email"
          onChange={onChangeHandler}
          value={data.email}
          placeholder="Email"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          placeholder="Street Address"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            placeholder="Province"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            placeholder="Postal code"
          />
          <input
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          placeholder="Phone number"
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Order Summary</h2>
          {(foodList || [])
            .filter((item) => cartItems[item._id] > 0)
            .map((item) => (
              <div key={item._id} className="cart-item-details">
                <div>
                  <p>{item.name}</p>
                  <p>Qty {cartItems[item._id]}</p>
                </div>
                <div>
                  <p>${(item.price * cartItems[item._id]).toFixed(2)}</p>
                  <p className="price-each">${item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          <hr />
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>${getTotalCartAmount().toFixed(2)}</p>
          </div>
          <div className="cart-total-details">
            <p>Shipping costs</p>
            <p>${getTotalCartAmount() === 0 ? "0.00" : "2.00"}</p>
          </div>
          <div className="cart-total-details">
            <b>Total</b>
            <b>
              $
              {getTotalCartAmount() === 0
                ? "0.00"
                : (getTotalCartAmount() + 2).toFixed(2)}
            </b>
          </div>
          <button type="submit">Proceed to Payment</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
