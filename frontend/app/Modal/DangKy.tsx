"use client";
import React, { useState } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useModalContext } from "@/context/QuanLiMoal";
interface objChiNhanh {
  Email: string;
}

type DangKyProps = {
  DuLieu?: objChiNhanh; 
  onClose?: () => void;
};

export function DangKy({ DuLieu, onClose }: DangKyProps) {
  const [loading, setLoading] = useState(false);
  const [HoTen,setHoTen] = useState<string>('');
  const [MatKhau,setMatKhau] = useState<string>('');
  const [XacNhan,setXacNhan] = useState<string>('');
  const [OTP,setOTP] = useState<string>();
  const { OpenMoDal } = useModalContext();
  const [err, setErr] = useState<string[]>([]);

  const handleSubmit = async () => {
    if(HoTen===""||MatKhau===""||XacNhan===""||OTP===null){
        ThongBao.ThongBao_CanhBao('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    if(MatKhau!==XacNhan){
        ThongBao.ThongBao_CanhBao('Mật khẩu và xác nhận mật khẩu không khớp!');
        return;
    }
    alert(XacNhan)
    const formData = new FormData();
    formData.append('Email', String(DuLieu?.Email));
    formData.append('MatKhau' , MatKhau);
    formData.append('XacNhanMatKhau', XacNhan);
    formData.append('TenND' , HoTen);
    formData.append('OTP' ,String(OTP));
    setLoading(true);
    try {
      const res = await api.CallAPI(formData, { url: '/NguoiDung/DangKy', PhuongThuc: 1 });
      if(res.success){
        ThongBao.ThongBao_ThanhCong(res.message);
        //OpenMoDal(undefined,{TenTrang:'DangNhap'})
      }
      if(res.validate){
        setErr(res.errors);
        return;
      }
      if(res.success===false){
        ThongBao.ThongBao_Loi(res.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Đã loại bỏ div full-screen bao ngoài để vừa khít khung Modal */
    <div
    
      className="bg-white flex flex-col items-center justify-center max-w-md w-full text-center relative z-10 mx-auto"
    >
      {/* Tiêu đề */}
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        Hoàn tất đăng ký
      </h1>
      <p className="text-xs text-slate-500 mt-2 mb-6 font-medium">
        Điền thông tin cá nhân và mã OTP được gửi tới <span className="text-blue-600 font-semibold">{DuLieu?.Email || "email của bạn"}</span>
      </p>
      {err && err.length > 0 && (
  <div className="w-full mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-left animate-fadeIn">
    {/* Tiêu đề vùng lỗi */}
    <div className="flex items-center gap-2 text-red-600 font-semibold text-sm mb-2">
      <i className="fa-solid fa-triangle-exclamation"></i>
      <span>Vui lòng kiểm tra lại thông tin:</span>
    </div>
    
  <ul className="list-disc list-inside space-y-1">
  {err.map((item, index) => (
    <li
      key={index}
      className="text-xs text-red-500 font-medium leading-relaxed"
    >
     {item}
    </li>
  ))}
</ul>
  </div>
)}

      {/* Input Họ Tên */}
      <div className="w-full mb-4">
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(37,99,235,0.06)] transition-all duration-300">
          <i className="fa-solid fa-user text-slate-400 mr-3.5 text-base"></i>
          <input 
            name="regName" 
            type="text" 
            placeholder="Họ và tên của bạn" 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400 font-medium" 
           onChange={(e)=>{setHoTen(e.target.value)}}
           value={HoTen}
          />
        </div>
      </div>

      {/* Input Mật khẩu */}
      <div className="w-full mb-4">
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(37,99,235,0.06)] transition-all duration-300">
          <i className="fa-solid fa-lock text-slate-400 mr-3.5 text-base"></i>
          <input 
            name="regPassword" 
            type="password" 
            placeholder="Mật khẩu bảo mật" 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400 font-medium" 
             onChange={(e)=>{setMatKhau(e.target.value)}}
           value={MatKhau}
          />
        </div>
      </div>

      {/* Input Xác nhận Mật khẩu */}
      <div className="w-full mb-4">
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(37,99,235,0.06)] transition-all duration-300">
          <i className="fa-solid fa-shield text-slate-400 mr-3.5 text-base"></i>
          <input 
            name="regConfirmPassword" 
            type="password" 
            placeholder="Xác nhận mật khẩu" 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400 font-medium" 
             onChange={(e)=>{setXacNhan(e.target.value)}}
           value={XacNhan}
          />
        </div>
      </div>

      {/* Input Mã OTP */}
      <div className="w-full mb-6">
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(37,99,235,0.06)] transition-all duration-300">
          <i className="fa-solid fa-key text-slate-400 mr-3.5 text-base"></i>
          <input 
            name="regOTP" 
            type="text" 
            maxLength={6}
            placeholder="Nhập 6 số OTP xác thực" 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400 font-bold tracking-widest" 
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/\D/g, "");
              setOTP(onlyDigits);
            }}
            value={OTP}
          />
        </div>
      </div>

      {/* Nút Đăng Ký */}
      <button 
        type="button"
        onClick={handleSubmit} 
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/15 hover:shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:bg-blue-400"
      >
        {loading ? "Đang xử lý..." : "Kích Hoạt Tài Khoản"}
      </button>

      {/* Link đóng/quay lại */}
      <p className="text-xs text-slate-400 mt-5 font-medium">
        Nhập sai email?{" "}
        <button 
          type="button"
          onClick={onClose}
          className="text-blue-600 hover:text-blue-700 font-bold transition-colors duration-200 bg-transparent border-none cursor-pointer outline-none ml-1"
        >
          Quay lại bước trước
        </button>
      </p>
    </div>
  );
}

export default DangKy;