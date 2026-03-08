import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- ĐÂY LÀ PHẦN GIAO DIỆN QUẢN LÝ USER CỦA BẠN (Được đổi tên thành UsersPage) ---
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  // Nhớ thay link này bằng link Vercel Backend chuẩn của bạn nhé
  const API_URL = 'https://backend-video-learning-qjf8bddka-lid204s-projects.vercel.app/api/users'; 

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ name: '', email: '', phone: '' }); 
      fetchUsers(); 
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
    }
  };

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, phone: user.phone });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Lỗi xóa dữ liệu:", error);
      }
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Quản Lý Người Dùng - PoC Đồ Án</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <input type="text" name="name" placeholder="Họ và tên" value={formData.name} onChange={handleInputChange} required style={{ padding: '8px' }}/>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required style={{ padding: '8px' }}/>
        <input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleInputChange} required style={{ padding: '8px' }}/>
        <button type="submit" style={{ padding: '8px 15px', backgroundColor: editingId ? '#f39c12' : '#27ae60', color: 'white', border: 'none', cursor: 'pointer' }}>
          {editingId ? 'Cập nhật' : 'Thêm Mới'}
        </button>
        {editingId && (
          <button type="button" onClick={() => {setEditingId(null); setFormData({name: '', email: '', phone: ''})}} style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}>
            Hủy
          </button>
        )}
      </form>
      <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#ecf0f1' }}>
            <th>ID</th><th>Họ và Tên</th><th>Email</th><th>Điện thoại</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td><td>{user.name}</td><td>{user.email}</td><td>{user.phone}</td>
              <td>
                <button onClick={() => handleEdit(user)} style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer' }}>Sửa</button>
                <button onClick={() => handleDelete(user.id)} style={{ padding: '5px 10px', cursor: 'pointer', color: 'red' }}>Xóa</button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chưa có dữ liệu. Hãy thêm người dùng mới!</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- ĐÂY LÀ PHẦN CẤU HÌNH LINK THEO ĐÚNG YÊU CẦU CỦA THẦY ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Khi vào trang chủ, tự động chuyển hướng sang /users */}
        <Route path="/" element={<Navigate to="/users" replace />} />
        
        {/* Đường dẫn BASE_FE/users sẽ hiển thị giao diện */}
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;