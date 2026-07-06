"use client";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useModalContext } from "@/context/QuanLiMoal";
import Link from 'next/link';

export interface Gia {
  ID_GIA: number;
  TEN_GIA: string;
  MOTA: string;
  NGAY_TAO: string; // ISO 8601
  NGAY_KET_THUC: string | null;
  DON_GIA: string; // API trả về dạng string
  DANHMUC_GHE: number;
}

export interface GiaResponse {
  success?: boolean;
  status?: boolean;
  data?: Gia;
}

export default function ChiTietGia() {
  const router = useRouter();
  const params = useParams();
     const { OpenMoDal } = useModalContext();
  // Lấy ID chuẩn xác từ URL
  const id = params?.ID_GIA || params?.idGia || params?.id || "";

  // State quản lý dữ liệu và loading
  const [gia, setGia] = useState<Gia | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChiTietGia = async () => {
      if (!id) {
        ThongBao.ThongBao_Loi("Không tìm thấy ID đơn giá trên đường dẫn!");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("1. Đang gọi API với ID:", id);

        const res: any = await api.CallAPI(undefined, { 
          url: `/admin/chitietgia?ID_GIA=${id}`, 
          PhuongThuc: 2 
        });
        
        console.log("2. Dữ liệu gốc từ API trả về:", res);

       
        const targetData = res?.data?.data || res?.data || res?.ChiTiet || res?.ChiTietGia || res?.DanhSach?.[0] || res;

        if (targetData && (targetData !== null) && (targetData.ID_GIA !== undefined || targetData.TEN_GIA !== undefined)) {
          console.log("3. Bóc tách thành công, gán vào State:", targetData);
          setGia(targetData);
        } else {
          console.error("Không tìm thấy cấu trúc Đơn Giá trong response:", res);
          ThongBao.ThongBao_Loi(res?.message || res?.thongBao || "Không thể tải hoặc sai cấu trúc thông tin đơn giá!");
          setGia(null);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API chitietgia:", error);
        ThongBao.ThongBao_Loi("Đã xảy ra lỗi khi kết nối đến máy chủ!");
      } finally {
        setLoading(false);
      }
    };

    fetchChiTietGia();
  }, [id]);

  // --- HÀM BỔ TRỢ FORMAT DỮ LIỆU ---
  const formatCurrency = (amountStr?: string) => {
    if (!amountStr) return "0 đ";
    const num = Number(amountStr);
    return isNaN(num) ? "0 đ" : `${num.toLocaleString("vi-VN")} đ`;
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Chưa xác định";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const isExpired = (endDate: string | null) => {
    return endDate ? new Date(endDate) < new Date() : false;
  };

  // --- GIAO DIỆN LOADING ---
  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400">Đang tải thông tin đơn giá...</p>
      </div>
    );
  }

  // --- GIAO DIỆN KHI KHÔNG TÌM THẤY DỮ LIỆU ---
  if (!gia) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
        <i className="fa-solid fa-triangle-exclamation text-4xl text-amber-500"></i>
        <h3 className="text-lg font-bold text-slate-700">Không tìm thấy dữ liệu đơn giá #{id}</h3>
        <button 
          type="button"
          onClick={() => router.back()} 
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="space-y-3">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-400">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="inline-flex items-center px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-3xs transition-all mr-1 group cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left mr-1.5 text-[10px] text-slate-400 group-hover:-translate-x-0.5 transition-transform"></i>Quay lại
        </button>
        <Link href="/danh-muc" className="hover:text-indigo-600 transition-colors">Danh mục</Link>
        <span><i className="fa-solid fa-chevron-right text-[8px]"></i></span>
        <Link href="/danh-muc/don-gia" className="hover:text-indigo-600 transition-colors">Quản lý đơn giá</Link>
        <span><i className="fa-solid fa-chevron-right text-[8px]"></i></span>
        <span className="text-gray-700">Chi tiết đơn giá #{gia.ID_GIA}</span>
      </div>
          
      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl ring-4 ring-indigo-50 flex items-center justify-center text-white text-xl shrink-0 shadow-sm">
            <i className="fa-solid fa-tags"></i>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{gia.TEN_GIA}</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Mã định danh hệ thống: <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">ID_{gia.ID_GIA}</span>
              <span className="ml-2 font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">DM_GHE: {gia.DANHMUC_GHE}</span>
            </p>
          </div>
        </div>
          
        <div className="flex items-center space-x-2 self-start sm:self-auto">
<button 
    // ĐÃ SỬA: Thay 'undefined' bằng biến 'gia' để truyền toàn bộ dữ liệu qua Modal
    onClick={() => { OpenMoDal(gia, { TenTrang: 'SuaGia', TieuDe: 'Cập nhật giá', icon: 'fa-solid fa-pen-to-square' }) }}
    className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center justify-center space-x-1.5" 
>
    <i className="fa-solid fa-pen-to-square text-[10px]"></i>
    <span>Chỉnh sửa giá</span>
</button>
          
          <button 
            type="button" 
            onClick={() => {/* Thêm logic ngừng áp dụng ở đây */}}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <i className="fa-solid fa-ban"></i> Ngừng áp dụng
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
        {/* Cột trái: Thông tin giá & Mô tả */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100">
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <i className="fa-solid fa-money-bill-wave text-indigo-500"></i> Thông tin đơn giá cấu hình
              </h3>
              <div className="text-4xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-2">
                <span>{formatCurrency(gia.DON_GIA)}</span>
                <span className="text-sm font-sans text-slate-400 font-semibold tracking-normal">/ Giờ sử dụng</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-3 bg-slate-50/40">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <i className="fa-solid fa-align-left text-slate-400"></i> Mô tả chi tiết quy định áp dụng
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {gia.MOTA ? gia.MOTA : <span className="italic text-slate-400">Chưa có thông tin mô tả chi tiết cho đơn giá này.</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải: Trạng thái & Nhật ký */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <i className="fa-solid fa-history text-slate-400"></i> Nhật ký & Trạng thái
            </h3>
              
            {/* Trạng thái hiện tại */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Trạng thái hiện tại</span>
              {!isExpired(gia.NGAY_KET_THUC) ? (
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 mt-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span> Đang hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-bold text-rose-600 mt-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5"></span> Ngừng áp dụng / Hết hạn
                </span>
              )}
            </div>

            {/* Ngày tạo */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ngày khởi tạo (NGAY_TAO)</span>
              <div className="text-xs font-bold text-slate-700 flex items-center gap-2 mt-2 font-mono">
                <i className="fa-regular fa-calendar text-slate-400 text-sm"></i>
                <span>{formatDate(gia.NGAY_TAO)}</span>
              </div>
            </div>

            {/* Ngày kết thúc (Nếu có) */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ngày kết thúc (NGAY_KET_THUC)</span>
              <div className="text-xs font-bold text-slate-700 flex items-center gap-2 mt-2 font-mono">
                <i className="fa-regular fa-calendar-xmark text-slate-400 text-sm"></i>
                <span>{gia.NGAY_KET_THUC ? formatDate(gia.NGAY_KET_THUC) : "Vô thời hạn"}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}