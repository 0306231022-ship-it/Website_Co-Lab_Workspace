"use client";
import React, { useState, useEffect } from "react";
import * as ThongBao from "@/FUNCTION/ThongBao";
import * as api from "@/API/API";
import { useRouter } from "next/navigation";
import { DanhMucGhe } from "@/interface/DanhMucGhe";
export interface CreateGiaRequest {
  TEN_GIA: string;
  MOTA?: string;
  DON_GIA: number;
  DANHMUC_GHE: number;
}

export interface CreateGiaResponse {
  success: boolean;
  message: string;
}

export default function ThemGiaMoi() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string[]>([]);
      const [DanhMuc, setdanhmuc] = useState<DanhMucGhe[]>([]);
  const [formData, setFormData] = useState<CreateGiaRequest>({
    TEN_GIA: "",
    MOTA: "",
    DON_GIA: 0,
    DANHMUC_GHE: 1,
  });
  useEffect(()=>{
    const loaddl = async()=>{
      try {
        const ketqua =  await api.CallAPI(undefined, { url: `/admin/loaidanhmuc`, PhuongThuc: 2 })
         if (ketqua.success) {
                    setdanhmuc(ketqua.dulieu);
                }
      } catch (error) {
         console.error("Lỗi khi lấy danh mục ghế:", error);
                        ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
      }
    }
    loaddl();
  },[])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setErr([]); // Xóa lỗi cũ khi người dùng bắt đầu nhập lại

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "DON_GIA" || name === "DANHMUC_GHE" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setErr([]);
    if (!formData.TEN_GIA.trim()) {
      ThongBao.ThongBao_Loi("Vui lòng nhập tên/định danh gói giá!");
      return;
    }
    if (formData.DON_GIA <= 0) {
      ThongBao.ThongBao_Loi("Đơn giá tiêu chuẩn phải lớn hơn 0 đ!");
      return;
    }

    const submitData = new FormData();
    submitData.append("TEN_GIA", formData.TEN_GIA.trim());
    submitData.append("MOTA", formData.MOTA || "");
    submitData.append("DON_GIA", String(formData.DON_GIA));
    submitData.append("DANHMUC_GHE", String(formData.DANHMUC_GHE));

    setLoading(true);
    try {
      // Truyền submitData (đã là new FormData) vào API
      const res = await api.CallAPI(submitData, {
        url: "/admin/themgiamoi",
        PhuongThuc: 1,
      });

      if (res.validate) {
        setErr(res.errors || ["Dữ liệu không hợp lệ!"]);
        return;
      }

      if (res && res.success) {
        if (ThongBao.ThongBao_ThanhCong) {
          ThongBao.ThongBao_ThanhCong(
            res.message || "Thêm bảng giá mới thành công!",
          );
        } else {
          alert(res.message || "Thêm bảng giá mới thành công!");
        }

        router.refresh();
      } else {
        ThongBao.ThongBao_Loi(
          res?.message || "Thêm bảng giá thất bại. Vui lòng thử lại!",
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạo giá mới:", error);
      ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col flex-1 ">
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

          {/* TÊN GÓI GIÁ */}
          <div className="space-y-1.5">
            <label
              htmlFor="TEN_GIA"
              className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1"
            >
              Tên gói giá / Định danh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="TEN_GIA"
              name="TEN_GIA"
              required
              value={formData.TEN_GIA}
              onChange={handleChange}
              placeholder="VD: Gói Ergonomic Tiêu chuẩn, Gói Booth Riêng Tư..."
              className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* DANH MỤC GHẾ */}
          <div className="space-y-1.5">
            <label
              htmlFor="DANHMUC_GHE"
              className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1"
            >
              Áp dụng cho danh mục ghế <span className="text-rose-500">*</span>
            </label>
            <select
              id="DANHMUC_GHE"
              name="DANHMUC_GHE"
              required
              value={formData.DANHMUC_GHE}
              onChange={handleChange}
              className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
            >
               {DanhMuc && DanhMuc.length > 0 ? (
                                    DanhMuc.map((item) => (
                                        <option key={item.ID_DANHMUC} value={item.ID_DANHMUC}>
                                            {item.TEN_DANHMUC}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled value={0}>Không có danh mục nào!</option>
                                )}
            </select>
          </div>

          {/* ĐƠN GIÁ TIÊU CHUẨN */}
          <div className="space-y-1.5">
            <label
              htmlFor="DON_GIA"
              className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1"
            >
              Đơn giá tiêu chuẩn (VND / 1 Giờ){" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                id="DON_GIA"
                name="DON_GIA"
                required
                min="0"
                value={formData.DON_GIA || ""}
                onChange={handleChange}
                placeholder="35000"
                className="w-full text-sm pl-3.5 pr-16 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono font-bold text-slate-800"
              />
              <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                đ / giờ
              </span>
            </div>
          </div>

          {/* TRẠNG THÁI ÁP DỤNG */}
          <div className="space-y-1.5">
            <label
              htmlFor="trang-thai"
              className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1"
            >
              Trạng thái áp dụng liền?
            </label>
            <select
              id="trang-thai"
              className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
            >
              <option value="1">
                Kích hoạt ngay (Hệ thống tự gỡ bỏ giá cũ)
              </option>
              <option value="0">Lưu nháp (Chưa áp dụng vào thực tế)</option>
            </select>
            <span className="text-[10px] text-amber-600 font-medium block leading-normal">
              <i className="fa-solid fa-triangle-exclamation mr-0.5"></i> Khi
              chọn &quot;Kích hoạt ngay&quot;, hệ thống tự động tắt (Inactivate)
              các đơn giá cũ của danh mục ghế này.
            </span>
          </div>

          {/* MÔ TẢ */}
          <div className="space-y-1.5">
            <label
              htmlFor="MOTA"
              className="text-xs font-bold text-slate-600 uppercase tracking-wide"
            >
              Mô tả / Lý do điều chỉnh giá
            </label>
            <textarea
              id="MOTA"
              name="MOTA"
              rows={2}
              value={formData.MOTA}
              onChange={handleChange}
              placeholder="Ví dụ: Điều chỉnh tăng giá 15% do nâng cấp cơ sở vật chất hoặc áp dụng cho mùa cao điểm..."
              className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700 placeholder:text-slate-400 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border border-indigo-600 transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed min-w-[130px]"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up mr-1.5"></i> Cập nhật
                giá mới
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
