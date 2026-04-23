import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const inputStyle = { padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '15px', outline: 'none' };
const primaryBtnStyle = { padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const successBtnStyle = { ...primaryBtnStyle, backgroundColor: '#10b981' };
const warningBtnStyle = { ...primaryBtnStyle, backgroundColor: '#f59e0b' };
const dangerBtnStyle = { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const neutralBtnStyle = { padding: '8px 16px', backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', marginRight: '5px' };
const thStyle = { padding: '20px', textAlign: 'left' };
const tdStyle = { padding: '20px' };

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'student' });
  const API_URL = `${API_BASE_URL}/users`;

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách user:', err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

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
    setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', role: user?.role || 'student' });
    setEditingId(user?.id || null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Bạn có chắc muốn xóa vĩnh viễn?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUsers();
    } catch (err) {
      alert('❌ Lỗi khi xóa!');
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();
    return (user?.name || '').toLowerCase().includes(keyword) || (user?.email || '').toLowerCase().includes(keyword);
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#0f172a', fontSize: '28px', marginBottom: '30px' }}>Quản Lý Người Dùng</h2>
      
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <form onSubmit={handleSubmitAdmin} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input style={{ ...inputStyle, flex: 1 }} type="text" placeholder="Họ và tên" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input style={{ ...inputStyle, flex: 1 }} type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input style={{ ...inputStyle, flex: 1 }} type="text" placeholder="Số điện thoại" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <select style={inputStyle} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="student">Học viên</option>
            <option value="teacher">Giáo viên</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" style={editingId ? warningBtnStyle : successBtnStyle}>{editingId ? 'Cập Nhật' : 'Lưu Mới'}</button>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <input type="text" placeholder="Tìm user theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={thStyle}>ID</th><th style={thStyle}>Người dùng</th><th style={thStyle}>Vai trò</th><th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>#{user.id}</td>
                <td style={tdStyle}><div style={{ fontWeight: 'bold' }}>{user.name}</div><small>{user.email}</small></td>
                <td style={tdStyle}>{user.role}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <button onClick={() => handleEdit(user)} style={neutralBtnStyle}>Sửa</button>
                  <button onClick={() => handleDelete(user.id)} style={dangerBtnStyle}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
