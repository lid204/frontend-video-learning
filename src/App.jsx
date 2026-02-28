import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  // Đây là địa chỉ Backend Node.js của bạn đang chạy ở máy (localhost)
  const API_URL = 'https://backend-video-learning-qjf8bddka-lid204s-projects.vercel.app/api/users'; 

  // Tự động lấy danh sách user khi vừa mở web lên
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu. Nhớ bật Backend lên nhé!", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi bấm nút Thêm hoặc Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Nếu đang có ID tức là Sửa
        await axios.put(`${API_URL}/${editingId}`, formData);
        setEditingId(null);
      } else {
        // Nếu không có ID tức là Thêm mới
        await axios.post(API_URL, formData);
      }
      setFormData({ name: '', email: '', phone: '' }); // Xóa trắng form sau khi gửi
      fetchUsers(); // Tải lại bảng dữ liệu mới nhất
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
    }
  };

  // Hàm đưa dữ liệu lên Form để chuẩn bị Sửa
  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, phone: user.phone });
    setEditingId(user.id);
  };

  // Hàm Xóa user
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

      {/* Form nhập liệu */}
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

      {/* Bảng hiển thị dữ liệu */}
      <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#ecf0f1' }}>
            <th>ID</th>
            <th>Họ và Tên</th>
            <th>Email</th>
            <th>Điện thoại</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
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

export default App;