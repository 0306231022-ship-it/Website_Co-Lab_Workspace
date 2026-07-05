"use client";
import React, { useState } from "react";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import Image from "next/image";
function ThemChiNhanh() {
  const [tenChiNhanh, setTenChiNhanh] = useState<string>("");
  const [diaChi, setDiaChi] = useState<string>("");
  const [anhChiNhanh, setAnhChiNhanh] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const previewUrl = anhChiNhanh ? URL.createObjectURL(anhChiNhanh) : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setAnhChiNhanh(e.target.files[0]);
    }
  };

  const guiDuLieu = async () => {
    if (!tenChiNhanh.trim() || !diaChi.trim() || !anhChiNhanh) {
      ThongBao.ThongBao_CanhBao("Vui lòng điền đầy đủ thông tin và chọn ảnh!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("TenCN", tenChiNhanh.trim());
      formData.append("DiaChi", diaChi.trim());
      formData.append("file", anhChiNhanh);
      const res = await api.CallAPI(formData, {
        url: "/admin/ThemChiNhanh", 
        PhuongThuc: 1 
      });
      if(res.validate){
        setErrors(res.errors);
      }
      if (res.success) {
        ThongBao.ThongBao_ThanhCong("Thêm chi nhánh mới thành công!");
        setTenChiNhanh("");
        setDiaChi("");
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setAnhChiNhanh(null); 
      } else {
        ThongBao.ThongBao_Loi(res.message || "Thêm chi nhánh thất bại.");
      }
    } catch (error) {
      console.error(error);
      ThongBao.ThongBao_Loi("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
          <div className=" space-y-5">
            {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1">
            <p className="text-sm font-bold text-red-700 flex items-center gap-1.5 mb-2">
              <i className="fa-solid fa-triangle-exclamation"></i> Phát hiện {errors.length} lỗi cần sửa:
            </p>
            <ul className="list-disc list-inside text-xs text-red-600 font-medium space-y-1 pl-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên chi nhánh <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={tenChiNhanh}
                onChange={(e) => setTenChiNhanh(e.target.value)}
                placeholder="VD: Co-Lab Quận 1" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-medium"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Địa chỉ <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
                placeholder="VD: 123 Nguyễn Đình Chiểu, Phường 6, Quận 1, TP. HCM" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-medium"
              />
            </div>

            {/* Khung hiển thị ảnh */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh chi nhánh đại diện <span className="text-red-500">*</span></label>
              
              <label className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:border-indigo-500 transition-all flex flex-col items-center justify-center text-center cursor-pointer group min-h-[180px] overflow-hidden">
                
                {previewUrl ? (
                  <div className="absolute inset-0 w-full h-full">
                    <Image
                      src={previewUrl} 
                      alt="Preview chi nhánh"
                        width={500}
                     height={192}
                     unoptimized 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white">
                      <i className="fa-solid fa-pen-to-square text-lg"></i>
                      <span className="text-xs font-bold">Thay đổi ảnh khác</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 border border-indigo-100">
                      <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                    </div>
                    <p className="text-xs font-bold text-gray-800 mb-1">Click vào đây để chọn ảnh</p>
                    <p className="text-[11px] text-gray-400">Hỗ trợ: JPG, PNG, WEBP</p>
                  </>
                )}

                <input 
                  type="file" 
                  onChange={handleFileChange}
                  accept="image/*" 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button type="button" className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition">Hủy bỏ</button>
            <button 
              type="button" 
              onClick={guiDuLieu}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-bold rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center"
            >
              <i className={loading ? "fa-solid fa-spinner animate-spin mr-2" : "fa-solid fa-check mr-2"}></i> 
              {loading ? "Đang lưu..." : "Lưu Chi nhánh"}
            </button>
          </div>
    </>
  );
}

export default ThemChiNhanh;