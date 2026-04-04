import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// SỬA DÒNG NÀY
function HomePage({ onLoginClick, onViewCoursesClick, isLoggedIn, currentUser, onLogoutClick }) { // Nhận 2 hàm truyền từ App.jsx
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await axios.get(`${API_URL}/courses`);
        setCourses(courseRes.data);
      } catch (err) {
        console.error("Lỗi tải trang chủ:", err);
      }
    };
    fetchData();
  }, []);

  const stripHtmlTags = (text) => {
    if (!text) return 'Chưa có mô tả cho khóa học này.';
    return text.replace(/<[^>]+>/g, ''); 
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif", overflowX: 'hidden' }}>
      
      <style>{`
        .hover-card { transition: all 0.3s ease; }
        .hover-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); border-color: #cbd5e1; }
        .category-pill { transition: all 0.2s; }
        .category-pill:hover { background-color: #3b82f6; color: white; transform: scale(1.05); }
        .search-btn:hover { background-color: #2563eb; }
        .swiper-button-next { right: 0px !important; }
        .swiper-button-prev { left: 0px !important; }
        .swiper-button-next, .swiper-button-prev { color: #3b82f6 !important; background: white; width: 44px; height: 44px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 1px solid #f1f5f9; }
        .swiper-button-next:after, .swiper-button-prev:after { font-size: 18px !important; font-weight: bold; }
        .swiper-pagination-bullet-active { background-color: #3b82f6 !important; }
        .swiper-container-wrapper { padding: 15px 50px 50px 50px; margin: 0 -50px; }
      `}</style>

      {/* THANH NAVBAR MỚI */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', cursor: 'pointer' }}>
          <span style={{ color: '#3b82f6' }}>E-</span>Learning
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span onClick={onViewCoursesClick} style={{ color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Khóa học</span>
          {/* LOGIC ĐỔI NÚT NẰM Ở ĐÂY */}
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>👤 {currentUser?.name}</span>
              <button 
                onClick={onLogoutClick} 
                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick} 
              style={{ padding: '10px 24px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', margin: '0 0 20px 0', fontWeight: '800' }}>Mở Khóa Tiềm Năng Của Bạn 🔓</h1>
        <div style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '50px', padding: '5px' }}>
          <input type="text" placeholder="🔍 Tìm khóa học..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '12px 20px', border: 'none', borderRadius: '50px', outline: 'none' }} />
          <button onClick={onViewCoursesClick} className="search-btn" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 25px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>Tìm Kiếm</button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-25px auto 40px auto', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
        {['💻 Lập trình Web', '🎨 Thiết kế UI/UX', '📱 Lập trình Mobile', '📈 Marketing', '🤖 AI & Data'].map((cat, index) => (
          <div key={index} onClick={onViewCoursesClick} className="category-pill" style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>
            {cat}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#0f172a', fontSize: '26px', margin: 0 }}>🔥 Sinh Viên Mua Nhiều Nhất</h2>
          {/* NÚT CHUYỂN SANG TRANG SIÊU THỊ KHÓA HỌC */}
          <span onClick={onViewCoursesClick} style={{ color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Xem tất cả &rarr;</span>
        </div>
        
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang tải danh sách khóa học...</div>
        ) : (
          <div className="swiper-container-wrapper">
            <Swiper modules={[Navigation, Pagination, Autoplay]} spaceBetween={25} slidesPerView={1} navigation autoplay={{ delay: 3500 }} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 }}}>
              {courses.map((course) => (
                <SwiperSlide key={course.id} style={{ height: 'auto' }}>
                  <div className="hover-card" style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', width: '100%', height: '170px', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                      <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/cbd5e1/475569?text=No+Image'; }} />
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#0f172a', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '46px' }}>{course.title}</h3>
                      <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '13.5px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{stripHtmlTags(course.description)}</p>
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontWeight: '800', color: '#10b981', fontSize: '18px' }}>{course.price > 0 ? `${Number(course.price).toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;