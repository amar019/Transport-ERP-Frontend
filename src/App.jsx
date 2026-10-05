import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import AppRoutes from "@/routes/AppRoutes";
import "./App.css";

const SESSION_MAX_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Listen for custom logout event triggered by API interceptor
    const handleAuthLogout = () => {
      dispatch(logout());
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [dispatch]);

  // Session timer to automatically log out after 1 hour
  useEffect(() => {
    if (!isAuthenticated) return;

    const loginTimestamp = localStorage.getItem("loginTimestamp");
    if (!loginTimestamp) {
      localStorage.setItem("loginTimestamp", Date.now().toString());
      return;
    }

    const elapsed = Date.now() - parseInt(loginTimestamp, 10);
    const remainingTime = SESSION_MAX_DURATION - elapsed;

    if (remainingTime <= 0) {
      console.warn("1 hour session expired. Logging out automatically.");
      dispatch(logout());
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?sessionExpired=true";
      }
    } else {
      const timer = setTimeout(() => {
        console.warn("1 hour session reached. Automatic logout.");
        dispatch(logout());
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?sessionExpired=true";
        }
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;