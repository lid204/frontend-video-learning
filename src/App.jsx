import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // 1. CÁC STATE QUẢN LÝ 
  const [activeTab, setActiveTab] = useState('users'); // Tab đang chọn (Menu bên trái)
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'student' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State cho thanh tìm kiếm

  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/users";

  // 2. GỌI API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 3. CÁC HÀM XỬ LÝ CRUD
  const handleSubmit = async (e) => {
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
      console.error(err);
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

  const cancelEdit = () => {
    setFormData({ name: '', email: '', phone: '', role: 'student' });
    setEditingId(null);
  };

  // 4. LOGIC TÌM KIẾM (Lọc danh sách user ngay trên trình duyệt)
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
      
      {/* ================= SIDEBAR (MENU BÊN TRÁI) ================= */}
      <div style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #334155', textAlign: 'center' }}>
          🎓 Admin Dashboard
        </div>
        <ul style={{ listStyle: 'none', padding: '10px', margin: 0 }}>
          <li 
            onClick={() => setActiveTab('users')}
            style={{ padding: '15px', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px', backgroundColor: activeTab === 'users' ? '#3b82f6' : 'transparent', transition: '0.3s' }}
          >
            👥 Quản lý Người dùng
          </li>
          <li 
            onClick={() => setActiveTab('courses')}
            style={{ padding: '15px', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px', backgroundColor: activeTab === 'courses' ? '#3b82f6' : 'transparent', transition: '0.3s' }}
          >
            📚 Quản lý Khóa học
          </li>
          <li 
            onClick={() => setActiveTab('lessons')}
            style={{ padding: '15px', cursor: 'pointer', borderRadius: '8px', backgroundColor: activeTab === 'lessons' ? '#3b82f6' : 'transparent', transition: '0.3s' }}
          >
            🎬 Quản lý Bài giảng
          </li>
        </ul>
      </div>

      {/* ================= NỘI DUNG CHÍNH (BÊN PHẢI) ================= */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        {/* NẾU ĐANG CHỌN TAB QUẢN LÝ NGƯỜI DÙNG */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1e293b', marginTop: 0, marginBottom: '20px' }}>Quản Lý Tài Khoản Hệ Thống</h2>

            {/* FORM THÊM/SỬA */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', flex: 1 }} type="text" placeholder="Họ và tên" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', flex: 1 }} type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', flex: 1 }} type="text" placeholder="Số điện thoại" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              
              <select style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="student">Học viên</option>
                <option value="teacher">Giáo viên</option>
                <option value="admin">Quản trị viên</option>
              </select>

              <button onClick={handleSubmit} style={{ padding: '10px 20px', backgroundColor: editingId ? '#f59e0b' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editingId ? "Cập Nhật" : "Thêm Mới"}
              </button>
              {editingId && <button onClick={cancelEdit} style={{ padding: '10px 20px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>}
            </div>

            {/* THANH TÌM KIẾM */}
            <div style={{ marginBottom: '15px' }}>
              <input 
                type="text" 
                placeholder="🔍 Tìm kiếm theo tên, email hoặc SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }}
              />
            </div>

            {/* BẢNG DỮ LIỆU */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>ID</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Họ và Tên</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Email</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Vai trò</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '15px' }}>{user.id}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: '#1e293b' }}>{user.name}</td>
                      <td style={{ padding: '15px', color: '#64748b' }}>{user.email}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>
                        {user.role === 'admin' ? <span style={{color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '4px'}}>🔴 Admin</span> : 
                         user.role === 'teacher' ? <span style={{color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px'}}>🔵 Giáo viên</span> : 
                         <span style={{color: '#16a34a', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px'}}>🟢 Học viên</span>}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(user)} style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', color: '#334155' }}>Sửa</button>
                        <button onClick={() => handleDelete(user.id)} style={{ padding: '6px 12px', cursor: 'pointer', border: '1px solid #fca5a5', borderRadius: '4px', backgroundColor: '#fef2f2', color: '#dc2626' }}>Xóa</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Không tìm thấy người dùng nào!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* NẾU ĐANG CHỌN TAB QUẢN LÝ KHÓA HỌC */}
        {activeTab === 'courses' && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1e293b' }}>📚 Quản Lý Khóa Học</h2>
            <p style={{ color: '#64748b', fontSize: '18px' }}>Giao diện này đang được xây dựng.</p>
            <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>👉 (Khu vực này hãy giao cho Thành viên số 6 thiết kế)</p>
          </div>
        )}

        {/* NẾU ĐANG CHỌN TAB QUẢN LÝ BÀI GIẢNG */}
        {activeTab === 'lessons' && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1e293b' }}>🎬 Quản Lý Bài Giảng Video</h2>
            <p style={{ color: '#64748b', fontSize: '18px' }}>Giao diện này đang được xây dựng.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;