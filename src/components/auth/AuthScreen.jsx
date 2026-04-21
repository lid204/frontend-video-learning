import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const inputStyle = { padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '15px', outline: 'none' };
const primaryBtnStyle = { padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const successBtnStyle = { ...primaryBtnStyle, backgroundColor: '#10b981' };

export default function AuthScreen({ onLoginSuccess, onBack }) {
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
  const API_URL = `${API_BASE_URL}/users`;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(API_URL);
      const userList = Array.isArray(response.data) ? response.data : [];
      const user = userList.find(u => u.email === loginForm.email && (!u.password || u.password === loginForm.password));

      if (!user) {
        alert('❌ Sai email hoặc mật khẩu!');
        return;
      }
      onLoginSuccess(user); // Trả user về cho App.js
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '90%', maxWidth: '420px', position: 'relative' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>
          🔙 Quay lại
        </button>
        <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
          <h2 style={{ color: '#0f172a', margin: 0 }}>{authMode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h2>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" placeholder="Email của bạn" required style={inputStyle} value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
            <input type="password" placeholder="Mật khẩu" required style={inputStyle} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
            <button type="submit" style={primaryBtnStyle}>Đăng Nhập 🚀</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Họ và tên" required style={inputStyle} value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
            <input type="email" placeholder="Email" required style={inputStyle} value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
            <input type="text" placeholder="Số điện thoại" required style={inputStyle} value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} />
            <input type="password" placeholder="Mật khẩu" required style={inputStyle} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
            <button type="submit" style={successBtnStyle}>Đăng Ký Ngay ✨</button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#64748b' }}>
          <span onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>
            {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  );
}