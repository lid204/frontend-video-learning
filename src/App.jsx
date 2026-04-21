import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Route, Routes, useNavigate, Navigate } from 'react-router-dom';

// Các trang chính
import CoursesPage from './components/Course/CoursesPage';
import LearningRoom from './components/learning/LearningRoom';
import Payment from './components/payment/Payment';
import Cart from './components/layout/cart';
import AuthScreen from './components/auth/AuthScreen';
import AdminLayout from './components/admin/AdminLayout';
import CourseDetail from './components/Course/CourseDetail';
import HomePage from './components/home/HomePage';
import MyCourses from './components/Course/MyCourses';

// ------------------------------------------------------------------
// BƯỚC 1: TẠO COMPONENT CON ĐỂ CHỨA LOGIC ROUTER
// (Bắt buộc phải tách ra thế này để dùng được hook useNavigate)
// ------------------------------------------------------------------
function AppRoutes() {
  const navigate = useNavigate(); // Vũ khí thay thế cho setCurrentView

  // Các State cốt lõi (Đã xóa currentView vì Router sẽ đảm nhận việc đó)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingCourseId, setViewingCourseId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearchKeyword, setCourseSearchKeyword] = useState('');

  // Cart States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const canManage = isLoggedIn && (currentUser?.role === 'admin' || currentUser?.role === 'teacher');

  // Logic Đăng nhập / Đăng xuất (Sử dụng navigate để chuyển trang)
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    navigate('/home'); 
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedCourse(null);
    setCartItems([]);
    navigate('/home');
  };

  // Node Floating Actions (Nút giỏ hàng & thông báo)
  const floatingWidgets = (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {isLoggedIn && (
        <button onClick={() => navigate('/my-courses')} style={{ position: 'fixed', bottom: '170px', right: '20px', padding: '15px', borderRadius: '50%', backgroundColor: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} title="Khóa học của tôi">📚</button>
      )}

      <button onClick={() => setIsCartOpen(true)} style={{ position: 'fixed', bottom: '100px', right: '20px', padding: '15px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>🛒 ({cartItems.length})</button>

      {canManage && (
        <button onClick={() => navigate('/admin')} style={{ position: 'fixed', bottom: '30px', right: '30px', padding: '15px 25px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', zIndex: 1000 }}>⚙️ Quản Lý Hệ Thống</button>
      )}

      {isCartOpen && (
        <Cart cartItems={cartItems} onClose={() => setIsCartOpen(false)} onRemoveItem={(id) => setCartItems(cartItems.filter(item => item.id !== id))} onCheckout={() => { setIsCartOpen(false); navigate('/payment'); }} />
      )}
    </>
  );

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* BƯỚC 2: KHAI BÁO TOÀN BỘ CÁC TUYẾN ĐƯỜNG (ROUTES) TẠI ĐÂY */}
      {/* ------------------------------------------------------------------ */}
      <Routes>
        {/* Tự động chuyển hướng từ gốc (/) sang (/home) */}
        <Route path="/" element={<Navigate to="/home" />} />

        <Route path="/home" element={
          <HomePage
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onLoginClick={() => navigate('/auth')}
            onViewCoursesClick={(kw) => { setCourseSearchKeyword(kw); navigate('/courses'); }}
            onCourseSelect={(id) => { setViewingCourseId(id); navigate('/course-detail'); }}
            onAdminClick={() => navigate('/admin')}
            onLogoutClick={handleLogout}
          />
        } />

        <Route path="/auth" element={
          <AuthScreen 
            onLoginSuccess={handleLoginSuccess} 
            onBack={() => navigate('/home')} 
          />
        } />

        <Route path="/admin" element={
          canManage ? (
            <AdminLayout 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              onNavigateHome={() => navigate('/home')} 
              onGoToLearning={(course) => { setSelectedCourse(course); navigate('/learning'); }} 
            />
          ) : (
            <Navigate to="/home" /> // Nếu không có quyền quản lý, tự động đá về trang chủ
          )
        } />

        <Route path="/courses" element={
          <CoursesPage 
            onBackToHome={() => navigate('/home')} 
            onViewCourse={(id) => { setViewingCourseId(id); navigate('/course-detail'); }} 
            initialSearchQuery={courseSearchKeyword} 
          />
        } />

        <Route path="/course-detail" element={
          <CourseDetail 
            courseId={viewingCourseId?.id || viewingCourseId} 
            onBack={() => navigate('/courses')} 
            onAddToCart={(courseData) => { 
              if (!isLoggedIn) return navigate('/auth'); 
              setCartItems([...cartItems, courseData]); 
              setIsCartOpen(true); 
            }} 
          />
        } />

        <Route path="/my-courses" element={
          <MyCourses 
            currentUser={currentUser} 
            onBack={() => navigate('/home')} 
            onGoToLearning={(course) => { setSelectedCourse(course); navigate('/learning'); }} 
          />
        } />

        <Route path="/learning" element={
          <LearningRoom 
            course={selectedCourse} 
            currentUser={currentUser} 
            onBack={() => canManage ? navigate('/admin') : navigate('/my-courses')} 
          />
        } />

        <Route path="/payment" element={
          <Payment 
            currentUser={currentUser} 
            cartItems={cartItems} 
            totalAmount={cartItems.reduce((sum, item) => sum + parseInt(Number(item.price) || 0, 10), 0)} 
            onPaymentSuccess={() => { setCartItems([]); navigate('/my-courses'); }} 
            onCancel={() => navigate('/home')} 
          />
        } />

        {/* Xử lý lỗi 404 (Trang không tồn tại) */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>

      {/* HIỂN THỊ GIỎ HÀNG VÀ NÚT THẢ NỔI BÊN NGOÀI ROUTES */}
      {floatingWidgets}
    </>
  );
}

// ------------------------------------------------------------------
// BƯỚC 3: COMPONENT GỐC BỌC TRONG BROWSER ROUTER
// ------------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}