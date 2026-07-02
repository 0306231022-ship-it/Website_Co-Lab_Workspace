'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function UserConfirmCheckIn() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room_id') || "Chưa xác định";

  const handleActionCheckIn = async () => {
    try {
      // Thay đổi URL này thành URL API Backend thực tế của bạn (Node.js/Python)
      // Nhớ dùng IP thay vì localhost để điện thoại gọi được tới máy tính
      const response = await fetch('http://192.168.1.15:5000/api/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          room_id: roomId,
          user_id: "CURRENT_USER_ID" // Thay bằng ID của user đang đăng nhập (nếu có)
        })
      });

      const result = await response.json();
      if (result.success) {
        alert("Bạn đã Check-in khung giờ thành công vào hệ thống!");
      } else {
        alert("Check-in thất bại: " + result.message);
      }
    } catch (error) {
      alert("Không thể kết nối tới Server. Hãy chắc chắn bạn đã bật đúng Wi-Fi!");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h3 style={{ marginTop: '40px' }}>XÁC NHẬN VÀO KHÔNG GIAN</h3>
      <p style={{ color: '#555' }}>Bạn đang thực hiện check-in cho: <b>{roomId}</b></p>
      
      {/* NÚT BẤM CHECK-IN THEO YÊU CẦU CỦA BẠN */}
      <button
        onClick={handleActionCheckIn}
        style={{
          marginTop: '30px',
          padding: '15px 40px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: '#0070f3',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '300px'
        }}
      >
        NHẤN ĐỂ CHECK-IN
      </button>
    </div>
  );
}