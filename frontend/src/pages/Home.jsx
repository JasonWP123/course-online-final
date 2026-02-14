import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const [myCoursesRes, allCoursesRes, popularRes] = await Promise.all([
            axios.get("/api/courses/user/my-courses"),
            axios.get("/api/courses"),
            axios.get("/api/courses/popular"),
          ]);
          setMyCourses(myCoursesRes.data);
          setAllCourses(allCoursesRes.data);
          setPopularCourses(popularRes.data);
        } else {
          const [allCoursesRes, popularRes] = await Promise.all([
            axios.get("/api/courses/public"),
            axios.get("/api/courses/popular/public"),
          ]);
          setAllCourses(allCoursesRes.data);
          setPopularCourses(popularRes.data);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      await axios.post(`/api/courses/${courseId}/enroll`);
      const res = await axios.get("/api/courses/user/my-courses");
      setMyCourses(res.data);
    } catch (err) {
      console.error("Error enrolling:", err);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            {user
              ? `Selamat Datang, ${user?.name}! 👋`
              : "Selamat Datang di Learnify! 👋"}
          </h1>
          <p style={styles.heroSubtitle}>
            {user
              ? `Kamu telah mengikuti ${myCourses.length} kursus. Lanjutkan belajarmu!`
              : "Platform belajar online untuk siswa SMA Kelas 12. Akses 100+ kursus berkualitas."}
          </p>
          {!user && (
            <div style={styles.heroButtons}>
              <Link to="/register" style={styles.heroButtonPrimary}>
                Daftar Gratis
              </Link>
              <Link to="/login" style={styles.heroButtonSecondary}>
                Login
              </Link>
            </div>
          )}
        </div>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <span style={styles.heroStatValue}>100+</span>
            <span style={styles.heroStatLabel}>Kursus</span>
          </div>
          <div style={styles.heroStatDivider}></div>
          <div style={styles.heroStat}>
            <span style={styles.heroStatValue}>10k+</span>
            <span style={styles.heroStatLabel}>Siswa</span>
          </div>
          <div style={styles.heroStatDivider}></div>
          <div style={styles.heroStat}>
            <span style={styles.heroStatValue}>500+</span>
            <span style={styles.heroStatLabel}>Sertifikat</span>
          </div>
        </div>
      </div>

      {/* My Courses Section - Hanya untuk user yang login */}
      {user && myCourses.length > 0 && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>📚 My Courses</h2>
              <p style={styles.sectionSubtitle}>
                Lanjutkan belajar dari tempat terakhir
              </p>
            </div>
            <Link to="/my-courses" style={styles.seeAllButton}>
              Lihat Semua Kursus Saya →
            </Link>
          </div>

          <div style={styles.myCoursesGrid}>
            {myCourses.slice(0, 3).map((enrollment) => (
              <div key={enrollment._id} style={styles.courseCard}>
                <div style={styles.courseHeader}>
                  <span style={styles.courseSubject}>
                    {enrollment.course.subject}
                  </span>
                  <span style={styles.courseLevel}>
                    {enrollment.course.level}
                  </span>
                </div>
                <h3 style={styles.courseTitle}>{enrollment.course.title}</h3>
                <div style={styles.courseMeta}>
                  <span>📚 {enrollment.course.totalModules} modul</span>
                  <span>⏱️ {enrollment.course.totalDuration}</span>
                </div>
                <div style={styles.progressSection}>
                  <div style={styles.progressHeader}>
                    <span style={styles.progressLabel}>Progress</span>
                    <span style={styles.progressValue}>
                      {enrollment.progress}%
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        width: `${enrollment.progress}%`,
                        height: "100%",
                        background:
                          enrollment.progress === 100 ? "#10b981" : "#6366f1",
                        borderRadius: "4px",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
                <Link
                  to={`/course/${enrollment.course._id}`}
                  style={styles.continueButton}
                >
                  {enrollment.progress === 0
                    ? "🚀 Mulai Belajar"
                    : "🔄 Lanjutkan"}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Courses Section */}
      {popularCourses.length > 0 && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>🔥 Populer Minggu Ini</h2>
              <p style={styles.sectionSubtitle}>
                Kursus yang paling banyak diambil siswa
              </p>
            </div>
          </div>

          <div style={styles.popularGrid}>
            {popularCourses.slice(0, 4).map((course) => {
              const isEnrolled = user
                ? myCourses.some((e) => e.course._id === course._id)
                : false;

              return (
                <div key={course._id} style={styles.popularCard}>
                  <div style={styles.popularBadge}>
                    ⭐ {course.rating || 4.8}
                  </div>
                  <div style={styles.popularContent}>
                    <span style={styles.courseSubject}>{course.subject}</span>
                    <h3 style={styles.popularTitle}>{course.title}</h3>
                    <p style={styles.courseDescription}>{course.description}</p>
                    <div style={styles.courseStats}>
                      <span>📚 {course.totalModules} modul</span>
                      <span>⏱️ {course.totalDuration}</span>
                      <span>👥 {course.enrolledCount} siswa</span>
                    </div>
                    <div style={styles.popularFooter}>
                      {isEnrolled ? (
                        <Link
                          to={`/course/${course._id}`}
                          style={styles.enrolledButton}
                        >
                          Sudah Diambil
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course._id)}
                          style={styles.enrollButton}
                        >
                          {user ? "Ambil Kursus" : "Login untuk Ambil"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Explore More Courses - CTA ke halaman Explore */}
      <section style={styles.exploreSection}>
        <div style={styles.exploreContent}>
          <div style={styles.exploreText}>
            <h2 style={styles.exploreTitle}>🎓 Jelajahi Semua Kursus</h2>
            <p style={styles.exploreSubtitle}>
              Temukan 100+ kursus berkualitas dari berbagai kategori. Dari
              Matematika, Fisika, Kimia, hingga Web Development dan Programming.
            </p>
            <div style={styles.exploreFeatures}>
              <div style={styles.exploreFeature}>
                <span style={styles.exploreFeatureIcon}>🔍</span>
                <span>Filter berdasarkan kategori</span>
              </div>
              <div style={styles.exploreFeature}>
                <span style={styles.exploreFeatureIcon}>📊</span>
                <span>Filter berdasarkan level</span>
              </div>
              <div style={styles.exploreFeature}>
                <span style={styles.exploreFeatureIcon}>📱</span>
                <span>Search course</span>
              </div>
              <div style={styles.exploreFeature}>
                <span style={styles.exploreFeatureIcon}>⭐</span>
                <span>Sort by popular</span>
              </div>
            </div>
          </div>
          <Link to="/explore" style={styles.exploreButton}>
            <span style={styles.exploreButtonIcon}>🚀</span>
            Explore More Courses
            <span style={styles.exploreButtonArrow}>→</span>
          </Link>
        </div>
      </section>

      {/* Categories Preview */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>📂 Belajar Berdasarkan Kategori</h2>
            <p style={styles.sectionSubtitle}>
              Pilih kategori yang ingin kamu pelajari
            </p>
          </div>
          <Link to="/explore" style={styles.seeAllButton}>
            Lihat Semua Kategori →
          </Link>
        </div>

        <div style={styles.categoriesGrid}>
          <Link to="/explore?category=Matematika" style={styles.categoryCard}>
            <span style={styles.categoryIcon}>🧮</span>
            <span style={styles.categoryName}>Matematika</span>
            <span style={styles.categoryCount}>12 kursus</span>
          </Link>
          <Link to="/explore?category=Fisika" style={styles.categoryCard}>
            <span style={styles.categoryIcon}>⚛️</span>
            <span style={styles.categoryName}>Fisika</span>
            <span style={styles.categoryCount}>8 kursus</span>
          </Link>
          <Link to="/explore?category=Kimia" style={styles.categoryCard}>
            <span style={styles.categoryIcon}>🧪</span>
            <span style={styles.categoryName}>Kimia</span>
            <span style={styles.categoryCount}>10 kursus</span>
          </Link>
          <Link to="/explore?category=Biologi" style={styles.categoryCard}>
            <span style={styles.categoryIcon}>🧬</span>
            <span style={styles.categoryName}>Biologi</span>
            <span style={styles.categoryCount}>9 kursus</span>
          </Link>
          <Link
            to="/explore?category=Web Development"
            style={styles.categoryCard}
          >
            <span style={styles.categoryIcon}>🌐</span>
            <span style={styles.categoryName}>Web Dev</span>
            <span style={styles.categoryCount}>15 kursus</span>
          </Link>
          <Link to="/explore?category=Programming" style={styles.categoryCard}>
            <span style={styles.categoryIcon}>💻</span>
            <span style={styles.categoryName}>Programming</span>
            <span style={styles.categoryCount}>20 kursus</span>
          </Link>
        </div>
      </section>

      {/* Why Learnify Section */}
      <section style={styles.whySection}>
        <h2 style={styles.whyTitle}>Mengapa Belajar di Learnify?</h2>
        <div style={styles.whyGrid}>
          <div style={styles.whyCard}>
            <span style={styles.whyIcon}>🎯</span>
            <h3 style={styles.whyCardTitle}>Materi Terstruktur</h3>
            <p style={styles.whyCardText}>
              Modul pembelajaran disusun secara sistematis dari dasar hingga
              mahir
            </p>
          </div>
          <div style={styles.whyCard}>
            <span style={styles.whyIcon}>💬</span>
            <h3 style={styles.whyCardTitle}>Diskusi Aktif</h3>
            <p style={styles.whyCardText}>
              Forum diskusi Q&A dengan ribuan siswa lainnya
            </p>
          </div>
          <div style={styles.whyCard}>
            <span style={styles.whyIcon}>📊</span>
            <h3 style={styles.whyCardTitle}>Progress Tracking</h3>
            <p style={styles.whyCardText}>
              Pantau perkembangan belajarmu dengan statistik lengkap
            </p>
          </div>
          <div style={styles.whyCard}>
            <span style={styles.whyIcon}>🎓</span>
            <h3 style={styles.whyCardTitle}>Sertifikat</h3>
            <p style={styles.whyCardText}>
              Dapatkan sertifikat setelah menyelesaikan kursus
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <div style={styles.footerBrand}>
              <span style={styles.footerBrandIcon}>📘</span>
              <span style={styles.footerBrandText}>Learnify</span>
            </div>
            <p style={styles.footerDescription}>
              Platform pembelajaran online untuk siswa SMA Kelas 12. Belajar
              kapan saja, di mana saja dengan materi berkualitas.
            </p>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}>
                📱
              </a>
              <a href="#" style={styles.socialLink}>
                💬
              </a>
              <a href="#" style={styles.socialLink}>
                📧
              </a>
              <a href="#" style={styles.socialLink}>
                🐦
              </a>
            </div>
          </div>

          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Learnify</h3>
            <ul style={styles.footerLinks}>
              <li>
                <Link to="/about" style={styles.footerLink}>
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/careers" style={styles.footerLink}>
                  Karir
                </Link>
              </li>
              <li>
                <Link to="/blog" style={styles.footerLink}>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" style={styles.footerLink}>
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Bantuan</h3>
            <ul style={styles.footerLinks}>
              <li>
                <Link to="/faq" style={styles.footerLink}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" style={styles.footerLink}>
                  Support
                </Link>
              </li>
              <li>
                <Link to="/terms" style={styles.footerLink}>
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link to="/privacy" style={styles.footerLink}>
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Kontak</h3>
            <ul style={styles.footerLinks}>
              <li style={styles.contactItem}>
                <span style={styles.contactIcon}>📍</span>
                <span style={styles.contactText}>Jakarta, Indonesia</span>
              </li>
              <li style={styles.contactItem}>
                <span style={styles.contactIcon}>📧</span>
                <span style={styles.contactText}>support@learnify.id</span>
              </li>
              <li style={styles.contactItem}>
                <span style={styles.contactIcon}>📱</span>
                <span style={styles.contactText}>+62 123 4567 890</span>
              </li>
            </ul>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p style={styles.copyright}>© 2026 Learnify. Semua hak dilindungi.</p>
          <div style={styles.footerBottomLinks}>
            <Link to="/privacy" style={styles.footerBottomLink}>
              Kebijakan Privasi
            </Link>
            <Link to="/terms" style={styles.footerBottomLink}>
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </footer>
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

  // Hero Section
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "24px",
    padding: "48px",
    marginBottom: "48px",
    color: "white",
  },
  heroContent: {
    maxWidth: "800px",
  },
  heroTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "16px",
    lineHeight: "1.2",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    opacity: 0.95,
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  heroButtons: {
    display: "flex",
    gap: "16px",
  },
  heroButtonPrimary: {
    background: "white",
    color: "#6366f1",
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: "30px",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.3s",
  },
  heroButtonSecondary: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: "30px",
    fontWeight: "600",
    fontSize: "1rem",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s",
  },
  heroStats: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
    marginTop: "32px",
  },
  heroStat: {
    display: "flex",
    flexDirection: "column",
  },
  heroStatValue: {
    fontSize: "1.8rem",
    fontWeight: "700",
  },
  heroStatLabel: {
    fontSize: "0.9rem",
    opacity: 0.9,
  },
  heroStatDivider: {
    width: "1px",
    height: "40px",
    background: "rgba(255,255,255,0.3)",
  },

  // Section Styles
  section: {
    marginBottom: "60px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  sectionSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
  },
  seeAllButton: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
    padding: "8px 16px",
    borderRadius: "30px",
    transition: "all 0.3s",
  },

  // Course Cards
  myCoursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
  },
  courseCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
    transition: "transform 0.3s, box-shadow 0.3s",
    display: "flex",
    flexDirection: "column",
  },
  courseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  courseSubject: {
    background: "#e0e7ff",
    color: "#6366f1",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  courseLevel: {
    color: "#64748b",
    fontSize: "0.8rem",
    padding: "4px 12px",
    background: "#f1f5f9",
    borderRadius: "20px",
  },
  courseTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  courseMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "0.85rem",
    color: "#64748b",
    marginBottom: "16px",
  },
  progressSection: {
    marginBottom: "20px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "0.9rem",
  },
  progressLabel: {
    color: "#64748b",
  },
  progressValue: {
    fontWeight: "600",
    color: "#6366f1",
  },
  progressBar: {
    width: "100%",
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  continueButton: {
    display: "block",
    background: "#6366f1",
    color: "white",
    textDecoration: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    textAlign: "center",
    marginTop: "auto",
    transition: "all 0.3s",
  },

  // Popular Courses
  popularGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
  },
  popularCard: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "#f59e0b",
    color: "white",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  popularContent: {
    padding: "24px",
  },
  popularTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
    marginTop: "8px",
  },
  courseDescription: {
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: "1.6",
    marginBottom: "16px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  courseStats: {
    display: "flex",
    gap: "16px",
    color: "#64748b",
    fontSize: "0.8rem",
    marginBottom: "20px",
  },
  popularFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  enrollButton: {
    background: "#6366f1",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  enrolledButton: {
    background: "#10b981",
    color: "white",
    textDecoration: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },

  // Explore Section - CTA ke Halaman Explore
  exploreSection: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "24px",
    padding: "48px",
    marginBottom: "60px",
    color: "white",
  },
  exploreContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "32px",
  },
  exploreText: {
    flex: 1,
    minWidth: "300px",
  },
  exploreTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "16px",
  },
  exploreSubtitle: {
    fontSize: "1.1rem",
    opacity: 0.95,
    marginBottom: "24px",
    lineHeight: "1.6",
  },
  exploreFeatures: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  exploreFeature: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
  },
  exploreFeatureIcon: {
    fontSize: "1.2rem",
  },
  exploreButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "white",
    color: "#6366f1",
    textDecoration: "none",
    padding: "16px 32px",
    borderRadius: "40px",
    fontWeight: "700",
    fontSize: "1.1rem",
    transition: "all 0.3s",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  exploreButtonIcon: {
    fontSize: "1.3rem",
  },
  exploreButtonArrow: {
    fontSize: "1.2rem",
    marginLeft: "4px",
  },

  // Categories Preview
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },
  categoryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    background: "white",
    borderRadius: "16px",
    border: "1px solid #edf2f7",
    textDecoration: "none",
    transition: "all 0.3s",
  },
  categoryIcon: {
    fontSize: "2.5rem",
    marginBottom: "12px",
  },
  categoryName: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
  },
  categoryCount: {
    fontSize: "0.8rem",
    color: "#64748b",
  },

  // Why Learnify Section
  whySection: {
    marginBottom: "60px",
  },
  whyTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: "32px",
  },
  whyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  whyCard: {
    textAlign: "center",
    padding: "32px",
    background: "white",
    borderRadius: "16px",
    border: "1px solid #edf2f7",
    transition: "all 0.3s",
  },
  whyIcon: {
    fontSize: "2.5rem",
    marginBottom: "16px",
    display: "block",
  },
  whyCardTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
  },
  whyCardText: {
    fontSize: "0.95rem",
    color: "#64748b",
    lineHeight: "1.6",
  },

  // Footer
  footer: {
    background: "#0f172a",
    borderRadius: "24px",
    padding: "48px 40px 24px",
    marginTop: "20px",
    color: "white",
  },
  footerContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "40px",
    marginBottom: "40px",
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  footerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  footerBrandIcon: {
    fontSize: "1.8rem",
  },
  footerBrandText: {
    fontSize: "1.4rem",
    fontWeight: "bold",
    color: "white",
  },
  footerDescription: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    lineHeight: "1.6",
  },
  socialLinks: {
    display: "flex",
    gap: "12px",
  },
  socialLink: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#1e293b",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontSize: "1.2rem",
    transition: "all 0.3s",
  },
  footerTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "white",
    marginBottom: "8px",
  },
  footerLinks: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.3s",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  contactIcon: {
    fontSize: "1rem",
  },
  contactText: {
    color: "#94a3b8",
  },
  footerBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "24px",
    borderTop: "1px solid #1e293b",
    flexWrap: "wrap",
    gap: "16px",
  },
  copyright: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: 0,
  },
  footerBottomLinks: {
    display: "flex",
    gap: "24px",
  },
  footerBottomLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.85rem",
    transition: "color 0.3s",
  },
};

export default Home;
