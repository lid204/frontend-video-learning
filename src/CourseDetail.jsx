import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; 

const CourseDetail = ({ currentUser }) => {
  const handleEnroll = async () => {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://backend-video-learning.vercel.app/api/enrollments',
        data: {
          user_id: 15, 
          course_id: 101
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast.success("🎉 Cảm ơn bạn đã ghi danh!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
      
      console.log("Đăng ký thành công nè ní:", response.data);

    } catch (err) {
      console.error("Lỗi đăng ký rồi:", err.response?.data || err.message);
      
      toast.error(err.response?.data?.error || "Lỗi đăng ký rồi!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '15px' }}>
      <h1 style={{ color: '#0f172a' }}>Khóa học: Lập trình ReactJS cho Sigma</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Học xong là bao "mượt", tích hợp Toastify cực choáy! </p>
      <button 
        onClick={handleEnroll}
        style={{ 
          padding: '15px 30px', 
          backgroundColor: '#10b981', 
          color: 'white', 
          border: 'none', 
          borderRadius: '10px', 
          fontWeight: 'bold', 
          cursor: 'pointer',
          transition: '0.3s'
        }}
        onMouseOver={(e) => e.target.style.opacity = '0.8'}
        onMouseOut={(e) => e.target.style.opacity = '1'}
      >
        Đăng ký khóa học 🚀
      </button>
    </div>
  );
};

export default CourseDetail;