"use client";
import React, { useState, useEffect } from "react";
import * as ThongBao from "@/FUNCTION/ThongBao";
import * as api from "@/API/API";
import { useRouter } from "next/navigation";
import { DanhMucGhe } from "@/interface/DanhMucGhe";

// Định nghĩa interface rõ ràng cho dữ liệu cũ truyền vào từ bảng
export interface GiaDữLiệuGốc {
  ID_GIA: number;
  TEN_GIA?: string;
  MOTA?: string;
  GIA?: number;
  DON_GIA?: number;
  DANHMUC_GHE?: number;
}

export interface UpdateGiaRequest {
  ID_GIA: number;
  TEN_GIA: string;
  MOTA?: string;
  DON_GIA: number;
  DANHMUC_GHE: number;
  PHUONG_THUC_CAP_NHAT: "overwrite" | "history";
}

// KHÔNG DÙNG ANY: Khai báo kiểu dữ liệu chuẩn cho Props
export default function SuaGia({
  DuLieu,
  onClose,
}: {
  DuLieu: GiaDữLiệuGốc;
  onClose: () => void;
}) {
  const router = useRouter();
  const [DanhMuc, setdanhmuc] = useState<DanhMucGhe[]>([]);
  
  // Lấy ID an toàn từ Props đã định kiểu
  const id = DuLieu?.ID_GIA || "";

  // State quản lý trạng thái tải
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [err, setErr] = useState<string[]>([]);

  // State quản lý Form Data
  const [formData, setFormData] = useState<UpdateGiaRequest>({
    ID_GIA: 0,
    TEN_GIA: "",
    MOTA: "",
    DON_GIA: 0,
    DANHMUC_GHE: 1,
    PHUONG_THUC_CAP_NHAT: "history",
  });

  // --- BƯỚC 1: GỌI API LẤY DỮ LIỆU CŨ ---
  useEffect(() => {
    const fetchChiTietGia = async () => {
      if (!id) {
        ThongBao.ThongBao_Loi("Không tìm thấy ID gói giá cần sửa!");
        setFetching(false);
        return;
      }

      setFetching(true);
      try {
        const [res1, res2] = await Promise.all([
          api.CallAPI(undefined, { url: `/admin/chitietgia?ID_GIA=${id}`, PhuongThuc: 2 }),
          api.CallAPI(undefined, { url: `/admin/loaidanhmuc`, PhuongThuc: 2 })
        ]);

        const targetData =
          res1?.data?.data ||
          res1?.data ||
          res1?.ChiTiet ||
          res1?.ChiTietGia ||
          res1?.DanhSach?.[0] ||
          res1;

        if (targetData && targetData.ID_GIA !== undefined) {
          const giaGoc = targetData.GIA !== undefined ? targetData.GIA : targetData.DON_GIA;

          setFormData({
            ID_GIA: Number(targetData.ID_GIA),
            TEN_GIA: targetData.TEN_GIA || "",
            MOTA: targetData.MOTA || "",
            DON_GIA: Number(giaGoc) || 0,
            DANHMUC_GHE: Number(targetData.DANHMUC_GHE) || 1,
            PHUONG_THUC_CAP_NHAT: "history",
          });
        } else {
          ThongBao.ThongBao_Loi("Không thể tải thông tin bảng giá cần chỉnh sửa!");
        }

        if (res2 && (res2.success || res2.dulieu)) {
          setdanhmuc(res2.dulieu || res2.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi load chi tiết:", error);
        ThongBao.ThongBao_Loi("Lỗi kết nối đến máy chủ!");
      } finally {
        setFetching(false);
      }
    };

    fetchChiTietGia();
  }, [id]);

  // --- BƯỚC 2: HÀM XỬ LÝ KHI NHẬP LIỆU ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setErr([]);

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "DON_GIA" || name === "DANHMUC_GHE" || name === "ID_GIA"
          ? Number(value)
          : value,
    }));
  };

  // --- BƯỚC 3: HÀM GỬI DỮ LIỆU BẰNG NEW FORMDATA() ---
  const handleSubmit = async () => {
    setErr([]);

    if (!formData.TEN_GIA.trim()) {
      ThongBao.ThongBao_Loi("Vui lòng nhập tên/định danh gói giá!");
      return;
    }
    if (formData.DON_GIA <= 0) {
      ThongBao.ThongBao_Loi("Đơn giá điều chỉnh phải lớn hơn 0 đ!");
      return;
    }

    // KHỞI TẠO NEW FORMDATA() THEO YÊU CẦU CỦA BẠN
    const dataGuiDi = new FormData();
    dataGuiDi.append("ID_GIA", String(formData.ID_GIA));
    dataGuiDi.append("TEN_GIA", formData.TEN_GIA.trim());
    dataGuiDi.append("MOTA", formData.MOTA || "");
    dataGuiDi.append("DON_GIA", String(formData.DON_GIA));
    dataGuiDi.append("DANHMUC_GHE", String(formData.DANHMUC_GHE));
    dataGuiDi.append("PHUONG_THUC_CAP_NHAT", formData.PHUONG_THUC_CAP_NHAT);

    setLoading(true);
    try {
      // Truyền đối tượng dataGuiDi (FormData) vào vị trí tham số thứ nhất
      const res = await api.CallAPI(dataGuiDi, {
        url: "/admin/suagia",
        PhuongThuc: 1, // POST
      });

      if (res && res.validate) {
        setErr(res.errors || ["Dữ liệu không hợp lệ!"]);
        return;
      }

      if (res && res.success) {
        if (ThongBao.ThongBao_ThanhCong) {
          ThongBao.ThongBao_ThanhCong(res.message || "Cập nhật bảng giá thành công!");
        } else {
          alert(res.message || "Cập nhật bảng giá thành công!");
        }

        router.refresh(); 
        onClose(); 
      } else {
        ThongBao.ThongBao_Loi(res?.message || "Cập nhật bảng giá thất bại. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giá:", error);
      ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-3 p-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400">
          Đang tải thông tin gói giá #{id}...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white w-full max-w-2xl mx-auto rounded-xl">
      <div className="space-y-5">
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

        {/* TÊN GÓI GIÁ */}
        <div className="space-y-1.5">
          <label htmlFor="TEN_GIA" className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
            Tên gói giá / Định danh <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="TEN_GIA"
            name="TEN_GIA"
            required
            value={formData.TEN_GIA}
            onChange={handleChange}
            placeholder="VD: Gói Ergonomic Tiêu chuẩn..."
            className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-semibold text-slate-800"
          />
        </div>

        {/* DANH MỤC GHẾ */}
        <div className="space-y-1.5">
          <label htmlFor="DANHMUC_GHE" className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
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
              <option value={0} disabled>Không có danh mục nào!</option>
            )}
          </select>
        </div>

        {/* ĐƠN GIÁ */}
        <div className="space-y-1.5">
          <label htmlFor="DON_GIA" className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
            Mức giá mới điều chỉnh (VND / 1 Giờ) <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              id="DON_GIA"
              name="DON_GIA"
              required
              min="0"
              step="1000"
              value={formData.DON_GIA || ""}
              onChange={handleChange}
              className="w-full text-sm pl-3.5 pr-16 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono font-bold text-slate-800"
            />
            <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">
              đ / giờ
            </span>
          </div>
        </div>

        {/* PHƯƠNG THỨC CẬP NHẬT */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
            Phương thức cập nhật hệ thống <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`p-3.5 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
              formData.PHUONG_THUC_CAP_NHAT === "history" 
                ? "border-indigo-500 bg-indigo-50/25 ring-2 ring-indigo-50" 
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}>
              <input
                type="radio"
                name="PHUONG_THUC_CAP_NHAT"
                value="history"
                checked={formData.PHUONG_THUC_CAP_NHAT === "history"}
                onChange={handleChange}
                className="mt-0.5 accent-indigo-600 cursor-pointer"
              />
              <div className="flex flex-col cursor-pointer">
                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                  <i className="fa-solid fa-shield-halved"></i> Tách giá tự động (An toàn)
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-1 leading-normal">
                  Nếu mã giá này đang được Không gian/Phòng họp dùng chung, hệ thống sẽ tự sinh bản ghi giá riêng để tránh làm đổi giá phòng.
                </span>
              </div>
            </label>

            <label className={`p-3.5 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
              formData.PHUONG_THUC_CAP_NHAT === "overwrite" 
                ? "border-amber-500 bg-amber-50/25 ring-2 ring-amber-50" 
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}>
              <input
                type="radio"
                name="PHUONG_THUC_CAP_NHAT"
                value="overwrite"
                checked={formData.PHUONG_THUC_CAP_NHAT === "overwrite"}
                onChange={handleChange}
                className="mt-0.5 accent-amber-600 cursor-pointer"
              />
              <div className="flex flex-col cursor-pointer">
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <i className="fa-solid fa-triangle-exclamation"></i> Ghi đè trực tiếp (Cách 1)
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-1 leading-normal">
                  Sửa đổi số tiền trực tiếp trên mã giá cũ. Lưu ý: Mọi phòng họp hay danh mục khác sử dụng chung mã giá này đều đổi theo.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* MÔ TẢ */}
        <div className="space-y-1.5">
          <label htmlFor="MOTA" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Mô tả / Ghi chú lý do thay đổi giá
          </label>
          <textarea
            id="MOTA"
            name="MOTA"
            rows={2}
            value={formData.MOTA}
            onChange={handleChange}
            placeholder="Nhập lý do điều chỉnh hoặc mô tả gói giá..."
            className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700 placeholder:text-slate-400 resize-none leading-relaxed"
          ></textarea>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-6 mt-5 border-t border-slate-100 flex items-center justify-end space-x-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border border-indigo-600 transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center justify-center disabled:opacity-70 min-w-[140px]"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5"></span>
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-cloud-arrow-up mr-1.5"></i> Lưu thay đổi giá
            </>
          )}
        </button>
      </div>
    </div>
  );
}