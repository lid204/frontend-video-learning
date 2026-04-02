import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các trang giao diện của team
import HomePage from './HomePage';
import CoursesPage from './CoursesPage';
import CourseManager from './CourseManager'; // Code mới của Danh

function App() {
  // === STATE QUẢN LÝ LUỒNG ĐI (QUAN TRỌNG) ===
  const [currentView, setCurrentView] = useState('home'); 

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [currentUser, setCurrentUser] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'student' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE CHO BÀI GIẢNG ---
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState({ course_id: 101, title: '', video_url: '' });

  // URL API (Link Vercel chuẩn)
  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/users";
  const LESSON_API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/lessons";

  // ================= CÁC HÀM XỬ LÝ (GIỮ NGUYÊN) =================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(API_URL);
      const user = response.data.find(u => u.email === loginForm.email);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        // --- CHỐT LOGIC: TẤT CẢ VỀ HOME KHI ĐĂNG NHẬP ---
        setCurrentView('home'); 
      } else {
        alert("❌ Sai Email hoặc chưa đăng ký!");
      }
    } catch (err) {
      alert("❌ Lỗi máy chủ!");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { ...registerForm, role: 'student' });
      alert("✅ Đăng ký thành công! Vui lòng đăng nhập.");
      setAuthMode('login');
      setRegisterForm({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      alert("❌ Đăng ký thất bại (Email có thể đã tồn tại)!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
    setCurrentView('home'); // Đăng xuất -> Quay về trang chủ
  };

  const fetchUsers = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, [isLoggedIn]);

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ name: '', email: '', phone: '', role: 'student' });
      setEditingId(null);
      fetchUsers();
    } catch (err) { alert("❌ Lỗi thao tác!"); }
  };

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, phone: user.phone, role: user.role || 'student' });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Bạn có chắc muốn xóa vĩnh viễn?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchUsers();
      } catch (err) { alert("❌ Lỗi khi xóa!"); }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`${LESSON_API_URL}/course/101`);
      setLessons(response.data);
    } catch (err) { console.error("Chưa có bài giảng", err); }
  };

  useEffect(() => {
    if (activeTab === 'lessons') fetchLessons();
  }, [activeTab]);

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(LESSON_API_URL, lessonForm);
      alert(`✅ Thêm thành công!\nID YouTube: ${response.data.video_url}`);
      setLessonForm({ ...lessonForm, title: '', video_url: '' });
      fetchLessons();
    } catch (err) {
      if (err.response) {
        alert(`❌ Lỗi từ Server: ${err.response.data.details || err.response.data.error}`);
      } else {
        alert("❌ Lỗi từ Server hoặc Backend chưa bật!");
      }
    }
  };

  // ================= ĐIỀU HƯỚNG MÀN HÌNH =================

  // --- BƯỚC 2 CỦA BẠN ĐÂY: HOMEPAGE + NÚT QUẢN LÝ QUYỀN LỰC ---
  // 1. Nếu đang ở Trang Chủ
  if (currentView === 'home') {
    return (
      <>
        {/* Tích hợp code Homepage của Duy */}
        <HomePage 
          onLoginClick={() => setCurrentView('auth')} 
          onViewCoursesClick={() => setCurrentView('courses')} 
          isLoggedIn={isLoggedIn}          {/* Truyền trạng thái đăng nhập */}
          currentUser={currentUser}        {/* Truyền thông tin user */}
          onLogoutClick={handleLogout}     {/* Truyền hàm đăng xuất */}
        />
        
        {/* NÚT QUẢN LÝ HỆ THỐNG LƠ LỬNG (Chỉ hiện cho Admin/Teacher) */}
        {isLoggedIn && (currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
          <button 
            onClick={() => {
              setCurrentView('dashboard');
              // Phân tab mặc định: Admin -> Users, Teacher -> Courses
              setActiveTab(currentUser.role === 'admin' ? 'users' : 'courses'); 
            }}
            style={{ 
              position: 'fixed', bottom: '30px', right: '30px', 
              padding: '15px 25px', backgroundColor: '#f59e0b', color: 'white', 
              border: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: 'bold', 
              cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
              zIndex: 1000, transition: '0.3s' 
            }}
          >
            ⚙️ Quản Lý Hệ Thống
          </button>
        )}
      </>
    );
  }

  // 2. Nếu đang ở Trang Siêu thị Khóa học (Giữ nguyên)
  if (currentView === 'courses') {
    return (
      <CoursesPage 
        onBackToHome={() => setCurrentView('home')} 
      />
    );
  }

  // 3. Nếu bấm Đăng nhập (Giữ nguyên)
  if (currentView === 'auth') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', width: '90%', maxWidth: '420px', position: 'relative' }}>
          
          <button onClick={() => setCurrentView('home')} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>
            🔙 Quay lại
          </button>

          <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
            <h2 style={{ color: '#0f172a', margin: 0 }}>{authMode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h2>
            <p style={{ color: '#64748b', marginTop: '5px', fontSize: '14px' }}>Hệ thống quản lý Video Learning</p>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="email" placeholder="Email của bạn" required style={inputStyle} value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} />
              <input type="password" placeholder="Mật khẩu" required style={inputStyle} value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} />
              <button type="submit" style={primaryBtnStyle}>Đăng Nhập 🚀</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Họ và tên" required style={inputStyle} value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} />
              <input type="email" placeholder="Email" required style={inputStyle} value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} />
              <input type="text" placeholder="Số điện thoại" required style={inputStyle} value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} />
              <input type="password" placeholder="Mật khẩu" required style={inputStyle} value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} />
              <button type="submit" style={successBtnStyle}>Đăng Ký Ngay ✨</button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#64748b' }}>
            {authMode === 'login' ? 
              <span>Chưa có tài khoản? <b onClick={() => setAuthMode('register')} style={{ color: '#3b82f6', cursor: 'pointer' }}>Đăng ký</b></span> : 
              <span>Đã có tài khoản? <b onClick={() => setAuthMode('login')} style={{ color: '#3b82f6', cursor: 'pointer' }}>Đăng nhập</b></span>
            }
          </div>
        </div>
      </div>
    );
  }

  // 4. Màn hình Dashboard Admin (Khi đã đăng nhập)
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* SIDEBAR */}
      <div style={{ width: '280px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>E-LEARNING</div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'inline-block' }}>
            👤 {currentUser?.name}
          </div>
        </div>

        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Quản Lý</div>
          
          {/* PHÂN QUYỀN THANH MENU DỰA TRÊN ROLE */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li onClick={() => setCurrentView('home')} style={{ padding: '16px 20px', cursor: 'pointer', borderRadius: '12px', color: '#cbd5e1', fontSize: '15px', fontWeight: '500', transition: '0.3s', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            🏠 Về Trang Chủ
            </li>
            {/* CHỈ ADMIN MỚI ĐƯỢC XEM TAB NGƯỜI DÙNG */}
            {currentUser?.role === 'admin' && (
              <li onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeMenuItem : menuItem}>👥 Người dùng</li>
            )}

            {/* ADMIN VÀ GIÁO VIÊN ĐỀU ĐƯỢC XEM 2 TAB NÀY */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
              <>
                <li onClick={() => setActiveTab('courses')} style={activeTab === 'courses' ? activeMenuItem : menuItem}>📚 Khóa học</li>
                <li onClick={() => setActiveTab('lessons')} style={activeTab === 'lessons' ? activeMenuItem : menuItem}>🎬 Bài giảng</li>
              </>
            )}
          </ul>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ ...dangerBtnStyle, width: '100%' }}>🚪 Đăng Xuất</button>
        </div>
      </div>

      {/* KHU VỰC NỘI DUNG (GIỮ NGUYÊN) */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {/* ... (Giữ nguyên toàn bộ phần nội dung Users, Courses, Lessons như code chuẩn) ... */}
        {activeTab === 'users' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* ... code users ... */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>Quản Lý Người Dùng</h2>
            </div>
            {/* ... */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <input type="text" placeholder="🔍 Tìm kiếm theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{...inputStyle, width: '100%', maxWidth: '400px', backgroundColor: 'white'}} />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  {/* ... code users table ... */}
                  <thead>
                    <tr style={{ backgroundColor: 'white', color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>ID</th><th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>Người dùng</th><th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>Liên hệ</th><th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>Vai trò</th><th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }}>
                        <td style={{ padding: '20px', color: '#64748b' }}>#{user.id}</td><td style={{ padding: '20px', fontWeight: 'bold', color: '#0f172a' }}>{user.name}</td><td style={{ padding: '20px', color: '#64748b' }}>{user.email}<br/><span style={{fontSize: '12px', color: '#94a3b8'}}>{user.phone}</span></td><td style={{ padding: '20px' }}><span style={{ backgroundColor: user.role === 'admin' ? '#fef2f2' : user.role === 'teacher' ? '#eff6ff' : '#f0fdf4', color: user.role === 'admin' ? '#ef4444' : user.role === 'teacher' ? '#3b82f6' : '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{user.role}</span></td><td style={{ padding: '20px', textAlign: 'right' }}><button onClick={() => handleEdit(user)} style={{...neutralBtnStyle, marginRight: '10px', padding: '8px 16px'}}>Sửa</button><button onClick={() => handleDelete(user.id)} style={{...dangerBtnStyle, padding: '8px 16px', backgroundColor: '#fef2f2', color: '#ef4444'}}>Xóa</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB KHÓA HỌC */}
        {activeTab === 'courses' && (
          <CourseManager /> 
        )}

        {/* TAB BÀI GIẢNG */}
        {activeTab === 'lessons' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>Quản Lý Bài Giảng & Video</h2>
            </div>
            {/* ... code lessons ... */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h3 style={{ marginTop: 0, color: '#334155', fontSize: '18px', marginBottom: '20px' }}>➕ Thêm Video Mới</h3>
              <form onSubmit={handleAddLesson} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input style={{...inputStyle, width: '120px'}} type="number" placeholder="ID Khóa học" required value={lessonForm.course_id} onChange={(e) => setLessonForm({...lessonForm, course_id: e.target.value})} title="Nhập ID khóa học (Test mặc định là 101)" /><input style={{...inputStyle, flex: 1, minWidth: '200px'}} type="text" placeholder="Tên bài giảng (VD: Bài 1: Giới thiệu Node.js)" required value={lessonForm.title} onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})} /><input style={{...inputStyle, flex: 2, minWidth: '250px'}} type="url" placeholder="Dán link YouTube (VD: https://www.youtube.com/watch?v=123)" required value={lessonForm.video_url} onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})} /><button type="submit" style={successBtnStyle}>Thêm Bài Giảng</button>
              </form>
              <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '12px', fontStyle: 'italic' }}>*Lưu ý: Ông cứ copy nguyên cái link YouTube dài thòng dán vào. Backend sẽ tự dùng Regex cắt lấy đúng cái mã ID Video để lưu cho nhẹ Database!</p>
            </div>
            {/* BẢNG BÀI GIẢNG */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>ID Bài</th><th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>Thuộc Khóa Học</th><th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>Tiêu đề video</th><th style={{ padding: '20px', borderBottom: '2px solid #e2e8f0' }}>Mã YouTube ID (Đã cắt)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.length === 0 ? (
                      <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Chưa có bài giảng nào. Hãy dán thử 1 link YouTube vào form phía trên nhé!</td></tr>
                    ) : (
                      lessons.map((lesson) => (
                        <tr key={lesson.id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }}>
                          <td style={{ padding: '20px', color: '#64748b', fontWeight: 'bold' }}>#{lesson.id}</td><td style={{ padding: '20px', color: '#3b82f6', fontWeight: 'bold' }}>Khóa ID: {lesson.course_id}</td><td style={{ padding: '20px', color: '#0f172a' }}>{lesson.title}</td><td style={{ padding: '20px' }}><span style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}>{lesson.video_url}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

// ================= BỘ CSS INLINE DÙNG CHUNG =================
const inputStyle = { padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '15px', outline: 'none', transition: 'border 0.3s' };
const primaryBtnStyle = { padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' };
const successBtnStyle = { ...primaryBtnStyle, backgroundColor: '#10b981' };
const warningBtnStyle = { ...primaryBtnStyle, backgroundColor: '#f59e0b' };
const dangerBtnStyle = { ...primaryBtnStyle, backgroundColor: '#ef4444' };
const neutralBtnStyle = { ...primaryBtnStyle, backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1' };

const menuItem = { padding: '16px 20px', cursor: 'pointer', borderRadius: '12px', color: '#cbd5e1', fontSize: '15px', fontWeight: '500', transition: '0.3s' };
const activeMenuItem = { ...menuItem, backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold' };

export default App;