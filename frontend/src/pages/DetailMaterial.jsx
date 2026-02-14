import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const DetailMaterial = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await axios.get(`/api/materials/${id}`);
        setMaterial(res.data);
      } catch (err) {
        console.error("Error fetching material:", err);
      }
      setLoading(false);
    };
    fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat materi...</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div style={styles.notFound}>
        <h2>Materi tidak ditemukan</h2>
        <Link to="/" style={styles.backLink}>
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Link to={`/course/${material.course?._id}`} style={styles.backLink}>
        ← Kembali ke Kursus
      </Link>

      <div style={styles.header}>
        <div style={styles.meta}>
          <span style={styles.subject}>{material.subject}</span>
          <span style={styles.type}>
            {material.type === "video" ? "🎥 Video" : "📄 Artikel"}
          </span>
          <span style={styles.duration}>⏱️ {material.duration}</span>
        </div>
        <h1 style={styles.title}>{material.title}</h1>
        <p style={styles.description}>{material.description}</p>
      </div>

      <div style={styles.content}>
        {material.type === "video" ? (
          <div style={styles.videoPlaceholder}>
            <span style={styles.videoIcon}>🎥</span>
            <h3>Video Pembelajaran</h3>
            <p>{material.content}</p>
          </div>
        ) : (
          <div style={styles.article}>
            <h3 style={styles.articleTitle}>Materi Pembelajaran</h3>
            <div style={styles.articleContent}>{material.content}</div>
          </div>
        )}
      </div>

      {material.module && (
        <div style={styles.navigation}>
          <Link to={`/course/${material.course?._id}`} style={styles.navButton}>
            ← Kembali ke Modul
          </Link>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "calc(100vh - 70px)",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e0e7ff",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  notFound: {
    textAlign: "center",
    padding: "60px 20px",
  },
  backLink: {
    display: "inline-block",
    marginBottom: "30px",
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "500",
  },
  header: {
    marginBottom: "40px",
  },
  meta: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  subject: {
    background: "#e0e7ff",
    color: "#6366f1",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  type: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "0.9rem",
  },
  duration: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "0.9rem",
  },
  title: {
    fontSize: "2rem",
    color: "#1e293b",
    marginBottom: "16px",
  },
  description: {
    fontSize: "1.1rem",
    color: "#475569",
    lineHeight: "1.6",
  },
  content: {
    background: "white",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  videoPlaceholder: {
    textAlign: "center",
    padding: "40px",
  },
  videoIcon: {
    fontSize: "64px",
    marginBottom: "20px",
    display: "block",
  },
  article: {
    lineHeight: "1.8",
  },
  articleTitle: {
    fontSize: "1.3rem",
    color: "#1e293b",
    marginBottom: "20px",
  },
  articleContent: {
    color: "#334155",
    fontSize: "1rem",
    lineHeight: "1.8",
    textAlign: "justify",
  },
  navigation: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
  navButton: {
    background: "#f1f5f9",
    color: "#475569",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "500",
    transition: "all 0.3s",
  },
};

export default DetailMaterial;
