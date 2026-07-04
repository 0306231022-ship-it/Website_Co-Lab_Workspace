"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import { objChiNhanh } from "@/interface/ChiNhanh";
function ChinhSuaChiNhanh({DuLieu}:{DuLieu : objChiNhanh}) {

  // --- KHỞI TẠO CÁC BIẾN STATE LƯU THÔNG TIN ĐỂ SỬA ---
  const [tenChiNhanh, setTenChiNhanh] = useState<string>("");
  const [diaChi, setDiaChi] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [anhChiNhanh, setAnhChiNhanh] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // State xem trước ảnh mới

  const [trangThai, setTrangThai] = useState<number>(2);
  const [tgBatDau, setTgBatDau] = useState<string>("");
  const [tgKetThuc, setTgKetThuc] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  

  // Xử lý khi người dùng chọn ảnh mới để thay đổi ảnh đại diện
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAnhChiNhanh(file);
      setPreviewUrl(URL.createObjectURL(file)); // Cập nhật URL xem trước thời gian thực
    }
  };

  // Thu hồi URL giả lập tránh rò rỉ bộ nhớ RAM
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== DuLieu.HINHANH) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, DuLieu.HINHANH]);

  // --- HÀM GỬI DỮ LIỆU LÊN SERVER QUA 3 ENDPOINT URL KHÁC NHAU ---
  const handleUpdateChiNhanh = async () => {
    if (!DuLieu.ID_CHI_NHANH) {
      ThongBao.ThongBao_CanhBao("Thiếu mã định danh chi nhánh (IDCN)!");
      return;
    }

    setLoading(true);
    try {
      // 🟩 NHÓM 1: Cập nhật Tên và Địa chỉ (Gửi JSON)
      if (tenChiNhanh.trim() !== DuLieu.TEN_CHI_NHANH || diaChi.trim() !== DuLieu.DIA_CHI) {
        if (!tenChiNhanh.trim() || !diaChi.trim()) {
          ThongBao.ThongBao_CanhBao("Tên chi nhánh và Địa chỉ không được để trống!");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("TenCN", tenChiNhanh.trim());
        formData.append("DiaChi", diaChi.trim());
        formData.append("IDCN", String(DuLieu.ID_CHI_NHANH));
        const resNhom1 = await api.CallAPI(formData,{ url: "/admin/CapNhat_thongTinMem", PhuongThuc: 1 });
        if(resNhom1.validate){
            setErrors(resNhom1.errors);
            setLoading(false)
            return;
        }
        if(resNhom1.success){
            ThongBao.ThongBao_ThanhCong(resNhom1.message);
            setLoading(false)
            return;
        }
        if (!resNhom1.success) {
          ThongBao.ThongBao_Loi("Lỗi cập nhật tên/địa chỉ: " + resNhom1.message);
          setLoading(false);
          return;
        }
      }
      if (anhChiNhanh !== null) {
        const formData = new FormData();
        formData.append("IDCN", String(DuLieu.ID_CHI_NHANH));
        formData.append("file", anhChiNhanh);
        const resNhom2 = await api.CallAPI(formData, {url: "/admin/ChinhSua_HinhAnh",PhuongThuc: 1});
        if(resNhom2.success){
            ThongBao.ThongBao_ThanhCong(resNhom2.message);
            setLoading(false)
            return;
        }
        if (!resNhom2.success) {
          ThongBao.ThongBao_Loi(resNhom2.message);
          setLoading(false);
          return;
        }
      }

      // 🟨 NHÓM 3: Cập nhật Trạng thái vận hành & Lịch bảo trì (Gửi JSON)
      if (
        trangThai !== DuLieu.TRANG_THAI ||
        tgBatDau !== String(DuLieu.NGAY_BAO_TRI) ||
        tgKetThuc !== String(DuLieu.NGAY_XONG)
      ) {
        // Nếu chọn trạng thái Chỉnh sửa (2) thì bắt buộc nhập thời gian bảo trì
        if (trangThai === 2 && (!tgBatDau || !tgKetThuc)) {
          ThongBao.ThongBao_CanhBao("Vui lòng thiết lập đầy đủ thời gian bảo trì!");
          setLoading(false);
          return;
        }
         const formData = new FormData();
        formData.append("IDCN", String(DuLieu.ID_CHI_NHANH));
        formData.append("TrangThai", String(trangThai));
        formData.append('NgayBatDau' , String(tgBatDau))
        formData.append('NgayKetThuc' ,String(tgKetThuc))
        const resNhom3 = await api.CallAPI(formData,{ url: "/admin/CapNhat_TrangThai", PhuongThuc: 1 });
        if(resNhom3.validate){
            setErrors(resNhom3.errors);
            setLoading(false)
            return;
        }
          if(resNhom3.success){
            ThongBao.ThongBao_ThanhCong(resNhom3.message);
            setLoading(false)
            return;
        }
        if (!resNhom3.success) {
          ThongBao.ThongBao_Loi("Lỗi cập nhật trạng thái vận hành: " + resNhom3.message);
          setLoading(false);
          return;
        }
      }
    
    } catch (error) {
      console.error("Lỗi cập nhật chi nhánh:", error);
      ThongBao.ThongBao_Loi("Lỗi kết nối hệ thống máy chủ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 my-6">
       {errors.length > 0 && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
            <i className="fa-solid fa-triangle-exclamation text-sm"></i> Phát hiện {errors.length} lỗi cần điều chỉnh:
          </p>
          <ul className="list-disc list-inside text-xs text-red-600 font-semibold space-y-1 pl-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {/* 🟩 NHÓM 1: THÔNG TIN CƠ BẢN */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tên chi nhánh</label>
          <input 
            type="text" 
            value={tenChiNhanh} 
            onChange={(e) => setTenChiNhanh(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Địa chỉ chi tiết</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
              <i className="fa-solid fa-location-dot text-sm"></i>
            </span>
            <input 
              type="text" 
              value={diaChi} 
              onChange={(e) => setDiaChi(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* 🟦 NHÓM 2: HÌNH ẢNH ĐẠI DIỆN */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ảnh chi nhánh đại diện</label>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-50 shadow-sm relative">
            {previewUrl && (
              <Image 
                src={previewUrl} 
                alt="Ảnh xem trước" 
                fill 
                unoptimized
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div className="flex-1">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium
                file:mr-3 file:py-2.5 file:px-4 file:border-0 file:text-xs file:font-bold 
                file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            />
            <p className="mt-1.5 text-[10px] text-gray-400 font-medium">
              <i className="fa-solid fa-circle-info mr-1"></i>Bỏ trống nếu giữ nguyên ảnh cũ. Hỗ trợ: JPG, PNG, WEBP.
            </p>
          </div>
        </div>
      </div>

      {/* 🟨 NHÓM 3: TRẠNG THÁI VẬN HÀNH */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Trạng thái vận hành</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Trạng thái 1: Hoạt động */}
          <div 
            onClick={() => setTrangThai(1)}
            className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
              trangThai === 1 ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200 hover:border-emerald-400 bg-white"
            }`}
          >
            <div className="flex flex-col">
              <span className={`text-xs font-black tracking-tight ${trangThai === 1 ? "text-emerald-700" : "text-gray-400"}`}>HOẠT ĐỘNG</span>
              <span className="text-[10px] text-gray-400">Sẵn sàng đón khách</span>
            </div>
            <div className={`ml-auto ${trangThai === 1 ? "text-emerald-500" : "text-gray-200"}`}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>

          {/* Trạng thái 2: Chỉnh sửa / Bảo trì */}
          <div 
            onClick={() => setTrangThai(2)}
            className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
              trangThai === 2 ? "border-amber-500 bg-amber-50/30" : "border-slate-200 hover:border-amber-400 bg-white"
            }`}
          >
            <div className="flex flex-col">
              <span className={`text-xs font-black tracking-tight ${trangThai === 2 ? "text-amber-700" : "text-gray-400"}`}>CHỈNH SỬA</span>
              <span className="text-[10px] text-amber-600 opacity-70">Đang bảo trì...</span>
            </div>
            <div className={`ml-auto ${trangThai === 2 ? "text-amber-500" : "text-gray-200"}`}>
              <i className="fa-solid fa-circle-dot"></i>
            </div>
          </div>

          {/* Trạng thái 0: Ngưng hoạt động */}
          <div 
            onClick={() => setTrangThai(0)}
            className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
              trangThai === 0 ? "border-red-500 bg-red-50/10" : "border-slate-200 hover:border-red-400 bg-white"
            }`}
          >
            <div className="flex flex-col">
              <span className={`text-xs font-black tracking-tight ${trangThai === 0 ? "text-red-600" : "text-gray-400"}`}>NGƯNG HĐ</span>
              <span className="text-[10px] text-gray-400">Tạm thời đóng cửa</span>
            </div>
            <div className={`ml-auto ${trangThai === 0 ? "text-red-400" : "text-gray-200"}`}>
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
          </div>
        </div>
      </div>

      {/* KHU VỰC THIẾT LẬP THỜI GIAN BẢO TRÌ (CHỈ HIỂN THỊ KHI TRẠNG THÁI === 2) */}
      {trangThai === 2 && (
        <div className="border border-amber-200 rounded-xl bg-amber-50/20 p-4 space-y-4 animate-fadeIn">
          <div className="flex items-start space-x-3 text-amber-800">
            <i className="fa-solid fa-triangle-exclamation text-base mt-0.5 shrink-0 text-amber-600"></i>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wide text-amber-900">Điều kiện chuyển trạng thái</h4>
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Hệ thống chỉ chấp nhận kích hoạt bảo trì chỉnh sửa khi chi nhánh <span className="font-bold underline">không có khách hàng nào đang thuê hoặc đặt lịch trước</span> trong khung giờ này.
              </p>
            </div>
          </div>

          <div className="p-3 bg-white border border-amber-200/60 rounded-xl flex items-center justify-between shadow-3xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                <i className="fa-solid fa-user-clock"></i>
              </div>
              <span className="text-xs font-bold text-gray-600">Đơn đặt chỗ cuối cùng kết thúc lúc:</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-gray-900 bg-gray-100 px-2 py-1 rounded">17/06/2026 21:00</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-100">
            <div>
              <label className="block text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1.5">Thời gian bắt đầu bảo trì</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-600/60 pointer-events-none">
                  <i className="fa-regular fa-calendar-plus text-xs"></i>
                </span>
                <input 
                  type="datetime-local" 
                  value={tgBatDau}
                  onChange={(e) => setTgBatDau(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1.5">Dự kiến hoàn thành</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-600/60 pointer-events-none">
                  <i className="fa-regular fa-calendar-check text-xs"></i>
                </span>
                <input 
                  type="datetime-local" 
                  value={tgKetThuc}
                  onChange={(e) => setTgKetThuc(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THÔNG TIN AUDIT LOG */}
      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-3">
        <i className="fa-solid fa-clock-rotate-left text-slate-400 text-sm"></i>
        <p className="text-[11px] text-slate-500 font-medium italic">Cập nhật lần cuối bởi Admin vào: 14/06/2026 14:30</p>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3 -mx-6 -mb-6">
        <button 
          type="button" 
          className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition cursor-pointer"
        >
          Hủy bỏ
        </button>
        <button 
          type="button" 
          disabled={loading}
          onClick={handleUpdateChiNhanh}
          className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-200 flex items-center cursor-pointer"
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner animate-spin mr-2"></i> Đang cập nhật...
            </>
          ) : (
            <>
              <i className="fa-solid fa-rotate mr-2"></i> Cập nhật ngay
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default ChinhSuaChiNhanh;