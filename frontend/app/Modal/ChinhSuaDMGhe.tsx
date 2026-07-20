"use client";
import React, { useState } from "react";
import * as ThongBao from "@/FUNCTION/ThongBao";
import * as api from "@/API/API";
import { useRouter } from "next/navigation";
import { useModalContext } from "@/context/QuanLiMoal";
interface UpdateDanhMucGheRequest {
  id: number;
  ten: string;
  trangthai: number;
}

interface ChinhsuadmgheProps {
  DuLieu: UpdateDanhMucGheRequest;
  onClose?: () => void;
}

export default function Chinhsuadmghe({ DuLieu, onClose }: ChinhsuadmgheProps) {
  const router = useRouter();
   const {  CloseMoDal } = useModalContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string[]>([]);

 
  const [formData, setFormData] = useState<UpdateDanhMucGheRequest>({
    id: Number(DuLieu?.id) || 0,
    ten: DuLieu?.ten || "",
    trangthai: DuLieu?.trangthai !== undefined ? Number(DuLieu.trangthai) : 1,
  });


  const [prevDuLieu, setPrevDuLieu] = useState<UpdateDanhMucGheRequest>(DuLieu);

  if (DuLieu && (DuLieu.id !== prevDuLieu?.id || DuLieu.ten !== prevDuLieu?.ten || DuLieu.trangthai !== prevDuLieu?.trangthai)) {
    setPrevDuLieu(DuLieu);
    setFormData({
      id: Number(DuLieu.id) || 0,
      ten: DuLieu.ten || "",
      trangthai: DuLieu.trangthai !== undefined ? Number(DuLieu.trangthai) : 1,
    });
  }

 
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setErr([]);
    setFormData((prev) => ({
      ...prev,
      [name]: name === "trangthai" || name === "id" ? Number(value) : value,
    }));
  };

 
  const handleSubmit = async () => {
    setErr([]);
    if (!formData.ten.trim()) {
      ThongBao.ThongBao_Loi?.("Vui lòng nhập tên danh mục ghế!");
      return;
    }
    const submitData = new FormData();
    submitData.append("ID_DANHMUC", String(formData.id));
    submitData.append("TEN_DANHMUC", formData.ten.trim());
    submitData.append("TRANG_THAI", String(formData.trangthai));
    setLoading(true);
    try {
      const res = await api.CallAPI(submitData, {
        url: "/admin/capnhatdanhmucghe",
        PhuongThuc: 1,
      });

      if (res.validate) {
        setErr(res.errors || ["Dữ liệu không hợp lệ!"]);
        return;
      }

      if (res && res.success) {
        ThongBao.ThongBao_ThanhCong?.(
          res.message || "Cập nhật danh mục ghế thành công!",
        );
        onClose?.();
        router.refresh();
      } else {
        ThongBao.ThongBao_Loi?.(
          res?.message || "Cập nhật thất bại. Vui lòng thử lại!",
        );
      }
    } catch (error) {
      console.error(" Lỗi khi cập nhật danh mục:", error);
      ThongBao.ThongBao_Loi?.("Đã xảy ra lỗi kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {err && err.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
          <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
            <i className="fa-solid fa-triangle-exclamation"></i> Vui lòng kiểm tra lại:
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
          Mã danh mục (ID_DANHMUC)
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            name="id"
            value={formData.id}
            className="w-full text-xs font-mono font-bold px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed tracking-wider"
          />
          <span className="absolute right-3.5 text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded font-sans flex items-center gap-1">
            <i className="fa-solid fa-lock text-[9px]"></i> PK
          </span>
        </div>
      </div>

     
      <div className="space-y-1.5">
        <label
          htmlFor="ten"
          className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1"
        >
          Tên danh mục ghế <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="ten"
          name="ten"
          required
          maxLength={255}
          value={formData.ten}
          onChange={handleChange}
          disabled={loading}
          placeholder="Nhập tên danh mục ghế..."
          className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-semibold text-slate-800 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>

    
      <div className="space-y-1.5">
        <label
          htmlFor="trangthai"
          className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1"
        >
          Trạng thái hoạt động
        </label>
        <select
          id="trangthai"
          name="trangthai"
          value={formData.trangthai}
          onChange={handleChange}
          disabled={loading}
          className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-medium text-slate-700 cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value={1}>1 - Cho phép hoạt động (Active)</option>
          <option value={0}>0 - Tạm khóa / Bảo trì (Inactive)</option>
        </select>
      </div>

      
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
        <button
          type="button"
           onClick={()=>{CloseMoDal()}}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-100 transition-all flex items-center justify-center min-w-[130px] cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5"></span>
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-check mr-1.5"></i> Lưu thay đổi
            </>
          )}
        </button>
      </div>
    </div>
  );
}