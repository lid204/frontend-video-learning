import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';// Khung CSS giao diện của React Quill

function CourseManager() {
  const [courses, setCourses] = useState([]);
  
  // State lưu thông tin form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail_url: '' // Ban đầu rỗng, sau khi upload ảnh xong sẽ điền link vào đây
  });

  const [imageFile, setImageFile] = useState(null); // Lưu file ảnh chọn từ máy tính
  const [isUploading, setIsUploading] = useState(false); // Trạng thái đang tải ảnh lên

  // Link API của bạn (Nhớ trỏ đúng localhost:5000 đang chạy Backend)
  const API_URL = "http://localhost:5000/api/courses";
  const UPLOAD_URL = "http://localhost:5000/api/upload";

  // 1. Hàm lấy danh sách khóa học
  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_URL);
      setCourses(response.data);
    } catch (err) {
      console.error("Lỗi lấy khóa học:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 2. Hàm xử lý Upload Ảnh & Lưu Khóa học
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !formData.thumbnail_url) {
      alert("⚠️ Vui lòng chọn ảnh bìa cho khóa học!");
      return;
    }

    try {
      let finalImageUrl = formData.thumbnail_url;

      // Nếu có chọn file ảnh mới từ máy tính thì đẩy lên Cloudinary trước
      if (imageFile) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadRes = await axios.post(UPLOAD_URL, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        finalImageUrl = uploadRes.data.imageUrl; // Lấy link ảnh Cloudinary trả về
      }

      // Sau khi có link ảnh, gửi toàn bộ data xuống Database
      const courseData = { ...formData, thumbnail_url: finalImageUrl };
      await axios.post(API_URL, courseData);
      
      alert("✅ Thêm khóa học thành công!");
      
      // Reset form
      setFormData({ title: '', description: '', price: '', thumbnail_url: '' });
      setImageFile(null);
      setIsUploading(false);
      fetchCourses();

    } catch (err) {
      alert("❌ Lỗi khi lưu khóa học!");
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>📚 Quản Lý Khóa Học</h2>

      {/* FORM THÊM KHÓA HỌC */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" placeholder="Tên khóa học..." required
            style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
          />
          <input 
            type="number" placeholder="Giá tiền (VNĐ)..." required
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} 
          />
        </div>

        {/* Khu vực chọn ảnh */}
        <div style={{ padding: '10px', border: '1px dashed #3b82f6', borderRadius: '6px', backgroundColor: '#eff6ff' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>🖼️ Ảnh bìa (Thumbnail):</label>
          <input 
            type="file" accept="image/*" 
            onChange={(e) => setImageFile(e.target.files[0])} 
          />
        </div>

        {/* Trình soạn thảo văn bản React Quill */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>📝 Mô tả chi tiết:</label>
          <ReactQuill 
            theme="snow" 
            value={formData.description} 
            onChange={(value) => setFormData({...formData, description: value})} 
            style={{ height: '150px', marginBottom: '40px' }} // Cách lề dưới cho khỏi bị che nút
          />
        </div>

        <button 
          type="submit" disabled={isUploading}
          style={{ padding: '12px', backgroundColor: isUploading ? '#94a3b8' : '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {isUploading ? '⏳ Đang tải ảnh & Lưu...' : '💾 Lưu Khóa Học'}
        </button>
      </form>

      {/* BẢNG HIỂN THỊ DANH SÁCH */}
      <h3 style={{ color: '#334155' }}>📋 Danh sách đã tạo</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9' }}>
            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Ảnh</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Tên khóa học</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Giá tiền</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px' }}>
                <img src={course.thumbnail_url} alt="thumbnail" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              </td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{course.title}</td>
              <td style={{ padding: '10px', color: '#10b981' }}>{course.price} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CourseManager;