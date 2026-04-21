import React, { useState } from 'react';
import UserManager from './UserManager';
import CourseManager from './CourseManager';
import AdminDashboard from './AdminDashboard';

const dangerBtnStyle = { padding: '14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const menuItem = { padding: '16px 20px', cursor: 'pointer', borderRadius: '12px', color: '#cbd5e1', fontSize: '15px', fontWeight: '500' };
const activeMenuItem = { ...menuItem, backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold' };
const analyticsMenuItem = { ...menuItem, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 'bold' };

export default function AdminLayout({ currentUser, onLogout, onNavigateHome, onGoToLearning }) {
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'admin' ? 'users' : 'courses');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* SIDEBAR */}
      <div style={{ width: '280px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>E-LEARNING</div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'inline-block' }}>
            👤 {currentUser?.name || 'Người dùng'}
          </div>
        </div>

        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Menu Quản Lý</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li onClick={onNavigateHome} style={{ ...menuItem, backgroundColor: 'rgba(255,255,255,0.05)' }}>🏠 Về Trang Chủ</li>
            {currentUser?.role === 'admin' && (
              <li onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeMenuItem : menuItem}>👥 Người dùng</li>
            )}
            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
              <>
                <li onClick={() => setActiveTab('analytics')} style={activeTab === 'analytics' ? analyticsMenuItem : menuItem}>📊 Analytics</li>
                <li onClick={() => setActiveTab('courses')} style={activeTab === 'courses' ? activeMenuItem : menuItem}>📚 Khóa học</li>
              </>
            )}
          </ul>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onLogout} style={{ ...dangerBtnStyle, width: '100%' }}>🚪 Đăng Xuất</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ flex: 1, padding: activeTab === 'analytics' ? '0' : '40px', overflowY: 'auto' }}>
        {activeTab === 'users' && currentUser?.role === 'admin' && <UserManager />}
        {activeTab === 'courses' && <CourseManager onGoToLearning={onGoToLearning} />}
        {activeTab === 'analytics' && <AdminDashboard />}
      </div>
    </div>
  );
}