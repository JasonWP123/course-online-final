import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { loadUser } = useContext(AuthContext);

  useEffect(() => {
    const handleAuthSuccess = async () => {
      // ✅ AMBIL TOKEN DARI URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      console.log("🔑 Token from URL:", token ? "✅ Received" : "❌ Not found");

      if (token) {
        // ✅ SIMPAN TOKEN DI LOCALSTORAGE
        localStorage.setItem("token", token);

        // ✅ SET TOKEN DI AXIOS HEADERS
        axios.defaults.headers.common["x-auth-token"] = token;

        // ✅ LOAD USER DATA
        await loadUser();

        // ✅ REDIRECT KE DASHBOARD
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        // ❌ TIDAK ADA TOKEN
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    handleAuthSuccess();
  }, [navigate, loadUser]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✅</div>
        <h1 style={styles.title}>Login Berhasil!</h1>
        <p style={styles.message}>Anda akan diarahkan ke dashboard...</p>
        <div style={styles.spinner}></div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    padding: "60px",
    textAlign: "center",
    maxWidth: "400px",
  },
  icon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  title: {
    color: "#2d3748",
    marginBottom: "16px",
    fontSize: "24px",
    fontWeight: "700",
  },
  message: {
    color: "#718096",
    marginBottom: "30px",
    fontSize: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e0e7ff",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
};

export default AuthSuccess;
