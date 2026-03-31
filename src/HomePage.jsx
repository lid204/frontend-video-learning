import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function HomePage() {
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

  // Hàm "tẩy rửa" mã HTML để chữ hiển thị trên Card đẹp hơn
  const stripHtmlTags = (text) => {
    if (!text) return 'Chưa có mô tả cho khóa học này.';
    return text.replace(/<[^>]+>/g, ''); 
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif", overflowX: 'hidden' }}>
      
      {/* 🚀 CSS TÙY CHỈNH - FIX LỖI GIAO DIỆN */}
      <style>{`
        .hover-card { transition: all 0.3s ease; }
        .hover-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); border-color: #cbd5e1; }
        .category-pill { transition: all 0.2s; }
        .category-pill:hover { background-color: #3b82f6; color: white; transform: scale(1.05); }
        .search-btn:hover { background-color: #2563eb; }
        
        /* Chỉnh nút Swiper xích ra ngoài một chút để không đè lên thẻ */
        .swiper-button-next { right: 0px !important; }
        .swiper-button-prev { left: 0px !important; }
        .swiper-button-next, .swiper-button-prev { 
          color: #3b82f6 !important; background: white; width: 44px; height: 44px; 
          border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 1px solid #f1f5f9;
        }
        .swiper-button-next:after, .swiper-button-prev:after { font-size: 18px !important; font-weight: bold; }
        .swiper-pagination-bullet-active { background-color: #3b82f6 !important; }
        
        /* Padding để thẻ có chỗ nhảy lên khi hover */
        .swiper-container-wrapper { padding: 15px 50px 50px 50px; margin: 0 -50px; }
      `}</style>

      {/* 🌟 HERO BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', margin: '0 0 20px 0', fontWeight: '800' }}>
          Mở Khóa Tiềm Năng Của Bạn 🔓
        </h1>
        
        {/* THANH TÌM KIẾM */}
        <div style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '50px', padding: '5px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }}>
          <input 
            type="text" 
            placeholder="🔍 Bạn muốn học gì hôm nay? (VD: React...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '12px 20px', border: 'none', borderRadius: '50px', outline: 'none', fontSize: '15px', color: '#0f172a' }}
          />
          <button className="search-btn" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 25px', borderRadius: '50px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
            Tìm Kiếm
          </button>
        </div>
      </div>

      {/* 🏷️ DANH MỤC */}
      <div style={{ maxWidth: '1000px', margin: '-25px auto 40px auto', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
        {['💻 Lập trình Web', '🎨 Thiết kế UI/UX', '📱 Lập trình Mobile', '📈 Marketing', '🤖 AI & Data'].map((cat, index) => (
          <div key={index} className="category-pill" style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: 'bold', color: '#475569', fontSize: '14px', border: '1px solid #f1f5f9' }}>
            {cat}
          </div>
        ))}
      </div>

      {/* 🚀 DANH SÁCH KHÓA HỌC */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#0f172a', fontSize: '26px', margin: 0 }}>🔥 Sinh Viên Mua Nhiều Nhất</h2>
          <span style={{ color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Xem tất cả &rarr;</span>
        </div>
        
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang tải danh sách khóa học...</div>
        ) : (
          <div className="swiper-container-wrapper">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={25}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              style={{ padding: '15px 5px 40px 5px' }} // Cho thẻ không bị cắt bóng đổ
            >
              {courses.map((course) => (
                <SwiperSlide key={course.id} style={{ height: 'auto' }}> {/* Bắt buộc height: auto để các thẻ cao bằng nhau */}
                  <div className="hover-card" style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* KHUNG ẢNH CỐ ĐỊNH KÍCH THƯỚC */}
                    <div style={{ position: 'relative', width: '100%', height: '170px', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        // TUYỆT CHIÊU: Nếu link ảnh bị lỗi, tự động thay bằng ảnh mặc định này
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = 'https://placehold.co/600x400/cbd5e1/475569?text=No+Image';
                        }} 
                      />
                      {/* Badge Bestseller luôn dính chặt vào góc ảnh */}
                      <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        🔥 Bestseller
                      </span>
                    </div>

                    {/* KHUNG NỘI DUNG (DÙNG FLEXBOX ĐỂ ĐẨY NÚT XUỐNG ĐÁY) */}
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      
                      <div style={{ color: '#f59e0b', fontSize: '13px', marginBottom: '8px', fontWeight: 'bold' }}>
                        ⭐⭐⭐⭐⭐ ({course.rating || '5.0'})
                      </div>
                      
                      {/* Tên khóa học: Bắt buộc hiện tối đa 2 dòng, dài quá thì thành dấu ... */}
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#0f172a', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '46px' }}>
                        {course.title}
                      </h3>
                      
                      {/* Mô tả: Bắt buộc hiện tối đa 2 dòng, đẩy các phần tử khác ra xa */}
                      <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '13.5px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                        {stripHtmlTags(course.description)}
                      </p>
                      
                      {/* Dòng dưới cùng (Giá + Nút) luôn nằm sát đáy thẻ */}
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontWeight: '800', color: '#10b981', fontSize: '18px' }}>
                          {course.price > 0 ? `${Number(course.price).toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                        </span>
                        <button style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
                          Xem ngay
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

    </div>
  );
}

export default HomePage;