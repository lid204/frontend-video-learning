import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const MyCourses = ({ currentUser, onGoToLearning, onBack }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/my-courses/${currentUser.id}`);
        setCourses(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách khóa học của tôi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [currentUser]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Đang tải tủ sách của bạn...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '16px', marginBottom: '30px', fontWeight: 'bold' }}>
        🔙 Về trang chủ
      </button>
      
      <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '30px' }}>📚 Khóa học của tôi</h1>

      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
          <h3 style={{ color: '#64748b' }}>Bạn chưa đăng ký khóa học nào.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {courses.map(course => (
            <div key={course.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: '0.3s' }}>
              <img 
                src={course.thumbnail_url || 'https://via.placeholder.com/300x150'} 
                alt="Thumbnail" 
                style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1e293b' }}>{course.title}</h3>
                <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px' }}>
                  Tiến độ: {course.progress_percent || 0}%
                </p>
                <button 
                  onClick={() => onGoToLearning(course)}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ▶️ Vào Phòng Học
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
