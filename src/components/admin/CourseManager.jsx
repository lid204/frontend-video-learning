import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ReactPlayer from 'react-player';
import API_BASE_URL from '../../config/api';
import { toast } from 'react-toastify';

const getVideoUrl = (lesson) => {
  if (!lesson || !lesson.video_url) return '';
  const url = lesson.video_url;
  if (url && url.length === 11 && !url.includes('http')) {
    return `https://www.youtube.com/watch?v=${url}`;
  }
  return url;
};

const emptyQuizForm = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: '',
  stopTimeSeconds: '',
};

const createEmptyQuizDraft = (stopTimeSeconds = '') => ({
  ...emptyQuizForm,
  stopTimeSeconds: String(stopTimeSeconds ?? ''),
});

function CourseManager({ onGoToLearning }) {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail_url: '',
    category_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [modalInput, setModalInput] = useState({ title: '', url: '', sectionId: null });

  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState(null);
  const [quizList, setQuizList] = useState([]);
  const [quizForm, setQuizForm] = useState(emptyQuizForm);
  const [bulkQuizConfig, setBulkQuizConfig] = useState({ count: '', duration: '' });
  const [bulkQuizForms, setBulkQuizForms] = useState([]);
  const [loadingQuizList, setLoadingQuizList] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [submittingBulkQuiz, setSubmittingBulkQuiz] = useState(false);
  const [calculatingDuration, setCalculatingDuration] = useState(false);

  const API_URL = `${API_BASE_URL}/courses`;
  const UPLOAD_URL = `${API_BASE_URL}/upload`;
  const BASE_API_URL = API_BASE_URL;
  const CATEGORY_API = `${API_BASE_URL}/categories`;

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_URL);
      setCourses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(CATEGORY_API);
      setCategories(response.data);
    } catch (error) {
      console.error('Lỗi lấy danh mục', error);
    }
  };

  const fetchCurriculum = async (course) => {
    setSelectedCourse(course);
    try {
      const [sectionsRes, lessonsRes] = await Promise.all([
        axios.get(`${BASE_API_URL}/sections/course/${course.id}`),
        axios.get(`${BASE_API_URL}/lessons/course/${course.id}`)
      ]);
      const secs = Array.isArray(sectionsRes.data) ? sectionsRes.data : [];
      const lessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];

      const sectionMap = new Map();
      for (const s of secs) {
        sectionMap.set(s.id, { id: s.id, title: s.title, order_index: s.order_index, lessons: [] });
      }
      for (const l of lessons) {
        const sid = l.section_id;
        if (!sectionMap.has(sid)) {
          sectionMap.set(sid, {
            id: sid,
            title: l.section_title || `Chương ${sid}`,
            order_index: l.section_order || 999,
            lessons: []
          });
        }
        sectionMap.get(sid).lessons.push({
          id: l.id,
          title: l.title,
          video_url: l.video_url,
          order_index: l.order_index,
          duration: l.duration,
        });
      }

      const curriculumData = Array.from(sectionMap.values())
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((sec) => ({
          ...sec,
          lessons: sec.lessons.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        }));

      setSections(curriculumData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const handleAddSection = () => {
    setModalInput({ title: '', url: '', sectionId: null });
    setShowSectionModal(true);
  };

  const confirmAddSection = async () => {
    if (!modalInput.title.trim()) return toast.warn('Ní chưa nhập tên chương kìa!');
    try {
      await axios.post(`${BASE_API_URL}/sections`, {
        course_id: selectedCourse.id,
        title: modalInput.title,
        order_index: sections.length + 1
      });
      setShowSectionModal(false);
      fetchCurriculum(selectedCourse);
      toast.success('📂 Đã thêm chương mới thành công!');
    } catch (err) {
      toast.error('❌ Lỗi thêm chương!');
    }
  };

  const handleAddLesson = (sectionId) => {
    setModalInput({ title: '', url: '', sectionId });
    setShowLessonModal(true);
  };

  const confirmAddLesson = async () => {
    if (!modalInput.title || !modalInput.url) return toast.warn('Điền đủ tên với link đi ní ơi!');
    try {
      const sec = sections.find((s) => s.id === modalInput.sectionId);
      const nextOrder = (sec?.lessons?.length || 0) + 1;
      await axios.post(`${BASE_API_URL}/lessons`, {
        section_id: modalInput.sectionId,
        title: modalInput.title,
        video_url: modalInput.url,
        order_index: nextOrder,
      });
      setShowLessonModal(false);
      fetchCurriculum(selectedCourse);
      toast.success('✅ Thêm bài học thành công!');
    } catch (err) {
      toast.error('Lỗi thêm bài học!');
    }
  };

  const handleDeleteCourse = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${itemToDelete}`);
      fetchCourses();
      setSelectedCourse(null);
      setShowDeleteModal(false);
      toast.info('🗑️ Đã xóa thành công khóa học!');
    } catch (err) {
      toast.error('❌ Xóa thất bại! Ní nhớ Restart Backend chưa?');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalImageUrl = formData.thumbnail_url;
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const uploadRes = await axios.post(UPLOAD_URL, uploadData);
        finalImageUrl = uploadRes.data.imageUrl;
      }
      await axios.post(API_URL, { ...formData, thumbnail_url: finalImageUrl });
      toast.success('🚀 Thêm khóa học thành công!');
      setFormData({ title: '', description: '', price: '', thumbnail_url: '', category_id: '' });
      setImageFile(null);
      fetchCourses();
    } catch (err) {
      toast.error('❌ Lỗi: ' + (err.response?.data?.error || 'Lỗi rồi ní!'));
    } finally {
      setIsUploading(false);
    }
  };

  const fetchLessonQuizzes = async (lessonId) => {
    setLoadingQuizList(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/lessons/${lessonId}/quizzes`);
      setQuizList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy quiz:', err);
      setQuizList([]);
      toast.error('Không lấy được danh sách quiz của bài học này');
    } finally {
      setLoadingQuizList(false);
    }
  };

  const handleOpenQuizModal = async (lesson) => {
    setSelectedLessonForQuiz(lesson);
    setQuizForm(emptyQuizForm);
    
    // Automatically set calculated duration if available, else wait for ReactPlayer
    if (lesson?.duration > 0) {
      const suggestedCount = Math.max(1, Math.floor(lesson.duration / 120));
      setBulkQuizConfig({ count: String(suggestedCount), duration: String(lesson.duration) });
      setCalculatingDuration(false);
    } else {
      setBulkQuizConfig({ count: '', duration: '' });
      setCalculatingDuration(true);
    }
    setBulkQuizForms([]);
    setShowQuizModal(true);
    await fetchLessonQuizzes(lesson.id);
  };

  const handleCreateQuiz = async () => {
    const options = [quizForm.optionA, quizForm.optionB, quizForm.optionC, quizForm.optionD]
      .map((item) => item.trim())
      .filter(Boolean);

    if (!selectedLessonForQuiz?.id) return toast.warn('Chưa chọn bài học để tạo quiz');
    if (!quizForm.question.trim()) return toast.warn('Nhập câu hỏi trước đã ní ơi');
    if (options.length < 2) return toast.warn('Quiz cần ít nhất 2 đáp án');
    if (!quizForm.correctAnswer.trim()) return toast.warn('Chọn đáp án đúng cho quiz');

    setSubmittingQuiz(true);
    try {
      await axios.post(`${BASE_API_URL}/quizzes`, {
        lesson_id: selectedLessonForQuiz.id,
        question: quizForm.question.trim(),
        options,
        correct_answer: quizForm.correctAnswer.trim(),
        stop_time_seconds: Number(quizForm.stopTimeSeconds) || 0,
      });
      toast.success('🧠 Đã tạo quiz cho bài học');
      setQuizForm(emptyQuizForm);
      await fetchLessonQuizzes(selectedLessonForQuiz.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Tạo quiz thất bại');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Xóa câu hỏi này khỏi bài học?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/quizzes/${quizId}`);
      toast.info('🗑️ Đã xóa quiz');
      if (selectedLessonForQuiz?.id) {
        await fetchLessonQuizzes(selectedLessonForQuiz.id);
      }
    } catch (err) {
      toast.error('Xóa quiz thất bại');
    }
  };

  const handleGenerateBulkQuizForms = () => {
    const quizCount = Number(bulkQuizConfig.count || 0);
    const duration = Number(bulkQuizConfig.duration || selectedLessonForQuiz?.duration || 0);

    if (!selectedLessonForQuiz?.id) return toast.warn('Chưa chọn bài học để tạo quiz');
    if (!Number.isFinite(quizCount) || quizCount < 0) return toast.warn('Nhập số lượng quiz hợp lệ');
    if (quizCount === 0) {
      setBulkQuizForms([]);
      return toast.info('Đã xóa danh sách mốc thời gian.');
    }
    if (!Number.isFinite(duration) || duration <= 0) return toast.warn('Nhập thời lượng video hợp lệ (giây)');

    const step = duration / (quizCount + 1);
    const nextForms = Array.from({ length: quizCount }, (_, index) => {
      const suggestedStopTime = Math.max(1, Math.round(step * (index + 1)));
      const existing = bulkQuizForms[index];
      return existing
        ? { ...existing, stopTimeSeconds: existing.stopTimeSeconds || String(suggestedStopTime) }
        : createEmptyQuizDraft(suggestedStopTime);
    });

    setBulkQuizForms(nextForms);
    toast.success('Đã chia mốc thời gian quiz. Admin có thể sửa lại từng mốc trước khi lưu.');
  };

  const handleBulkQuizFormChange = (index, field, value) => {
    setBulkQuizForms((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const handleCreateBulkQuizzes = async () => {
    if (!selectedLessonForQuiz?.id) return toast.warn('Chưa chọn bài học để tạo quiz');
    if (bulkQuizForms.length === 0) return toast.warn('Hãy chia mốc thời gian trước đã');

    for (let index = 0; index < bulkQuizForms.length; index += 1) {
      const item = bulkQuizForms[index];
      const options = [item.optionA, item.optionB, item.optionC, item.optionD]
        .map((option) => option.trim())
        .filter(Boolean);

      if (!item.question.trim()) return toast.warn(`Quiz ${index + 1} chưa có câu hỏi`);
      if (options.length < 2) return toast.warn(`Quiz ${index + 1} cần ít nhất 2 đáp án`);
      if (!item.correctAnswer.trim()) return toast.warn(`Quiz ${index + 1} chưa chọn đáp án đúng`);
      if (!item.stopTimeSeconds && item.stopTimeSeconds !== 0) return toast.warn(`Quiz ${index + 1} chưa có mốc thời gian`);
    }

    setSubmittingBulkQuiz(true);
    try {
      for (const item of bulkQuizForms) {
        const options = [item.optionA, item.optionB, item.optionC, item.optionD]
          .map((option) => option.trim())
          .filter(Boolean);

        await axios.post(`${BASE_API_URL}/quizzes`, {
          lesson_id: selectedLessonForQuiz.id,
          question: item.question.trim(),
          options,
          correct_answer: item.correctAnswer.trim(),
          stop_time_seconds: Number(item.stopTimeSeconds) || 0,
        });
      }

      toast.success(`Đã tạo ${bulkQuizForms.length} quiz theo mốc thời gian cho video`);
      setBulkQuizForms([]);
      setBulkQuizConfig((prev) => ({ ...prev, count: '' }));
      await fetchLessonQuizzes(selectedLessonForQuiz.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Tạo quiz hàng loạt thất bại');
    } finally {
      setSubmittingBulkQuiz(false);
    }
  };

  const currentAnswerOptions = [quizForm.optionA, quizForm.optionB, quizForm.optionC, quizForm.optionD]
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>📚 Quản Lý Khóa Học</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '50px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input
            type="text" placeholder="Tên khóa học..." required
            style={inputStyle}
            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <select
            style={inputStyle}
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="number" placeholder="Giá tiền (VNĐ)..." required
            style={inputStyle}
            value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        <div style={{ border: '2px dashed #cbd5e1', padding: '15px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#eff6ff' }}>
          <label style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold' }}>
            🖼️ {imageFile ? imageFile.name : 'Nhấn để chọn Ảnh bìa (Thumbnail)'}
            <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
        </div>

        <ReactQuill theme="snow" value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} style={{ height: '180px', marginBottom: '45px' }} />

        <button type="submit" disabled={isUploading} style={{ ...primaryBtn, backgroundColor: isUploading ? '#64748b' : '#0f172a' }}>
          {isUploading ? '⏳ Đang lưu...' : '💾 Lưu Khóa Học'}
        </button>
      </form>

      <h3 style={{ color: '#334155' }}>📋 Danh sách đã tạo</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9' }}>
            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Ảnh</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Tên khóa học</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Danh mục</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Giá tiền</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px' }}><img src={course.thumbnail_url} alt="thumbnail" style={{ width: '70px', borderRadius: '8px' }} /></td>
              <td style={{ padding: '10px', fontWeight: 'bold', color: '#1e293b' }}>{course.title}</td>
              <td style={{ padding: '10px' }}>{course.category_name || 'Chưa phân loại'}</td>
              <td style={{ padding: '10px', color: '#10b981', fontWeight: 'bold' }}>{Number(course.price).toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', padding: '10px' }}>
                <button onClick={() => fetchCurriculum(course)} style={infoBtn}>⚙️ Nội dung</button>
                <button onClick={() => handleDeleteCourse(course.id)} style={dangerBtn}>❌ Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCourse && (
        <div style={{ marginTop: '50px', padding: '30px', border: '2px solid #3b82f6', borderRadius: '20px', backgroundColor: '#f0f9ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#0369a1', margin: 0 }}>🛠️ Đang sửa: {selectedCourse.title}</h3>
            <button onClick={() => setSelectedCourse(null)} style={neutralBtn}>Đóng quản lý</button>
          </div>
          <button onClick={handleAddSection} style={successBtn}>+ Thêm Chương Mới</button>
          <div style={{ marginTop: '20px' }}>
            {sections.map(sec => (
              <div key={sec.id} style={{ marginBottom: '15px', padding: '20px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '16px', color: '#1e293b' }}>📂 {sec.title}</strong>
                  <button onClick={() => handleAddLesson(sec.id)} style={smallBtn}>+ Thêm Bài Học</button>
                </div>
                <div style={{ marginTop: '12px', borderLeft: '3px solid #e2e8f0', marginLeft: '10px', paddingLeft: '20px' }}>
                  {sec.lessons?.map(l => (
                    <div key={l.id} style={{ fontSize: '14px', color: '#64748b', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span>🔹 {l.title}</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenQuizModal(l)} style={{ ...quizBtn }}>🧠 Tạo Quiz</button>
                        <button onClick={() => onGoToLearning(selectedCourse)} style={{ padding: '4px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>▶️ Bắt đầu học</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSectionModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>📁 Thêm Chương Mới</h3>
            <input
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', padding: '15px' }}
              placeholder="Nhập tên chương..."
              value={modalInput.title}
              onChange={(e) => setModalInput({ ...modalInput, title: e.target.value })}
            />
            <div style={modalActions}>
              <button onClick={() => setShowSectionModal(false)} style={neutralBtn}>Hủy</button>
              <button onClick={confirmAddSection} style={successBtn}>Xác nhận ✅</button>
            </div>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#0f172a' }}>▶️ Thêm Bài Học</h3>
            <input
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: '15px', padding: '15px' }}
              placeholder="Tên bài học..."
              value={modalInput.title}
              onChange={(e) => setModalInput({ ...modalInput, title: e.target.value })}
            />
            <input
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', padding: '15px' }}
              placeholder="Dán link YouTube bài học..."
              value={modalInput.url}
              onChange={(e) => setModalInput({ ...modalInput, url: e.target.value })}
            />
            <div style={modalActions}>
              <button onClick={() => setShowLessonModal(false)} style={neutralBtn}>Hủy</button>
              <button onClick={confirmAddLesson} style={successBtn}>Thêm Ngay 🚀</button>
            </div>
          </div>
        </div>
      )}

      {showQuizModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, width: '760px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '6px', color: '#0f172a' }}>📋 Quiz — {selectedLessonForQuiz?.title || 'Bài học'}</h3>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Chia mốc câu hỏi theo từng đoạn video, hệ thống sẽ tự gợi ý số lượng phù hợp.</div>
              </div>
              <button onClick={() => { setShowQuizModal(false); setBulkQuizForms([]); }} style={neutralBtn}>Đóng</button>
            </div>

            <div style={{ marginTop: '18px', padding: '18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Thiết lập mốc câu hỏi</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
                Chọn số câu hỏi — hệ thống tự chia đều vào video, anh chỉnh lại nội dung từng câu trước khi lưu là xong.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <div style={labelStyle}>Thời lượng video</div>
                  {calculatingDuration ? (
                     <div style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', height: '48px', boxSizing: 'border-box' }}>
                       ⏳ Đang tính toán...
                     </div>
                  ) : (
                     <div style={{ ...inputStyle, background: '#f1f5f9', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', height: '48px', boxSizing: 'border-box' }}>
                       Tự động: {bulkQuizConfig.duration || 0} giây
                     </div>
                  )}
                </div>
                <div>
                  <div style={labelStyle}>Đề xuất số quiz chia đều</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button style={adjustBtn} onClick={() => setBulkQuizConfig(p => ({...p, count: Math.max(0, (Number(p.count)||0)-1)}))}>-</button>
                    <input
                      type="number"
                      min="0"
                      style={{ 
                        ...inputStyle, 
                        textAlign: 'center', 
                        padding: '14px 10px', 
                        height: '48px', 
                        boxSizing: 'border-box',
                        color: (Number(bulkQuizConfig.count) > 0 && Number(bulkQuizConfig.duration) > 0 && (Number(bulkQuizConfig.duration) / (Number(bulkQuizConfig.count) + 1) < 20)) ? '#ef4444' : '#0f172a',
                        fontWeight: 'bold'
                      }}
                      value={bulkQuizConfig.count}
                      onChange={(e) => {
                         let val = e.target.value;
                         if (val !== '' && Number(val) < 0) val = '0';
                         setBulkQuizConfig({ ...bulkQuizConfig, count: val });
                      }}
                    />
                    <button style={adjustBtn} onClick={() => setBulkQuizConfig(p => ({...p, count: (Number(p.count)||0)+1}))}>+</button>
                  </div>
                </div>
                <button onClick={handleGenerateBulkQuizForms} disabled={calculatingDuration || !bulkQuizConfig.duration} style={{ ...quizBtn, padding: '12px 16px', borderRadius: '10px', height: '48px', opacity: (calculatingDuration || !bulkQuizConfig.duration) ? 0.7 : 1 }}>⚙️ Chia mốc</button>
              </div>

              {bulkQuizForms.length > 0 && (
                <div style={{ marginTop: '18px', display: 'grid', gap: '14px' }}>
                  {bulkQuizForms.map((item, index) => {
                    const answerOptions = [item.optionA, item.optionB, item.optionC, item.optionD]
                      .map((option) => option.trim())
                      .filter(Boolean);

                    return (
                      <div key={`bulk-quiz-${index}`} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>Quiz {index + 1}</div>
                          <input
                            type="number"
                            min="0"
                            style={inputStyle}
                            placeholder="Mốc dừng (giây)"
                            value={item.stopTimeSeconds}
                            onChange={(e) => handleBulkQuizFormChange(index, 'stopTimeSeconds', e.target.value)}
                          />
                        </div>

                        <textarea
                          rows={2}
                          style={{ ...textareaStyle, marginBottom: '12px' }}
                          placeholder={`Nhập câu hỏi cho quiz ${index + 1}...`}
                          value={item.question}
                          onChange={(e) => handleBulkQuizFormChange(index, 'question', e.target.value)}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <input style={inputStyle} placeholder="Đáp án A" value={item.optionA} onChange={(e) => handleBulkQuizFormChange(index, 'optionA', e.target.value)} />
                          <input style={inputStyle} placeholder="Đáp án B" value={item.optionB} onChange={(e) => handleBulkQuizFormChange(index, 'optionB', e.target.value)} />
                          <input style={inputStyle} placeholder="Đáp án C (không bắt buộc)" value={item.optionC} onChange={(e) => handleBulkQuizFormChange(index, 'optionC', e.target.value)} />
                          <input style={inputStyle} placeholder="Đáp án D (không bắt buộc)" value={item.optionD} onChange={(e) => handleBulkQuizFormChange(index, 'optionD', e.target.value)} />
                        </div>

                        <select
                          style={inputStyle}
                          value={item.correctAnswer}
                          onChange={(e) => handleBulkQuizFormChange(index, 'correctAnswer', e.target.value)}
                        >
                          <option value="">-- Chọn đáp án đúng --</option>
                          {answerOptions.map((option, optionIndex) => (
                            <option key={`${option}-${optionIndex}`} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={() => setBulkQuizForms([])} style={neutralBtn}>Xóa danh sách tạm</button>
                    <button onClick={handleCreateBulkQuizzes} disabled={submittingBulkQuiz} style={successBtn}>
                      {submittingBulkQuiz ? '⏳ Đang lưu hàng loạt...' : `Lưu ${bulkQuizForms.length} quiz`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '22px' }}>
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>Danh sách quiz hiện có</div>
              {loadingQuizList ? (
                <div style={{ color: '#64748b' }}>Đang tải quiz...</div>
              ) : quizList.length === 0 ? (
                <div style={{ padding: '14px', borderRadius: '12px', background: '#fff7ed', color: '#9a3412' }}>
                  Bài học này chưa có quiz nào.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {quizList.map((quiz, index) => (
                    <div key={quiz.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Câu {index + 1}: {quiz.question}</div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Dừng video tại: {Number(quiz.stop_time_seconds || 0)} giây</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(quiz.options || []).map((option, optIndex) => (
                              <span key={`${option}-${optIndex}`} style={{ padding: '6px 10px', borderRadius: '999px', background: option === quiz.correct_answer ? '#dcfce7' : '#f1f5f9', color: option === quiz.correct_answer ? '#166534' : '#334155', fontSize: '12px', fontWeight: 600 }}>
                                {option === quiz.correct_answer ? '✅ ' : ''}{option}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteQuiz(quiz.id)} style={dangerBtn}>Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedLessonForQuiz && (
              <div style={{ display: 'none' }}>
                <ReactPlayer 
                  url={getVideoUrl(selectedLessonForQuiz)}
                  playing={true} 
                  muted={true}
                  onDuration={(seconds) => {
                     const totalCalculated = Math.round(seconds);
                     setCalculatingDuration(false);
                     if (!bulkQuizConfig.duration || bulkQuizConfig.duration == '0') {
                        const proposed = Math.max(1, Math.floor(totalCalculated / 120));
                        setBulkQuizConfig({ duration: String(totalCalculated), count: String(proposed) });
                     }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, borderTop: '5px solid #ef4444' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#0f172a' }}>⚠️ Xác nhận xóa?</h3>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>
              Có chắc muốn xóa khóa học này không?!!
            </p>
            <div style={modalActions}>
              <button onClick={() => setShowDeleteModal(false)} style={neutralBtn}>Hủy</button>
              <button onClick={confirmDelete} style={{ ...dangerBtn, borderRadius: '10px' }}>XÓA!!! 🗑️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' };
const textareaStyle = { width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', resize: 'vertical' };
const labelStyle = { fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' };
const primaryBtn = { padding: '15px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const infoBtn = { padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px' };
const dangerBtn = { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const successBtn = { padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const neutralBtn = { padding: '8px 16px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const smallBtn = { padding: '5px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const quizBtn = { padding: '5px 12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const adjustBtn = { padding: '0 15px', height: '48px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const modalContent = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '450px', boxShadow: '0 20px 25px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease' };
const modalActions = { display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' };

export default CourseManager;
