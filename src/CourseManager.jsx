import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function CourseManager({ onGoToLearning }) { 
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', thumbnail_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/courses";
  const UPLOAD_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/upload";
  const BASE_API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api";

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_URL);
      setCourses(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchCurriculum = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await axios.get(`${API_URL}/${course.id}/curriculum`);
      setSections(res.data); 
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCourses(); }, []);

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
      await axios.post(`${BASE_API_URL}/lessons`, {
        section_id: sectionId, 
        title: title,
        video_url: url
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
      // Gửi toàn bộ formData (bao gồm cả description)
      await axios.post(API_URL, { ...formData, thumbnail_url: finalImageUrl });
      alert("✅ Thêm khóa học thành công!");
      setFormData({ title: '', description: '', price: '', thumbnail_url: '' });
      setIsUploading(false);
      setImageFile(null);
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
          <input style={inputStyle} type="text" placeholder="Tên khóa học..." required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <input style={inputStyle} type="number" placeholder="Giá tiền (VND)..." required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
        </div>
        <div style={{ border: '2px dashed #cbd5e1', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <label style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold' }}>
            🖼️ {imageFile ? imageFile.name : "Nhấn để chọn Ảnh bìa (Thumbnail)"}
            <input type="file" hidden onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
        </div>
        <ReactQuill theme="snow" value={formData.description} onChange={(val) => setFormData({...formData, description: val})} style={{ height: '180px', marginBottom: '45px' }} />
        <button type="submit" disabled={isUploading} style={{...primaryBtn, backgroundColor: isUploading ? '#64748b' : '#0f172a'}}>
          {isUploading ? '⏳ Đang lưu...' : '💾 Lưu Khóa Học'}
        </button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
        <thead><tr style={{ color: '#64748b', textAlign: 'left' }}><th>Ảnh</th><th>Tên khóa học</th><th style={{ textAlign: 'right' }}>Hành động</th></tr></thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id} style={{ backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <td style={{ padding: '15px' }}><img src={course.thumbnail_url} style={{ width: '70px', borderRadius: '8px' }} /></td>
              <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{course.title}</td>
              <td style={{ textAlign: 'right', paddingRight: '15px' }}>
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

const inputStyle = { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' };
const primaryBtn = { padding: '15px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const infoBtn = { padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px' };
const dangerBtn = { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const successBtn = { padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const neutralBtn = { padding: '8px 16px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const smallBtn = { padding: '5px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

export default CourseManager;