"use client";
import React, { useState } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useModalContext } from "@/context/QuanLiMoal";
export default function VerifyEmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
    const { OpenMoDal } = useModalContext();
  const handleSubmit = async () => {
    if (!email.trim()) {
      ThongBao.ThongBao_CanhBao('Vui lòng nhập đầy đủ thông tin!');
      return; 
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Email', email);
      formData.append('TrangThai', String(1));
      const res = await api.CallAPI(formData, { url: '/NguoiDung/XacThucOTP', PhuongThuc: 1 });
      if(res.success){
        ThongBao.ThongBao_ThanhCong(res.message);
        OpenMoDal({ Email: email },{TenTrang:'formDangKy'});

      }else{
        ThongBao.ThongBao_Loi(res.message);
        return;
      }

      
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      ThongBao.ThongBao_CanhBao("Đã có lỗi hệ thống xảy ra!");
    } finally {
      setLoading(false); // Đảm bảo luôn tắt loading dù thành công hay thất bại
    }
  };

  return (
    /* Đổi từ <header> thành <form> để tận dụng sự kiện onSubmit và phím Enter */
    <div
      
      className="bg-white flex flex-col items-center justify-center max-w-sm w-full text-center relative z-10 mx-auto"
    >
      {/* Icon phong bì bay bổng */}
      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/10 mb-5 border border-blue-100">
        <i className="fa-solid fa-paper-plane animate-pulse"></i>
      </div>

      {/* Tiêu đề & Mô tả ngắn */}
      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
        Xác thực Email
      </h1>
      <p className="text-xs text-slate-500 mt-1.5 mb-6 font-medium px-2 leading-relaxed">
        Nhập địa chỉ email của bạn để nhận mã xác minh bảo mật (OTP) từ hệ thống.
      </p>

      {/* Input Nhập Email */}
      <div className="w-full mb-6">
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(37,99,235,0.06)] transition-all duration-300">
          <i className="fa-solid fa-envelope text-slate-400 mr-3.5 text-base"></i>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com" 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400 font-medium" 
            disabled={loading} // Khóa luôn input khi đang gửi dữ liệu
          />
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG NÚT BẤM (Xác thực & Hủy) */}
      <div className="flex gap-3 w-full">
        {/* Nút Hủy (Nằm bên trái, màu sắc nhẹ nhàng) */}
        <button 
          type="button" 
          disabled={loading}
          className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-bold py-3 rounded-2xl transition-all duration-200 text-sm cursor-pointer border border-transparent disabled:opacity-50"
        >
          Hủy bỏ
        </button>

        {/* Nút Xác thực (Nằm bên phải, màu Brand Blue nổi bật) */}
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/15 hover:shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner animate-spin"></i>
              Đang gửi...
            </>
          ) : (
            "Xác Thực"
          )}
        </button>
      </div>
    </div>
  );
}