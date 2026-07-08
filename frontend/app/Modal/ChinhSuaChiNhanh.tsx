"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import { objChiNhanh } from "@/interface/ChiNhanh";

function ChinhSuaChiNhanh({ DuLieu }: { DuLieu: objChiNhanh }) {
  // --- KHỞI TẠO CÁC BIẾN STATE TRỰC TIẾP TỪ PROPS ---
  const [tenChiNhanh, setTenChiNhanh] = useState<string>(DuLieu?.TEN_CHI_NHANH || "");
  const [diaChi, setDiaChi] = useState<string>(DuLieu?.DIA_CHI || "");
  const [errors, setErrors] = useState<string[]>([]);
  const [anhChiNhanh, setAnhChiNhanh] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    DuLieu?.HINHANH ? `http://localhost:3001/${DuLieu.HINHANH}` : ""
  );

  const [trangThai, setTrangThai] = useState<number>(DuLieu?.TRANG_THAI ?? 1);
  
  // Định dạng lại thời gian ban đầu từ DB sang dạng YYYY-MM-DDTHH:mm để hiển thị trên HTML5 input
  const formatDateTimeLocal = (dateStr: string | undefined | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [thoiGianApDung, setThoiGianApDung] = useState<string>(
    formatDateTimeLocal(String(DuLieu?.NGAY_CAP_NHAT))
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [minDateTime, setMinDateTime] = useState<string>("");

  // Cập nhật mốc thời gian hiện tại liên tục để chặn input HTML (Format: YYYY-MM-DDTHH:mm)
  useEffect(() => {
    const updateMinTime = () => {
      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
      setMinDateTime(localISOTime);
    };
    updateMinTime();
    const interval = setInterval(updateMinTime, 60000); // Cập nhật mỗi phút
    return () => clearInterval(interval);
  }, []);

  // Hàm xử lý khi click đổi trạng thái: Xóa trắng giờ cũ để ép nhập giờ mới
  const handleTrangThaiChange = (status: number) => {
    setTrangThai(status);
    if (status !== DuLieu.TRANG_THAI) {
      setThoiGianApDung(""); // Ép buộc chọn thời gian mới hoàn toàn
    } else {
      setThoiGianApDung(formatDateTimeLocal(String(DuLieu?.NGAY_CAP_NHAT))); // Trả về ban đầu nếu đổi ý quay lại trạng thái gốc
    }
  };

  // Xử lý khi chọn ảnh mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAnhChiNhanh(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Thu hồi URL tạm thời để tránh tràn RAM
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // --- HÀM GỬI DỮ LIỆU LÊN SERVER ---
  const handleUpdateChiNhanh = async () => {
    if (!DuLieu.ID_CHI_NHANH) {
      ThongBao.ThongBao_CanhBao("Thiếu mã định danh chi nhánh (IDCN)!");
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      let coCapNhat = false;

      // 🟩 NHÓM 1: Cập nhật Tên và Địa chỉ
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
        
        const resNhom1 = await api.CallAPI(formData, { url: "/admin/CapNhat_thongTinMem", PhuongThuc: 1 });
        if (resNhom1.validate) {
          setErrors(resNhom1.errors);
          setLoading(false);
          return;
        }
        if (!resNhom1.success) {
          ThongBao.ThongBao_Loi("Lỗi cập nhật thông tin: " + resNhom1.message);
          setLoading(false);
          return;
        }
        ThongBao.ThongBao_ThanhCong(resNhom1.message);
        coCapNhat = true;
      }

      // 🟦 NHÓM 2: Cập nhật Hình ảnh
      if (anhChiNhanh !== null) {
        const formData = new FormData();
        formData.append("IDCN", String(DuLieu.ID_CHI_NHANH));
        formData.append("file", anhChiNhanh);
        
        const resNhom2 = await api.CallAPI(formData, { url: "/admin/ChinhSua_HinhAnh", PhuongThuc: 1 });
        if (!resNhom2.success) {
          ThongBao.ThongBao_Loi("Lỗi cập nhật hình ảnh: " + resNhom2.message);
          setLoading(false);
          return;
        }
        ThongBao.ThongBao_ThanhCong(resNhom2.message);
        coCapNhat = true;
      }

      // 🟨 NHÓM 3: Cập nhật Trạng thái vận hành (Bắt buộc kiểm tra thời gian nếu thay đổi trạng thái)
      if (trangThai !== DuLieu.TRANG_THAI) {
        // 1. Kiểm tra bắt buộc điền
        if (!thoiGianApDung) {
          ThongBao.ThongBao_CanhBao("Vui lòng thiết lập thời gian áp dụng cho trạng thái mới!");
          setLoading(false);
          return;
        }

        // 2. Kiểm tra thời gian không được nhỏ hơn thời gian hiện tại
        const selectedTime = new Date(thoiGianApDung).getTime();
        const currentTime = new Date().getTime();
        
        // Thêm biên độ sai số nhỏ (khoảng 5-10 giây) để tránh lỗi lệch giây khi bấm nút gửi
        if (selectedTime < currentTime - 10000) {
          ThongBao.ThongBao_CanhBao("Thời gian áp dụng lệnh không được nhỏ hơn thời gian hiện tại!");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("IDCN", String(DuLieu.ID_CHI_NHANH));
        formData.append("TrangThai", String(trangThai));
        formData.append("ThoiGianApDung", thoiGianApDung);

        const resNhom3 = await api.CallAPI(formData, { url: "/admin/CapNhat_TrangThai", PhuongThuc: 1 });
        if (resNhom3.validate) {
          setErrors(resNhom3.errors);
          setLoading(false);
          return;
        }
        if (!resNhom3.success) {
          ThongBao.ThongBao_Loi("Lỗi cập nhật trạng thái: " + resNhom3.message);
          setLoading(false);
          return;
        }
        ThongBao.ThongBao_ThanhCong(resNhom3.message);
        coCapNhat = true;
      }

      if (!coCapNhat) {
        ThongBao.ThongBao_CanhBao("Bạn chưa thay đổi thông tin nào!");
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
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
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Trạng thái chi nhánh</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Hoạt động */}
            <div
              onClick={() => handleTrangThaiChange(1)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                trangThai === 1 ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-black ${trangThai === 1 ? "text-emerald-700" : "text-gray-400"}`}>HOẠT ĐỘNG</span>
                <span className="text-[10px] text-gray-400">Mở cửa đón khách đặt lịch</span>
              </div>
              {trangThai === 1 && <i className="fa-solid fa-circle-check text-emerald-500 text-sm"></i>}
            </div>

            {/* Ngưng hoạt động */}
            <div
              onClick={() => handleTrangThaiChange(0)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                trangThai === 0 ? "border-red-500 bg-red-50/10" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-black ${trangThai === 0 ? "text-red-600" : "text-gray-400"}`}>NGƯNG HOẠT ĐỘNG</span>
                <span className="text-[10px] text-gray-400">Đóng cửa toàn bộ chi nhánh</span>
              </div>
              {trangThai === 0 && <i className="fa-solid fa-circle-xmark text-red-500 text-sm"></i>}
            </div>
          </div>
        </div>

        {/* CHỈ HIỂN THỊ Ô THỜI GIAN KHI ADMIN THỰC SỰ THAY ĐỔI TRẠNG THÁI KHÁC VỚI BAN ĐẦU */}
        {trangThai !== DuLieu.TRANG_THAI && (
          <div className={`p-4 rounded-xl border border-dashed transition-all animate-fadeIn ${
            trangThai === 1 ? "bg-emerald-50/20 border-emerald-300" : "bg-red-50/20 border-red-300"
          }`}>
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
              trangThai === 1 ? "text-emerald-800" : "text-red-800"
            }`}>
              <i className="fa-regular fa-calendar-check mr-1.5 text-sm"></i>
              Thời gian bắt đầu áp dụng lệnh chuyển trạng thái này
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                trangThai === 1 ? "text-emerald-500/60" : "text-red-500/60"
              }`}>
                <i className="fa-regular fa-clock text-xs"></i>
              </span>
              <input
                type="datetime-local"
                value={thoiGianApDung}
                min={minDateTime}
                onChange={(e) => setThoiGianApDung(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-xs font-bold text-gray-800 focus:outline-none transition-all ${
                  trangThai === 1 ? "border-emerald-200 focus:border-emerald-500" : "border-red-200 focus:border-red-500"
                }`}
              />
            </div>
            <p className={`mt-2 text-[10px] font-medium ${trangThai === 1 ? "text-emerald-600" : "text-red-600"}`}>
              <i className="fa-solid fa-circle-info mr-1"></i>
              {trangThai === 1 
                ? "Lên lịch mở cửa hoạt động lại: Hệ thống sẽ tự động mở cổng đặt chỗ của chi nhánh đúng giờ này." 
                : "Lên lịch tạm đóng cửa: Vui lòng đảm bảo sau khung giờ này chi nhánh không còn lịch khách đặt."
              }
            </p>
          </div>
        )}
      </div>

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