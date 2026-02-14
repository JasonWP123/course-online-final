import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        if (!courseId || courseId === "undefined" || courseId === "null") {
          setError("ID Course tidak valid");
          setLoading(false);
          return;
        }

        const res = await axios.get(`/api/courses/${courseId}`);
        setCourseData(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching course detail:", err);
        setError(err.response?.data?.msg || "Gagal memuat detail kursus");
      }
      setLoading(false);
    };

    fetchCourseDetail();
  }, [courseId]);

  // ✅ Hitung progress berdasarkan sub-modules
  const calculateProgress = () => {
    if (!courseData?.modules || !courseData?.enrollment) return 0;

    const { modules, enrollment } = courseData;
    const completedSubModules = enrollment.completedSubModules || [];

    let totalSubModules = 0;
    modules.forEach((module) => {
      totalSubModules += module.subModules?.length || 0;
    });

    if (totalSubModules === 0) return 0;
    return Math.round((completedSubModules.length / totalSubModules) * 100);
  };

  // ✅ Hitung jumlah materi selesai
  const getCompletedCount = () => {
    if (!courseData?.enrollment?.completedSubModules) return 0;
    return courseData.enrollment.completedSubModules.length;
  };

  // ✅ Hitung total materi
  const getTotalCount = () => {
    if (!courseData?.modules) return 0;
    let total = 0;
    courseData.modules.forEach((module) => {
      total += module.subModules?.length || 0;
    });
    return total;
  };

  // ✅ Tandai sub-module selesai
  const markSubModuleComplete = async (moduleId, subModuleId) => {
    try {
      await axios.post(
        `/api/modules/${moduleId}/submodules/${subModuleId}/complete`,
      );
      const res = await axios.get(`/api/courses/${courseId}`);
      setCourseData(res.data);
    } catch (err) {
      console.error("Error marking sub-module complete:", err);
    }
  };

  // ✅ Cek status sub-module
  const isSubModuleCompleted = (subModuleId) => {
    if (!courseData?.enrollment?.completedSubModules) return false;
    return courseData.enrollment.completedSubModules.includes(subModuleId);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat detail kursus...</p>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>😕</div>
        <h2 style={styles.errorTitle}>Kursus Tidak Ditemukan</h2>
        <p style={styles.errorMessage}>
          {error || "Kursus yang Anda cari tidak tersedia."}
        </p>
        <Link to="/" style={styles.backButton}>
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const { course, modules, enrollment } = courseData;
  const progress = calculateProgress();
  const completedCount = getCompletedCount();
  const totalCount = getTotalCount();

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>
          Dashboard
        </Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbCurrent}>
          {course?.title || "Course"}
        </span>
      </div>

      {/* Course Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.meta}>
            <span style={styles.subject}>{course?.subject}</span>
            <span style={styles.level}>{course?.level}</span>
            {enrollment && (
              <span style={styles.enrolledBadge}>✓ Terdaftar</span>
            )}
          </div>
          <h1 style={styles.title}>{course?.title}</h1>
          <p style={styles.description}>{course?.description}</p>

          <div style={styles.stats}>
            <span>📚 {modules?.length || 0} modul</span>
            <span>📖 {totalCount} materi</span>
            <span>⏱️ {course?.totalDuration || "0 jam"}</span>
            <span>👥 {course?.enrolledCount || 0} siswa</span>
          </div>

          {/* ✅ PROGRESS CARD - Menampilkan "1 dari 10 materi selesai" */}
          {/* {enrollment && (
            <div style={styles.progressCard}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Progress Belajar</span>
                <span style={styles.progressPercent}>{progress}%</span>
              </div>
              <div style={styles.progressBarContainer}>
                <div
                  style={{ ...styles.progressBarFill, width: `${progress}%` }}
                />
              </div>
              <p style={styles.progressStatus}>
                {completedCount} dari {totalCount} materi selesai
              </p>
            </div>
          )} */}
        </div>
      </div>

      {/* Daftar Modul */}
      <div style={styles.modulesSection}>
        <h2 style={styles.sectionTitle}>📋 Daftar Modul</h2>

        {!modules || modules.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Belum ada modul untuk kursus ini</p>
          </div>
        ) : (
          <div style={styles.moduleList}>
            {modules.map((module, index) => {
              // ✅ Hitung progress per modul
              const subModules = module.subModules || [];
              const completedSubCount =
                enrollment?.completedSubModules?.filter((id) =>
                  subModules.some((sm) => sm._id === id),
                ).length || 0;
              const moduleProgress =
                subModules.length > 0
                  ? Math.round((completedSubCount / subModules.length) * 100)
                  : 0;

              return (
                <div key={module._id} style={styles.moduleCard}>
                  <div style={styles.moduleHeader}>
                    <div>
                      <span style={styles.moduleNumber}>Modul {index + 1}</span>
                      {moduleProgress === 100 && (
                        <span style={styles.completedBadge}>✓ Selesai</span>
                      )}
                    </div>
                    <span style={styles.moduleDuration}>
                      ⏱️ {module.duration}
                    </span>
                  </div>

                  <h3 style={styles.moduleTitle}>{module.title}</h3>
                  <p style={styles.moduleDesc}>{module.description}</p>

                  {/* ✅ PROGRESS MODUL - Menampilkan "1 dari 10 materi selesai" */}
                  {subModules.length > 0 && (
                    <div style={styles.moduleProgressContainer}>
                      <div style={styles.moduleProgressHeader}>
                        <span style={styles.moduleProgressLabel}>
                          Progress Modul
                        </span>
                        <span style={styles.moduleProgressPercent}>
                          {moduleProgress}%
                        </span>
                      </div>
                      <div style={styles.moduleProgressBar}>
                        <div
                          style={{
                            ...styles.moduleProgressFill,
                            width: `${moduleProgress}%`,
                          }}
                        />
                      </div>
                      <p style={styles.moduleProgressText}>
                        {completedSubCount} dari {subModules.length} materi
                        selesai
                      </p>
                    </div>
                  )}

                  {/* ✅ LIST MATERI - Dengan tombol Tandai Selesai / Sudah Selesai */}
                  {subModules.length > 0 && (
                    <div style={styles.materialsList}>
                      <p style={styles.materialsListTitle}>
                        📖 Materi Pembelajaran:
                      </p>
                      {subModules
                        .sort((a, b) => a.order - b.order)
                        .map((subModule) => {
                          const isCompleted = isSubModuleCompleted(
                            subModule._id,
                          );

                          return (
                            <div
                              key={subModule._id}
                              style={styles.materialItem}
                            >
                              <div style={styles.materialInfo}>
                                <div style={styles.materialHeader}>
                                  <span style={styles.materialIcon}>
                                    {subModule.type === "video" && "🎥"}
                                    {subModule.type === "article" && "📄"}
                                    {subModule.type === "exercise" && "✏️"}
                                    {subModule.type === "reading" && "📖"}
                                    {subModule.type === "quiz" && "📝"}
                                  </span>
                                  <div style={styles.materialTitleContainer}>
                                    <Link
                                      to={`/module/${module._id}/submodule/${subModule._id}`}
                                      style={styles.materialTitle}
                                    >
                                      {subModule.title}
                                    </Link>
                                    <span style={styles.materialDuration}>
                                      {subModule.duration}
                                    </span>
                                  </div>
                                </div>

                                {/* ✅ SUPPORT LINKS - Artikel, PDF, dll */}
                                {subModule.supportLinks &&
                                  subModule.supportLinks.length > 0 && (
                                    <div style={styles.supportLinks}>
                                      {subModule.supportLinks.map((link, i) => (
                                        <a
                                          key={i}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={styles.supportLink}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {link.title}
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                {/* ✅ SEARCH LINKS - Google & YouTube */}
                                <div style={styles.searchLinks}>
                                  <a
                                    href={`https://www.google.com/search?q=${encodeURIComponent(subModule.title + " aljabar")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.searchLink}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Cari di Google
                                  </a>
                                  <a
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(subModule.title + " aljabar")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.searchLink}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Cari di YouTube
                                  </a>
                                </div>
                              </div>

                              {/* ✅ TOMBOL TANDAI SELESAI / STATUS SELESAI */}
                              <div style={styles.materialAction}>
                                {isCompleted ? (
                                  <span style={styles.completedBadgeSmall}>
                                    ✓ Sudah Selesai
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      markSubModuleComplete(
                                        module._id,
                                        subModule._id,
                                      )
                                    }
                                    style={styles.completeButton}
                                  >
                                    Tandai Selesai
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* ✅ LINK LIHAT SEMUA MATERI */}
                  <div style={styles.moduleFooter}>
                    <Link
                      to={`/course/${course._id}/module/${module._id}/materials`}
                      style={styles.viewMaterialsLink}
                    >
                      Lihat Semua Materi →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
    ":hover": { textDecoration: "underline" },
  },
  breadcrumbSeparator: {
    color: "#94a3b8",
  },
  breadcrumbCurrent: {
    color: "#1e293b",
    fontWeight: "500",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "20px",
    padding: "40px",
    marginBottom: "40px",
    color: "white",
  },
  headerContent: {
    maxWidth: "900px",
  },
  meta: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  subject: {
    background: "rgba(255,255,255,0.2)",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  level: {
    background: "rgba(255,255,255,0.2)",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "0.9rem",
  },
  enrolledBadge: {
    background: "#10b981",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "16px",
    fontWeight: "700",
  },
  description: {
    fontSize: "1.1rem",
    lineHeight: "1.7",
    marginBottom: "24px",
    opacity: 0.95,
  },
  stats: {
    display: "flex",
    gap: "24px",
    marginBottom: "30px",
    flexWrap: "wrap",
    fontSize: "0.95rem",
  },
  progressCard: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: "16px",
    padding: "24px",
    marginTop: "20px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "0.95rem",
  },
  progressLabel: {
    fontWeight: "500",
  },
  progressPercent: {
    fontWeight: "bold",
    color: "#ffd700",
    fontSize: "1.1rem",
  },
  progressBarContainer: {
    width: "100%",
    height: "8px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  progressBarFill: {
    height: "100%",
    background: "#ffd700",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  progressStatus: {
    fontSize: "0.95rem",
    opacity: 0.9,
  },
  modulesSection: {
    marginTop: "20px",
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
  moduleList: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  moduleCard: {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
  },
  moduleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  moduleNumber: {
    fontSize: "0.9rem",
    color: "#6366f1",
    fontWeight: "600",
    background: "#e0e7ff",
    padding: "4px 12px",
    borderRadius: "20px",
    marginRight: "12px",
  },
  completedBadge: {
    fontSize: "0.85rem",
    color: "#10b981",
    fontWeight: "600",
    background: "#dcfce7",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  moduleTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px",
  },
  moduleDesc: {
    fontSize: "1rem",
    color: "#475569",
    marginBottom: "20px",
    lineHeight: "1.6",
  },
  moduleDuration: {
    fontSize: "0.9rem",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  moduleProgressContainer: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
  },
  moduleProgressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "0.9rem",
  },
  moduleProgressLabel: {
    color: "#475569",
    fontWeight: "500",
  },
  moduleProgressPercent: {
    color: "#6366f1",
    fontWeight: "600",
  },
  moduleProgressBar: {
    width: "100%",
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  moduleProgressFill: {
    height: "100%",
    background: "#6366f1",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  moduleProgressText: {
    fontSize: "0.85rem",
    color: "#64748b",
  },
  materialsList: {
    marginBottom: "24px",
  },
  materialsListTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "16px",
  },
  materialItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "12px",
    border: "1px solid #e2e8f0",
  },
  materialInfo: {
    flex: 1,
  },
  materialHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  materialIcon: {
    fontSize: "1.2rem",
  },
  materialTitleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  materialTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1e293b",
    textDecoration: "none",
    ":hover": {
      color: "#6366f1",
      textDecoration: "underline",
    },
  },
  materialDuration: {
    fontSize: "0.85rem",
    color: "#64748b",
    background: "#e2e8f0",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  supportLinks: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  supportLink: {
    fontSize: "0.8rem",
    color: "#6366f1",
    textDecoration: "none",
    padding: "2px 10px",
    background: "#e0e7ff",
    borderRadius: "16px",
    ":hover": {
      background: "#c7d2fe",
    },
  },
  searchLinks: {
    display: "flex",
    gap: "12px",
  },
  searchLink: {
    fontSize: "0.8rem",
    color: "#475569",
    textDecoration: "none",
    padding: "2px 10px",
    background: "#f1f5f9",
    borderRadius: "16px",
    ":hover": {
      background: "#e2e8f0",
    },
  },
  materialAction: {
    display: "flex",
    alignItems: "center",
    marginLeft: "16px",
  },
  completedBadgeSmall: {
    fontSize: "0.85rem",
    color: "#10b981",
    fontWeight: "600",
    padding: "6px 12px",
    background: "#dcfce7",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
  completeButton: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
    ":hover": {
      background: "#059669",
    },
  },
  moduleFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0",
  },
  viewMaterialsLink: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.95rem",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s",
    ":hover": {
      background: "#e0e7ff",
    },
  },
};

export default CourseDetail;
