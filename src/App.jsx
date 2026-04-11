import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './HomePage';
import CoursesPage from './CoursesPage';
import CourseManager from './CourseManager';
import LearningRoom from './LearningRoom';
import CourseDetail from './CourseDetail';
import AdminDashboard from './AdminDashboard';
import Cart from './cart'; 
import Payment from './Payment'; 
import API_BASE_URL from './config/api';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingCourseId, setViewingCourseId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearchKeyword, setCourseSearchKeyword] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]); 
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const API_URL = `${API_BASE_URL}/users`;

  const canManage =
    isLoggedIn &&
    (currentUser?.role === 'admin' || currentUser?.role === 'teacher');

  const fetchUsers = async () => {
    if (!canManage) return;

    try {
      const response = await axios.get(API_URL);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách user:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isLoggedIn, currentUser?.role]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(API_URL);
      const userList = Array.isArray(response.data) ? response.data : [];

      const user = userList.find(
        (u) =>
          u.email === loginForm.email &&
          (!u.password || u.password === loginForm.password)
      );

      if (!user) {
        alert('❌ Sai email hoặc mật khẩu!');
        return;
      }

      setCurrentUser(user);
      setIsLoggedIn(true);
      setCurrentView('home');
      setLoginForm({ email: '', password: '' });

      if (user.role === 'admin') {
        setActiveTab('users');
      } else if (user.role === 'teacher') {
        setActiveTab('courses');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Lỗi máy chủ!');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(API_URL, { ...registerForm, role: 'student' });
      alert('✅ Đăng ký thành công! Vui lòng đăng nhập.');
      setAuthMode('login');
      setRegisterForm({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      console.error(err);
      alert('❌ Đăng ký thất bại!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
    setSelectedCourse(null);
    setViewingCourseId(null);
    setCurrentView('home');
  };

  const handleOpenCourses = (keyword = '') => {
    setCourseSearchKeyword(keyword || '');
    setCurrentView('courses');
  };

  const handleOpenCourseDetail = (courseOrId) => {
    const id =
      typeof courseOrId === 'object' ? courseOrId?.id : courseOrId;

    if (!id) return;

    setViewingCourseId(id);

    if (typeof courseOrId === 'object') {
      setSelectedCourse({
        id: courseOrId.id,
        title: courseOrId.title,
      });
    }

    setCurrentView('courseDetail');
  };

  const handleOpenDashboard = () => {
    if (!canManage) return;
    setCurrentView('dashboard');
    setActiveTab(currentUser?.role === 'admin' ? 'users' : 'courses');
  };

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
    } catch (err) {
      console.error(err);
      alert('❌ Lỗi thao tác!');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'student',
    });
    setEditingId(user?.id || null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Bạn có chắc muốn xóa vĩnh viễn?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('❌ Lỗi khi xóa!');
    }
  };

  const filteredUsers = users.filter((user) => {
    const name = (user?.name || '').toLowerCase();
    const email = (user?.email || '').toLowerCase();
    const keyword = searchTerm.toLowerCase();

    return name.includes(keyword) || email.includes(keyword);
  });

  const goToLearning = (course) => {
    setSelectedCourse(course);
    setActiveTab('learning');
    setCurrentView('dashboard');
  };

  const toastNode = (
    <ToastContainer position="top-right" autoClose={3000} theme="colored" />
  );


  const cartNode = (
    <>
      <button 
        onClick={() => setIsCartOpen(true)}
        style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '15px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      >
        🛒 ({cartItems.length})
      </button>
      {isCartOpen && (
        <Cart 
          cartItems={cartItems} 
          onClose={() => setIsCartOpen(false)} 
          onCheckout={() => {
            setIsCartOpen(false); // Đóng giỏ hàng
            setCurrentView('payment'); // Chuyển sang trang thanh toán
          }} 
        />
      )}
    </>
  );

  if (currentView === 'home') {
    return (
      <>
        <HomePage
          onLoginClick={() => setCurrentView('auth')}
          onViewCoursesClick={handleOpenCourses}
          onCourseSelect={handleOpenCourseDetail}
          onAdminClick={handleOpenDashboard}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogoutClick={handleLogout}
          // 👇 Gắn công tắc onViewCourse tại đây
          onViewCourse={(id) => {
            setViewingCourseId(id);
            setCurrentView('courseDetail');
          }}
        />

        {canManage && (
          <button
            onClick={handleOpenDashboard}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              padding: '15px 25px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 1000,
            }}
          >
            ⚙️ Quản Lý Hệ Thống
          </button>
        )}
        {cartNode}
        {toastNode}
      </>
    );
  }

  if (currentView === 'courses') {
    return (
      <>
        <CoursesPage
          onBackToHome={() => setCurrentView('home')}
          onViewCourse={handleOpenCourseDetail}
          initialSearchQuery={courseSearchKeyword}
        />
        {cartNode}
        {toastNode}
      </>
    );
  }

  if (currentView === 'courseDetail') {
    return (
      <>
        <CourseDetail
          courseId={viewingCourseId}
          onBack={() => setCurrentView('courses')}
        />
        {toastNode}
      </>
    );
  }
  if (currentView === 'payment') {
    return (
      <>
        <Payment 
          currentUser={currentUser}
          cartItems={cartItems}     
          totalAmount={cartItems.reduce((sum, item) => sum + item.price, 0)}
          onPaymentSuccess={() => {
            alert("Thanh toán thành công!");
            setCartItems([]); 
            setCurrentView('home');
          }}
          onCancel={() => setCurrentView('home')}
        />
        {toastNode}
      </>
    );
  }
  

  if (currentView === 'auth') {
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            minHeight: '100vh',
            backgroundColor: '#f0f4f8',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              width: '90%',
              maxWidth: '420px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setCurrentView('home')}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              🔙 Quay lại
            </button>

            <div
              style={{
                textAlign: 'center',
                marginBottom: '30px',
                marginTop: '20px',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
              <h2 style={{ color: '#0f172a', margin: 0 }}>
                {authMode === 'login'
                  ? 'Chào mừng trở lại'
                  : 'Tạo tài khoản mới'}
              </h2>
            </div>

            {authMode === 'login' ? (
              <form
                onSubmit={handleLogin}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <input
                  type="email"
                  placeholder="Email của bạn"
                  required
                  style={inputStyle}
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  required
                  style={inputStyle}
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
                <button type="submit" style={primaryBtnStyle}>
                  Đăng Nhập 🚀
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleRegister}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <input
                  type="text"
                  placeholder="Họ và tên"
                  required
                  style={inputStyle}
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, name: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  style={inputStyle}
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  required
                  style={inputStyle}
                  value={registerForm.phone}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, phone: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  required
                  style={inputStyle}
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                />
                <button type="submit" style={successBtnStyle}>
                  Đăng Ký Ngay ✨
                </button>
              </form>
            )}

            <div
              style={{
                textAlign: 'center',
                marginTop: '25px',
                fontSize: '14px',
                color: '#64748b',
              }}
            >
              {authMode === 'login' ? (
                <span
                  onClick={() => setAuthMode('register')}
                  style={{
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Chưa có tài khoản? Đăng ký
                </span>
              ) : (
                <span
                  onClick={() => setAuthMode('login')}
                  style={{
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Đã có tài khoản? Đăng nhập
                </span>
              )}
            </div>
          </div>
        </div>
        {toastNode}
      </>
    );
  }

  if (!canManage) {
    return (
      <>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h2>Không có quyền truy cập</h2>
          <button onClick={() => setCurrentView('home')} style={primaryBtnStyle}>
            Về trang chủ
          </button>
        </div>
        {toastNode}
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div
          style={{
            width: '280px',
            backgroundColor: '#0f172a',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: '30px 20px',
              textAlign: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#38bdf8',
                letterSpacing: '1px',
              }}
            >
              E-LEARNING
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#94a3b8',
                marginTop: '8px',
                padding: '5px 10px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                display: 'inline-block',
              }}
            >
              👤 {currentUser?.name || 'Người dùng'}
            </div>
          </div>

          <div style={{ padding: '20px', flex: 1 }}>
            <div
              style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: 'bold',
                marginBottom: '10px',
                textTransform: 'uppercase',
              }}
            >
              Menu Quản Lý
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li onClick={() => setCurrentView('home')} style={{ ...menuItem, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                🏠 Về Trang Chủ
              </li>

              {currentUser?.role === 'admin' && (
                <li
                  onClick={() => setActiveTab('users')}
                  style={activeTab === 'users' ? activeMenuItem : menuItem}
                >
                  👥 Người dùng
                </li>
              )}

              {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <>
                  <li
                    onClick={() => setActiveTab('analytics')}
                    style={activeTab === 'analytics' ? analyticsMenuItem : menuItem}
                  >
                    📊 Analytics
                  </li>
                  <li
                    onClick={() => setActiveTab('courses')}
                    style={activeTab === 'courses' ? activeMenuItem : menuItem}
                  >
                    📚 Khóa học
                  </li>
                  <li
                    onClick={() => {
                      setSelectedCourse({
                        id: selectedCourse?.id || 101,
                        title: selectedCourse?.title || 'Lập trình ReactJS cho Gen Z',
                      });
                      setActiveTab('learning');
                    }}
                    style={activeTab === 'learning' ? activeMenuItem : menuItem}
                  >
                    🎓 Phòng Học
                  </li>
                </>
              )}
            </ul>
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={handleLogout} style={{ ...dangerBtnStyle, width: '100%' }}>
              🚪 Đăng Xuất
            </button>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding:
              activeTab === 'learning' || activeTab === 'analytics' ? '0' : '40px',
            overflowY: 'auto',
          }}
        >
          {activeTab === 'users' && currentUser?.role === 'admin' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ color: '#0f172a', fontSize: '28px', marginBottom: '30px' }}>
                Quản Lý Người Dùng
              </h2>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  marginBottom: '30px',
                }}
              >
                <form onSubmit={handleSubmitAdmin} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    type="text"
                    placeholder="Họ và tên"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    type="text"
                    placeholder="Số điện thoại"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <select
                    style={inputStyle}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">Học viên</option>
                    <option value="teacher">Giáo viên</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" style={editingId ? warningBtnStyle : successBtnStyle}>
                    {editingId ? 'Cập Nhật' : 'Lưu Mới'}
                  </button>
                </form>
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  marginBottom: '20px',
                }}
              >
                <input
                  type="text"
                  placeholder="Tìm user theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Người dùng</th>
                      <th style={thStyle}>Vai trò</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>#{user.id}</td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                          <small>{user.email}</small>
                        </td>
                        <td style={tdStyle}>{user.role}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <button onClick={() => handleEdit(user)} style={neutralBtnStyle}>
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(user.id)} style={dangerBtnStyle}>
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && <CourseManager onGoToLearning={goToLearning} />}
          {activeTab === 'analytics' && <AdminDashboard />}
          {activeTab === 'learning' && (
            <LearningRoom
              course={selectedCourse}
              currentUser={currentUser}
              onBack={() => setActiveTab('courses')}
            />
          )}
        </div>
      </div>

      {toastNode}
    </>
  );
}

const inputStyle = {
  padding: '14px',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  fontSize: '15px',
  outline: 'none',
};

const primaryBtnStyle = {
  padding: '14px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const successBtnStyle = {
  ...primaryBtnStyle,
  backgroundColor: '#10b981',
};

const warningBtnStyle = {
  ...primaryBtnStyle,
  backgroundColor: '#f59e0b',
};

const dangerBtnStyle = {
  ...primaryBtnStyle,
  backgroundColor: '#ef4444',
};

const neutralBtnStyle = {
  padding: '8px 16px',
  backgroundColor: 'white',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  cursor: 'pointer',
  marginRight: '5px',
};

const menuItem = {
  padding: '16px 20px',
  cursor: 'pointer',
  borderRadius: '12px',
  color: '#cbd5e1',
  fontSize: '15px',
  fontWeight: '500',
};

const activeMenuItem = {
  ...menuItem,
  backgroundColor: '#3b82f6',
  color: 'white',
  fontWeight: 'bold',
};

const analyticsMenuItem = {
  ...menuItem,
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: 'white',
  fontWeight: 'bold',
};

const thStyle = {
  padding: '20px',
  textAlign: 'left',
};

const tdStyle = {
  padding: '20px',
};

export default App;
