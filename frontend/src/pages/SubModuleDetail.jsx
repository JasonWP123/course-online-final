import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SubModuleDetail = () => {
  const { moduleId, subModuleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [subModule, setSubModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    const fetchSubModule = async () => {
      try {
        const res = await axios.get(`/api/modules/${moduleId}`);
        setModule(res.data);

        const foundSubModule = res.data.subModules?.find(
          (sm) => sm._id === subModuleId,
        );
        setSubModule(foundSubModule);

        // Check if completed
        const enrollment = await axios.get(
          `/api/courses/${res.data.course._id}/enrollment`,
        );
        setIsCompleted(
          enrollment.data?.completedSubModules?.includes(subModuleId) || false,
        );
      } catch (err) {
        console.error("Error fetching sub-module:", err);
      }
      setLoading(false);
    };
    fetchSubModule();
  }, [moduleId, subModuleId]);

  const handleComplete = async () => {
    try {
      await axios.post(
        `/api/modules/${moduleId}/submodules/${subModuleId}/complete`,
      );
      setIsCompleted(true);

      // Update progress
      await axios.put(`/api/courses/${module.course._id}/progress`, {
        completedSubModule: subModuleId,
      });
    } catch (err) {
      console.error("Error completing sub-module:", err);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat materi...</p>
      </div>
    );
  }

  if (!subModule) {
    return (
      <div style={styles.notFound}>
        <h2>Materi tidak ditemukan</h2>
        <Link to={`/course/${module?.course?._id}`} style={styles.backLink}>
          Kembali ke Kursus
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>
          Dashboard
        </Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <Link
          to={`/course/${module?.course?._id}`}
          style={styles.breadcrumbLink}
        >
          {module?.course?.title}
        </Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbCurrent}>{subModule.title}</span>
      </div>

      {/* Content */}
      <div style={styles.contentCard}>
        <div style={styles.header}>
          <div style={styles.typeBadge}>
            {subModule.type === "video" && "🎥 Video Pembelajaran"}
            {subModule.type === "article" && "📄 Artikel"}
            {subModule.type === "exercise" && "✏️ Latihan Soal"}
            {subModule.type === "quiz" && "📝 Kuis"}
            {subModule.type === "reading" && "📖 Materi Bacaan"}
          </div>
          <h1 style={styles.title}>{subModule.title}</h1>
          <p style={styles.description}>{subModule.content}</p>
        </div>

        {/* Video Player */}
        {subModule.type === "video" && subModule.videoUrl && (
          <div style={styles.videoContainer}>
            <iframe
              src={subModule.videoUrl.replace("watch?v=", "embed/")}
              title={subModule.title}
              style={styles.video}
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Support Links */}
        {subModule.supportLinks && subModule.supportLinks.length > 0 && (
          <div style={styles.supportSection}>
            <h3 style={styles.supportTitle}>📎 Materi Pendukung</h3>
            <div style={styles.supportGrid}>
              {subModule.supportLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.supportCard}
                >
                  <span style={styles.supportIcon}>
                    {link.type === "pdf" && "📕"}
                    {link.type === "video" && "🎬"}
                    {link.type === "external" && "🔗"}
                  </span>
                  <span style={styles.supportText}>{link.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={styles.navigation}>
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            style={{
              ...styles.completeButton,
              ...(isCompleted && styles.completeButtonDisabled),
            }}
          >
            {isCompleted ? "✓ Sudah Selesai" : "Tandai Selesai"}
          </button>

          <Link
            to={`/course/${module?.course?._id}`}
            style={styles.backToCourseButton}
          >
            Kembali ke Kursus
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1000px",
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
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "30px",
    fontSize: "0.95rem",
    flexWrap: "wrap",
  },
  breadcrumbLink: {
    color: "#6366f1",
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },
  breadcrumbSeparator: {
    color: "#94a3b8",
  },
  breadcrumbCurrent: {
    color: "#1e293b",
    fontWeight: "500",
  },
  contentCard: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  header: {
    marginBottom: "30px",
  },
  typeBadge: {
    display: "inline-block",
    background: "#e0e7ff",
    color: "#6366f1",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
    marginBottom: "16px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "16px",
  },
  description: {
    fontSize: "1.1rem",
    color: "#475569",
    lineHeight: "1.7",
  },
  videoContainer: {
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    borderRadius: "12px",
    marginBottom: "30px",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
  },
  supportSection: {
    marginTop: "30px",
    paddingTop: "30px",
    borderTop: "1px solid #e2e8f0",
  },
  supportTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "16px",
  },
  supportGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
  },
  supportCard: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#1e293b",
    transition: "all 0.3s",
    ":hover": {
      background: "#e0e7ff",
      color: "#6366f1",
    },
  },
  supportIcon: {
    fontSize: "1.2rem",
  },
  supportText: {
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "40px",
    paddingTop: "30px",
    borderTop: "1px solid #e2e8f0",
  },
  completeButton: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    ":hover": {
      background: "#059669",
      transform: "translateY(-2px)",
    },
  },
  completeButtonDisabled: {
    background: "#cbd5e1",
    cursor: "not-allowed",
    ":hover": {
      background: "#cbd5e1",
      transform: "none",
    },
  },
  backToCourseButton: {
    background: "#f1f5f9",
    color: "#475569",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.3s",
    ":hover": {
      background: "#e2e8f0",
    },
  },
};

export default SubModuleDetail;
