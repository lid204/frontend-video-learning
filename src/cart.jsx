import React from 'react';

const Cart = ({ cartItems, onRemoveItem, onCheckout, onBack }) => {
  // Tính tổng tiền giỏ hàng
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Nút quay lại & Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <button onClick={onBack} style={backBtnStyle}>
            🔙 Tiếp tục tìm khóa học
          </button>
          <h2 style={{ fontSize: '28px', color: '#0f172a', margin: '0 0 0 20px' }}>
            🛒 Giỏ hàng của bạn
          </h2>
        </div>

        {cartItems.length === 0 ? (
          // Trạng thái giỏ hàng trống
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🪹</div>
            <h3 style={{ color: '#64748b', fontSize: '20px' }}>Giỏ hàng đang trống</h3>
            <p style={{ color: '#94a3b8', marginTop: '10px' }}>Hãy khám phá thêm các khóa học tuyệt vời nhé!</p>
            <button onClick={onBack} style={{ ...primaryBtnStyle, marginTop: '20px' }}>Khám phá ngay</button>
          </div>
        ) : (
          // Trạng thái có hàng
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* Cột trái: Danh sách khóa học */}
            <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {cartItems.map((item, index) => (
                <div key={index} style={cartItemStyle}>
                  <div style={{ width: '120px', height: '80px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={item.thumbnail_url || 'https://via.placeholder.com/150'} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>{item.title}</h4>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>
                      {Number(item.price).toLocaleString()} VNĐ
                    </span>
                  </div>
                  <button onClick={() => onRemoveItem(item.id)} style={deleteBtnStyle}>
                    ❌ Xóa
                  </button>
                </div>
              ))}
            </div>

            {/* Cột phải: Tổng kết đơn hàng */}
            <div style={{ width: '300px', backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>Tổng thanh toán</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#64748b' }}>
                <span>Số lượng:</span>
                <span style={{ fontWeight: 'bold' }}>{cartItems.length} khóa học</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '20px', color: '#0f172a' }}>
                <span style={{ fontWeight: 'bold' }}>Tổng cộng:</span>
                <span style={{ color: '#ef4444', fontWeight: '900' }}>{totalPrice.toLocaleString()} đ</span>
              </div>
              <button onClick={onCheckout} style={{ ...successBtnStyle, width: '100%', padding: '15px' }}>
                💳 Thanh toán ngay
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles ---
const backBtnStyle = { padding: '10px 15px', backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const cartItemStyle = { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const primaryBtnStyle = { padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const successBtnStyle = { ...primaryBtnStyle, backgroundColor: '#10b981' };
const deleteBtnStyle = { padding: '8px 12px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' };

export default Cart;