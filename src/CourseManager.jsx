import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import API_BASE_URL from './config/api';

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

  const API_URL = `${API_BASE_URL}/courses`;
  const UPLOAD_URL = `${API_BASE_URL}/upload`;
  const BASE_API_URL = API_BASE_URL;
  const CATEGORY_API = `${API_BASE_URL}/categories`;

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_URL);
      setCourses(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(CATEGORY_API);
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục", error);
    }
  };

  const fetchCurriculum = async (course) => {
    setSelectedCourse(course);
    try {
      // Backend fixed build curriculum từ sections + lessons
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
          sectionMap.set(sid, { id: sid, title: l.section_title || `Chương ${sid}`, order_index: l.section_order || 999, lessons: [] });
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
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    fetchCourses(); 
    fetchCategories();
  }, []);

  const handleAddSection = async () => {
    const title = prompt("Nhập tên chương mới (VD: Chương 1: Cơ bản):");
    if (!title) return;
    try {
      await axios.post(`${BASE_API_URL}/sections`, {
        course_id: selectedCourse.id, 
        title: title,
        order_index: sections.length + 1
      });
      fetchCurriculum(selectedCourse); 
    } catch (err) { alert("❌ Lỗi thêm chương!"); }
  };

  const handleAddLesson = async (sectionId) => {
    const title = prompt("Tên bài học:");
    const url = prompt("Dán link YouTube bài học:");
    if (!title || !url) return;
    try {
      const sec = sections.find((s) => s.id === sectionId);
      const nextOrder = (sec?.lessons?.length || 0) + 1;
      await axios.post(`${BASE_API_URL}/lessons`, {
        section_id: sectionId,
        title,
        video_url: url,
        order_index: nextOrder,
      });
      fetchCurriculum(selectedCourse); 
    } catch (err) { alert("Lỗi thêm bài học!"); }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa không?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchCourses();
        setSelectedCourse(null);
        alert("🗑️ Đã xóa thành công!");
      } catch (err) {
        alert("❌ Xóa thất bại! Ní nhớ Restart Backend chưa?");
      }
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
      alert("✅ Thêm khóa học thành công!");

      setFormData({ title: '', description: '', price: '', thumbnail_url: '', category_id: '' });
      setImageFile(null);
      setIsUploading(false);
      fetchCourses();
    } catch (err) { 
      setIsUploading(false);
      alert("❌ Lỗi: " + (err.response?.data?.error || "Lỗi rồi ní!"));
    }
  };

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
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
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
            🖼️ {imageFile ? imageFile.name : "Nhấn để chọn Ảnh bìa (Thumbnail)"}
            <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
        </div>
        
        <ReactQuill theme="snow" value={formData.description} onChange={(val) => setFormData({...formData, description: val})} style={{ height: '180px', marginBottom: '45px' }} />
        
        <button type="submit" disabled={isUploading} style={{...primaryBtn, backgroundColor: isUploading ? '#64748b' : '#0f172a'}}>
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
                    <div key={l.id} style={{ fontSize: '14px', color: '#64748b', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>🔹 {l.title}</span>
                      <button onClick={() => onGoToLearning(selectedCourse)} style={{ padding: '4px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>▶️ Bắt đầu học</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Giữ lại bộ style chuẩn ở cuối file để code luôn sạch đẹp
const inputStyle = { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' };
const primaryBtn = { padding: '15px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const infoBtn = { padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px' };
const dangerBtn = { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const successBtn = { padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const neutralBtn = { padding: '8px 16px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const smallBtn = { padding: '5px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

export default CourseManager;