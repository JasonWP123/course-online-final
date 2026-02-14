import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const Discussions = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("trending");

  // Modal state untuk Ask Question
  const [showAskModal, setShowAskModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "help",
    tags: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // State untuk komentar per diskusi
  const [replyData, setReplyData] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const [showReplies, setShowReplies] = useState({});

  useEffect(() => {
    fetchDiscussions();
  }, [filter, searchTerm]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort: filter,
        limit: 20,
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const res = await axios.get(`/api/discussions?${params}`);

      // Load votes from localStorage
      const discussionsWithVotes = res.data.map((discussion) => {
        const storageKey = `discussion_vote_${discussion._id}`;
        const savedVote = localStorage.getItem(storageKey);
        return {
          ...discussion,
          votes: discussion.votes || 0,
          userVote: savedVote || null,
          replies: [],
          showReplies: false,
          replyCount: discussion.answerCount || 0,
        };
      });

      setDiscussions(discussionsWithVotes);

      // Fetch replies for each discussion
      discussionsWithVotes.forEach((discussion) => {
        fetchReplies(discussion._id);
      });
    } catch (err) {
      console.error("Error fetching discussions:", err);
    }
    setLoading(false);
  };

  // ✅ FETCH REPLIES UNTUK SATU DISKUSI
  const fetchReplies = async (discussionId) => {
    try {
      const res = await axios.get(`/api/discussions/${discussionId}/replies`);

      setDiscussions((prevDiscussions) =>
        prevDiscussions.map((disc) =>
          disc._id === discussionId
            ? { ...disc, replies: res.data, replyCount: res.data.length }
            : disc,
        ),
      );
    } catch (err) {
      console.error(`Error fetching replies for ${discussionId}:`, err);
    }
  };

  // ✅ HANDLE VOTE - DIPERBAIKI: 👍 like nambah, 👎 dislike ngurang
  const handleVote = (discussionId, voteType) => {
    if (!user) {
      navigate("/login", { state: { from: "/discussions" } });
      return;
    }

    setDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) => {
        if (discussion._id === discussionId) {
          const storageKey = `discussion_vote_${discussionId}`;
          const currentVote = localStorage.getItem(storageKey);

          let newVotes = discussion.votes || 0;
          let newUserVote = null;

          if (currentVote) {
            if (currentVote === voteType) {
              // Remove vote
              localStorage.removeItem(storageKey);
              if (currentVote === "upvote") {
                newVotes = newVotes + 1; // 👍 remove: -1
              } else {
                newVotes = newVotes - 1; // 👎 remove: +1 (kembali ke netral)
              }
              newUserVote = null;
            } else {
              // Change vote
              localStorage.setItem(storageKey, voteType);
              if (currentVote === "upvote" && voteType === "downvote") {
                newVotes = newVotes - 2; // 👍 ke 👎: -2
              } else if (currentVote === "downvote" && voteType === "upvote") {
                newVotes = newVotes + 2; // 👎 ke 👍: +2
              }
              newUserVote = voteType;
            }
          } else {
            // First time vote
            localStorage.setItem(storageKey, voteType);
            if (voteType === "upvote") {
              newVotes = newVotes + 1; // 👍: +1
            } else {
              newVotes = newVotes - 1; // 👎: -1
            }
            newUserVote = voteType;
          }

          return { ...discussion, votes: newVotes, userVote: newUserVote };
        }
        return discussion;
      }),
    );
  };

  // ✅ HANDLE ADD REPLY (LANGSUNG DI LIST)
  const handleAddReply = async (discussionId) => {
    if (!user) {
      navigate("/login", { state: { from: "/discussions" } });
      return;
    }

    const content = replyData[discussionId];
    if (!content || !content.trim()) {
      alert("Komentar tidak boleh kosong");
      return;
    }

    setSubmittingReply((prev) => ({ ...prev, [discussionId]: true }));

    try {
      const res = await axios.post(`/api/discussions/${discussionId}/replies`, {
        content: content,
      });

      // Clear reply input
      setReplyData((prev) => ({ ...prev, [discussionId]: "" }));

      // Refresh replies
      fetchReplies(discussionId);
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("Gagal menambahkan komentar");
    }

    setSubmittingReply((prev) => ({ ...prev, [discussionId]: false }));
  };

  // ✅ TOGGLE SHOW REPLIES
  const toggleReplies = (discussionId) => {
    setDiscussions((prevDiscussions) =>
      prevDiscussions.map((disc) =>
        disc._id === discussionId
          ? { ...disc, showReplies: !disc.showReplies }
          : disc,
      ),
    );
  };

  // ✅ HANDLE CREATE DISCUSSION
  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (!formData.title || !formData.content) {
      setFormError("Judul dan konten harus diisi");
      setFormLoading(false);
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const discussionData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: tagsArray,
      };

      const res = await axios.post("/api/discussions", discussionData);

      // Reset form
      setFormData({ title: "", content: "", category: "help", tags: "" });
      setShowAskModal(false);

      // Refresh discussions
      fetchDiscussions();
    } catch (err) {
      console.error("Error creating discussion:", err);
      setFormError(err.response?.data?.msg || "Gagal membuat diskusi");
    }
    setFormLoading(false);
  };

  const formatDate = (date) => {
    return format(new Date(date), "do MMM yyyy, h:mm a", { locale: id });
  };

  return (
    <div style={styles.container}>
      {/* Header with Ask Question Button */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Q&A Discussions</h1>
          <p style={styles.subtitle}>
            Tanya jawab seputar programming, matematika, karir, dan pembelajaran
          </p>
        </div>

        {/* ASK QUESTION BUTTON */}
        {user ? (
          <button
            onClick={() => setShowAskModal(true)}
            style={styles.askButton}
          >
            ✏️ Ask a Question
          </button>
        ) : (
          <Link to="/login" style={styles.loginAskButton}>
            🔐 Login to Ask
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchIcon}>🔍</span>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        <button
          onClick={() => setFilter("trending")}
          style={{
            ...styles.filterTab,
            ...(filter === "trending" && styles.filterTabActive),
          }}
        >
          🔥 Trending
        </button>
        <button
          onClick={() => setFilter("latest")}
          style={{
            ...styles.filterTab,
            ...(filter === "latest" && styles.filterTabActive),
          }}
        >
          🕐 Latest
        </button>
        <button
          onClick={() => setFilter("popular")}
          style={{
            ...styles.filterTab,
            ...(filter === "popular" && styles.filterTabActive),
          }}
        >
          ⭐ Popular
        </button>
        <button
          onClick={() => setFilter("unanswered")}
          style={{
            ...styles.filterTab,
            ...(filter === "unanswered" && styles.filterTabActive),
          }}
        >
          ❓ Unanswered
        </button>
      </div>

      {/* Discussions List */}
      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
        </div>
      ) : discussions.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No questions found</p>
          {user && (
            <button
              onClick={() => setShowAskModal(true)}
              style={styles.emptyAskButton}
            >
              Be the first to ask a question
            </button>
          )}
        </div>
      ) : (
        <div style={styles.discussionsList}>
          {discussions.map((discussion, index) => (
            <div key={discussion._id} style={styles.discussionCard}>
              {/* Official Badge */}
              {discussion.isOfficial && (
                <div style={styles.officialBadge}>📢 OFFICIAL</div>
              )}

              {/* Title */}
              <div style={styles.titleContainer}>
                <Link
                  to={`/discussions/${discussion._id}`}
                  style={styles.title}
                >
                  {discussion.title}
                </Link>
              </div>

              {/* Preview Content */}
              <p style={styles.preview}>
                {discussion.content?.substring(0, 150)}...
              </p>

              {/* Tags */}
              {discussion.tags && discussion.tags.length > 0 && (
                <div style={styles.tagList}>
                  {discussion.tags.slice(0, 3).map((tag) => (
                    <span key={tag} style={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                  {discussion.tags.length > 3 && (
                    <span style={styles.tagMore}>
                      +{discussion.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats - VOTE SUDAH DIPERBAIKI */}
              <div style={styles.statsContainer}>
                <div style={styles.voteContainer}>
                  <button
                    onClick={() => handleVote(discussion._id, "upvote")}
                    style={{
                      ...styles.voteButton,
                      ...(discussion.userVote === "upvote" &&
                        styles.voteButtonActive),
                    }}
                    title="Like (👍)"
                  >
                    👍
                  </button>
                  <span style={styles.voteCount}>{discussion.votes || 0}</span>
                  <button
                    onClick={() => handleVote(discussion._id, "downvote")}
                    style={{
                      ...styles.voteButton,
                      ...(discussion.userVote === "downvote" &&
                        styles.voteButtonActive),
                    }}
                    title="Dislike (👎)"
                  >
                    👎
                  </button>
                </div>

                <div
                  style={styles.answerContainer}
                  onClick={() => toggleReplies(discussion._id)}
                >
                  <span style={styles.answerIcon}>💬</span>
                  <span style={styles.answerCount}>
                    {discussion.replyCount || 0} answers
                  </span>
                </div>

                <div style={styles.viewContainer}>
                  <span style={styles.viewIcon}>👁️</span>
                  <span style={styles.viewCount}>
                    {discussion.views || 0} views
                  </span>
                </div>
              </div>

              {/* Meta Info */}
              <div style={styles.metaInfo}>
                <span style={styles.date}>
                  {formatDate(discussion.createdAt)}
                </span>
                <span style={styles.author}>
                  by {discussion.author?.name || "Anonymous"}
                </span>
              </div>

              {/* ✅ KOMMENTAR SECTION - LANGSUNG DI LIST */}
              {discussion.showReplies && (
                <div style={styles.repliesSection}>
                  {/* List Replies */}
                  {discussion.replies && discussion.replies.length > 0 ? (
                    <div style={styles.repliesList}>
                      {discussion.replies.map((reply) => (
                        <div key={reply._id} style={styles.replyItem}>
                          <div style={styles.replyHeader}>
                            <span style={styles.replyAuthor}>
                              {reply.author?.name || "Anonymous"}
                            </span>
                            <span style={styles.replyDate}>
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p style={styles.replyContent}>{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={styles.noReplies}>No comments yet.</p>
                  )}

                  {/* Add Reply Form */}
                  {user ? (
                    <div style={styles.addReplyForm}>
                      <textarea
                        value={replyData[discussion._id] || ""}
                        onChange={(e) =>
                          setReplyData((prev) => ({
                            ...prev,
                            [discussion._id]: e.target.value,
                          }))
                        }
                        placeholder="Write a comment..."
                        style={styles.replyTextarea}
                        rows="2"
                      />
                      <button
                        onClick={() => handleAddReply(discussion._id)}
                        disabled={submittingReply[discussion._id]}
                        style={styles.submitReplyButton}
                      >
                        {submittingReply[discussion._id]
                          ? "Posting..."
                          : "Post Comment"}
                      </button>
                    </div>
                  ) : (
                    <div style={styles.loginReplyPrompt}>
                      <Link to="/login" style={styles.loginLink}>
                        Login
                      </Link>{" "}
                      to comment
                    </div>
                  )}
                </div>
              )}

              {/* Separator */}
              {index < discussions.length - 1 && (
                <hr style={styles.separator} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ASK QUESTION MODAL */}
      {showAskModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Ask a Question</h2>
              <button
                onClick={() => {
                  setShowAskModal(false);
                  setFormData({
                    title: "",
                    content: "",
                    category: "help",
                    tags: "",
                  });
                  setFormError("");
                }}
                style={styles.modalClose}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} style={styles.modalForm}>
              {formError && <div style={styles.formError}>{formError}</div>}

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Question Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., How to understand calculus limits?"
                  style={styles.formInput}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  style={styles.formSelect}
                >
                  <option value="help">❓ Help</option>
                  <option value="programming">💻 Programming</option>
                  <option value="career">🚀 Career</option>
                  <option value="general">💬 General</option>
                  <option value="showcase">✨ Showcase</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Question Details</label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Describe your question in detail..."
                  style={styles.formTextarea}
                  rows="6"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Tags{" "}
                  <span style={styles.formHint}>(separate with commas)</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="e.g., javascript, react, beginner"
                  style={styles.formInput}
                />
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={styles.submitButton}
                >
                  {formLoading ? "Posting..." : "Post Question"}
                </button>
              </div>
            </form>
          </div>
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
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    marginTop: "8px",
  },
  askButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "30px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    ":hover": {
      background: "#1d4ed8",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
    },
  },
  loginAskButton: {
    background: "#f1f5f9",
    color: "#475569",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "30px",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s",
    ":hover": {
      background: "#e2e8f0",
    },
  },
  searchContainer: {
    position: "relative",
    marginBottom: "24px",
  },
  searchInput: {
    width: "100%",
    padding: "14px 48px 14px 20px",
    border: "1px solid #e2e8f0",
    borderRadius: "40px",
    fontSize: "15px",
    backgroundColor: "#f8fafc",
    ":focus": {
      outline: "none",
      borderColor: "#2563eb",
      backgroundColor: "white",
      boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
    },
  },
  searchIcon: {
    position: "absolute",
    right: "20px",
    top: "14px",
    color: "#94a3b8",
    fontSize: "18px",
  },
  filterTabs: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "12px",
    flexWrap: "wrap",
  },
  filterTab: {
    padding: "6px 12px",
    border: "none",
    background: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "#64748b",
    cursor: "pointer",
    borderRadius: "20px",
    transition: "all 0.2s",
    ":hover": {
      color: "#0f172a",
      background: "#f1f5f9",
    },
  },
  filterTabActive: {
    color: "#2563eb",
    background: "#eff6ff",
    fontWeight: "600",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: "60px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#f8fafc",
    borderRadius: "16px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "16px",
  },
  emptyAskButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "30px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  discussionsList: {
    display: "flex",
    flexDirection: "column",
  },
  discussionCard: {
    padding: "24px 0",
  },
  officialBadge: {
    display: "inline-block",
    background: "#f43f5e",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  titleContainer: {
    marginBottom: "8px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    textDecoration: "none",
    lineHeight: "1.4",
    ":hover": {
      color: "#2563eb",
      textDecoration: "underline",
    },
  },
  preview: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "12px",
    lineHeight: "1.6",
  },
  tagList: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  tag: {
    fontSize: "12px",
    color: "#2563eb",
    background: "#eff6ff",
    padding: "4px 10px",
    borderRadius: "16px",
  },
  tagMore: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "16px",
  },
  statsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "12px",
  },
  voteContainer: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#f8fafc",
    padding: "4px",
    borderRadius: "30px",
  },
  voteButton: {
    padding: "6px 12px",
    border: "none",
    background: "none",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "30px",
    transition: "all 0.2s",
    ":hover": {
      background: "#e2e8f0",
    },
  },
  voteButtonActive: {
    background: "#2563eb",
    color: "white",
    ":hover": {
      background: "#1d4ed8",
    },
  },
  voteCount: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    minWidth: "30px",
    textAlign: "center",
  },
  answerContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "20px",
    ":hover": {
      background: "#f1f5f9",
    },
  },
  answerIcon: {
    fontSize: "16px",
    color: "#64748b",
  },
  answerCount: {
    fontSize: "14px",
    color: "#1e293b",
  },
  viewContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  viewIcon: {
    fontSize: "16px",
    color: "#64748b",
  },
  viewCount: {
    fontSize: "14px",
    color: "#64748b",
  },
  metaInfo: {
    display: "flex",
    gap: "12px",
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "16px",
  },
  date: {
    color: "#64748b",
  },
  author: {
    color: "#0f172a",
    fontWeight: "500",
  },

  // ✅ REPLY SECTION STYLES
  repliesSection: {
    marginTop: "16px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  repliesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },
  replyItem: {
    padding: "12px",
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  replyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  replyAuthor: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
  },
  replyDate: {
    fontSize: "11px",
    color: "#64748b",
  },
  replyContent: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.5",
    margin: 0,
  },
  noReplies: {
    fontSize: "14px",
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: "16px",
  },
  addReplyForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  replyTextarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    ":focus": {
      borderColor: "#2563eb",
      boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
      outline: "none",
    },
  },
  submitReplyButton: {
    alignSelf: "flex-end",
    padding: "8px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    ":hover": {
      background: "#1d4ed8",
    },
    ":disabled": {
      opacity: 0.7,
      cursor: "not-allowed",
    },
  },
  loginReplyPrompt: {
    fontSize: "13px",
    color: "#64748b",
    textAlign: "center",
    padding: "12px",
  },
  loginLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
    ":hover": {
      textDecoration: "underline",
    },
  },
  separator: {
    margin: "0",
    border: "none",
    borderTop: "1px solid #edf2f7",
    marginTop: "24px",
  },

  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "white",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#64748b",
    padding: "4px 8px",
    borderRadius: "8px",
    ":hover": {
      background: "#f1f5f9",
      color: "#0f172a",
    },
  },
  modalForm: {
    padding: "24px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  formLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  formHint: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "normal",
  },
  formInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    transition: "all 0.2s",
    ":focus": {
      borderColor: "#2563eb",
      boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
      outline: "none",
    },
  },
  formSelect: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    background: "white",
  },
  formTextarea: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
    ":focus": {
      borderColor: "#2563eb",
      boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
      outline: "none",
    },
  },
  formError: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
  cancelButton: {
    padding: "12px 24px",
    border: "1px solid #e2e8f0",
    background: "white",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    ":hover": {
      background: "#f8fafc",
    },
  },
  submitButton: {
    padding: "12px 32px",
    border: "none",
    background: "#2563eb",
    color: "white",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#1d4ed8",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
    },
    ":disabled": {
      opacity: 0.7,
      cursor: "not-allowed",
      transform: "none",
    },
  },
};

export default Discussions;
