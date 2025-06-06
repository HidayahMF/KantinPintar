import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logokantin} alt="" />
          <p>
             Welcome to Kantin Pintar – your one-stop solution for ordering delicious meals online! 
             Browse your favorite dishes, place an order in seconds, and enjoy fast, reliable delivery right to your doorstep.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Get In Touch</h2>
          <ul>
            <li>+62-8212-5630-770</li>
            <li>contact@HidayahMF.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2025© HidayahMF.com - All Right Reserved{" "}
      </p>
    </div>
  );
};

export default Footer;
