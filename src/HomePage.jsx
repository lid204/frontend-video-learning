import React, { useState, useEffect, useRef } from 'react'; // CHỈ THÊM useRef
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import CurriculumAccordion from './components/CurriculumAccordion'; 

function HomePage({ onLoginClick, onViewCoursesClick, isLoggedIn, currentUser, onLogoutClick }) { 
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // --- CHỈ THÊM 3 DÒNG STATE/REF NÀY ---
  const [expandingCourseId, setExpandingCourseId] = useState(null);
  const [courseCurriculum, setCourseCurriculum] = useState([]);
  const detailRef = useRef(null); 

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

  // --- HÀM XỬ LÝ NHẢY XUỐNG CUỐI TRANG ---
  const toggleExpand = async (courseId) => {
    try {
      const res = await axios.get(`${API_URL}/courses/${courseId}/curriculum`);
      setCourseCurriculum(res.data);
      setExpandingCourseId(courseId);

      // Lệnh cuộn trang cực mượt
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); 
    } catch (err) {
      console.error("Lỗi lấy chi tiết khóa học:", err);
    }
  };

  const stripHtmlTags = (text) => {
    if (!text) return 'Chưa có mô tả cho khóa học này.';
    
    // 1. Xóa các thẻ HTML như <p>, <b>...
    let cleanText = text.replace(/<[^>]+>/g, ''); 
    
    // 2. Tạo một cái "máy lọc" để biến các ký tự &nbsp;, &quot; thành chữ bình thường
    const doc = new DOMParser().parseFromString(cleanText, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif", overflowX: 'hidden' }}>
      
      <style>{`
        .hover-card { transition: all 0.3s ease; }
        .hover-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); border-color: #cbd5e1; }
        .category-pill { transition: all 0.2s; }
        .category-pill:hover { background-color: #3b82f6; color: white; transform: scale(1.05); }
        .search-btn:hover { background-color: #2563eb; }
        .swiper-button-next, .swiper-button-prev { color: #3b82f6 !important; background: white; width: 44px; height: 44px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 1px solid #f1f5f9; }
        .swiper-pagination-bullet-active { background-color: #3b82f6 !important; }
        .swiper-container-wrapper { padding: 15px 50px 50px 50px; margin: 0 -50px; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* THANH NAVBAR - GIỮ NGUYÊN 100% */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', cursor: 'pointer' }}>
          <span style={{ color: '#3b82f6' }}>E-</span>Learning
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span onClick={onViewCoursesClick} style={{ color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Khóa học</span>
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>👤 {currentUser?.name}</span>
              <button onClick={onLogoutClick} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Đăng Xuất</button>
            </div>
          ) : (
            <button onClick={onLoginClick} style={{ padding: '10px 24px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Đăng Nhập</button>
          )}
        </div>
      </nav>

      {/* HERO SECTION - GIỮ NGUYÊN 100% */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', margin: '0 0 20px 0', fontWeight: '800' }}>Mở Khóa Tiềm Năng Của Bạn 🔓</h1>
        <div style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '50px', padding: '5px' }}>
          <input type="text" placeholder="🔍 Tìm khóa học..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '12px 20px', border: 'none', borderRadius: '50px', outline: 'none' }} />
          <button onClick={onViewCoursesClick} className="search-btn" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 25px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>Tìm Kiếm</button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-25px auto 40px auto', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
        {['💻 Lập trình Web', '🎨 Thiết kế UI/UX', '📱 Lập trình Mobile', '📈 Marketing', '🤖 AI & Data'].map((cat, index) => (
          <div key={index} onClick={onViewCoursesClick} className="category-pill" style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>{cat}</div>
        ))}
      </div>

      {/* DANH SÁCH KHÓA HỌC SWIPER - GIỮ NGUYÊN 100% */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#0f172a', fontSize: '26px', margin: 0 }}>🔥 Sinh Viên Mua Nhiều Nhất</h2>
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
                    <div style={{ position: 'relative', width: '100%', height: '170px', backgroundColor: '#e2e8f0' }}>
                      <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/cbd5e1/475569?text=No+Image'; }} />
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#0f172a', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '46px' }}>{course.title}</h3>
                      <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '13.5px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{stripHtmlTags(course.description)}</p>
                      
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginTop: 'auto' }}>
                        <span style={{ fontWeight: '800', color: '#10b981', fontSize: '18px' }}>{course.price > 0 ? `${Number(course.price).toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
                        
                        {/* NÚT BẤM MỚI CHÈN VÀO CARD */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleExpand(course.id); }}
                          style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          📑 Xem Chi Tiết Khóa Học
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* --- PHẦN HIỂN THỊ CHI TIẾT CUỐI TRANG - ĐÂY LÀ ĐOẠN THÊM MỚI HOÀN TOÀN --- */}
      <div ref={detailRef} style={{ maxWidth: '1200px', margin: '50px auto', padding: '0 20px 100px 20px' }}>
        {expandingCourseId && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', animation: 'fadeInUp 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '32px', color: '#0f172a', margin: '0 0 15px 0', fontWeight: '800' }}>
                  {courses.find(c => c.id === expandingCourseId)?.title}
                </h2>
                {/* HIỂN THỊ MÔ TẢ ĐẦY ĐỦ DẠNG HTML */}
                <div 
                  style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}
                  dangerouslySetInnerHTML={{ __html: courses.find(c => c.id === expandingCourseId)?.description }} 
                />
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                  Giá: {Number(courses.find(c => c.id === expandingCourseId)?.price).toLocaleString('vi-VN')}đ
                </div>
              </div>
              <button onClick={() => setExpandingCourseId(null)} style={{ background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#ef4444' }}>Đóng lại ❌</button>
            </div>

            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#334155' }}>📑 Chi tiết tổng quan các bài học của Khóa Học:</h3>
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '10px' }}>
                <CurriculumAccordion curriculumData={courseCurriculum} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;