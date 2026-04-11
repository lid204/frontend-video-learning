import React, { useState, useEffect } from 'react';
import LearningSpace from './LearningSpace';
import axios from 'axios';
import { FaStar, FaRegStar, FaPlay, FaCheckCircle, FaClock, FaArrowLeft, FaChalkboardTeacher } from 'react-icons/fa';
import { MdOutlineRateReview } from 'react-icons/md';
import CurriculumAccordion from "./components/CurriculumAccordion";
import API_BASE_URL from './config/api';

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

function LearningRoom({ course, currentUser, onBack }) {
  const courseId = course?.id || 101;
  const courseName = course?.title || 'Lập trình ReactJS cho Gen Z';

  const [curriculum, setCurriculum] = useState([]); 
  const [activeLesson, setActiveLesson] = useState(null);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchCurriculum();
    fetchReviews();
  }, [courseId]);

  const fetchCurriculum = async () => {
  setLoadingLessons(true);
  try {
    const res = await axios.get(`${API_BASE_URL}/courses/${courseId}/curriculum`);
    const curriculumData = Array.isArray(res.data) ? res.data : [];

    setCurriculum(curriculumData);

    if (curriculumData.length > 0 && curriculumData[0].lessons?.length > 0) {
      setActiveLesson(curriculumData[0].lessons[0]);
    } else {
      setActiveLesson(null);
    }
  } catch (err) {
    console.error('Lỗi lấy chương trình học:', err);
    setCurriculum([]);
    setActiveLesson(null);
  } finally {
    setLoadingLessons(false);
  }
};

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/reviews/${courseId}`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avg_rating || 0);
      setTotalReviews(res.data.total_reviews || 0);
    } catch (err) {
      console.error('Lỗi lấy reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getVideoUrl = (lesson) => {
    if (!lesson || !lesson.video_url) return '';
    const url = lesson.video_url;
    if (url && url.length === 11 && !url.includes('http')) {
      return `https://www.youtube.com/watch?v=${url}`;
    }
    return url;
  };

  const handleLessonEnd = () => {
    if (activeLesson) {
      setCompletedLessons(prev => new Set([...prev, activeLesson.id]));
    }
    let allLessons = [];
    curriculum.forEach(section => {
      if (section.lessons) allLessons = [...allLessons, ...section.lessons];
    });

    const currentIdx = allLessons.findIndex(l => l.id === activeLesson?.id);
    if (currentIdx < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIdx + 1]);
      setPlaying(true);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalLessons = curriculum.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!myRating) { setReviewMsg('⚠️ Vui lòng chọn số sao trước khi gửi!'); return; }
    if (!currentUser) { setReviewMsg('⚠️ Bạn cần đăng nhập để đánh giá!'); return; }
    setSubmitting(true);
    setReviewMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/reviews`, {
        user_id: currentUser.id,
        course_id: courseId,
        rating: myRating,
        comment: myComment,
      });
      setReviewMsg('✅ ' + res.data.message);
      setMyComment('');
      fetchReviews();
    } catch (err) {
      setReviewMsg('❌ ' + (err.response?.data?.error || 'Lỗi gửi đánh giá!'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
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

      <div style={styles.mainLayout}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={{ fontWeight: '700', fontSize: '15px', color: '#f1f5f9' }}>
              📋 Nội dung khóa học
            </div>
            <div style={styles.sidebarStats}>
              {totalLessons} bài · {completedLessons.size} đã xong
            </div>
          </div>

          <div style={styles.progressBarTrack}>
            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
          </div>

          <div style={styles.lessonList}>
            {loadingLessons ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner} />
                Đang tải chương trình học...
              </div>
            ) : (
              <CurriculumAccordion 
                curriculumData={curriculum} 
                onLessonSelect={(lesson) => { setActiveLesson(lesson); setPlaying(true); }}
                activeLessonId={activeLesson?.id}
              />
            )}
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.playerWrapper}>
            {activeLesson ? (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <LearningSpace
                  key={activeLesson.id}
                  lessonId={activeLesson.id}
                  videoUrl={getVideoUrl(activeLesson)}
                  userId={currentUser?.id ?? null}
                  onEnded={handleLessonEnd}
                  onPlayStateChange={setPlaying}
                />
              </div>
            ) : (
              <div style={styles.playerPlaceholder}>
                <FaPlay style={{ fontSize: '48px', color: '#334155', marginBottom: '16px' }} />
                <p style={{ color: '#64748b' }}>Chọn một bài giảng để bắt đầu học</p>
              </div>
            )}
          </div>

          {activeLesson && (
            <div style={styles.videoInfo}>
              <h2 style={styles.videoTitle}>{activeLesson.title}</h2>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={styles.videoBadge}>Đang phát</span>
                {completedLessons.has(activeLesson.id) && (
                  <span style={{ ...styles.videoBadge, backgroundColor: '#ecfdf5', color: '#059669' }}>
                    <FaCheckCircle style={{ marginRight: '5px' }} />
                    Đã hoàn thành
                  </span>
                )}
                {!completedLessons.has(activeLesson.id) && (
                  <button
                    onClick={() => setCompletedLessons(prev => new Set([...prev, activeLesson.id]))}
                    style={styles.markDoneBtn}
                  >
                    ✅ Đánh dấu đã xem
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={styles.reviewSection}>
            <div style={styles.ratingOverview}>
              <div style={styles.ratingBigNum}>{avgRating}</div>
              <div>
                <StarRating rating={Math.round(avgRating)} readonly size={20} />
                <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
                  {totalReviews} lượt đánh giá
                </div>
              </div>
            </div>

            <div style={styles.reviewFormCard}>
              <h3 style={styles.reviewFormTitle}>
                <MdOutlineRateReview style={{ marginRight: '8px', color: '#38bdf8' }} />
                Đánh giá của bạn
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <StarRating rating={myRating} onRate={setMyRating} size={36} />
              </div>
              <textarea
                placeholder="Chia sẻ cảm nhận của bạn..."
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
                style={styles.commentInput}
              />
              <button onClick={handleSubmitReview} disabled={submitting} style={styles.submitBtn}>
                {submitting ? '⏳ Đang gửi...' : '🚀 Gửi đánh giá'}
              </button>
              {reviewMsg && <div style={styles.reviewMsg}>{reviewMsg}</div>}
            </div>

            <div style={styles.reviewListSection}>
              <h3 style={styles.reviewListTitle}>💬 Nhận xét từ học viên</h3>
              {loadingReviews ? (
                <div style={styles.loadingState}><div style={styles.spinner} /> Đang tải...</div>
              ) : reviews.length === 0 ? (
                <div style={styles.emptyReviews}>Chưa có đánh giá nào. 🌟</div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewCardHeader}>
                      <div style={styles.reviewAvatar}>{(review.user_name || 'A')[0].toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#e2e8f0' }}>{review.user_name}</div>
                        <StarRating rating={review.rating} readonly size={14} />
                      </div>
                    </div>
                    {review.comment && <p style={styles.reviewComment}>{review.comment}</p>}
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

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Inter', sans-serif" },
  header: { display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px', backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  backBtn: { display: 'inline-flex', alignItems: 'center', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  headerTitle: { flex: 1, display: 'flex', alignItems: 'center', fontWeight: '700', color: '#f1f5f9', fontSize: '16px' },
  progressBadge: { padding: '6px 14px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },
  mainLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '340px', backgroundColor: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  sidebarHeader: { padding: '20px 20px 12px' },
  sidebarStats: { color: '#64748b', fontSize: '12px', marginTop: '4px' },
  progressBarTrack: { height: '3px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 20px 8px', borderRadius: '2px' },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: '2px', transition: 'width 0.4s ease' },
  lessonList: { flex: 1, padding: '8px 0' },
  lessonItem: { display: 'flex', alignItems: 'flex-start', padding: '14px 20px', cursor: 'pointer', gap: '14px', transition: 'background 0.2s' },
  lessonIcon: { width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  lessonTitle: { fontSize: '14px', lineHeight: '1.5', marginBottom: '4px' },
  lessonDuration: { display: 'flex', alignItems: 'center', color: '#475569', fontSize: '11px' },
  content: { flex: 1, overflowY: 'auto', padding: '24px' },
  playerWrapper: { position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000' },
  playerPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' },
  videoInfo: { backgroundColor: '#1e293b', borderRadius: '16px', padding: '20px 24px', margin: '24px 0', border: '1px solid rgba(255,255,255,0.06)' },
  videoTitle: { color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' },
  videoBadge: { padding: '6px 12px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderRadius: '20px', fontSize: '13px' },
  markDoneBtn: { padding: '8px 18px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' },
  reviewSection: { backgroundColor: '#1e293b', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' },
  ratingOverview: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: '12px', marginBottom: '24px' },
  ratingBigNum: { fontSize: '52px', fontWeight: '800', color: '#f59e0b' },
  reviewFormCard: { backgroundColor: '#0f172a', borderRadius: '12px', padding: '24px', marginBottom: '28px' },
  reviewFormTitle: { display: 'flex', alignItems: 'center', color: '#e2e8f0', fontSize: '17px', marginBottom: '20px' },
  commentInput: { width: '100%', padding: '14px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e2e8f0', outline: 'none' },
  submitBtn: { padding: '12px 28px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' },
  reviewMsg: { marginTop: '14px', color: '#f59e0b', fontSize: '14px' },
  reviewListTitle: { color: '#e2e8f0', fontSize: '17px', marginBottom: '20px' },
  reviewCard: { backgroundColor: '#0f172a', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px' },
  reviewCardHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' },
  reviewAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' },
  reviewComment: { color: '#94a3b8', fontSize: '14px', paddingLeft: '54px' },
  emptyReviews: { textAlign: 'center', color: '#475569', padding: '40px' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', color: '#64748b' },
  spinner: { width: '24px', height: '24px', border: '3px solid rgba(59,130,246,0.2)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

export default LearningRoom;