import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const MyCourses = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/courses/user/my-courses");
      setEnrollments(res.data);
    } catch (err) {
      console.error("Error fetching my courses:", err);
    }
    setLoading(false);
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return "#ef4444";
    if (progress < 70) return "#f59e0b";
    return "#10b981";
  };

  const getStatusText = (progress) => {
    if (progress === 0) return "Belum Dimulai";
    if (progress === 100) return "Selesai";
    return "Sedang Berjalan";
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filter === "all") return true;
    if (filter === "in-progress") {
      return enrollment.progress > 0 && enrollment.progress < 100;
    }
    if (filter === "completed") {
      return enrollment.progress === 100;
    }
    return true;
  });

  const getSubjectIcon = (subject) => {
    const icons = {
      Matematika: "🧮",
      Fisika: "⚛️",
      Kimia: "🧪",
      Biologi: "🧬",
      "Web Development": "🌐",
      Programming: "💻",
      "Mobile Development": "📱",
      Database: "🗄️",
      "Bahasa Inggris": "🇬🇧",
      "Bahasa Indonesia": "🇮🇩",
    };
    return icons[subject] || "📚";
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat kursus Anda...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📚 My Courses</h1>
          <p style={styles.subtitle}>
            {user?.name}, kamu telah mengikuti {enrollments.length} kursus
          </p>
        </div>
        <Link to="/" style={styles.browseButton}>
          <span>+</span> Jelajahi Kursus Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>📚</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{enrollments.length}</span>
            <span style={styles.statLabel}>Total Kursus</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>⏳</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>
              {
                enrollments.filter((e) => e.progress > 0 && e.progress < 100)
                  .length
              }
            </span>
            <span style={styles.statLabel}>Sedang Berjalan</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>✅</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>
              {enrollments.filter((e) => e.progress === 100).length}
            </span>
            <span style={styles.statLabel}>Selesai</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>⏱️</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>
              {enrollments.reduce(
                (acc, e) => acc + (e.course?.totalModules || 0),
                0,
              )}
            </span>
            <span style={styles.statLabel}>Total Modul</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        <button
          onClick={() => setFilter("all")}
          style={{
            ...styles.filterTab,
            ...(filter === "all" && styles.filterTabActive),
          }}
        >
          Semua Kursus ({enrollments.length})
        </button>
        <button
          onClick={() => setFilter("in-progress")}
          style={{
            ...styles.filterTab,
            ...(filter === "in-progress" && styles.filterTabActive),
          }}
        >
          Sedang Berjalan (
          {enrollments.filter((e) => e.progress > 0 && e.progress < 100).length}
          )
        </button>
        <button
          onClick={() => setFilter("completed")}
          style={{
            ...styles.filterTab,
            ...(filter === "completed" && styles.filterTabActive),
          }}
        >
          Selesai ({enrollments.filter((e) => e.progress === 100).length})
        </button>
      </div>

      {/* Courses Grid */}
      {filteredEnrollments.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>Belum Ada Kursus</h3>
          <p style={styles.emptyText}>
            {filter === "all"
              ? "Kamu belum mengambil kursus apapun. Mulai belajar sekarang!"
              : filter === "in-progress"
                ? "Tidak ada kursus yang sedang berjalan"
                : "Belum ada kursus yang selesai"}
          </p>
          <Link to="/" style={styles.emptyButton}>
            Jelajahi Kursus
          </Link>
        </div>
      ) : (
        <div style={styles.coursesGrid}>
          {filteredEnrollments.map((enrollment) => {
            const course = enrollment.course;
            const progress = enrollment.progress || 0;
            const progressColor = getProgressColor(progress);
            const statusText = getStatusText(progress);

            return (
              <div key={enrollment._id} style={styles.courseCard}>
                <div style={styles.courseHeader}>
                  <div style={styles.courseIconContainer}>
                    <span style={styles.courseIcon}>
                      {getSubjectIcon(course?.subject)}
                    </span>
                  </div>
                  <div style={styles.courseMeta}>
                    <span style={styles.courseSubject}>
                      {course?.subject || "Umum"}
                    </span>
                    <span
                      style={{
                        ...styles.courseStatus,
                        ...(progress === 100
                          ? styles.statusCompleted
                          : styles.statusInProgress),
                      }}
                    >
                      {statusText}
                    </span>
                  </div>
                </div>

                <h3 style={styles.courseTitle}>
                  <Link to={`/course/${course?._id}`} style={styles.courseLink}>
                    {course?.title}
                  </Link>
                </h3>

                <p style={styles.courseDescription}>
                  {course?.description?.substring(0, 100)}...
                </p>

                <div style={styles.progressSection}>
                  <div style={styles.progressHeader}>
                    <span style={styles.progressLabel}>Progress</span>
                    <span
                      style={{
                        ...styles.progressPercentage,
                        color: progressColor,
                      }}
                    >
                      {progress}%
                    </span>
                  </div>
                  <div style={styles.progressBarContainer}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${progress}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                </div>

                <div style={styles.courseStats}>
                  <div style={styles.statItem}>
                    <span style={styles.statIcon}>📖</span>
                    <span style={styles.statText}>
                      {course?.totalModules || 0} modul
                    </span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statIcon}>⏱️</span>
                    <span style={styles.statText}>
                      {course?.totalDuration || "0 jam"}
                    </span>
                  </div>
                </div>

                <div style={styles.actionSection}>
                  {progress === 0 ? (
                    <Link
                      to={`/course/${course?._id}`}
                      style={styles.startButton}
                    >
                      🚀 Mulai Belajar
                    </Link>
                  ) : progress === 100 ? (
                    <Link
                      to={`/course/${course?._id}`}
                      style={styles.reviewButton}
                    >
                      📋 Lihat Sertifikat
                    </Link>
                  ) : (
                    <Link
                      to={`/course/${course?._id}`}
                      style={styles.continueButton}
                    >
                      🔄 Lanjutkan ({progress}%)
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "40px 24px",
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  subtitle: {
    fontSize: "1rem",
    color: "#64748b",
    marginTop: "8px",
  },
  browseButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#6366f1",
    color: "white",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "30px",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "all 0.3s",
    ":hover": {
      background: "#4f52e0",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 16px rgba(99,102,241,0.2)",
    },
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statInfo: {
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#64748b",
  },
  filterTabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "12px",
  },
  filterTab: {
    padding: "8px 20px",
    border: "none",
    background: "none",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      color: "#6366f1",
      background: "#f8fafc",
    },
  },
  filterTabActive: {
    background: "#e0e7ff",
    color: "#6366f1",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    background: "white",
    borderRadius: "20px",
    border: "1px solid #edf2f7",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "1rem",
    color: "#64748b",
    marginBottom: "24px",
  },
  emptyButton: {
    display: "inline-block",
    background: "#6366f1",
    color: "white",
    textDecoration: "none",
    padding: "12px 32px",
    borderRadius: "30px",
    fontWeight: "600",
    transition: "all 0.3s",
    ":hover": {
      background: "#4f52e0",
      transform: "translateY(-2px)",
    },
  },
  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px",
  },
  courseCard: {
    background: "white",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
    transition: "all 0.3s",
    display: "flex",
    flexDirection: "column",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
      borderColor: "#6366f1",
    },
  },
  courseHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  courseIconContainer: {
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e0e7ff",
    borderRadius: "16px",
  },
  courseIcon: {
    fontSize: "2rem",
  },
  courseMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  courseSubject: {
    fontSize: "0.85rem",
    color: "#6366f1",
    background: "#e0e7ff",
    padding: "4px 12px",
    borderRadius: "20px",
    alignSelf: "flex-start",
    fontWeight: "600",
  },
  courseStatus: {
    fontSize: "0.8rem",
    padding: "4px 12px",
    borderRadius: "20px",
    alignSelf: "flex-start",
    fontWeight: "500",
  },
  statusInProgress: {
    background: "#fef3c7",
    color: "#92400e",
  },
  statusCompleted: {
    background: "#d1fae5",
    color: "#065f46",
  },
  courseTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  courseLink: {
    color: "#1e293b",
    textDecoration: "none",
    ":hover": {
      color: "#6366f1",
      textDecoration: "underline",
    },
  },
  courseDescription: {
    fontSize: "0.95rem",
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "20px",
    flex: 1,
  },
  progressSection: {
    marginBottom: "20px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  progressLabel: {
    fontSize: "0.85rem",
    color: "#64748b",
  },
  progressPercentage: {
    fontSize: "0.95rem",
    fontWeight: "600",
  },
  progressBarContainer: {
    width: "100%",
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  courseStats: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #edf2f7",
  },
  statText: {
    fontSize: "0.85rem",
    color: "#475569",
  },
  actionSection: {
    display: "flex",
    justifyContent: "flex-end",
  },
  startButton: {
    background: "#6366f1",
    color: "white",
    textDecoration: "none",
    padding: "10px 24px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s",
    ":hover": {
      background: "#4f52e0",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
    },
  },
  continueButton: {
    background: "#10b981",
    color: "white",
    textDecoration: "none",
    padding: "10px 24px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s",
    ":hover": {
      background: "#059669",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
    },
  },
  reviewButton: {
    background: "#8b5cf6",
    color: "white",
    textDecoration: "none",
    padding: "10px 24px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s",
    ":hover": {
      background: "#7c3aed",
      transform: "translateY(-2px)",
    },
  },
};

export default MyCourses;
