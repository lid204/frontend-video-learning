import React, { useState } from 'react';

const Payment = ({ totalAmount, onPaymentSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Gọi API VietQR tạo mã thanh toán động cực xịn cho lúc Demo
  const bankId = 'MB'; // Ngân hàng MB Bank
  const accountNo = '0123456789'; // Số tài khoản (Có thể thay số thật của bạn)
  const accountName = 'NGUYEN KHAC NHU'; // Tên thật của Tư lệnh để biểu diễn
  const addInfo = 'Thanh toan khoa hoc ELearning';
  
  // Link API tự động render ảnh QR
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.jpg?amount=${totalAmount}&addInfo=${addInfo}&accountName=${accountName}`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Giả lập thời gian chờ ngân hàng xử lý 2 giây cho giống thật
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000); 
  };

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        
        <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '26px' }}>Thanh Toán Quét Mã</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Mở App Ngân hàng bất kỳ để quét mã QR</p>

        {/* Khung chứa mã QR */}
        <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '16px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
          <img 
            src={qrUrl} 
            alt="Mã QR Thanh toán" 
            style={{ width: '100%', borderRadius: '12px', mixBlendMode: 'multiply' }} 
          />
        </div>

        {/* Thông tin đơn hàng */}
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

        {/* Các nút thao tác */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={handleSimulatePayment} 
            disabled={isProcessing}
            style={{ padding: '14px', backgroundColor: isProcessing ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: '0.3s' }}
          >
            {isProcessing ? '⏳ Đang xử lý giao dịch...' : '✅ Đã chuyển khoản xong (Demo)'}
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