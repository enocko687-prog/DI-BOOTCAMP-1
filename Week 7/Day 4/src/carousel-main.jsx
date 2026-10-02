import React from "react";
import { createRoot } from "react-dom/client";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./carousel.css";
import App from "../Daily challange react carousel.js";

createRoot(document.getElementById("carousel-root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);