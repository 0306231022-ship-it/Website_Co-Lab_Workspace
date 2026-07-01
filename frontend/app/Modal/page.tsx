"use client";
import React, { useState } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useModalContext } from "@/context/QuanLiMoal";



export default function VerifyEmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string[]>([]);
  const { OpenMoDal , CloseMoDal } = useModalContext();

  const handleSubmit = async () => {
  
    if (!email.trim()) {
      ThongBao.ThongBao_CanhBao('Vui lòng nhập đầy đủ thông tin!');
      return; 
    }

    setLoading(true);
    setErr([]); // Reset lỗi trước khi gửi dữ liệu mới
    
    try {
      const formData = new FormData();
      formData.append('Email', email);
      formData.append('TrangThai', String(1));
      
      const res = await api.CallAPI(formData, { url: '/NguoiDung/XacThucOTP', PhuongThuc: 1 });
      
      if (res && res.validate) {
         setErr(res.errors || ["Thông tin nhập vào không hợp lệ."]);
         return;
      }
      
      if (res && res.success) {
        ThongBao.ThongBao_ThanhCong(res.message);
        OpenMoDal({ Email: email }, { TenTrang: 'formDangKy', TieuDe: 'Hoàn tất đăng ký' });
      } else {
        ThongBao.ThongBao_Loi(res?.message || "Yêu cầu xác thực thất bại.");
        return;
      }
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      ThongBao.ThongBao_CanhBao("Đã có lỗi hệ thống xảy ra!");
    } finally {
      setLoading(false);
    }
  };
  const DangNhap=()=>{
    CloseMoDal();
    OpenMoDal(null, { TenTrang: 'DangNhap', TieuDe: 'Đăng nhập', icon: 'fa-solid fa-user-plus' })
  }

  return (
    <header
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

      {/* ================= HỘP HIỂN THỊ MẢNG LỖI VALIDATE MỚI ================= */}
      {err && err.length > 0 && (
        <div className="w-full mb-5 p-3.5 bg-red-50 border border-red-200/60 rounded-2xl text-left animate-fadeIn">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-xs mb-1.5">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Vui lòng xử lý các lỗi sau:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {err.map((item, index) => (
              <li key={index} className="text-[11px] text-red-500 font-medium leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

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
            disabled={loading}
            required
          />
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG NÚT BẤM (Xác thực & Hủy) */}
      <div className="flex gap-3 w-full mb-5">
        {/* Nút Hủy */}
        <button 
          type="button" 
          onClick={()=>{CloseMoDal()}}
          disabled={loading}
          className="flex-1 bg-slate-100 hover:bg-slate-200/80 disabled:opacity-50 text-slate-600 font-bold py-3 rounded-2xl transition-all duration-200 text-sm cursor-pointer border border-transparent"
        >
          Hủy bỏ
        </button>

        {/* Nút Xác thực */}
        <button 
          type="button"
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

      {/* Chuyển hướng phụ đưa xuống đáy form */}
      <p className="text-xs text-slate-400 font-medium">
        Có tài khoản số?{" "}
        <button 
          type="button"
          onClick={DangNhap}
          className="text-blue-600 hover:text-blue-700 font-bold transition-colors duration-200 bg-transparent border-none cursor-pointer outline-none ml-0.5"
        >
          Đăng nhập ngay
        </button>
      </p>
    </header>
  );
}