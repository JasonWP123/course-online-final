import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const dropdownRef = useRef(null);
  const coursesDropdownRef = useRef(null);

  // Fetch enrolled courses when user is logged in
  useEffect(() => {
    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  const fetchMyCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await axios.get("/api/courses/user/my-courses");
      setMyCourses(res.data);
    } catch (err) {
      console.error("Error fetching my courses:", err);
    }
    setLoadingCourses(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        coursesDropdownRef.current &&
        !coursesDropdownRef.current.contains(event.target)
      ) {
        setCoursesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setCoursesDropdownOpen(false);
  };

  const toggleCoursesDropdown = () => {
    setCoursesDropdownOpen(!coursesDropdownOpen);
    setDropdownOpen(false);
  };

  // Get course progress percentage
  const getProgress = (enrollment) => {
    return enrollment?.progress || 0;
  };

  // Get first 3 courses for dropdown
  const recentCourses = myCourses.slice(0, 3);

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Brand Logo */}
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>📘</span>
          <span style={styles.brandText}>Learnify</span>
        </Link>

        {/* Desktop Navigation */}
        <div style={styles.navLinks}>
          {user ? (
            <>
              <Link
                to="/"
                style={{
                  ...styles.link,
                  ...(isActive("/") && styles.activeLink),
                }}
              >
                Dashboard
              </Link>

              <Link
                to="/discussions"
                style={{
                  ...styles.link,
                  ...(isActive("/discussions") && styles.activeLink),
                }}
              >
                <span style={styles.linkIcon}>💬</span>
                Discussions
              </Link>

              {/* ✅ MY COURSES DROPDOWN - Menampilkan kursus yang dienroll */}
              <div
                style={styles.coursesDropdownContainer}
                ref={coursesDropdownRef}
              >
                <button
                  onClick={toggleCoursesDropdown}
                  style={{
                    ...styles.coursesDropdownToggle,
                    ...(isActive("/my-courses") && styles.activeLink),
                  }}
                >
                  <span style={styles.linkIcon}>📚</span>
                  My Courses
                  <span style={styles.dropdownArrow}>
                    {coursesDropdownOpen ? "▲" : "▼"}
                  </span>
                </button>

                {coursesDropdownOpen && (
                  <div style={styles.coursesDropdownMenu}>
                    <div style={styles.coursesDropdownHeader}>
                      <span style={styles.coursesDropdownTitle}>
                        Kursus Saya
                      </span>
                      <Link
                        to="/my-courses"
                        style={styles.viewAllLink}
                        onClick={() => setCoursesDropdownOpen(false)}
                      >
                        Lihat Semua →
                      </Link>
                    </div>

                    <div style={styles.coursesDropdownDivider} />

                    {loadingCourses ? (
                      <div style={styles.coursesLoading}>
                        <div style={styles.coursesSpinner}></div>
                        <span>Memuat kursus...</span>
                      </div>
                    ) : recentCourses.length === 0 ? (
                      <div style={styles.noCourses}>
                        <p style={styles.noCoursesText}>
                          Belum mengambil kursus
                        </p>
                        <Link
                          to="/"
                          style={styles.browseCoursesLink}
                          onClick={() => setCoursesDropdownOpen(false)}
                        >
                          Jelajahi Kursus →
                        </Link>
                      </div>
                    ) : (
                      <div style={styles.coursesList}>
                        {recentCourses.map((enrollment) => (
                          <Link
                            key={enrollment._id}
                            to={`/course/${enrollment.course._id}`}
                            style={styles.courseItem}
                            onClick={() => setCoursesDropdownOpen(false)}
                          >
                            <div style={styles.courseIcon}>
                              {enrollment.course.subject === "Matematika" &&
                                "🧮"}
                              {enrollment.course.subject === "Fisika" && "⚛️"}
                              {enrollment.course.subject === "Kimia" && "🧪"}
                              {enrollment.course.subject === "Biologi" && "🧬"}
                              {enrollment.course.subject ===
                                "Web Development" && "🌐"}
                              {enrollment.course.subject === "Programming" &&
                                "💻"}
                              {enrollment.course.subject ===
                                "Mobile Development" && "📱"}
                              {enrollment.course.subject === "Database" && "🗄️"}
                              {![
                                "Matematika",
                                "Fisika",
                                "Kimia",
                                "Biologi",
                                "Web Development",
                                "Programming",
                                "Mobile Development",
                                "Database",
                              ].includes(enrollment.course.subject) && "📚"}
                            </div>
                            <div style={styles.courseInfo}>
                              <span style={styles.courseTitle}>
                                {enrollment.course.title}
                              </span>
                              <div style={styles.courseProgress}>
                                <div style={styles.progressBarContainer}>
                                  <div
                                    style={{
                                      ...styles.progressBarFill,
                                      width: `${getProgress(enrollment)}%`,
                                    }}
                                  />
                                </div>
                                <span style={styles.progressText}>
                                  {getProgress(enrollment)}%
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {recentCourses.length > 0 && (
                      <>
                        <div style={styles.coursesDropdownDivider} />
                        <Link
                          to="/my-courses"
                          style={styles.coursesDropdownFooter}
                          onClick={() => setCoursesDropdownOpen(false)}
                        >
                          <span>Lihat Semua Kursus</span>
                          <span style={styles.courseCount}>
                            {myCourses.length} kursus
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* PROFILE DROPDOWN */}
              <div style={styles.dropdownContainer} ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  style={styles.dropdownToggle}
                  aria-expanded={dropdownOpen}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={styles.userName}>{user.name}</span>
                  <span style={styles.dropdownArrow}>
                    {dropdownOpen ? "▲" : "▼"}
                  </span>
                </button>

                {dropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownUserInfo}>
                        <div style={styles.dropdownUserName}>{user.name}</div>
                        <div style={styles.dropdownUserEmail}>{user.email}</div>
                        <div style={styles.dropdownUserRole}>
                          {user.role === "admin" ? "👑 Admin" : "🎓 Student"}
                        </div>
                      </div>
                    </div>

                    <div style={styles.dropdownDivider} />

                    <Link
                      to="/profile"
                      style={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span style={styles.dropdownIcon}>👤</span>
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/help"
                      style={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span style={styles.dropdownIcon}>❓</span>
                      <span>Help Center</span>
                    </Link>

                    <div style={styles.dropdownDivider} />

                    <button
                      onClick={handleLogout}
                      style={styles.dropdownLogout}
                    >
                      <span style={styles.dropdownIcon}>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    padding: "0.8rem 0",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    borderBottom: "1px solid #edf2f7",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: "1.6rem",
    fontWeight: "bold",
    color: "#6366f1",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  brandIcon: {
    fontSize: "1.8rem",
  },
  brandText: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  link: {
    color: "#4b5563",
    textDecoration: "none",
    fontWeight: "500",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "all 0.2s",
    ":hover": {
      color: "#6366f1",
      background: "#f3f4f6",
    },
  },
  activeLink: {
    color: "#6366f1",
    background: "#e0e7ff",
    fontWeight: "600",
  },
  linkIcon: {
    fontSize: "1.1rem",
    marginRight: "4px",
  },

  // ✅ MY COURSES DROPDOWN STYLES
  coursesDropdownContainer: {
    position: "relative",
    display: "inline-block",
  },
  coursesDropdownToggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    border: "none",
    background: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#4b5563",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      color: "#6366f1",
      background: "#f3f4f6",
    },
  },
  coursesDropdownMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    width: "360px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    animation: "fadeIn 0.2s ease",
    zIndex: 1001,
  },
  coursesDropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  coursesDropdownTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  viewAllLink: {
    fontSize: "0.85rem",
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "500",
    ":hover": {
      textDecoration: "underline",
    },
  },
  coursesDropdownDivider: {
    height: "1px",
    background: "#e2e8f0",
  },
  coursesLoading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "32px",
    color: "#64748b",
  },
  coursesSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid #e2e8f0",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  noCourses: {
    padding: "32px",
    textAlign: "center",
  },
  noCoursesText: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: "12px",
  },
  browseCoursesLink: {
    fontSize: "0.9rem",
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "500",
    ":hover": {
      textDecoration: "underline",
    },
  },
  coursesList: {
    display: "flex",
    flexDirection: "column",
    padding: "8px",
  },
  courseItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    textDecoration: "none",
    borderRadius: "8px",
    transition: "all 0.2s",
    ":hover": {
      background: "#f8fafc",
    },
  },
  courseIcon: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e0e7ff",
    borderRadius: "8px",
    fontSize: "1.2rem",
    color: "#6366f1",
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "220px",
  },
  courseProgress: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  progressBarContainer: {
    flex: 1,
    height: "4px",
    background: "#e2e8f0",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "#6366f1",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6366f1",
    minWidth: "35px",
  },
  coursesDropdownFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#f8fafc",
    color: "#1e293b",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s",
    ":hover": {
      background: "#f1f5f9",
      color: "#6366f1",
    },
  },
  courseCount: {
    fontSize: "0.8rem",
    color: "#64748b",
    background: "#e2e8f0",
    padding: "2px 8px",
    borderRadius: "12px",
  },

  // PROFILE DROPDOWN STYLES
  dropdownContainer: {
    position: "relative",
    display: "inline-block",
  },
  dropdownToggle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px 6px 6px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "40px",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#f1f5f9",
      borderColor: "#cbd5e1",
    },
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  avatarPlaceholder: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "600",
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  userName: {
    color: "#1e293b",
    fontWeight: "600",
    fontSize: "0.95rem",
    maxWidth: "120px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdownArrow: {
    color: "#64748b",
    fontSize: "0.8rem",
    marginLeft: "4px",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "280px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    animation: "fadeIn 0.2s ease",
  },
  dropdownHeader: {
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  dropdownUserInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  dropdownUserName: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "2px",
  },
  dropdownUserEmail: {
    fontSize: "0.85rem",
    opacity: 0.9,
    wordBreak: "break-all",
  },
  dropdownUserRole: {
    fontSize: "0.8rem",
    background: "rgba(255,255,255,0.2)",
    padding: "4px 10px",
    borderRadius: "20px",
    display: "inline-block",
    marginTop: "6px",
    alignSelf: "flex-start",
  },
  dropdownDivider: {
    height: "1px",
    background: "#e2e8f0",
    margin: "8px 0",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    color: "#334155",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.2s",
    ":hover": {
      background: "#f8fafc",
      color: "#6366f1",
    },
  },
  dropdownIcon: {
    fontSize: "1.2rem",
    width: "24px",
    textAlign: "center",
  },
  dropdownLogout: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    color: "#ef4444",
    background: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#fef2f2",
      color: "#dc2626",
    },
  },
  authLinks: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  registerBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    textDecoration: "none",
    fontWeight: "600",
    padding: "8px 24px",
    borderRadius: "30px",
    transition: "all 0.3s",
    boxShadow: "0 4px 6px rgba(99,102,241,0.2)",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 12px rgba(99,102,241,0.3)",
    },
  },
};

// Add keyframes for animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;
