import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourseDetail = ({ courseId, onBack }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await axios.get(`https://backend-video-learning-lid204s-projects.vercel.app/api/courses/${courseId}`);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải chi tiết khóa học", error);
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [courseId]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Đang tải thông tin...</div>;
  if (!course) return <div style={{ textAlign: 'center', padding: '50px' }}>❌ Không tìm thấy khóa học!</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>
        🔙 Quay lại danh sách
      </button>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* CỘT TRÁI: Nội dung khóa học */}
        <div style={{ flex: '2', minWidth: '600px' }}>
          <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '10px' }}>{course.title}</h1>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '20px' }}>
            📁 Danh mục: <strong>{course.category_name || 'Chưa phân loại'}</strong> | 👨‍🏫 Giảng viên: <strong>{course.teacher_name}</strong>
          </p>
          
          <img 
            src={course.thumbnail_url || 'https://via.placeholder.com/800x400?text=Chua+co+anh+bia'} 
            alt="Thumbnail" 
            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
          />
          
          <h2 style={{ fontSize: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Mô tả chi tiết</h2>
          
          {/* Render HTML từ ReactQuill một cách an toàn */}
          <div 
            style={{ lineHeight: '1.8', color: '#334155', fontSize: '16px' }}
            dangerouslySetInnerHTML={{ __html: course.description }} 
          />
        </div>

        {/* CỘT PHẢI: Giỏ hàng / Chốt sale (Để Nhu làm tiếp) */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'sticky', top: '40px' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444', marginBottom: '20px' }}>
              {Number(course.price).toLocaleString('vi-VN')} đ
            </div>
            
            <button style={{ width: '100%', padding: '15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>
              Đăng ký học ngay
            </button>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: 0 }}>
              Khu vực này sẽ được tích hợp Giỏ hàng ở Task sau.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;