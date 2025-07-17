import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import "./styles/navbar.css";
import "./styles/global.css"; // Global styles for integration

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);

