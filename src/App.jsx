import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các trang giao diện của team
import HomePage from './HomePage';
import CoursesPage from './CoursesPage';
import CourseManager from './CourseManager';
import LearningRoom from './LearningRoom';
import AdminDashboard from './AdminDashboard';

function App() {
  // === STATE QUẢN LÝ LUỒNG ĐI ===
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

  // --- STATE PHÒNG HỌC ---
  const [selectedCourse, setSelectedCourse] = useState(null);

  // URL API CHÍNH THỨC
  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/users";
  const LESSON_API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/lessons";

  // ================= CÁC HÀM XỬ LÝ =================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(API_URL);
      const user = response.data.find(u => u.email === loginForm.email);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
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
      alert("❌ Đăng ký thất bại!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
    setCurrentView('home');
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
      alert("❌ Lỗi thêm bài giảng!");
    }
  };

  // ================= ĐIỀU HƯỚNG MÀN HÌNH =================

  if (currentView === 'home') {
    return (
      <>
        <HomePage 
          onLoginClick={() => setCurrentView('auth')} 
          onViewCoursesClick={() => setCurrentView('courses')} 
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogoutClick={handleLogout}
        />
        
        {isLoggedIn && (currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
          <button 
            onClick={() => {
              setCurrentView('dashboard');
              setActiveTab(currentUser.role === 'admin' ? 'users' : 'courses'); 
            }}
            style={{ position: 'fixed', bottom: '30px', right: '30px', padding: '15px 25px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 1000 }}
          >
            ⚙️ Quản Lý Hệ Thống
          </button>
        )}
      </>
    );
  }

  if (currentView === 'courses') {
    return <CoursesPage onBackToHome={() => setCurrentView('home')} />;
  }

  if (currentView === 'auth') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '90%', maxWidth: '420px', position: 'relative' }}>
          <button onClick={() => setCurrentView('home')} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>🔙 Quay lại</button>
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
            {authMode === 'login' ? <span onClick={() => setAuthMode('register')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>Chưa có tài khoản? Đăng ký</span> : <span onClick={() => setAuthMode('login')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>Đã có tài khoản? Đăng nhập</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ width: '280px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>E-LEARNING</div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'inline-block' }}>👤 {currentUser?.name}</div>
        </div>
        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Menu Quản Lý</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li onClick={() => setCurrentView('home')} style={{ padding: '16px 20px', cursor: 'pointer', borderRadius: '12px', color: '#cbd5e1', fontSize: '15px', fontWeight: '500', transition: '0.3s', backgroundColor: 'rgba(255,255,255,0.05)' }}>🏠 Về Trang Chủ</li>
            {currentUser?.role === 'admin' && <li onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeMenuItem : menuItem}>👥 Người dùng</li>}
            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
              <>
                <li onClick={() => setActiveTab('analytics')} style={activeTab === 'analytics' ? analyticsMenuItem : menuItem}>📊 Analytics</li>
                <li onClick={() => setActiveTab('courses')} style={activeTab === 'courses' ? activeMenuItem : menuItem}>📚 Khóa học</li>
                <li onClick={() => setActiveTab('lessons')} style={activeTab === 'lessons' ? activeMenuItem : menuItem}>🎬 Bài giảng</li>
                <li onClick={() => { setSelectedCourse({ id: 101, title: 'Lập trình ReactJS cho Gen Z' }); setActiveTab('learning'); }} style={activeTab === 'learning' ? activeMenuItem : menuItem}>🎓 Phòng Học</li>
              </>
            )}
          </ul>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ ...dangerBtnStyle, width: '100%' }}>🚪 Đăng Xuất</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: (activeTab === 'learning' || activeTab === 'analytics') ? '0' : '40px', overflowY: 'auto' }}>
        {activeTab === 'users' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: '#0f172a', fontSize: '28px', marginBottom: '30px' }}>Quản Lý Người Dùng</h2>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <form onSubmit={handleSubmitAdmin} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input style={{...inputStyle, flex: 1}} type="text" placeholder="Họ và tên" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input style={{...inputStyle, flex: 1}} type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <input style={{...inputStyle, flex: 1}} type="text" placeholder="Số điện thoại" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <select style={inputStyle} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}><option value="student">Học viên</option><option value="teacher">Giáo viên</option><option value="admin">Admin</option></select>
                <button type="submit" style={editingId ? warningBtnStyle : successBtnStyle}>{editingId ? "Cập Nhật" : "Lưu Mới"}</button>
              </form>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ backgroundColor: '#f8fafc' }}><th style={{ padding: '20px' }}>ID</th><th style={{ padding: '20px' }}>Người dùng</th><th style={{ padding: '20px' }}>Vai trò</th><th style={{ padding: '20px', textAlign: 'right' }}>Thao tác</th></tr></thead>
                  <tbody>{filteredUsers.map((user) => (<tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '20px' }}>#{user.id}</td><td style={{ padding: '20px' }}>{user.name}<br/><small>{user.email}</small></td><td style={{ padding: '20px' }}>{user.role}</td><td style={{ padding: '20px', textAlign: 'right' }}><button onClick={() => handleEdit(user)} style={neutralBtnStyle}>Sửa</button><button onClick={() => handleDelete(user.id)} style={dangerBtnStyle}>Xóa</button></td></tr>))}</tbody>
                </table>
            </div>
          </div>
        )}
        {activeTab === 'courses' && <CourseManager />}
        {activeTab === 'lessons' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Quản Lý Bài Giảng</h2>
            <form onSubmit={handleAddLesson} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}><input style={inputStyle} type="number" placeholder="ID Khóa học" required value={lessonForm.course_id} onChange={(e) => setLessonForm({...lessonForm, course_id: e.target.value})} /><input style={{...inputStyle, flex: 1}} type="text" placeholder="Tên bài giảng" required value={lessonForm.title} onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})} /><input style={{...inputStyle, flex: 1}} type="url" placeholder="Link YouTube" required value={lessonForm.video_url} onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})} /><button type="submit" style={successBtnStyle}>Thêm</button></form>
            <table style={{ width: '100%', backgroundColor: 'white', borderRadius: '12px' }}>
              <thead><tr style={{ textAlign: 'left' }}><th style={{ padding: '20px' }}>ID</th><th style={{ padding: '20px' }}>Tiêu đề</th><th style={{ padding: '20px' }}>YouTube ID</th></tr></thead>
              <tbody>{lessons.map((lesson) => (<tr key={lesson.id}><td style={{ padding: '20px' }}>#{lesson.id}</td><td style={{ padding: '20px' }}>{lesson.title}</td><td style={{ padding: '20px' }}>{lesson.video_url}</td></tr>))}</tbody>
            </table>
          </div>
        )}
        {activeTab === 'analytics' && <AdminDashboard />}
        {activeTab === 'learning' && <LearningRoom course={selectedCourse} currentUser={currentUser} onBack={() => setActiveTab('courses')} />}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

const inputStyle = { padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '15px', outline: 'none' };
const primaryBtnStyle = { padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const successBtnStyle = { ...primaryBtnStyle, backgroundColor: '#10b981' };
const warningBtnStyle = { ...primaryBtnStyle, backgroundColor: '#f59e0b' };
const dangerBtnStyle = { ...primaryBtnStyle, backgroundColor: '#ef4444' };
const neutralBtnStyle = { padding: '8px 16px', backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', marginRight: '5px' };
const menuItem = { padding: '16px 20px', cursor: 'pointer', borderRadius: '12px', color: '#cbd5e1', fontSize: '15px', fontWeight: '500' };
const activeMenuItem = { ...menuItem, backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold' };
const analyticsMenuItem = { ...menuItem, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 'bold' };

export default App;