import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reply form
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Reply to specific comment
  const [replyingTo, setReplyingTo] = useState(null);
  const [nestedReplyContent, setNestedReplyContent] = useState("");

  useEffect(() => {
    fetchDiscussionDetail();
  }, [id]);

  const fetchDiscussionDetail = async () => {
    setLoading(true);
    try {
      console.log(`🔍 Fetching discussion: ${id}`);

      // Fetch discussion
      const discussionRes = await axios.get(`/api/discussions/${id}`);
      console.log("✅ Discussion data:", discussionRes.data);
      setDiscussion(discussionRes.data);

      // Fetch replies
      await fetchReplies();

      setError(null);
    } catch (err) {
      console.error("❌ Error fetching discussion:", err);
      setError(err.response?.data?.msg || "Diskusi tidak ditemukan");
    }
    setLoading(false);
  };

  const fetchReplies = async () => {
    try {
      const repliesRes = await axios.get(`/api/discussions/${id}/replies`);
      console.log(`✅ Replies found: ${repliesRes.data.length}`);
      setReplies(repliesRes.data);
    } catch (err) {
      console.log("No replies yet");
      setReplies([]);
    }
  };

  // ✅ FIXED: HANDLE ADD REPLY - WITH BETTER ERROR HANDLING
  const handleAddReply = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", { state: { from: `/discussions/${id}` } });
      return;
    }

    if (!replyContent.trim()) {
      setReplyError("Komentar tidak boleh kosong");
      return;
    }

    if (replyContent.trim().length < 2) {
      setReplyError("Komentar terlalu pendek (minimal 2 karakter)");
      return;
    }

    setSubmitting(true);
    setReplyError("");

    try {
      console.log("📝 Sending reply:", replyContent);

      const res = await axios.post(`/api/discussions/${id}/replies`, {
        content: replyContent.trim(),
      });

      console.log("✅ Reply added:", res.data);

      // Clear form
      setReplyContent("");

      // Refresh replies
      await fetchReplies();

      // Update answer count
      setDiscussion({
        ...discussion,
        answerCount: (discussion.answerCount || 0) + 1,
      });
    } catch (err) {
      console.error("❌ Error adding reply:", err);

      // Show specific error message
      const errorMsg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Gagal menambahkan komentar";

      setReplyError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ ADD NESTED REPLY
  const handleAddNestedReply = async (parentReplyId) => {
    if (!user) {
      navigate("/login", { state: { from: `/discussions/${id}` } });
      return;
    }

    if (!nestedReplyContent.trim()) {
      return;
    }

    try {
      await axios.post(`/api/discussions/${id}/replies`, {
        content: nestedReplyContent.trim(),
        parentReply: parentReplyId,
      });

      // Refresh replies
      await fetchReplies();

      setReplyingTo(null);
      setNestedReplyContent("");
    } catch (err) {
      console.error("Error adding nested reply:", err);
      alert(err.response?.data?.msg || "Gagal menambahkan balasan");
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      navigate("/login", { state: { from: `/discussions/${id}` } });
      return;
    }

    try {
      const res = await axios.put(`/api/discussions/${id}/vote`, { voteType });

      setDiscussion({
        ...discussion,
        votes: res.data.votes,
        userVote: res.data.userVote,
      });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleReplyVote = async (replyId, voteType) => {
    if (!user) {
      navigate("/login", { state: { from: `/discussions/${id}` } });
      return;
    }

    try {
      const res = await axios.put(
        `/api/discussions/${id}/replies/${replyId}/vote`,
        {
          voteType,
        },
      );

      setReplies(
        replies.map((reply) =>
          reply._id === replyId
            ? { ...reply, votes: res.data.votes, userVote: res.data.userVote }
            : reply,
        ),
      );
    } catch (err) {
      console.error("Error voting on reply:", err);
    }
  };

  const handleAcceptAnswer = async (replyId) => {
    if (!user || user.id !== discussion.author._id) return;

    try {
      await axios.put(`/api/discussions/${id}/replies/${replyId}/accept`);

      await fetchReplies();
      setDiscussion({ ...discussion, isSolved: true });
    } catch (err) {
      console.error("Error accepting answer:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = d.toLocaleString("id-ID", { month: "short" });
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, "0");
      const minutes = d.getMinutes().toString().padStart(2, "0");
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch (err) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading discussion...</p>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Discussion Not Found</h2>
        <p style={styles.errorMessage}>
          {error || "The discussion you're looking for doesn't exist."}
        </p>
        <Link to="/discussions" style={styles.backLink}>
          ← Back to Discussions
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <Link to="/discussions" style={styles.backLink}>
        ← Back to Discussions
      </Link>

      {/* Discussion Header */}
      <div style={styles.header}>
        {discussion.isOfficial && (
          <div style={styles.officialBadge}>📢 OFFICIAL</div>
        )}

        <h1 style={styles.title}>{discussion.title}</h1>

        <div style={styles.meta}>
          <span style={styles.author}>
            Asked by {discussion.author?.name || "Anonymous"}
          </span>
          <span style={styles.date}>{formatDate(discussion.createdAt)}</span>
          <span style={styles.views}>{discussion.views || 0} views</span>
        </div>
      </div>

      {/* Discussion Content */}
      <div style={styles.contentCard}>
        <div style={styles.contentHeader}>
          <div style={styles.voteContainer}>
            <button
              onClick={() => handleVote("upvote")}
              style={{
                ...styles.voteButton,
                ...(discussion.userVote === "upvote" &&
                  styles.voteButtonActive),
              }}
              title="Like"
            >
              👍
            </button>
            <span style={styles.voteCount}>{discussion.votes || 0}</span>
            <button
              onClick={() => handleVote("downvote")}
              style={{
                ...styles.voteButton,
                ...(discussion.userVote === "downvote" &&
                  styles.voteButtonActive),
              }}
              title="Dislike"
            >
              👎
            </button>
          </div>

          <div style={styles.content}>
            <p style={styles.contentText}>{discussion.content}</p>

            {discussion.tags && discussion.tags.length > 0 && (
              <div style={styles.tagList}>
                {discussion.tags.map((tag) => (
                  <span key={tag} style={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies Section */}
      <div style={styles.repliesSection}>
        <h2 style={styles.repliesTitle}>
          {discussion.answerCount || 0} Answers
        </h2>

        {/* ✅ FIXED: Reply Form dengan better UX */}
        {user ? (
          <form onSubmit={handleAddReply} style={styles.replyForm}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your answer..."
              style={styles.replyTextarea}
              rows="4"
              disabled={submitting}
            />
            {replyError && <div style={styles.replyError}>❌ {replyError}</div>}
            <div style={styles.replyActions}>
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                style={{
                  ...styles.submitReplyButton,
                  ...((submitting || !replyContent.trim()) &&
                    styles.buttonDisabled),
                }}
              >
                {submitting ? "Posting..." : "Post Answer"}
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.loginPrompt}>
            <Link to="/login" style={styles.loginLink}>
              Login
            </Link>{" "}
            to answer this question
          </div>
        )}

        {/* Replies List */}
        <div style={styles.repliesList}>
          {replies.length === 0 ? (
            <div style={styles.noReplies}>
              <p>No answers yet. Be the first to answer!</p>
            </div>
          ) : (
            replies.map((reply) => (
              <div
                key={reply._id}
                style={{
                  ...styles.replyCard,
                  ...(reply.isAcceptedAnswer && styles.acceptedAnswer),
                }}
              >
                {reply.isAcceptedAnswer && (
                  <div style={styles.acceptedBadge}>✅ Accepted Answer</div>
                )}

                <div style={styles.replyHeader}>
                  <div style={styles.replyAuthor}>
                    <span style={styles.replyAuthorName}>
                      {reply.author?.name || "Anonymous"}
                    </span>
                    <span style={styles.replyDate}>
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>

                  <div style={styles.replyVoteContainer}>
                    <button
                      onClick={() => handleReplyVote(reply._id, "upvote")}
                      style={{
                        ...styles.replyVoteButton,
                        ...(reply.userVote === "upvote" &&
                          styles.voteButtonActive),
                      }}
                      title="Like"
                    >
                      👍
                    </button>
                    <span style={styles.replyVoteCount}>
                      {reply.votes || 0}
                    </span>
                    <button
                      onClick={() => handleReplyVote(reply._id, "downvote")}
                      style={{
                        ...styles.replyVoteButton,
                        ...(reply.userVote === "downvote" &&
                          styles.voteButtonActive),
                      }}
                      title="Dislike"
                    >
                      👎
                    </button>
                  </div>
                </div>

                <div style={styles.replyContent}>
                  <p>{reply.content}</p>
                </div>

                {/* Reply button */}
                {user && (
                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === reply._id ? null : reply._id)
                    }
                    style={styles.replyButton}
                  >
                    💬 Reply
                  </button>
                )}

                {/* Nested reply form */}
                {replyingTo === reply._id && (
                  <div style={styles.nestedReplyForm}>
                    <textarea
                      value={nestedReplyContent}
                      onChange={(e) => setNestedReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      style={styles.nestedReplyTextarea}
                      rows="2"
                    />
                    <div style={styles.nestedReplyActions}>
                      <button
                        onClick={() => setReplyingTo(null)}
                        style={styles.cancelReplyButton}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddNestedReply(reply._id)}
                        style={styles.submitNestedReplyButton}
                        disabled={!nestedReplyContent.trim()}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested replies */}
                {reply.replies && reply.replies.length > 0 && (
                  <div style={styles.nestedReplies}>
                    {reply.replies.map((nestedReply) => (
                      <div key={nestedReply._id} style={styles.nestedReply}>
                        <div style={styles.nestedReplyHeader}>
                          <span style={styles.nestedReplyAuthor}>
                            {nestedReply.author?.name || "Anonymous"}
                          </span>
                          <span style={styles.nestedReplyDate}>
                            {formatDate(nestedReply.createdAt)}
                          </span>
                        </div>
                        <p style={styles.nestedReplyContent}>
                          {nestedReply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Accept Answer Button */}
                {user &&
                  discussion.author?._id === user.id &&
                  !discussion.isSolved &&
                  !reply.isAcceptedAnswer && (
                    <button
                      onClick={() => handleAcceptAnswer(reply._id)}
                      style={styles.acceptButton}
                    >
                      ✅ Accept as Answer
                    </button>
                  )}
              </div>
            ))
          )}
        </div>
      </div>
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
    border: "4px solid #e2e8f0",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px 20px",
  },
  errorTitle: {
    fontSize: "24px",
    color: "#ef4444",
    marginBottom: "16px",
  },
  errorMessage: {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "24px",
  },
  backLink: {
    display: "inline-block",
    marginBottom: "30px",
    color: "#2563eb",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
  },
  header: {
    marginBottom: "24px",
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
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "12px",
  },
  meta: {
    display: "flex",
    gap: "16px",
    fontSize: "14px",
    color: "#64748b",
    flexWrap: "wrap",
  },
  contentCard: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "32px",
    border: "1px solid #e2e8f0",
  },
  contentHeader: {
    display: "flex",
    gap: "20px",
  },
  voteContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    minWidth: "60px",
  },
  voteButton: {
    padding: "8px 12px",
    border: "none",
    background: "white",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
    border: "1px solid #e2e8f0",
  },
  voteButtonActive: {
    background: "#2563eb",
    color: "white",
    borderColor: "#2563eb",
  },
  voteCount: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  content: {
    flex: 1,
  },
  contentText: {
    fontSize: "16px",
    color: "#334155",
    lineHeight: "1.7",
    marginBottom: "16px",
  },
  tagList: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  tag: {
    fontSize: "12px",
    color: "#2563eb",
    background: "#eff6ff",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  repliesSection: {
    marginTop: "40px",
  },
  repliesTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "24px",
  },
  replyForm: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    marginBottom: "32px",
  },
  replyTextarea: {
    width: "100%",
    padding: "14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
    marginBottom: "16px",
  },
  replyError: {
    color: "#ef4444",
    fontSize: "14px",
    marginBottom: "12px",
    padding: "8px",
    background: "#fef2f2",
    borderRadius: "6px",
  },
  replyActions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  submitReplyButton: {
    padding: "12px 24px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  loginPrompt: {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "32px",
    color: "#64748b",
  },
  loginLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
  repliesList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  noReplies: {
    textAlign: "center",
    padding: "40px",
    background: "#f8fafc",
    borderRadius: "12px",
    color: "#64748b",
  },
  replyCard: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e2e8f0",
  },
  acceptedAnswer: {
    border: "2px solid #10b981",
    background: "#f0fdf4",
  },
  acceptedBadge: {
    display: "inline-block",
    background: "#10b981",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  replyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  replyAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  replyAuthorName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
  },
  replyDate: {
    fontSize: "13px",
    color: "#64748b",
  },
  replyVoteContainer: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  replyVoteButton: {
    padding: "4px 8px",
    border: "none",
    background: "none",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  replyVoteCount: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    minWidth: "30px",
    textAlign: "center",
  },
  replyContent: {
    fontSize: "15px",
    color: "#334155",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  replyButton: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  nestedReplyForm: {
    marginTop: "16px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  nestedReplyTextarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "12px",
  },
  nestedReplyActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  cancelReplyButton: {
    padding: "6px 12px",
    border: "1px solid #e2e8f0",
    background: "white",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
  submitNestedReplyButton: {
    padding: "6px 16px",
    border: "none",
    background: "#2563eb",
    color: "white",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  nestedReplies: {
    marginTop: "16px",
    paddingLeft: "20px",
    borderLeft: "2px solid #e2e8f0",
  },
  nestedReply: {
    marginBottom: "12px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  nestedReplyHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  nestedReplyAuthor: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
  },
  nestedReplyDate: {
    fontSize: "11px",
    color: "#64748b",
  },
  nestedReplyContent: {
    fontSize: "14px",
    color: "#334155",
    margin: 0,
  },
  acceptButton: {
    marginTop: "12px",
    padding: "6px 12px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
};

export default DiscussionDetail;
