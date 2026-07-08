"use client";
import React, { useState } from "react";
import { useModalContext } from "@/context/QuanLiMoal";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useRouter } from 'next/navigation';
export function DangNhap() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string[]>([]);
  const [email,setemail] = useState<string>();
  const [MatKhau,setMatKhau] = useState<string>();
  const { OpenMoDal , CloseMoDal , CloseAllModals } = useModalContext();
  const router = useRouter();
  const handleSubmit = async () => {
    setLoading(true)
    if(email==="" ||MatKhau===""){
        ThongBao.ThongBao_CanhBao('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    const formdata = new FormData();
    formdata.append('Email' , String(email));
    formdata.append('MatKhau' ,String(MatKhau));
    try {
        const DangNhap = await api.CallAPI(formdata,{url:`/NguoiDung/DangNhap` , PhuongThuc:1});
        if(DangNhap.validate){
            setErr(DangNhap.errors);
            return;
        }
        if(!DangNhap.success){
            ThongBao.ThongBao_Loi(DangNhap.message);
            return;
        }else{
          console.log(DangNhap.ThongTin_NguoiDung)
            if(DangNhap.ThongTin_NguoiDung===1){
                router.push('/admin'); 
            }
            CloseAllModals();
            ThongBao.ThongBao_ThanhCong(DangNhap.message);
            return;
        }
    } catch (error) {
         console.error("Lỗi gửi email:", error);
        ThongBao.ThongBao_CanhBao("Đã có lỗi hệ thống xảy ra!");
    } finally {
        setLoading(false)
    }
  };
  const DangKy=()=>{
     CloseMoDal();
     OpenMoDal({TrangThai:1}, { TenTrang: 'DangKy', TieuDe: 'Đăng ký thành viên', icon: 'fa-solid fa-user-plus' })
  }


  return (
    <header className="bg-white flex flex-col items-center justify-center max-w-md w-full text-center relative z-10 mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Chào mừng quay trở lại</h1>
      <p className="text-xs text-slate-500 mt-2 mb-6 font-medium"> Đăng nhập để tiếp tục làm việc cùng Co-lab Workspace</p>
      {err && err.length > 0 && (
        <div className="w-full mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-left animate-pulse">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-xs mb-1.5">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Thông tin đăng nhập không hợp lệ:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {err.map((item, index) => (
              <li key={index} className="text-[11px] text-red-500 font-medium">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input Email */}
      <div className="w-full mb-4">
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(37,99,235,0.06)] transition-all duration-300">
          <i className="fa-solid fa-envelope text-slate-400 mr-3.5 text-base"></i>
          <input 
            name="loginEmail" 
            type="email" 
            placeholder="Địa chỉ email của bạn" 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400 font-medium" 
            onChange={(e)=>{setemail(e.target.value)}}
            value={email}
          />
        </div>
      </div>

      {/* Input Mật khẩu */}
      <div className="w-full mb-4">
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(37,99,235,0.06)] transition-all duration-300">
          <i className="fa-solid fa-lock text-slate-400 mr-3.5 text-base"></i>
          <input 
            name="loginPassword" 
            type="password" 
            placeholder="Mật khẩu tài khoản" 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400 font-medium" 
            onChange={(e)=>{setMatKhau(e.target.value)}}
            value={MatKhau}
          />
        </div>
      </div>

      {/* Ghi nhớ đăng nhập & Quên mật khẩu */}
      <div className="flex items-center justify-between w-full mb-6 text-xs font-medium">
        <label className="flex items-center gap-2 text-slate-500 hover:text-slate-700 cursor-pointer select-none">
          <input 
            type="checkbox" 
            name="rememberMe"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-transparent cursor-pointer"
          />
          Ghi nhớ tôi
        </label>
        <button 
          type="button"
          onClick={()=>{ OpenMoDal({TrangThai:2}, { TenTrang: 'DangKy', TieuDe: 'Quên mật khẩu', icon: 'fa-solid fa-user-plus'})}}
          className="text-blue-600 hover:text-blue-700 font-semibold bg-transparent border-none cursor-pointer outline-none"
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* Nút Đăng Nhập */}
      <button 
        type="button" 
        disabled={loading}
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/15 hover:shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:bg-blue-400"
      >
        {loading ? "Đang kiểm tra..." : "Đăng Nhập Hệ Thống"}
      </button>

      {/* Điều hướng sang Đăng ký */}
      <p className="text-xs text-slate-400 mt-5 font-medium">
        Chưa có tài khoản số?{" "}
        <button 
          type="button"
          onClick={DangKy}
          className="text-blue-600 hover:text-blue-700 font-bold transition-colors duration-200 bg-transparent border-none cursor-pointer outline-none ml-1"
        >
          Đăng ký ngay
        </button>
      </p>
    </header>
  );
}

export default DangNhap;