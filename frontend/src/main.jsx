import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import "./index.css";

const pathname = window.location.pathname;

const isAdminPage =
  pathname === "/admin" ||
  pathname.startsWith("/admin/");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isAdminPage ? <AdminDashboard /> : <App />}
  </StrictMode>
);