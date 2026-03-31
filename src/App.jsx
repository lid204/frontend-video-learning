import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import 2 trang giao diện của bạn
import HomePage from './HomePage';
import CoursesPage from './CoursesPage';
import CourseDetail from './CourseDetail'; 

function App() {
  // === STATE QUẢN LÝ LUỒNG ĐI (QUAN TRỌNG) ===
  // currentView có 4 trạng thái: 'home', 'courses', 'auth', 'dashboard'
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

  // STATE CHO BÀI GIẢNG
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState({ course_id: 1, title: '', video_url: '' });

  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/users";
  const LESSON_API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/lessons";

  // ================= CÁC HÀM XỬ LÝ (Giữ nguyên của bạn) =================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(API_URL);
      const user = response.data.find(u => u.email === loginForm.email);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setCurrentView('dashboard'); // Đăng nhập thành công -> Vào Dashboard
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
      const response = await axios.get(`${LESSON_API_URL}/course/1`);
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
      alert("❌ Lỗi từ Server hoặc Backend chưa bật!");
    }
  };

  // ================= ĐIỀU HƯỚNG MÀN HÌNH =================

  // 1. Nếu đang ở Trang Chủ
  if (currentView === 'home') {
    return (
      <HomePage 
        onLoginClick={() => setCurrentView('auth')} 
        onViewCoursesClick={() => setCurrentView('courses')} 
      />
    );
  }

  // 2. Nếu đang ở Trang Siêu thị Khóa học
  if (currentView === 'courses') {
    return (
      <CoursesPage 
        onBackToHome={() => setCurrentView('home')} 
      />
    );
  }

  // 3. Nếu bấm Đăng nhập (Chưa có tài khoản)
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

  // 4. Màn hình Dashboard (Khi đã đăng nhập thành công)
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* SIDEBAR */}
      <div style={{ width: '280px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>E-LEARNING</div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'inline-block' }}>👤 {currentUser?.name}</div>
        </div>
        
        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Menu Quản Lý</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeMenuItem : menuItem}>👥 Người dùng</li>
            <li onClick={() => setActiveTab('courses')} style={activeTab === 'courses' ? activeMenuItem : menuItem}>📚 Khóa học</li>
            <li onClick={() => setActiveTab('lessons')} style={activeTab === 'lessons' ? activeMenuItem : menuItem}>🎬 Bài giảng</li>
          </ul>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ ...dangerBtnStyle, width: '100%' }}>🚪 Đăng Xuất</button>
        </div>
      </div>

      {/* KHU VỰC NỘI DUNG */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {activeTab === 'users' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>Quản Lý Người Dùng</h2>
            </div>
            {/* Các nội dung quản lý User cũ của bạn vẫn nằm đây, chạy bình thường! */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <form onSubmit={handleSubmitAdmin} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input style={{...inputStyle, flex: 1}} type="text" placeholder="Họ và tên" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input style={{...inputStyle, flex: 1}} type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <select style={{...inputStyle, width: '150px'}} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="student">Học viên</option><option value="teacher">Giáo viên</option><option value="admin">Admin</option>
                </select>
                <button type="submit" style={editingId ? warningBtnStyle : successBtnStyle}>{editingId ? "Cập Nhật" : "Lưu Mới"}</button>
              </form>
            </div>
            
            {/* Bảng Users rút gọn (Giữ nguyên logic) */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px' }}>
              {filteredUsers.map((user) => (
                <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0'}}>
                   <span>{user.name} ({user.email}) - <b>{user.role}</b></span>
                   <div>
                     <button onClick={() => handleEdit(user)} style={{marginRight: '10px'}}>Sửa</button>
                     <button onClick={() => handleDelete(user.id)}>Xóa</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px' }}>
            <h2>Tính năng khóa học Admin</h2>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px', marginBottom: '20px' }}>Quản Lý Bài Giảng</h2>
             <form onSubmit={handleAddLesson} style={{ display: 'flex', gap: '15px' }}>
                <input style={{...inputStyle, width: '120px'}} type="number" placeholder="ID Khóa học" required value={lessonForm.course_id} onChange={(e) => setLessonForm({...lessonForm, course_id: e.target.value})} />
                <input style={{...inputStyle, flex: 1}} type="text" placeholder="Tên bài giảng" required value={lessonForm.title} onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})} />
                <input style={{...inputStyle, flex: 2}} type="url" placeholder="Link YouTube" required value={lessonForm.video_url} onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})} />
                <button type="submit" style={successBtnStyle}>Thêm Bài Giảng</button>
              </form>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

// BỘ CSS DÙNG CHUNG
const inputStyle = { padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '15px', outline: 'none' };
const primaryBtnStyle = { padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const successBtnStyle = { ...primaryBtnStyle, backgroundColor: '#10b981' };
const warningBtnStyle = { ...primaryBtnStyle, backgroundColor: '#f59e0b' };
const dangerBtnStyle = { ...primaryBtnStyle, backgroundColor: '#ef4444' };
const neutralBtnStyle = { ...primaryBtnStyle, backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1' };
const menuItem = { padding: '16px 20px', cursor: 'pointer', borderRadius: '12px', color: '#cbd5e1', fontSize: '15px', fontWeight: '500' };
const activeMenuItem = { ...menuItem, backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold' };

export default App; // CHỈ CÓ ĐÚNG 1 LỆNH EXPORT NÀY