import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "react-google-button";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Selamat Datang</h1>
        <p style={styles.subtitle}>Silakan login ke akun Anda</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              style={styles.input}
              placeholder="Masukkan email"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              style={styles.input}
              placeholder="Masukkan password"
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Login..." : "Login"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>atau</span>
        </div>

        <div style={styles.googleButtonContainer}>
          <GoogleButton
            onClick={googleLogin}
            style={styles.googleButton}
            label="Login dengan Google"
          />
        </div>

        <div style={styles.footer}>
          <p>
            Belum punya akun?{" "}
            <Link to="/register" style={styles.link}>
              Daftar
            </Link>
          </p>
        </div>
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
    padding: "40px",
    width: "100%",
    maxWidth: "450px",
  },
  title: {
    color: "#2d3748",
    marginBottom: "10px",
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "#718096",
    fontSize: "16px",
    textAlign: "center",
    marginBottom: "30px",
  },
  error: {
    background: "#fed7d7",
    color: "#c53030",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#4a5568",
    fontWeight: "500",
    fontSize: "14px",
  },
  input: {
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "border-color 0.3s",
    ":focus": {
      borderColor: "#6366f1",
      boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
    },
  },
  button: {
    background: "#6366f1",
    color: "white",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    marginTop: "10px",
    ":hover": {
      background: "#4f52e0",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
    },
  },
  divider: {
    position: "relative",
    margin: "30px 0",
    textAlign: "center",
    borderTop: "1px solid #e2e8f0",
  },
  dividerText: {
    position: "relative",
    top: "-12px",
    background: "white",
    padding: "0 16px",
    color: "#718096",
    fontSize: "14px",
  },
  googleButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  googleButton: {
    width: "100%",
    height: "50px",
    borderRadius: "8px",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
    color: "#718096",
  },
  link: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "500",
    ":hover": {
      textDecoration: "underline",
    },
  },
  demo: {
    marginTop: "30px",
    padding: "20px",
    background: "#f7fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  demoTitle: {
    color: "#2d3748",
    fontWeight: "600",
    marginBottom: "10px",
  },
  demoText: {
    color: "#4a5568",
    fontSize: "14px",
    marginBottom: "5px",
  },
};

export default Login;
