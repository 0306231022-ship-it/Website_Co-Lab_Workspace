"use client";
import { useParams } from 'next/navigation';
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';
import { useEffect, useState } from 'react';
import {socket} from '@/FUNCTION/socket';
import { useModalContext } from "@/context/QuanLiMoal";
type NguoiDung = {
    TENND: string,
    EMAIL: string,
    HINH_ANH: string,
    IDND: string,
    LOAIND: number
}

export default function NguoiDung() {
  const params = useParams();
  const id = params?.id;
  const [ThongTin, setThongTin] = useState<NguoiDung | null>(null);
  const [tenND, setTenND] = useState<string>("");
  const [matKhauCu, setMatKhauCu] = useState<string>("");
  const [matKhauMoi, setMatKhauMoi] = useState<string>("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const { OpenMoDal } = useModalContext();
  useEffect(() => {
    const fetchData = async () => {
     if (!id) {
          ThongBao.ThongBao_CanhBao('không kết nối!');
          return;
      }
      try {
          const laytt = await api.CallAPI(undefined, { PhuongThuc: 1, url: `/NguoiDung/kiemtra_dangnhap` });
          if (laytt.success) {
              setThongTin(laytt.dulieu);
              setTenND(laytt.dulieu.TENND);
          }
      } catch (error) {
          console.error("Lỗi xảy ra:", error);
      }
  };
  fetchData();
  }, [id]);
    useEffect(() => {
        socket.on('DangNhap', (item) => {
          setThongTin(item.ThongTinNguoiDung);
        });
        return () => {
          socket.off('DangNhap');
        };
    }, []);
  const handleThayAnh = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileAnh = files[0];
    const formData = new FormData();
    formData.append("files", fileAnh);
    try {
      const response = await api.CallAPI(formData, { 
        url: `/NguoiDung/ChinhSua_Anh`, 
        PhuongThuc: 1 
      });
      if (response.success) {
        ThongBao.ThongBao_ThanhCong(response.message || "Thay đổi ảnh đại diện thành công!");
      } else {
        ThongBao.ThongBao_Loi(response.message || "Cập nhật ảnh thất bại!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật ảnh:", error);
    }
  };

  // HÀM 2: ĐỔI MẬT KHẨU
  const handleDoiMatKhau = async () => {
    if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
      ThongBao.ThongBao_CanhBao("Vui lòng nhập đầy đủ các trường mật khẩu!");
      return;
    }

    if (matKhauMoi.length < 8) {
      ThongBao.ThongBao_CanhBao("Mật khẩu mới phải từ 8 ký tự trở lên!");
      return;
    }

    if (matKhauMoi !== xacNhanMatKhau) {
      ThongBao.ThongBao_Loi("Xác nhận mật khẩu mới không trùng khớp!");
      return;
    }

    try {
       const formData = new FormData();
       formData.append("MatKhauCu", matKhauCu);
       formData.append('MatKhauMoi',matKhauMoi);
       formData.append('XacNhanMatKhau' , xacNhanMatKhau);
      const response = await api.CallAPI(formData, { 
        url: `/NguoiDung/DoiMatKhau`, 
        PhuongThuc: 1 
      });
         if (response.validate) {
            setErrors(response.errors);
            ThongBao.ThongBao_CanhBao(response.message);
        }
      if (response.success) {
        ThongBao.ThongBao_ThanhCong(response.message || "Đổi mật khẩu thành công!");
        setMatKhauCu("");
        setMatKhauMoi("");
        setXacNhanMatKhau("");
      } else {
        ThongBao.ThongBao_Loi(response.message || "Mật khẩu hiện tại không chính xác!");
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
    }
  };


  const handleCapNhatHoSo = async () => {
    if (!tenND.trim()) {
      ThongBao.ThongBao_CanhBao("Họ và tên không được để trống!");
      return;
    }
    try {
         const formData = new FormData();
         formData.append("TENND", tenND);
        const response = await api.CallAPI(formData, { 
          url: `/NguoiDung/ChinhSua_thongTin`, 
          PhuongThuc: 1 
        });
      if (response.validate) {
        setErrors(response.errors);
        ThongBao.ThongBao_CanhBao(response.errors);
        return;
      }
      if (response.success) {
        ThongBao.ThongBao_ThanhCong(response.message || "Cập nhật hồ sơ thành công!");
      } else {
        ThongBao.ThongBao_Loi(response.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
    }
  };

  // 🌟 HÀM XỬ LÝ QUÊN MẬT KHẨU
  const handleQuenMatKhau = async () => {
    if (!ThongTin?.EMAIL) {
        ThongBao.ThongBao_Loi("Không tìm thấy địa chỉ email tài khoản!");
        return;
    }
    const XacNhan = await ThongBao.ThongBao_XacNhanTT(`Hệ thống sẽ gửi liên kết khôi phục mật khẩu tới email: ${ThongTin.EMAIL}. Bạn có muốn tiếp tục không?`);
    if(!XacNhan) return;
    try {
         const formData = new FormData();
         formData.append("Email", ThongTin.EMAIL);
         formData.append('TrangThai',String(2));
         const response = await api.CallAPI(formData, { 
            url: '/NguoiDung/XacThucOTP', 
            PhuongThuc: 1 
        });
        if (response.success) {
            //Mở modal quên mất khẩu
            OpenMoDal(undefined,{TenTrang:'QuenMatKhau'})
            ThongBao.ThongBao_ThanhCong(response.message || "Vui lòng kiểm tra email để đặt lại mật khẩu!");
        } else {
            ThongBao.ThongBao_Loi(response.message || "Gửi yêu cầu thất bại!");
        }
    } catch (error) {
        console.error("Lỗi quên mật khẩu:", error);
    }
  };

  return (
    // 🌟 THAY ĐỔI: Sử dụng w-full h-full p-8 để giao diện bung tràn toàn màn hình, không bị bóp hẹp chiều rộng
    <div className="w-full min-h-full p-8 space-y-6 bg-slate-50">
        
        {/* KHỐI HIỂN THỊ AVATAR VÀ THÔNG TIN TỔNG QUAN */}
        <div className="w-full bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="relative group">
                    <img src={`http://localhost:3001/${ThongTin?.HINH_ANH}`} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100"/>
                    <label className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <i className="fa-solid fa-camera text-xs mb-1"></i>Thay ảnh
                        <input type="file" accept="image/*" onChange={handleThayAnh} className="hidden"/>
                    </label>
                </div>
                <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h1 className="text-lg font-bold text-slate-900">{ThongTin?.TENND}</h1>
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-100">{ThongTin?.LOAIND === 1 ? 'Quản trị viên' : 'Thành viên'}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Mã số: <span className="font-mono text-slate-600">{ThongTin?.IDND}</span></p>
                </div>
            </div>
        </div>

        {/* FORM CẬP NHẬT THÔNG TIN HỒ SƠ */}
        <header className="w-full space-y-6">
            {/* THÔNG TIN CƠ BẢN */}
           {errors.length > 0 && (
  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
    <div className="flex items-center mb-2 font-semibold">
      {/* Icon cảnh báo (SVG) */}
      <svg className="mr-2 h-5 w-5 flex-shrink-0 text-red-800" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
      </svg>
      <span>Có lỗi xảy ra, vui lòng kiểm tra lại:</span>
    </div>
    
    <ul className="list-inside list-disc pl-2 space-y-1">
      {errors.map((err, index) => (
        <li key={index} className="font-medium">{err}</li>
      ))}
    </ul>
  </div>
)}
            <div className="w-full bg-white border border-slate-200/60 rounded-xl shadow-xs p-5 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Thông tin cơ bản</h3>
                        <p className="text-[11px] text-slate-400">Cập nhật thông tin định danh cá nhân của bạn trên hệ thống.</p>
                    </div>
                    <i className="fa-solid fa-id-card text-slate-300 text-lg"></i>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Họ và tên</label>
                        <input 
                          type="text" 
                          value={tenND} 
                          onChange={(e) => setTenND(e.target.value)}
                          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Địa chỉ Email</label>
                        <input type="email" value={ThongTin?.EMAIL || ""} disabled className="w-full text-xs font-medium bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-500 cursor-not-allowed"/>
                    </div>
                </div>
            </div>

            {/* NÚT XỬ LÝ HỒ SƠ */}
            <div className="flex items-center justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setTenND(ThongTin?.TENND || "")} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer">
                    Huỷ bỏ
                </button>
                <button type="button" onClick={handleCapNhatHoSo} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer">
                    <i className="fa-solid fa-floppy-disk"></i>
                    <span>Cập nhật hồ sơ</span>
                </button>
            </div>
        </header>

        {/* KHỐI ĐỔI MẬT KHẨU TÁCH BIỆT */}
        <header className="w-full bg-white border border-slate-200/60 rounded-xl shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Đổi mật khẩu</h3>
                    <p className="text-[11px] text-slate-400">Đảm bảo mật khẩu dài hơn 8 ký tự để bảo mật tài khoản tốt nhất.</p>
                </div>
                <i className="fa-solid fa-shield-keyhole text-slate-300 text-lg"></i>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={matKhauCu}
                      onChange={(e) => setMatKhauCu(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Mật khẩu mới</label>
                        <input 
                          type="password" 
                          placeholder="Nhập mật khẩu mới" 
                          value={matKhauMoi}
                          onChange={(e) => setMatKhauMoi(e.target.value)}
                          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Xác nhận mật khẩu mới</label>
                        <input 
                          type="password" 
                          placeholder="Nhập lại mật khẩu mới" 
                          value={xacNhanMatKhau}
                          onChange={(e) => setXacNhanMatKhau(e.target.value)}
                          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                        />
                    </div>
                </div>
                
                {/* 🌟 THAY ĐỔI: Khu vực nút điều hướng Đổi mật khẩu & Quên mật khẩu */}
                <div className="flex items-center justify-between pt-2">
                    {/* Nút Quên mật khẩu */}
                    <button 
                        type="button"
                        onClick={handleQuenMatKhau}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all cursor-pointer"
                    >
                        Quên mật khẩu hiện tại?
                    </button>
                    <button type="button" onClick={handleDoiMatKhau} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs cursor-pointer">
                        Đổi mật khẩu
                    </button>
                </div>
            </div>
        </header>
    </div>
  );
}