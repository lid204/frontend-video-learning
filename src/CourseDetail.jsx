import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Tích hợp thư viện theo yêu cầu 

const CourseDetail = ({ currentUser }) => {
  const handleEnroll = async () => {
    try {
      // Gọi API POST /api/enrollments 
      await axios.post("http://localhost:5000/api/enrollments", {
        user_id: currentUser?.id || 1, 
        course_id: 101 // ID khóa học ví dụ
      });
      
      // Hiện thông báo mượt mà thay vì alert() 
      toast.success("🎉 Cảm ơn bạn đã ghi danh!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi đăng ký rồi!");
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '15px' }}>
      <h1 style={{ color: '#0f172a' }}>Khóa học: Lập trình ReactJS cho Sigma</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Học xong là bao "mượt", tích hợp Toastify cực choáy! </p>
      <button 
        onClick={handleEnroll}
        style={{ padding: '15px 30px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Đăng ký khóa học 🚀
      </button>
    </div>
  );
};

export default CourseDetail;