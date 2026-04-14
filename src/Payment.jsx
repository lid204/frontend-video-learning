import React, { useState } from 'react';
import axios from 'axios';

// Thêm prop currentUser và cartItems để lấy dữ liệu gửi cho Backend
const Payment = ({ currentUser, cartItems, totalAmount, onPaymentSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const bankId = 'MB'; 
  const accountNo = '0123456789'; 
  const accountName = 'NGUYEN KHAC NHU'; 
  const addInfo = `Thanh toan khoa hoc`;
  
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.jpg?amount=${totalAmount}&addInfo=${addInfo}&accountName=${accountName}`;

  // Hàm gọi API thật lên Backend
  const handleRealPayment = async () => {
    if (!currentUser) {
      alert("⚠️ Vui lòng đăng nhập để thanh toán!");
      return;
    }

    setIsProcessing(true);

    try {
      // Gọi link API Vercel thật của nhóm (Nhớ dùng đúng link đang chạy)
      const API_URL = "https://backend-video-learning-lid204s-projects.vercel.app/api";
      
      const response = await axios.post(`${API_URL}/checkout`, {
        user_id: currentUser.id,
        cartItems: cartItems
      });

      alert("🎉 " + response.data.message);
      onPaymentSuccess(); // Quay về trang chủ và xóa giỏ hàng
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi kết nối đến máy chủ thanh toán!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        
        <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '26px' }}>Thanh Toán Quét Mã</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Mở App Ngân hàng bất kỳ để quét mã QR</p>

        <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '16px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
          <img src={qrUrl} alt="Mã QR" style={{ width: '100%', borderRadius: '12px', mixBlendMode: 'multiply' }} />
        </div>

        <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '12px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#475569' }}>Chủ tài khoản:</span>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{accountName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#475569' }}>Số tiền cần thanh toán:</span>
            <span style={{ fontWeight: '900', color: '#ef4444', fontSize: '18px' }}>
              {totalAmount.toLocaleString()} VNĐ
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Nút thanh toán giờ gọi hàm gọi API thật */}
          <button 
            onClick={handleRealPayment} 
            disabled={isProcessing}
            style={{ padding: '14px', backgroundColor: isProcessing ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: '0.3s' }}
          >
            {isProcessing ? '⏳ Đang xác nhận hệ thống...' : '✅ Đã chuyển khoản xong'}
          </button>
          
          <button 
            onClick={onCancel} 
            disabled={isProcessing}
            style={{ padding: '14px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
          >
            Hủy giao dịch
          </button>
        </div>

      </div>
    </div>
  );
};

export default Payment;
