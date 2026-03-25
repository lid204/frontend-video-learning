import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  
  // Đã thêm 'role' vào state mặc định
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'student' });
  const [editingId, setEditingId] = useState(null);

  const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api/users";

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
      // Reset form bao gồm cả role
      setFormData({ name: '', email: '', phone: '', role: 'student' });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert("❌ Lỗi thao tác!");
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    // Kéo cả role lên form khi bấm sửa
    setFormData({ name: user.name, email: user.email, phone: user.phone, role: user.role || 'student' });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("⚠️ Bạn có chắc muốn xóa người dùng này?");
    if (confirmDelete) {
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

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#1a365d' }}>Quản Lý Người Dùng - PoC Đồ Án</h2>

      {/* KHU VỰC FORM */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input 
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          type="text" placeholder="Họ và tên" required
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
        />
        <input 
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          type="email" placeholder="Email" required
          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
        />
        <input 
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          type="text" placeholder="Số điện thoại" required
          value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
        />
        
        {/* DROPDOWN CHỌN VAI TRÒ */}
        <select 
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
          value={formData.role} 
          onChange={(e) => setFormData({...formData, role: e.target.value})}
        >
          <option value="student">Học viên</option>
          <option value="teacher">Giáo viên</option>
          <option value="admin">Quản trị viên</option>
        </select>

        <button 
          onClick={handleSubmit}
          style={{ padding: '9px 15px', background: editingId ? '#f59e0b' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {editingId ? "Cập Nhật" : "Thêm Mới"}
        </button>

        {editingId && (
          <button onClick={cancelEdit} style={{ padding: '9px 15px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Hủy
          </button>
        )}
      </div>

      {/* KHU VỰC BẢNG */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Họ và Tên</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Vai trò</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.id}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.name}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
              
              {/* HIỂN THỊ VAI TRÒ CÓ MÀU SẮC */}
              <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                {user.role === 'admin' ? <span style={{color: '#dc2626'}}>🔴 Admin</span> : 
                 user.role === 'teacher' ? <span style={{color: '#2563eb'}}>🔵 Giáo viên</span> : 
                 <span style={{color: '#16a34a'}}>🟢 Học viên</span>}
              </td>

              <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                <button onClick={() => handleEdit(user)} style={{ marginRight: '8px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: '#f9fafb' }}>
                  Sửa
                </button>
                <button onClick={() => handleDelete(user.id)} style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #fca5a5', borderRadius: '4px', color: '#dc2626', background: '#fef2f2' }}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;