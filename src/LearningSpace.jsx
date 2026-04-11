import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import API_BASE_URL from './config/api';

export default function LearningSpace({
  lessonId,
  videoUrl,
  userId,
  onEnded,
  onPlayStateChange,
}) {
  const playerRef = useRef(null);

  const [playing, setPlaying] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeSeconds, setResumeSeconds] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

  const currentTimeRef = useRef(0);
  const playingRef = useRef(true);
  const saveTimerRef = useRef(null);
  const quizTimeoutRef = useRef(null);

  const shownQuizIdsRef = useRef(new Set());
  const answeredQuizIdsRef = useRef(new Set());
  const pendingQuizIdRef = useRef(null);
  const lastSavedSecondsRef = useRef(0);
  const resumeAppliedRef = useRef(false);

  const normalizedVideoUrl = useMemo(() => {
    if (!videoUrl) return '';

    const raw = String(videoUrl).trim();

    if (!raw) return '';

    // Nếu chỉ lưu YouTube ID
    if (raw.length === 11 && !raw.includes('http')) {
      return `https://www.youtube.com/watch?v=${raw}`;
    }

    return raw;
  }, [videoUrl]);

  const pauseVideo = useCallback(() => {
    setPlaying(false);
    playingRef.current = false;
    onPlayStateChange?.(false);

    try {
      const internal = playerRef.current?.getInternalPlayer?.();
      if (internal?.pauseVideo) internal.pauseVideo();
      else if (internal?.pause) internal.pause();
    } catch (err) {
      console.error('Lỗi pause video:', err);
    }
  }, [onPlayStateChange]);

  const playVideo = useCallback(() => {
    setPlaying(true);
    playingRef.current = true;
    onPlayStateChange?.(true);

    try {
      const internal = playerRef.current?.getInternalPlayer?.();
      if (internal?.playVideo) internal.playVideo();
      else if (internal?.play) internal.play();
    } catch (err) {
      console.error('Lỗi play video:', err);
    }
  }, [onPlayStateChange]);

  const saveProgress = useCallback(
    async (force = false) => {
      if (!lessonId || !userId) return;

      const seconds = Math.max(0, Math.floor(currentTimeRef.current || 0));
      if (seconds <= 0) return;

      if (!force && seconds === lastSavedSecondsRef.current) return;

      try {
        await axios.post(`${API_BASE_URL}/progress`, {
          user_id: userId,
          lesson_id: lessonId,
          watched_seconds: seconds,
        });

        lastSavedSecondsRef.current = seconds;
      } catch (err) {
        console.error('Lỗi lưu tiến độ:', err);
      }
    },
    [lessonId, userId]
  );

  const triggerQuizWithDelay = useCallback(
    (quiz) => {
      if (!quiz) return;
      if (pendingQuizIdRef.current === quiz.id) return;

      pendingQuizIdRef.current = quiz.id;

      pauseVideo();
      saveProgress(true);

      if (quizTimeoutRef.current) {
        clearTimeout(quizTimeoutRef.current);
        quizTimeoutRef.current = null;
      }

      quizTimeoutRef.current = setTimeout(() => {
        setActiveQuiz(quiz);
        setIsModalOpen(true);
        shownQuizIdsRef.current.add(quiz.id);
        pendingQuizIdRef.current = null;
        quizTimeoutRef.current = null;
      }, 500);
    },
    [pauseVideo, saveProgress]
  );

  useEffect(() => {
    let mounted = true;

    setQuizzes([]);
    setActiveQuiz(null);
    setIsModalOpen(false);

    shownQuizIdsRef.current = new Set();
    answeredQuizIdsRef.current = new Set();
    pendingQuizIdRef.current = null;

    async function fetchQuizzes() {
      if (!lessonId) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/quizzes`);

        if (!mounted) return;

        const normalized = (Array.isArray(res.data) ? res.data : []).map((q) => ({
          ...q,
          stop_time_seconds: Number(q.stop_time_seconds),
          options: Array.isArray(q.options)
            ? q.options
            : (() => {
                try {
                  return JSON.parse(q.options || '[]');
                } catch {
                  return [];
                }
              })(),
        }));

        setQuizzes(normalized);
      } catch (err) {
        console.error('Lỗi lấy quizzes:', err);
        if (mounted) setQuizzes([]);
      }
    }

    fetchQuizzes();

    return () => {
      mounted = false;
    };
  }, [lessonId]);

  useEffect(() => {
    let mounted = true;

    setResumeSeconds(0);
    setPlayerReady(false);
    setActiveQuiz(null);
    setIsModalOpen(false);

    currentTimeRef.current = 0;
    lastSavedSecondsRef.current = 0;
    resumeAppliedRef.current = false;
    pendingQuizIdRef.current = null;

    if (quizTimeoutRef.current) {
      clearTimeout(quizTimeoutRef.current);
      quizTimeoutRef.current = null;
    }

    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    async function fetchProgress() {
      if (!lessonId || !userId) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/progress`, {
          params: {
            user_id: userId,
            lesson_id: lessonId,
          },
        });

        if (!mounted) return;

        const seconds = Math.max(0, Math.floor(Number(res.data?.watched_seconds || 0)));
        setResumeSeconds(seconds);
        currentTimeRef.current = seconds;
        lastSavedSecondsRef.current = seconds;
      } catch (err) {
        console.error('Lỗi lấy tiến độ:', err);
      }
    }

    fetchProgress();

    return () => {
      mounted = false;
    };
  }, [lessonId, userId]);

  useEffect(() => {
    if (!playerReady || resumeAppliedRef.current || resumeSeconds <= 0) return;

    const timer = window.setTimeout(() => {
      try {
        playerRef.current?.seekTo?.(resumeSeconds, 'seconds');
        currentTimeRef.current = resumeSeconds;
        resumeAppliedRef.current = true;
      } catch (err) {
        console.error('Lỗi tua đến tiến độ đã lưu:', err);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [playerReady, resumeSeconds]);

  useEffect(() => {
    return () => {
      if (quizTimeoutRef.current) {
        clearTimeout(quizTimeoutRef.current);
        quizTimeoutRef.current = null;
      }

      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      saveProgress(true);
    };
  }, [saveProgress]);

  const handleProgress = useCallback(
    (state) => {
      const currentTime = Number(state?.playedSeconds || 0);
      currentTimeRef.current = currentTime;

      if (!saveTimerRef.current && lessonId && userId) {
        saveTimerRef.current = setInterval(() => {
          if (!playingRef.current) return;
          saveProgress(false);
        }, 5000);
      }

      if (isModalOpen || pendingQuizIdRef.current) return;

      const sec = Math.floor(currentTime);

      const quiz = quizzes.find((q) => {
        const stop = Number(q.stop_time_seconds);
        if (!Number.isFinite(stop)) return false;

        const notShown = !shownQuizIdsRef.current.has(q.id);
        return notShown && sec >= stop;
      });

      if (quiz) {
        triggerQuizWithDelay(quiz);
      }
    },
    [isModalOpen, lessonId, quizzes, saveProgress, triggerQuizWithDelay, userId]
  );

  const handleSeek = useCallback(
    (seconds) => {
      const seekSec = Math.floor(Number(seconds) || 0);
      currentTimeRef.current = seekSec;

      if (quizTimeoutRef.current) {
        clearTimeout(quizTimeoutRef.current);
        quizTimeoutRef.current = null;
      }

      pendingQuizIdRef.current = null;
      setIsModalOpen(false);
      setActiveQuiz(null);

      quizzes.forEach((q) => {
        const stop = Number(q.stop_time_seconds);
        if (!Number.isFinite(stop)) return;

        // Tua ngược về trước mốc quiz => cho phép quiz hiện lại
        if (seekSec < stop) {
          shownQuizIdsRef.current.delete(q.id);
          answeredQuizIdsRef.current.delete(q.id);
        }
      });
    },
    [quizzes]
  );

  const handleSelectAnswer = useCallback(
    (option) => {
      if (!activeQuiz) return;

      if (option === activeQuiz.correct_answer) {
        answeredQuizIdsRef.current.add(activeQuiz.id);
        setIsModalOpen(false);
        setActiveQuiz(null);
        playVideo();
      } else {
        alert('Sai rồi! Hãy chọn lại đáp án đúng để tiếp tục.');
      }
    },
    [activeQuiz, playVideo]
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ReactPlayer
        ref={playerRef}
        url={normalizedVideoUrl}
        playing={playing}
        controls
        width="100%"
        height="100%"
        progressInterval={1000}
        onReady={() => setPlayerReady(true)}
        onProgress={handleProgress}
        onSeek={handleSeek}
        onError={(err) => {
          console.error('Lỗi phát video:', normalizedVideoUrl, err);
        }}
        onPlay={() => {
          setPlaying(true);
          playingRef.current = true;
          onPlayStateChange?.(true);
        }}
        onPause={() => {
          setPlaying(false);
          playingRef.current = false;
          onPlayStateChange?.(false);
          saveProgress(true);
        }}
        onEnded={() => {
          saveProgress(true);
          onEnded?.();
        }}
        config={{
          youtube: {
            playerVars: {
              rel: 0,
              modestbranding: 1,
            },
          },
        }}
      />

      {isModalOpen && activeQuiz && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 680,
              background: '#111827',
              borderRadius: 18,
              padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
              Câu hỏi tương tác
            </div>

            <div
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: '#e5e7eb',
                marginBottom: 20,
              }}
            >
              {activeQuiz.question}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {(activeQuiz.options || []).map((option, index) => (
                <button
                  key={`${option}-${index}`}
                  onClick={() => handleSelectAnswer(option)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: '#1f2937',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}