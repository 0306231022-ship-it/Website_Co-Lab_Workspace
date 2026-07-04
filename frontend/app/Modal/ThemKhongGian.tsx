"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import Image from "next/image";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";

function ThemKhongGian() {
  const router = useRouter();
const { idChiNhanh } = useParams();
  // --- 1. KHỞI TẠO CÁC BIẾN STATE ---
  const [tenKhongGian, setTenKhongGian] = useState<string>("");
  const [loaiKhongGian, setLoaiKhongGian] = useState<number>(1); // 1: Không gian chung, 0: Phòng cho thuê
  const [anhKhongGian, setAnhKhongGian] = useState<File | null>(null);
  
  const [previewUrl, setPreviewUrl] = useState<string>(""); // Xem trước ảnh
  const [errors, setErrors] = useState<string[]>([]); // Mảng quản lý lỗi validate
  const [loading, setLoading] = useState<boolean>(false);

  // --- 2. XỬ LÝ XEM TRƯỚC VÀ THAY ĐỔI ẢNH ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAnhKhongGian(file);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Xóa thông báo lỗi liên quan đến ảnh nếu có
      setErrors(prev => prev.filter(err => !err.includes("Hình ảnh")));
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // --- 3. HÀM KIỂM TRA VALIDATE DỮ LIỆU ĐẦU VÀO ---
  const validateForm = (): boolean => {
    const listErrors: string[] = [];

    if (!tenKhongGian.trim()) {
      listErrors.push("Tên không gian không được phép bỏ trống!");
    } else if (tenKhongGian.trim().length < 3) {
      listErrors.push("Tên không gian phải nhập tối thiểu từ 3 ký tự trở lên!");
    }

    if (!anhKhongGian) {
      listErrors.push("Hình ảnh không gian bắt buộc phải tải lên!");
    }

    if (!idChiNhanh) {
      listErrors.push("Không tìm thấy mã định danh chi nhánh (IDCN). Vui lòng quay lại trang trước!");
    }

    setErrors(listErrors);
    return listErrors.length === 0;
  };

  // --- 4. HÀM GỬI DỮ LIỆU LÊN SERVER DB (GỌI QUA EVENT CLICK) ---
  const handleActionSubmit = async () => {
   if (!validateForm()) {
      ThongBao.ThongBao_CanhBao("Vui lòng kiểm tra lại các thông tin nhập lỗi!");
      return;
    }
    try {
      setErrors([])
      setLoading(true);
      const formData = new FormData();
      formData.append("TenKhongGian", tenKhongGian.trim());
      formData.append("LoaiKG", loaiKhongGian.toString());
      formData.append("IDCN", String(idChiNhanh));
      formData.append("file", anhKhongGian!);

      const res = await api.CallAPI(formData, {
        url: "/admin/ThemKhongGian",
        PhuongThuc: 1 
      });
       if(res.validate){
        setErrors(res.errors);
      }
      if (res.success) {
        ThongBao.ThongBao_ThanhCong(res.message);
        setTenKhongGian("");
        setLoaiKhongGian(1);
        setAnhKhongGian(null);
        setPreviewUrl("");
        setErrors([]);
        
      } else {
        ThongBao.ThongBao_Loi(res.message || "Tạo không gian thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khởi tạo không gian:", error);
      ThongBao.ThongBao_Loi("Có lỗi hệ thống xảy ra khi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden my-6">
      
      {/* KHUNG HIỂN THỊ MẢNG LỖI TẬP TRUNG */}
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

      <div className="p-6 space-y-6">
        
        {/* Input: Tên không gian */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
            Tên không gian <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
              <i className="fa-solid fa-font text-sm"></i>
            </span>
            <input 
              type="text" 
              value={tenKhongGian}
              onChange={(e) => {
                setTenKhongGian(e.target.value);
                setErrors(prev => prev.filter(err => !err.includes("Tên không gian")));
              }}
              placeholder="Ví dụ: Khu vực Creative Zone, Phòng họp M2..." 
              className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal ${
                errors.some(err => err.includes("Tên không gian"))
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              }`}
            />
          </div>
        </div>

        {/* Input: Loại không gian */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
            Loại không gian <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chon 1: Không gian chung */}
            <div 
              onClick={() => setLoaiKhongGian(1)}
              className={`relative flex items-start p-4 rounded-xl border bg-white cursor-pointer transition-all hover:border-indigo-300 ${
                loaiKhongGian === 1 ? "border-indigo-600 bg-indigo-50/30" : "border-gray-200"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border shrink-0 transition-colors ${
                loaiKhongGian === 1 ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 text-gray-500 border-gray-100"
              }`}>
                <i className="fa-solid fa-users-viewfinder"></i>
              </div>
              <div className="ml-3 pr-4 flex flex-col">
                <span className={`text-sm font-bold transition-colors ${loaiKhongGian === 1 ? "text-indigo-900" : "text-gray-700"}`}>Không gian chung</span>
                <span className={`text-[11px] mt-0.5 leading-snug ${loaiKhongGian === 1 ? "text-indigo-600/80" : "text-gray-400"}`}>Khu vực mở, chỗ ngồi linh hoạt, vãng lai</span>
              </div>
              {loaiKhongGian === 1 && (
                <div className="absolute top-4 right-4 text-indigo-600 text-xs">
                  <i className="fa-solid fa-circle-check text-sm"></i>
                </div>
              )}
            </div>

            {/* Chon 2: Phòng cho thuê */}
            <div 
              onClick={() => setLoaiKhongGian(0)}
              className={`relative flex items-start p-4 rounded-xl border bg-white cursor-pointer transition-all hover:border-purple-300 ${
                loaiKhongGian === 0 ? "border-purple-600 bg-purple-50/30" : "border-gray-200"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border shrink-0 transition-colors ${
                loaiKhongGian === 0 ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 text-gray-500 border-gray-100"
              }`}>
                <i className="fa-solid fa-door-open"></i>
              </div>
              <div className="ml-3 pr-4 flex flex-col">
                <span className={`text-sm font-bold transition-colors ${loaiKhongGian === 0 ? "text-purple-900" : "text-gray-700"}`}>Phòng cho thuê</span>
                <span className={`text-[11px] mt-0.5 leading-snug ${loaiKhongGian === 0 ? "text-purple-600/80" : "text-gray-400"}`}>Phòng họp, văn phòng riêng, khép kín</span>
              </div>
              {loaiKhongGian === 0 && (
                <div className="absolute top-4 right-4 text-purple-600 text-xs">
                  <i className="fa-solid fa-circle-check text-sm"></i>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input: Hình ảnh + Khu vực Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
            Hình ảnh không gian <span className="text-red-500">*</span>
          </label>
          
          <div className={`relative border-2 border-dashed rounded-xl p-5 bg-gray-50/50 hover:bg-white transition-all flex flex-col items-center justify-center text-center group min-h-[220px] overflow-hidden ${
            errors.some(err => err.includes("Hình ảnh")) 
              ? "border-red-400 hover:border-red-500" 
              : "border-gray-200 hover:border-indigo-500"
          }`}>
            
            {previewUrl ? (
              <div className="absolute inset-0 w-full h-full z-10">
                <Image 
                  src={previewUrl}
                  alt="Xem trước không gian"
                  fill
                  unoptimized
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 text-white transition-opacity duration-200 cursor-pointer">
                  <i className="fa-solid fa-images text-xl"></i>
                  <p className="text-xs font-bold">Bấm vào nút bên dưới để đổi ảnh khác</p>
                </div>
              </div>
            ) : (
              <>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300 border ${
                  errors.some(err => err.includes("Hình ảnh"))
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-indigo-50 text-indigo-600 border-indigo-100"
                }`}>
                  <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                </div>
                <p className="text-xs font-bold text-gray-800 mb-1">Click vào nút bên dưới để chọn hình ảnh</p>
                <p className="text-[11px] text-gray-400 mb-4">Định dạng hỗ trợ: JPG, PNG, WEBP (Hệ thống chỉ nhận 1 ảnh)</p>
              </>
            )}

            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="text-xs text-gray-500 font-medium max-w-full relative z-20
                file:mr-3 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:rounded-lg
                file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:transition-colors file:cursor-pointer
                focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3 shrink-0">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition cursor-pointer"
        >
          Hủy bỏ
        </button>
        <button 
          type="button" 
          disabled={loading}
          onClick={handleActionSubmit}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-bold rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center cursor-pointer"
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner animate-spin mr-2 text-xs"></i> Đang xử lý...
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus mr-2 text-xs"></i> Khởi tạo ngay
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default ThemKhongGian;