import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// ✅ NAMED EXPORT UNTUK CONTEXT
export const AuthContext = createContext();

// ✅ DEFAULT EXPORT UNTUK PROVIDER
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set axios defaults
  axios.defaults.baseURL = "http://localhost:5000";
  axios.defaults.headers.common["Content-Type"] = "application/json";
  axios.defaults.withCredentials = true;

  // ✅ LOAD USER FUNCTION - EXPOSE VIA CONTEXT
  const loadUser = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common["x-auth-token"] = storedToken;
      const res = await axios.get("/api/auth/me");
      setUser(res.data);
      console.log("✅ User loaded:", res.data.name);
    } catch (err) {
      console.error("❌ Error loading user:", err);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["x-auth-token"];
    }
    setLoading(false);
  };

  // ✅ CHECK TOKEN ON INITIAL LOAD
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axios.defaults.headers.common["x-auth-token"] = storedToken;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (formData) => {
    try {
      const res = await axios.post("/api/auth/register", formData);
      return {
        success: true,
        message: res.data.msg || "Registrasi berhasil! Silakan login.",
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || "Registrasi gagal",
      };
    }
  };

  const login = async (formData) => {
    try {
      const res = await axios.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["x-auth-token"] = res.data.token;
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || "Login gagal",
      };
    }
  };

  // ✅ GOOGLE LOGIN - Redirect ke backend
  const googleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["x-auth-token"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleLogin,
        logout,
        loadUser, // ✅ EXPOSE loadUser function!
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
