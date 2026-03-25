import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // ================= 1. STATE QUẢN LÝ ĐĂNG NHẬP (AUTH) =================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' hoặc 'register'
  const [currentUser, setCurrentUser] = useState(null); // Lưu thông tin người đang đăng nhập

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });

  // ================= 2. STATE QUẢN LÝ ADMIN DASHBOARD =================
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'student' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/users";

  // ================= 3. LOGIC ĐĂNG NHẬP & ĐĂNG KÝ =================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // [DÀNH CHO TEAM DEV]: Chỗ này hiện đang gọi tạm API GET để test PoC. 
      // Nhiệm vụ của bạn Backend (Thành viên 5) là viết lại một API: POST /api/auth/login
      const response = await axios.get(API_URL);
      const allUsers = response.data;
      
      // Tìm user có email khớp (Tạm thời bỏ qua pass vì PoC chưa làm chức năng check pass chuẩn)
      const user = allUsers.find(u => u.email === loginForm.email);
      
      if (user) {
        alert(`🎉 Chào mừng ${user.name} trở lại!`);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        alert("❌ Không tìm thấy tài khoản với Email này!");
      }
    } catch (err) {
      alert("❌ Lỗi kết nối đến máy chủ!");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Gắn mặc định role là student khi đăng ký mới
      const newUser = { ...registerForm, role: 'student' };
      await axios.post(API_URL, newUser);
      
      alert("✅ Đăng ký thành công! Vui lòng đăng nhập.");
      setAuthMode('login'); // Chuyển về tab đăng nhập
      setRegisterForm({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      alert("❌ Lỗi đăng ký (Có thể Email đã tồn tại)!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
  };

  // ================= 4. LOGIC ADMIN (CRUD USERS) =================
  const fetchUsers = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isLoggedIn]);

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        alert("✅ Cập nhật thành công!");
      } else {
        await axios.post(API_URL, formData);
        alert("✅ Thêm mới thành công!");
      }
      setFormData({ name: '', email: '', phone: '', role: 'student' });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert("❌ Lỗi thao tác!");
    }
  };

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, phone: user.phone, role: user.role || 'student' });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchUsers();
      } catch (err) {
        alert("❌ Lỗi khi xóa!");
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= GIAO DIỆN CHƯA ĐĂNG NHẬP (AUTH SCREEN) =================
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          
          <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '30px', fontSize: '24px' }}>
            {authMode === 'login' ? '🔑 Đăng Nhập Hệ Thống' : '📝 Đăng Ký Tài Khoản'}
          </h2>

          {/* Form Đăng nhập */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="email" placeholder="Email của bạn" required style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} />
              <input type="password" placeholder="Mật khẩu" required style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} />
              <button type="submit" style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Đăng Nhập</button>
            </form>
          ) : (
          /* Form Đăng ký */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Họ và Tên" required style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} />
              <input type="email" placeholder="Email" required style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} />
              <input type="text" placeholder="Số điện thoại" required style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} />
              <input type="password" placeholder="Mật khẩu" required style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} />
              <button type="submit" style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Tạo Tài Khoản</button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {authMode === 'login' ? (
              <p style={{ color: '#64748b' }}>Chưa có tài khoản? <span onClick={() => setAuthMode('register')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>Đăng ký ngay</span></p>
            ) : (
              <p style={{ color: '#64748b' }}>Đã có tài khoản? <span onClick={() => setAuthMode('login')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>Đăng nhập</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= GIAO DIỆN ĐÃ ĐĂNG NHẬP (ADMIN DASHBOARD) =================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
      
      {/* ===== SIDEBAR ===== */}
      <div style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#38bdf8' }}>E-Learning Pro</div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>Xin chào, {currentUser?.name} 👋</div>
        </div>
        
        <ul style={{ listStyle: 'none', padding: '15px', margin: 0, flex: 1 }}>
          <li onClick={() => setActiveTab('users')} style={{ padding: '15px', cursor: 'pointer', borderRadius: '8px', marginBottom: '8px', backgroundColor: activeTab === 'users' ? '#3b82f6' : 'transparent' }}>
            👥 Quản lý Người dùng
          </li>
          <li onClick={() => setActiveTab('courses')} style={{ padding: '15px', cursor: 'pointer', borderRadius: '8px', marginBottom: '8px', backgroundColor: activeTab === 'courses' ? '#3b82f6' : 'transparent' }}>
            📚 Quản lý Khóa học
          </li>
          <li onClick={() => setActiveTab('lessons')} style={{ padding: '15px', cursor: 'pointer', borderRadius: '8px', backgroundColor: activeTab === 'lessons' ? '#3b82f6' : 'transparent' }}>
            🎬 Quản lý Bài giảng
          </li>
        </ul>

        {/* NÚT ĐĂNG XUẤT NẰM Ở CUỐI SIDEBAR */}
        <div style={{ padding: '15px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {/* ===== NỘI DUNG CHÍNH ===== */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        {activeTab === 'users' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b' }}>Quản Lý Tài Khoản Hệ Thống</h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', flex: 1 }} type="text" placeholder="Họ và tên" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', flex: 1 }} type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', flex: 1 }} type="text" placeholder="Số điện thoại" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <select style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="student">Học viên</option>
                <option value="teacher">Giáo viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
              <button onClick={handleSubmitAdmin} style={{ padding: '10px 20px', backgroundColor: editingId ? '#f59e0b' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editingId ? "Cập Nhật" : "Thêm Mới"}
              </button>
              {editingId && <button onClick={cancelEdit} style={{ padding: '10px 20px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>}
            </div>

            <input type="text" placeholder="🔍 Tìm kiếm theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '15px' }} />

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '15px' }}>ID</th>
                  <th style={{ padding: '15px' }}>Họ và Tên</th>
                  <th style={{ padding: '15px' }}>Email</th>
                  <th style={{ padding: '15px' }}>Vai trò</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '15px' }}>{user.id}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#0f172a' }}>{user.name}</td>
                    <td style={{ padding: '15px', color: '#64748b' }}>{user.email}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ backgroundColor: user.role === 'admin' ? '#fef2f2' : user.role === 'teacher' ? '#eff6ff' : '#f0fdf4', color: user.role === 'admin' ? '#dc2626' : user.role === 'teacher' ? '#2563eb' : '#16a34a', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(user)} style={{ marginRight: '8px', padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Sửa</button>
                      <button onClick={() => handleDelete(user.id)} style={{ padding: '6px 12px', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', background: '#fef2f2', color: '#dc2626' }}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'courses' && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ color: '#0f172a' }}>📚 Quản Lý Khóa Học</h2>
            <p style={{ color: '#64748b' }}>[DÀNH CHO TEAM DEV] - Tách phần này ra thành component riêng nhé.</p>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ color: '#0f172a' }}>🎬 Quản Lý Bài Giảng</h2>
            <p style={{ color: '#64748b' }}>[DÀNH CHO TEAM DEV] - Thiết kế UI upload video tại đây.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;