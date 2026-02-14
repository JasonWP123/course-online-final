import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "react-google-button";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ State modal
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password });
    setLoading(false);

    if (result.success) {
      setShowSuccessModal(true); // ✅ Tampilkan modal sukses
    } else {
      setError(result.error);
    }
  };

  const goToLogin = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Daftar Akun</h1>
        <p style={styles.subtitle}>Mulai belajar bersama Learnify</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={onSubmit} style={styles.form}>
          {/* Form fields sama seperti di atas */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

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
              placeholder="Minimal 6 karakter"
              minLength="6"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              style={styles.input}
              placeholder="Masukkan ulang password"
              minLength="6"
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>atau</span>
        </div>

        <div style={styles.googleButtonContainer}>
          <GoogleButton
            onClick={googleLogin}
            style={styles.googleButton}
            label="Daftar dengan Google"
          />
        </div>

        <div style={styles.footer}>
          <p>
            Sudah punya akun?{" "}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* ✅ MODAL SUCCESS */}
      {showSuccessModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.icon}>✅</div>
            <h2 style={modalStyles.title}>Registrasi Berhasil!</h2>
            <p style={modalStyles.message}>
              Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.
            </p>
            <div style={modalStyles.buttons}>
              <button onClick={goToLogin} style={modalStyles.button}>
                Login Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Style untuk modal
const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "400px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  icon: {
    fontSize: "48px",
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
    lineHeight: "1.6",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
  },
  button: {
    background: "#6366f1",
    color: "white",
    padding: "12px 32px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
};

const styles = {
  // ... styles yang sama seperti di atas
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
    marginTop: "10px",
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
  },
};

export default Register;
