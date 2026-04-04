import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { FaStar, FaRegStar, FaPlay, FaCheckCircle, FaClock, FaArrowLeft, FaChalkboardTeacher } from 'react-icons/fa';
import { MdOutlineRateReview } from 'react-icons/md';

const BASE_URL = 'https://backend-video-learning-lid204s-projects.vercel.app/api';

// ============================================================
// COMPONENT: StarRating - Hệ thống chấm sao tương tác
// ============================================================
function StarRating({ rating, onRate, readonly = false, size = 24 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || rating;

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            cursor: readonly ? 'default' : 'pointer',
            color: star <= display ? '#f59e0b' : '#d1d5db',
            fontSize: `${size}px`,
            transition: 'color 0.15s, transform 0.15s',
            transform: !readonly && star <= hovered ? 'scale(1.25)' : 'scale(1)',
            display: 'inline-flex',
          }}
        >
          {star <= display ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </div>
  );
}

// ============================================================
// COMPONENT CHÍNH: LearningRoom
// ============================================================
function LearningRoom({ course, currentUser, onBack }) {
  const courseId = course?.id || 101;
  const courseName = course?.title || 'Lập trình ReactJS cho Gen Z';

  // --- STATE VIDEO & LESSONS ---
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  // --- STATE REVIEWS ---
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(true);

  // ============================================================
  // FETCH DỮ LIỆU
  // ============================================================
  useEffect(() => {
    fetchLessons();
    fetchReviews();
  }, [courseId]);

  const fetchLessons = async () => {
    setLoadingLessons(true);
    try {
      const res = await axios.get(`${BASE_URL}/lessons/course/${courseId}`);
      const lessonData = res.data;
      setLessons(lessonData);
      if (lessonData.length > 0) setActiveLesson(lessonData[0]);
    } catch (err) {
      console.error('Lỗi lấy bài giảng:', err);
      // Dữ liệu mẫu nếu API chưa có lesson nào
      const mockLessons = [
        { id: 1, course_id: courseId, title: 'Bài 1: Giới thiệu React & Setup môi trường', video_url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', duration: 1200, lesson_order: 1 },
        { id: 2, course_id: courseId, title: 'Bài 2: JSX và Components cơ bản', video_url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', duration: 900, lesson_order: 2 },
        { id: 3, course_id: courseId, title: 'Bài 3: State và Props - Linh hồn của React', video_url: 'https://www.youtube.com/watch?v=35lXWvCuM8o', duration: 1500, lesson_order: 3 },
        { id: 4, course_id: courseId, title: 'Bài 4: useEffect - Hook xử lý side effect', video_url: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U', duration: 1800, lesson_order: 4 },
        { id: 5, course_id: courseId, title: 'Bài 5: Gọi API với Axios', video_url: 'https://www.youtube.com/watch?v=GiItFkgV0ZQ', duration: 2100, lesson_order: 5 },
      ];
      setLessons(mockLessons);
      setActiveLesson(mockLessons[0]);
    } finally {
      setLoadingLessons(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await axios.get(`${BASE_URL}/reviews/${courseId}`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avg_rating || 0);
      setTotalReviews(res.data.total_reviews || 0);
    } catch (err) {
      console.error('Lỗi lấy reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // ============================================================
  // XỬ LÝ VIDEO
  // ============================================================
  const getVideoUrl = (lesson) => {
    if (!lesson) return '';
    const url = lesson.video_url;
    // Nếu là YouTube ID thuần (11 ký tự) thì chuyển thành URL đầy đủ
    if (url && url.length === 11 && !url.includes('http')) {
      return `https://www.youtube.com/watch?v=${url}`;
    }
    return url;
  };

  const handleLessonEnd = () => {
    if (activeLesson) {
      setCompletedLessons(prev => new Set([...prev, activeLesson.id]));
    }
    // Tự động chuyển bài tiếp theo
    const currentIdx = lessons.findIndex(l => l.id === activeLesson?.id);
    if (currentIdx < lessons.length - 1) {
      setActiveLesson(lessons[currentIdx + 1]);
      setPlaying(true);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = lessons.length > 0
    ? Math.round((completedLessons.size / lessons.length) * 100)
    : 0;

  // ============================================================
  // XỬ LÝ REVIEW / CHẤM SAO
  // ============================================================
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!myRating) {
      setReviewMsg('⚠️ Vui lòng chọn số sao trước khi gửi!');
      return;
    }
    if (!currentUser) {
      setReviewMsg('⚠️ Bạn cần đăng nhập để đánh giá!');
      return;
    }
    setSubmitting(true);
    setReviewMsg('');
    try {
      const res = await axios.post(`${BASE_URL}/reviews`, {
        user_id: currentUser.id,
        course_id: courseId,
        rating: myRating,
        comment: myComment,
      });
      setReviewMsg('✅ ' + res.data.message);
      setMyComment('');
      fetchReviews(); // Reload danh sách
    } catch (err) {
      setReviewMsg('❌ ' + (err.response?.data?.error || 'Lỗi gửi đánh giá!'));
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={styles.wrapper}>

      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Tất cả khóa học
        </button>
        <div style={styles.headerTitle}>
          <FaChalkboardTeacher style={{ marginRight: '10px', color: '#38bdf8' }} />
          {courseName}
        </div>
        <div style={styles.progressBadge}>
          {progressPercent}% hoàn thành
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div style={styles.mainLayout}>

        {/* ===== SIDEBAR: DANH SÁCH BÀI GIẢNG ===== */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={{ fontWeight: '700', fontSize: '15px', color: '#f1f5f9' }}>
              📋 Nội dung khóa học
            </div>
            <div style={styles.sidebarStats}>
              {lessons.length} bài · {completedLessons.size} đã xong
            </div>
          </div>

          {/* Progress bar */}
          <div style={styles.progressBarTrack}>
            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
          </div>

          {/* Danh sách bài học */}
          <div style={styles.lessonList}>
            {loadingLessons ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner} />
                Đang tải bài giảng...
              </div>
            ) : (
              lessons.map((lesson, index) => {
                const isActive = activeLesson?.id === lesson.id;
                const isDone = completedLessons.has(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => { setActiveLesson(lesson); setPlaying(true); }}
                    style={{
                      ...styles.lessonItem,
                      backgroundColor: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
                      borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    }}
                  >
                    <div style={styles.lessonIcon}>
                      {isDone ? (
                        <FaCheckCircle style={{ color: '#10b981', fontSize: '18px' }} />
                      ) : isActive ? (
                        <FaPlay style={{ color: '#3b82f6', fontSize: '14px' }} />
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>{index + 1}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        ...styles.lessonTitle,
                        color: isActive ? '#e2e8f0' : isDone ? '#94a3b8' : '#cbd5e1',
                        fontWeight: isActive ? '700' : '400',
                      }}>
                        {lesson.title}
                      </div>
                      {lesson.duration > 0 && (
                        <div style={styles.lessonDuration}>
                          <FaClock style={{ marginRight: '4px', fontSize: '10px' }} />
                          {formatDuration(lesson.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===== KHU VỰC VIDEO + REVIEWS ===== */}
        <div style={styles.content}>

          {/* VIDEO PLAYER */}
          <div style={styles.playerWrapper}>
            {activeLesson ? (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <ReactPlayer
                  url={getVideoUrl(activeLesson)}
                  width="100%"
                  height="100%"
                  controls
                  playing={playing}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={handleLessonEnd}
                  config={{
                    youtube: {
                      playerVars: { rel: 0, modestbranding: 1 }
                    }
                  }}
                />
              </div>
            ) : (
              <div style={styles.playerPlaceholder}>
                <FaPlay style={{ fontSize: '48px', color: '#334155', marginBottom: '16px' }} />
                <p style={{ color: '#64748b' }}>Chọn một bài giảng để bắt đầu học</p>
              </div>
            )}
          </div>

          {/* THÔNG TIN BÀI GIẢNG ĐANG PHÁT */}
          {activeLesson && (
            <div style={styles.videoInfo}>
              <h2 style={styles.videoTitle}>{activeLesson.title}</h2>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={styles.videoBadge}>
                  Bài {lessons.findIndex(l => l.id === activeLesson.id) + 1} / {lessons.length}
                </span>
                {completedLessons.has(activeLesson.id) && (
                  <span style={{ ...styles.videoBadge, backgroundColor: '#ecfdf5', color: '#059669' }}>
                    <FaCheckCircle style={{ marginRight: '5px' }} />
                    Đã hoàn thành
                  </span>
                )}
                {!completedLessons.has(activeLesson.id) && (
                  <button
                    onClick={() => {
                      setCompletedLessons(prev => new Set([...prev, activeLesson.id]));
                    }}
                    style={styles.markDoneBtn}
                  >
                    ✅ Đánh dấu đã xem
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===== PHẦN ĐÁNH GIÁ SAO ===== */}
          <div style={styles.reviewSection}>

            {/* Tổng quan điểm đánh giá */}
            <div style={styles.ratingOverview}>
              <div style={styles.ratingBigNum}>{avgRating}</div>
              <div>
                <StarRating rating={Math.round(avgRating)} readonly size={20} />
                <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
                  {totalReviews} lượt đánh giá
                </div>
              </div>
            </div>

            {/* Form gửi đánh giá */}
            <div style={styles.reviewFormCard}>
              <h3 style={styles.reviewFormTitle}>
                <MdOutlineRateReview style={{ marginRight: '8px', color: '#38bdf8' }} />
                Đánh giá của bạn
              </h3>

              {/* Chọn sao */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>
                  Bấm chọn số sao (1 = Tệ nhất, 5 = Tuyệt vời nhất):
                </p>
                <StarRating rating={myRating} onRate={setMyRating} size={36} />
                {myRating > 0 && (
                  <span style={{ marginLeft: '12px', color: '#f59e0b', fontWeight: '700', fontSize: '15px' }}>
                    {['', '😤 Tệ thật', '😕 Chưa tốt', '😐 Bình thường', '😊 Khá hay', '🤩 Tuyệt vời!'][myRating]}
                  </span>
                )}
              </div>

              {/* Nhập bình luận */}
              <textarea
                placeholder="Chia sẻ cảm nhận của bạn về khóa học này... (tùy chọn)"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
                style={styles.commentInput}
              />

              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? '⏳ Đang gửi...' : '🚀 Gửi đánh giá'}
              </button>

              {reviewMsg && (
                <div style={{
                  ...styles.reviewMsg,
                  backgroundColor: reviewMsg.startsWith('✅') ? '#ecfdf5' : reviewMsg.startsWith('⚠️') ? '#fffbeb' : '#fef2f2',
                  color: reviewMsg.startsWith('✅') ? '#065f46' : reviewMsg.startsWith('⚠️') ? '#92400e' : '#991b1b',
                }}>
                  {reviewMsg}
                </div>
              )}
            </div>

            {/* Danh sách reviews */}
            <div style={styles.reviewListSection}>
              <h3 style={styles.reviewListTitle}>💬 Nhận xét từ học viên</h3>
              {loadingReviews ? (
                <div style={styles.loadingState}>
                  <div style={styles.spinner} />
                  Đang tải đánh giá...
                </div>
              ) : reviews.length === 0 ? (
                <div style={styles.emptyReviews}>
                  Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá khóa học này! 🌟
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewCardHeader}>
                      <div style={styles.reviewAvatar}>
                        {(review.user_name || 'A')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '15px' }}>
                          {review.user_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <StarRating rating={review.rating} readonly size={14} />
                          <span style={{ color: '#64748b', fontSize: '12px' }}>
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p style={styles.reviewComment}>{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 24px',
    backgroundColor: '#1e293b',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.2s',
    whiteSpace: 'nowrap',
  },
  headerTitle: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    fontWeight: '700',
    color: '#f1f5f9',
    fontSize: '16px',
  },
  progressBadge: {
    padding: '6px 14px',
    backgroundColor: 'rgba(59,130,246,0.15)',
    color: '#60a5fa',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid rgba(59,130,246,0.3)',
    whiteSpace: 'nowrap',
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  // SIDEBAR
  sidebar: {
    width: '340px',
    minWidth: '280px',
    backgroundColor: '#1e293b',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '20px 20px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  sidebarStats: {
    color: '#64748b',
    fontSize: '12px',
    marginTop: '4px',
  },
  progressBarTrack: {
    height: '3px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    margin: '0 20px 8px',
    borderRadius: '2px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '2px',
    transition: 'width 0.4s ease',
  },
  lessonList: {
    flex: 1,
    padding: '8px 0',
  },
  lessonItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '14px 20px',
    cursor: 'pointer',
    gap: '14px',
    transition: 'background 0.2s',
    borderLeft: '3px solid transparent',
  },
  lessonIcon: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  lessonTitle: {
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '4px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    textOverflow: 'ellipsis',
  },
  lessonDuration: {
    display: 'flex',
    alignItems: 'center',
    color: '#475569',
    fontSize: '11px',
  },
  // CONTENT
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  playerWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // 16:9 ratio
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#000',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    marginBottom: '20px',
  },
  playerPlaceholder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  videoInfo: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  videoTitle: {
    color: '#f1f5f9',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  videoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: 'rgba(59,130,246,0.1)',
    color: '#60a5fa',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  markDoneBtn: {
    padding: '8px 18px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: '0.2s',
  },
  // REVIEWS
  reviewSection: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  ratingOverview: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 24px',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: '12px',
    border: '1px solid rgba(245,158,11,0.2)',
    marginBottom: '24px',
  },
  ratingBigNum: {
    fontSize: '52px',
    fontWeight: '800',
    color: '#f59e0b',
    lineHeight: 1,
  },
  reviewFormCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '28px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  reviewFormTitle: {
    display: 'flex',
    alignItems: 'center',
    color: '#e2e8f0',
    fontSize: '17px',
    fontWeight: '700',
    margin: '0 0 20px 0',
  },
  commentInput: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    marginBottom: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: '1.6',
  },
  submitBtn: {
    padding: '12px 28px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
    transition: '0.2s',
  },
  reviewMsg: {
    marginTop: '14px',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
  },
  reviewListSection: {
    marginTop: '4px',
  },
  reviewListTitle: {
    color: '#e2e8f0',
    fontSize: '17px',
    fontWeight: '700',
    margin: '0 0 20px 0',
  },
  reviewCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '18px 20px',
    marginBottom: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: '0.2s',
  },
  reviewCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '10px',
  },
  reviewAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '800',
    fontSize: '16px',
    flexShrink: 0,
  },
  reviewComment: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: '1.7',
    margin: '8px 0 0 0',
    paddingLeft: '54px',
  },
  emptyReviews: {
    textAlign: 'center',
    color: '#475569',
    fontSize: '15px',
    padding: '40px 20px',
    border: '1px dashed rgba(255,255,255,0.08)',
    borderRadius: '12px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '30px',
    color: '#64748b',
    fontSize: '14px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(59,130,246,0.2)',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// Fix cho React Player trong wrapper 16:9
const playerFixStyle = document.createElement('style');
playerFixStyle.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .learning-room-player { position: absolute; top: 0; left: 0; }
  .learning-room-player iframe,
  .learning-room-player video {
    border-radius: 12px;
  }
`;
document.head.appendChild(playerFixStyle);

// Thêm wrapper position absolute cho ReactPlayer
const WrappedLearningRoom = (props) => <LearningRoom {...props} />;

// Patch ReactPlayer để fit trong wrapper paddingTop 16:9
const PatchedPlayerWrapper = ({ children }) => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
    {children}
  </div>
);

export { StarRating };
export default LearningRoom;
