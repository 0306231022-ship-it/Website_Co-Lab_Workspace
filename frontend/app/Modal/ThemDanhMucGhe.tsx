"use client";
import React, { useState } from "react";
import * as ThongBao from "@/FUNCTION/ThongBao";
import * as api from "@/API/API";
import { useRouter } from "next/navigation";
import { useModalContext } from "@/context/QuanLiMoal";
export interface CreateDanhMucGheRequest {
  TEN_DANHMUC: string;
  TRANG_THAI: number;
}

export interface CreateDanhMucGheResponse {
  success?: boolean;
  validate?: boolean;
  errors?: string[];
  message?: string;
}

export default function ThemDanhMucGhe() {
  const router = useRouter();
   const {  CloseMoDal } = useModalContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string[]>([]);


  const [formData, setFormData] = useState<CreateDanhMucGheRequest>({
    TEN_DANHMUC: "",
    TRANG_THAI: 1,
  });


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setErr([]); 

    setFormData((prev) => ({
      ...prev,
      [name]: name === "TRANG_THAI" ? Number(value) : value,
    }));
  };

  
  const handleSubmit = async () => {
    setErr([]);

   
    if (!formData.TEN_DANHMUC.trim()) {
      ThongBao.ThongBao_Loi("Vui lòng nhập tên danh mục ghế!");
      return;
    }

    
    const submitData = new FormData();
    submitData.append("TEN_DANHMUC", formData.TEN_DANHMUC.trim());
    submitData.append("TRANG_THAI", String(formData.TRANG_THAI));

    setLoading(true);
    try {
      
      const res: CreateDanhMucGheResponse = await api.CallAPI(submitData, {
        url: "/admin/themdanhmucghe",
        PhuongThuc: 1,
      });

      if (res.validate) {
        setErr(res.errors || ["Dữ liệu không hợp lệ!"]);
        return;
      }

      
      if (res && res.success) {
        if (ThongBao.ThongBao_ThanhCong) {
          ThongBao.ThongBao_ThanhCong(
            res.message || "Thêm danh mục ghế mới thành công!",
          );
        } else {
          alert(res.message || "Thêm danh mục ghế mới thành công!");
        }

        
        router.push("/admin/danhmucghe");
        router.refresh();
      } else {
        ThongBao.ThongBao_Loi(
          res?.message || "Thêm danh mục thất bại. Vui lòng thử lại!",
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạo danh mục mới:", error);
      ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col flex-1">
        <div className="p-6 space-y-4 flex-1">
        
          {err && err.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <i className="fa-solid fa-triangle-exclamation"></i> Vui lòng
                kiểm tra lại:
              </p>
              <ul className="list-disc list-inside text-xs text-rose-600 font-medium space-y-0.5">
                {err.map((errorMsg, index) => (
                  <li key={index}>{errorMsg}</li>
                ))}
              </ul>
            </div>
          )}

         
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              Mã danh mục ghế (ID_DANHMUC)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value="Hệ thống tự động cấp phát"
                className="w-full text-xs font-sans font-bold px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 text-slate-400 rounded-xl cursor-not-allowed"
              />
              <span className="absolute right-3.5 text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <i className="fa-solid fa-key text-[9px]"></i> PK (int)
              </span>
            </div>
          </div>

        
          <div className="space-y-1.5">
            <label
              htmlFor="TEN_DANHMUC"
              className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1"
            >
              Tên danh mục ghế (TEN_DANHMUC){" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="TEN_DANHMUC"
              name="TEN_DANHMUC"
              required
              maxLength={255}
              value={formData.TEN_DANHMUC}
              onChange={handleChange}
              placeholder="Ví dụ: Ghế Công thái học Pro, Ghế Gaming..."
              className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>Nhập tên hiển thị phân loại loại ghế.</span>
              <span>{formData.TEN_DANHMUC.length}/255 ký tự</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
              Trạng thái hoạt động (TRANG_THAI)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value="1 - Cho phép hoạt động (Active)"
                className="w-full text-sm px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 text-slate-700 rounded-xl shadow-3xs font-semibold cursor-not-allowed"
              />
              <span className="absolute right-3.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                Mặc định
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block leading-normal">
              Danh mục mới thêm vào sẽ mặc định được kích hoạt và hiển thị trên
              sơ đồ đặt chỗ.
            </span>
          </div>
        </div>

       
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
             onClick={()=>{CloseMoDal()}}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600 transition-all shadow-md shadow-emerald-100 cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up mr-1.5"></i> Thêm danh
                mục
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
