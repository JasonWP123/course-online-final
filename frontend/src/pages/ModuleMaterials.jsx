import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ModuleMaterials = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          !courseId ||
          courseId === "undefined" ||
          !moduleId ||
          moduleId === "undefined"
        ) {
          setError("ID Course atau Module tidak valid");
          setLoading(false);
          return;
        }

        const courseRes = await axios.get(`/api/courses/${courseId}`);
        setCourse(courseRes.data);

        const moduleRes = await axios.get(`/api/modules/${moduleId}`);
        setModule(moduleRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.msg || "Gagal memuat data");
      }
      setLoading(false);
    };

    fetchData();
  }, [courseId, moduleId]);

  const handleViewSubModule = (subModuleId) => {
    navigate(`/module/${moduleId}/submodule/${subModuleId}`);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat materi...</p>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Oops! Terjadi Kesalahan</h2>
        <p style={styles.errorMessage}>{error || "Module tidak ditemukan"}</p>
        <Link to={`/course/${courseId}`} style={styles.backButton}>
          ← Kembali ke Course
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
        <Link to={`/course/${courseId}`} style={styles.breadcrumbLink}>
          {course?.title || "Course"}
        </Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbCurrent}>{module.title}</span>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{module.title}</h1>
        <p style={styles.description}>{module.description}</p>

        <div style={styles.stats}>
          <span style={styles.statItem}>⏱️ {module.duration}</span>
          <span style={styles.statItem}>
            📚 {module.subModules?.length || 0} materi
          </span>
          {module.quiz && <span style={styles.statItem}>📝 1 kuis</span>}
        </div>
      </div>

      {/* Learning Objectives */}
      {module.learningObjectives && module.learningObjectives.length > 0 && (
        <div style={styles.objectivesCard}>
          <h3 style={styles.objectivesTitle}>🎯 Tujuan Pembelajaran</h3>
          <ul style={styles.objectivesList}>
            {module.learningObjectives.map((objective, index) => (
              <li key={index} style={styles.objectiveItem}>
                {objective}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Daftar Materi Pembelajaran */}
      <div style={styles.materialsSection}>
        <h2 style={styles.sectionTitle}>📖 Daftar Materi Pembelajaran</h2>

        {!module.subModules || module.subModules.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Belum ada materi untuk modul ini</p>
          </div>
        ) : (
          <div style={styles.materialsGrid}>
            {module.subModules
              .sort((a, b) => a.order - b.order)
              .map((subModule, index) => (
                <div
                  key={subModule._id || index}
                  style={styles.materialCard}
                  onClick={() => handleViewSubModule(subModule._id)}
                >
                  <div style={styles.materialHeader}>
                    <span style={styles.materialType}>
                      {subModule.type === "video" && "🎥"}
                      {subModule.type === "article" && "📄"}
                      {subModule.type === "exercise" && "✏️"}
                      {subModule.type === "reading" && "📖"}
                      {subModule.type === "quiz" && "📝"}
                    </span>
                    <span style={styles.materialBadge}>
                      {subModule.type === "video" && "Video"}
                      {subModule.type === "article" && "Artikel"}
                      {subModule.type === "exercise" && "Latihan"}
                      {subModule.type === "reading" && "Bacaan"}
                      {subModule.type === "quiz" && "Kuis"}
                    </span>
                  </div>

                  <h3 style={styles.materialTitle}>{subModule.title}</h3>
                  <p style={styles.materialDescription}>
                    {subModule.content?.substring(0, 120)}...
                  </p>

                  <div style={styles.materialFooter}>
                    <span style={styles.materialDuration}>
                      ⏱️ {subModule.duration}
                    </span>
                    <span style={styles.viewLink}>Lihat Materi →</span>
                  </div>

                  {/* Link Pembelajaran Support */}
                  {subModule.supportLinks &&
                    subModule.supportLinks.length > 0 && (
                      <div style={styles.supportLinks}>
                        {subModule.supportLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={styles.supportLink}
                          >
                            {link.type === "pdf" && "📄"}
                            {link.type === "video" && "🎬"}
                            {link.type === "external" && "🔗"}
                            {link.type === "article" && "📰"}
                            {link.title}
                          </a>
                        ))}
                      </div>
                    )}

                  {/* Link Google Search dan YouTube Search */}
                  <div style={styles.searchLinks}>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(subModule.title + " " + module.title + " pembelajaran")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={styles.searchLink}
                    >
                      <span style={styles.searchIcon}>🔍</span>
                      Cari di Google
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(subModule.title + " " + module.title + " tutorial")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={styles.searchLink}
                    >
                      <span style={styles.searchIcon}>🎬</span>
                      Cari di YouTube
                    </a>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Kuis Akhir Modul */}
      {module.quiz && (
        <div style={styles.quizSection}>
          <h2 style={styles.sectionTitle}>📝 Kuis Akhir Modul</h2>
          <div style={styles.quizCard}>
            <div style={styles.quizInfo}>
              <h3 style={styles.quizTitle}>{module.quiz.title}</h3>
              <p style={styles.quizDescription}>{module.quiz.description}</p>
              <div style={styles.quizMeta}>
                <span style={styles.quizMetaItem}>
                  ⏱️ {module.quiz.timeLimit} menit
                </span>
                <span style={styles.quizMetaItem}>
                  🎯 Nilai Lulus: {module.quiz.passingScore}%
                </span>
                <span style={styles.quizMetaItem}>
                  📝 {module.quiz.questions?.length || 0} soal
                </span>
              </div>
            </div>
            <Link
              to={`/module/${moduleId}/quiz`}
              style={styles.startQuizButton}
            >
              Mulai Kuis →
            </Link>
          </div>
        </div>
      )}

      {/* Materi Pendukung */}
      {module.supportMaterials && module.supportMaterials.length > 0 && (
        <div style={styles.supportSection}>
          <h2 style={styles.sectionTitle}>📎 Materi Pendukung</h2>
          <div style={styles.supportGrid}>
            {module.supportMaterials.map((material, index) => (
              <a
                key={index}
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.supportCard}
              >
                <span style={styles.supportIcon}>
                  {material.type === "pdf" && "📄"}
                  {material.type === "video" && "🎬"}
                  {material.type === "presentation" && "📊"}
                  {material.type === "link" && "🔗"}
                </span>
                <div style={styles.supportContent}>
                  <h4 style={styles.supportCardTitle}>{material.title}</h4>
                  <p style={styles.supportCardDesc}>{material.description}</p>
                  <span style={styles.supportMeta}>
                    {material.type === "pdf" &&
                      `PDF • ${material.size || "2.1 MB"}`}
                    {material.type === "video" &&
                      `Video • ${material.duration || "25 menit"}`}
                    {material.type === "link" && "Link Eksternal"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tombol Kembali */}
      <div style={styles.navigation}>
        <Link to={`/course/${courseId}`} style={styles.backToCourseButton}>
          ← Kembali ke Course
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
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
  errorContainer: {
    textAlign: "center",
    padding: "60px 20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  errorIcon: {
    fontSize: "48px",
    marginBottom: "20px",
  },
  errorTitle: {
    fontSize: "24px",
    color: "#ef4444",
    marginBottom: "16px",
  },
  errorMessage: {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "30px",
  },
  backButton: {
    display: "inline-block",
    background: "#6366f1",
    color: "white",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "all 0.3s",
    ":hover": {
      background: "#4f52e0",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
    },
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
  header: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "16px",
  },
  description: {
    fontSize: "1.1rem",
    color: "#475569",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  stats: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  statItem: {
    background: "#f1f5f9",
    padding: "8px 16px",
    borderRadius: "30px",
    fontSize: "0.95rem",
    color: "#475569",
  },
  objectivesCard: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "40px",
    border: "1px solid #e2e8f0",
  },
  objectivesTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "16px",
  },
  objectivesList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  objectiveItem: {
    padding: "8px 0",
    paddingLeft: "24px",
    position: "relative",
    color: "#475569",
    ":before": {
      content: '"•"',
      color: "#6366f1",
      fontWeight: "bold",
      position: "absolute",
      left: "8px",
    },
  },
  materialsSection: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "24px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    background: "#f8fafc",
    borderRadius: "16px",
  },
  emptyText: {
    color: "#64748b",
    fontSize: "1rem",
  },
  materialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px",
  },
  materialCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    flexDirection: "column",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
      borderColor: "#6366f1",
    },
  },
  materialHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  materialType: {
    fontSize: "2rem",
  },
  materialBadge: {
    background: "#e0e7ff",
    color: "#6366f1",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  materialTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
  },
  materialDescription: {
    fontSize: "0.95rem",
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "20px",
    flex: 1,
  },
  materialFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  materialDuration: {
    fontSize: "0.9rem",
    color: "#64748b",
  },
  viewLink: {
    color: "#6366f1",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  supportLinks: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0",
    marginBottom: "12px",
  },
  supportLink: {
    fontSize: "0.85rem",
    color: "#6366f1",
    textDecoration: "none",
    padding: "4px 12px",
    background: "#e0e7ff",
    borderRadius: "20px",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    ":hover": {
      background: "#c7d2fe",
    },
  },
  searchLinks: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  searchLink: {
    flex: 1,
    fontSize: "0.85rem",
    color: "#475569",
    textDecoration: "none",
    padding: "8px 12px",
    background: "#f1f5f9",
    borderRadius: "8px",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontWeight: "500",
    ":hover": {
      background: "#e2e8f0",
      color: "#1e293b",
    },
  },
  searchIcon: {
    fontSize: "0.95rem",
  },
  quizSection: {
    marginBottom: "40px",
  },
  quizCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    padding: "32px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "8px",
  },
  quizDescription: {
    fontSize: "0.95rem",
    opacity: 0.95,
    marginBottom: "16px",
  },
  quizMeta: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  quizMetaItem: {
    background: "rgba(255,255,255,0.2)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    backdropFilter: "blur(10px)",
  },
  startQuizButton: {
    background: "white",
    color: "#6366f1",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "all 0.3s",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    },
  },
  supportSection: {
    marginBottom: "40px",
  },
  supportGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  supportCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
    textDecoration: "none",
    transition: "all 0.3s",
    ":hover": {
      borderColor: "#6366f1",
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
      transform: "translateY(-2px)",
    },
  },
  supportIcon: {
    fontSize: "1.5rem",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    borderRadius: "12px",
    color: "#475569",
  },
  supportContent: {
    flex: 1,
  },
  supportCardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
  },
  supportCardDesc: {
    fontSize: "0.9rem",
    color: "#64748b",
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  supportMeta: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  navigation: {
    marginTop: "40px",
    textAlign: "center",
  },
  backToCourseButton: {
    display: "inline-block",
    background: "#f1f5f9",
    color: "#475569",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "500",
    transition: "all 0.3s",
    ":hover": {
      background: "#e2e8f0",
      transform: "translateY(-2px)",
    },
  },
};

export default ModuleMaterials;
