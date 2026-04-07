import CurriculumAccordion from './components/CurriculumAccordion';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CoursesPage({ onBackToHome }) { // Nhận lệnh Quay về nhà từ App.jsx
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api";
  const categories = ['Tất cả', 'Lập trình Web', 'Thiết kế UI/UX', 'Lập trình Mobile', 'Marketing', 'AI & Data'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/courses`);
        setCourses(response.data);
      } catch (err) { console.error("Lỗi:", err); }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    return course.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stripHtmlTags = (text) => {
    if (!text) return 'Chưa có mô tả cho khóa học này.';
    return text.replace(/<[^>]+>/g, ''); 
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        .course-card { transition: all 0.3s ease; }
        .course-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-color: #cbd5e1; }
        .cat-btn { transition: 0.2s; }
        .cat-btn:hover { background-color: #e2e8f0; }
        .cat-btn.active { background-color: #3b82f6; color: white; border-color: #3b82f6; }
      `}</style>

      {/* NÚT QUAY LẠI */}
      <nav style={{ padding: '20px 40px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={onBackToHome} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          &larr; Trang Chủ
        </button>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Khám Phá Khóa Học 📚</div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* CỘT TÌM KIẾM BÊN TRÁI */}
        <div style={{ width: '100%', maxWidth: '250px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a', marginBottom: '20px' }}>Tìm kiếm</h3>
          <input type="text" placeholder="Tên khóa học..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '30px', outline: 'none', boxSizing: 'border-box' }} />
          <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>Danh mục</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categories.map((cat, idx) => (
              <button key={idx} className={`cat-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)} style={{ textAlign: 'left', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: activeCategory === cat ? '#3b82f6' : 'transparent', color: activeCategory === cat ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LƯỚI KHÓA HỌC BÊN PHẢI */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px', color: '#64748b' }}>Đang hiển thị <b style={{ color: '#0f172a' }}>{filteredCourses.length}</b> khóa học</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {filteredCourses.map(course => (
              <div key={course.id} className="course-card" style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', height: '160px', backgroundColor: '#e2e8f0' }}>
                  <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/cbd5e1/475569?text=No+Image'; }} />
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#0f172a', lineHeight: '1.4' }}>{course.title}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>{stripHtmlTags(course.description)}</p>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                    <span style={{ fontWeight: '800', color: '#10b981', fontSize: '18px' }}>{course.price > 0 ? `${Number(course.price).toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CoursesPage;