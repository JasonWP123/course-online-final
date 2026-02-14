import React, { useContext, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // profile, certificates
  const fileInputRef = useRef(null);

  // Mock data - tidak perlu ke database
  const [profileData, setProfileData] = useState({
    name: user?.name || "Jason Wijayaputra",
    email: user?.email || "jasonwputra@gmail.com",
    bio: "Pelajar SMA Kelas 12 | Tech Enthusiast | Calon Developer",
    school: "SMA Negeri 1 Jakarta",
    location: "Jakarta, Indonesia",
    avatar: user?.avatar || null,
    stats: {
      courses: 12,
      certificates: 5,
      xp: 1234,
    },
    memberSince: "12 Februari 2026",
  });

  // Mock certificates data
  const [certificates] = useState([
    {
      id: 1,
      title: "Kalkulus Dasar",
      issuer: "Learnify",
      issueDate: "10 Februari 2026",
      credentialId: "LRN-CALC-2026-001",
      image: "https://img.icons8.com/fluency/96/diploma.png",
      color: "#6366f1",
    },
    {
      id: 2,
      title: "Aljabar Linear",
      issuer: "Learnify",
      issueDate: "25 Januari 2026",
      credentialId: "LRN-ALJ-2026-045",
      image: "https://img.icons8.com/fluency/96/diploma.png",
      color: "#8b5cf6",
    },
    {
      id: 3,
      title: "Fisika Mekanika",
      issuer: "Learnify",
      issueDate: "15 Desember 2025",
      credentialId: "LRN-FIS-2025-123",
      image: "https://img.icons8.com/fluency/96/diploma.png",
      color: "#ec4899",
    },
    {
      id: 4,
      title: "React JS Dasar",
      issuer: "Learnify",
      issueDate: "5 Desember 2025",
      credentialId: "LRN-REACT-2025-089",
      image: "https://img.icons8.com/fluency/96/diploma.png",
      color: "#06b6d4",
    },
    {
      id: 5,
      title: "Database MongoDB",
      issuer: "Learnify",
      issueDate: "20 November 2025",
      credentialId: "LRN-MDB-2025-067",
      image: "https://img.icons8.com/fluency/96/diploma.png",
      color: "#10b981",
    },
  ]);

  // Mock activities
  const [activities] = useState([
    {
      id: 1,
      type: "course",
      icon: "📘",
      text: 'Completed "Kalkulus Dasar" module',
      time: "2 hours ago",
      color: "#6366f1",
    },
    {
      id: 2,
      type: "badge",
      icon: "🏆",
      text: 'Earned "Fast Learner" badge',
      time: "Yesterday",
      color: "#f59e0b",
    },
    {
      id: 3,
      type: "discussion",
      icon: "💬",
      text: 'Posted in "Java vs Python" discussion',
      time: "3 days ago",
      color: "#10b981",
    },
    {
      id: 4,
      type: "certificate",
      icon: "📜",
      text: 'Earned "React JS Dasar" certificate',
      time: "5 days ago",
      color: "#8b5cf6",
    },
  ]);

  // Mock achievements
  const [achievements] = useState([
    {
      id: 1,
      icon: "🏃",
      name: "Quick Starter",
      desc: "Completed first course",
      progress: 100,
      color: "#6366f1",
    },
    {
      id: 2,
      icon: "💡",
      name: "Problem Solver",
      desc: "Solved 10 exercises",
      progress: 100,
      color: "#f59e0b",
    },
    {
      id: 3,
      icon: "🤝",
      name: "Helper",
      desc: "Answered 5 questions",
      progress: 100,
      color: "#10b981",
    },
    {
      id: 4,
      icon: "⚡",
      name: "Speed Demon",
      desc: "Complete module in 1 day",
      progress: 60,
      color: "#8b5cf6",
    },
    {
      id: 5,
      icon: "🎯",
      name: "Goal Keeper",
      desc: "Complete 5 courses",
      progress: 40,
      color: "#ec4899",
    },
  ]);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: profileData.name,
    bio: profileData.bio,
    school: profileData.school,
    location: profileData.location,
  });

  const [message, setMessage] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Mock upload foto - hanya preview, tidak ke database
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
        setProfileData({
          ...profileData,
          avatar: reader.result,
        });
        setMessage({ type: "success", text: "Foto profil berhasil diubah!" });
        setTimeout(() => setMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock submit - hanya update state lokal
  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulasi loading
    setTimeout(() => {
      setProfileData({
        ...profileData,
        name: formData.name,
        bio: formData.bio,
        school: formData.school,
        location: formData.location,
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    }, 500);
  };

  if (!user) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          {/* Avatar dengan Upload */}
          <div style={styles.avatarSection}>
            <div style={styles.avatarWrapper}>
              {previewAvatar || profileData.avatar ? (
                <img
                  src={previewAvatar || profileData.avatar}
                  alt={profileData.name}
                  style={styles.avatarLarge}
                />
              ) : (
                <div style={styles.avatarPlaceholderLarge}>
                  {profileData.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                style={styles.changePhotoBtn}
                onClick={() => fileInputRef.current.click()}
              >
                <span style={styles.cameraIcon}>📷</span>
                Change Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* User Info */}
          <div style={styles.userInfo}>
            <h1 style={styles.userName}>{profileData.name}</h1>
            <p style={styles.userEmail}>{profileData.email}</p>
            <div style={styles.userStats}>
              <div style={styles.statItem}>
                <span style={styles.statValue}>
                  {profileData.stats.courses}
                </span>
                <span style={styles.statLabel}>Courses</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <span style={styles.statValue}>
                  {profileData.stats.certificates}
                </span>
                <span style={styles.statLabel}>Certificates</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <span style={styles.statValue}>
                  {profileData.stats.xp.toLocaleString()}
                </span>
                <span style={styles.statLabel}>XP</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            style={styles.editProfileBtn}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "✏️ Edit Profile"}
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          style={{
            ...styles.message,
            ...(message.type === "success"
              ? styles.successMessage
              : styles.errorMessage),
          }}
        >
          {message.type === "success" ? "✅" : "❌"} {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "profile" && styles.activeTab),
          }}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "certificates" && styles.activeTab),
          }}
          onClick={() => setActiveTab("certificates")}
        >
          📜 Certificates ({certificates.length})
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div style={styles.content}>
          {/* Left Column - Profile Info */}
          <div style={styles.leftColumn}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>About Me</h2>
              {isEditing ? (
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      style={styles.textarea}
                      rows="3"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>School</label>
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formActions}>
                    <button type="submit" style={styles.saveBtn}>
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      style={styles.cancelBtn}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={styles.profileInfo}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>📝</span>
                    <div>
                      <span style={styles.infoLabel}>Bio</span>
                      <p style={styles.infoValue}>{profileData.bio}</p>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>🏫</span>
                    <div>
                      <span style={styles.infoLabel}>School</span>
                      <p style={styles.infoValue}>{profileData.school}</p>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>📍</span>
                    <div>
                      <span style={styles.infoLabel}>Location</span>
                      <p style={styles.infoValue}>{profileData.location}</p>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>🎓</span>
                    <div>
                      <span style={styles.infoLabel}>Member Since</span>
                      <p style={styles.infoValue}>{profileData.memberSince}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Activity & Achievements */}
          <div style={styles.rightColumn}>
            {/* Recent Activity */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Recent Activity</h2>
              <div style={styles.activityList}>
                {activities.map((activity) => (
                  <div key={activity.id} style={styles.activityItem}>
                    <div
                      style={{
                        ...styles.activityIcon,
                        backgroundColor: `${activity.color}20`,
                        color: activity.color,
                      }}
                    >
                      {activity.icon}
                    </div>
                    <div style={styles.activityContent}>
                      <p style={styles.activityText}>{activity.text}</p>
                      <span style={styles.activityTime}>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/activity" style={styles.viewAllLink}>
                View All Activity →
              </Link>
            </div>

            {/* Achievements */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Achievements</h2>
              <div style={styles.achievementGrid}>
                {achievements.map((achievement) => (
                  <div key={achievement.id} style={styles.achievementItem}>
                    <div
                      style={{
                        ...styles.achievementIcon,
                        backgroundColor: `${achievement.color}20`,
                        color: achievement.color,
                      }}
                    >
                      {achievement.icon}
                    </div>
                    <div style={styles.achievementInfo}>
                      <span style={styles.achievementName}>
                        {achievement.name}
                      </span>
                      <span style={styles.achievementDesc}>
                        {achievement.desc}
                      </span>
                      <div style={styles.achievementProgress}>
                        <div style={styles.achievementProgressBar}>
                          <div
                            style={{
                              ...styles.achievementProgressFill,
                              width: `${achievement.progress}%`,
                              backgroundColor: achievement.color,
                            }}
                          />
                        </div>
                        <span style={styles.achievementProgressText}>
                          {achievement.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/achievements" style={styles.viewAllLink}>
                View All Achievements →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === "certificates" && (
        <div style={styles.certificatesContainer}>
          <div style={styles.certificatesHeader}>
            <h2 style={styles.sectionTitle}>📜 My Certificates</h2>
            <p style={styles.certificatesSubtitle}>
              You have earned {certificates.length} certificates
            </p>
          </div>

          <div style={styles.certificatesGrid}>
            {certificates.map((cert) => (
              <div key={cert.id} style={styles.certificateCard}>
                <div
                  style={{
                    ...styles.certificateHeader,
                    background: `linear-gradient(135deg, ${cert.color} 0%, ${cert.color}dd 100%)`,
                  }}
                >
                  <img
                    src={cert.image}
                    alt="certificate"
                    style={styles.certificateIcon}
                  />
                </div>
                <div style={styles.certificateBody}>
                  <h3 style={styles.certificateTitle}>{cert.title}</h3>
                  <p style={styles.certificateIssuer}>{cert.issuer}</p>
                  <div style={styles.certificateMeta}>
                    <span style={styles.certificateDate}>
                      📅 {cert.issueDate}
                    </span>
                    <span style={styles.certificateId}>
                      🆔 {cert.credentialId}
                    </span>
                  </div>
                </div>
                <div style={styles.certificateFooter}>
                  <button style={styles.viewCertificateBtn}>
                    View Certificate
                  </button>
                  <button style={styles.downloadCertificateBtn}>⬇️</button>
                </div>
              </div>
            ))}
          </div>
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "24px",
    padding: "40px",
    marginBottom: "32px",
    color: "white",
    position: "relative",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
    flexWrap: "wrap",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarLarge: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  avatarPlaceholderLarge: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "white",
    color: "#6366f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "600",
    border: "4px solid white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  changePhotoBtn: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "8px 20px",
    borderRadius: "30px",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s",
    ":hover": {
      background: "rgba(255,255,255,0.3)",
    },
  },
  cameraIcon: {
    fontSize: "1rem",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "8px",
  },
  userEmail: {
    fontSize: "1rem",
    opacity: 0.9,
    marginBottom: "16px",
  },
  userStats: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    background: "rgba(255,255,255,0.1)",
    padding: "16px 28px",
    borderRadius: "16px",
    backdropFilter: "blur(10px)",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  statLabel: {
    fontSize: "0.85rem",
    opacity: 0.9,
  },
  statDivider: {
    width: "1px",
    height: "40px",
    background: "rgba(255,255,255,0.3)",
  },
  editProfileBtn: {
    background: "white",
    color: "#6366f1",
    border: "none",
    padding: "12px 28px",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
    },
  },
  message: {
    padding: "16px 24px",
    borderRadius: "12px",
    marginBottom: "24px",
    fontSize: "0.95rem",
  },
  successMessage: {
    background: "#d1fae5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
  },
  errorMessage: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
  tabs: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "12px",
  },
  tab: {
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
  activeTab: {
    background: "#e0e7ff",
    color: "#6366f1",
    fontWeight: "600",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
    transition: "all 0.3s",
    ":hover": {
      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
    },
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f1f5f9",
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  infoItem: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: "1.2rem",
    width: "28px",
    color: "#64748b",
  },
  infoLabel: {
    display: "block",
    fontSize: "0.8rem",
    color: "#64748b",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "1rem",
    color: "#1e293b",
    fontWeight: "500",
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
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.95rem",
    transition: "all 0.2s",
    ":focus": {
      borderColor: "#6366f1",
      boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
      outline: "none",
    },
  },
  textarea: {
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.95rem",
    resize: "vertical",
    fontFamily: "inherit",
    ":focus": {
      borderColor: "#6366f1",
      boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
      outline: "none",
    },
  },
  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
  },
  saveBtn: {
    flex: 1,
    background: "#6366f1",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    ":hover": {
      background: "#4f52e0",
      transform: "translateY(-2px)",
    },
  },
  cancelBtn: {
    padding: "12px 24px",
    border: "1px solid #e2e8f0",
    background: "white",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#f8fafc",
    },
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "20px",
  },
  activityItem: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
  },
  activityIcon: {
    fontSize: "1.2rem",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    borderRadius: "12px",
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: "0.95rem",
    color: "#1e293b",
    marginBottom: "4px",
    fontWeight: "500",
  },
  activityTime: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  achievementGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "20px",
  },
  achievementItem: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "12px",
    transition: "all 0.2s",
    ":hover": {
      background: "#f1f5f9",
    },
  },
  achievementIcon: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e0e7ff",
    color: "#6366f1",
    borderRadius: "12px",
    fontSize: "1.5rem",
  },
  achievementInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  achievementName: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  achievementDesc: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  achievementProgress: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
  },
  achievementProgressBar: {
    flex: 1,
    height: "4px",
    background: "#e2e8f0",
    borderRadius: "2px",
    overflow: "hidden",
  },
  achievementProgressFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
  achievementProgressText: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#475569",
    minWidth: "35px",
  },
  viewAllLink: {
    color: "#6366f1",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
    display: "inline-block",
    transition: "all 0.2s",
    ":hover": {
      transform: "translateX(4px)",
    },
  },

  // Certificates Styles
  certificatesContainer: {
    marginTop: "20px",
  },
  certificatesHeader: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  certificatesSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
  },
  certificatesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  certificateCard: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #edf2f7",
    transition: "all 0.3s",
    display: "flex",
    flexDirection: "column",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
    },
  },
  certificateHeader: {
    padding: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  certificateIcon: {
    width: "64px",
    height: "64px",
    objectFit: "contain",
  },
  certificateBody: {
    padding: "24px",
    flex: 1,
  },
  certificateTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "4px",
  },
  certificateIssuer: {
    fontSize: "0.85rem",
    color: "#64748b",
    marginBottom: "12px",
  },
  certificateMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "0.8rem",
    color: "#64748b",
  },
  certificateDate: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  certificateId: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontFamily: "monospace",
  },
  certificateFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #edf2f7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
  },
  viewCertificateBtn: {
    background: "#6366f1",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#4f52e0",
    },
  },
  downloadCertificateBtn: {
    background: "white",
    border: "1px solid #e2e8f0",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#f1f5f9",
    },
  },
};

export default ProfilePage;
