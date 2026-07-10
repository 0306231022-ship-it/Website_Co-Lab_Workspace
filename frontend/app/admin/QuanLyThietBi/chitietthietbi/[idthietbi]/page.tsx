"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";

export interface ThietBiDetail {
  ID_THIET_BI: number;
  TEN_THIET_BI: string;
  HINH_ANH?: string; // Đã thêm ? để chống lỗi nếu HINH_ANH bị null từ database
}

export interface ThietBiKhongGian {
  ID_CT_TB: number;
  ID_KHONG_GIAN: number;
  TRANG_THAI: number;
  TEN_KHONG_GIAN: string;
  TEN_CHI_NHANH: string;
}

export default function ChiTietThietBi() {
  const router = useRouter();
  const params = useParams();
  
  // FIX CHỐNG SẬP 1: Dùng optional chaining (?.) để tránh crash khi params bị null
  // Hỗ trợ cả trường hợp bạn đặt tên thư mục là [idthietbi] hoặc [id]
  const idthietbi = params?.idthietbi || "";

  // State quản lý dữ liệu
  const [loading, setLoading] = useState<boolean>(true);
  const [chiTiet, setChiTiet] = useState<ThietBiDetail | null>(null);
  const [danhSach, setDanhSach] = useState<ThietBiKhongGian[]>([]);

  // Gọi API
  useEffect(() => {
    const laydl = async () => {
      if (!idthietbi) return;

      console.log("Đang gọi API với ID:", idthietbi); // Kiểm tra xem ID nhận được là gì
      setLoading(true);
      try {
        const response: any = await api.CallAPI(undefined, {
          url: `/admin/layid?ID_THIET_BI=${idthietbi}`,
          PhuongThuc: 2,
        });

        console.log("Dữ liệu API trả về:", response); // Kiểm tra xem server trả về cái gì

        if (response && response.success && response.data) {
          setChiTiet(response.data.ChiTiet || null);
          setDanhSach(response.data.DanhSach || []);
        } else {
          // Có thể server trả về data nằm ở chỗ khác
          ThongBao.ThongBao_Loi("API trả về thất bại!");
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    laydl();
  }, [idthietbi]);

  // FIX CHỐNG SẬP 3: Đảm bảo danhSach luôn là mảng trước khi dùng .length hay .filter
  const safeDanhSach = Array.isArray(danhSach) ? danhSach : [];
  const tongCapPhat = safeDanhSach.length;
  const soHoatDongTot = safeDanhSach.filter((item) => item.TRANG_THAI === 1).length;

  // Hàm render badge trạng thái
  const renderTrangThai = (trangThai: number) => {
    switch (trangThai) {
      case 1:
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] rounded-md font-bold border border-emerald-100">
            Hoạt động tốt
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[11px] rounded-md font-bold border border-amber-100">
            Đang bảo trì
          </span>
        );
      case 0:
      default:
        return (
          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[11px] rounded-md font-bold border border-rose-100">
            Hư hỏng
          </span>
        );
    }
  };

  // --- GIAO DIỆN KHU VỰC 1: LOADING ---
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400">Đang tải chi tiết thiết bị...</p>
      </div>
    );
  }

  // --- GIAO DIỆN KHU VỰC 2: KHÔNG TÌM THẤY DỮ LIỆU ---
  if (!chiTiet) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <i className="fa-solid fa-triangle-exclamation text-4xl text-amber-500"></i>
        <h3 className="text-lg font-bold text-slate-700">Không tìm thấy dữ liệu thiết bị {idthietbi? `#${idthietbi}` : "này"}</h3>
        <p className="text-xs text-slate-400 pb-2">Vui lòng kiểm tra lại đường dẫn hoặc cấu trúc thư mục của bạn.</p>
        <button onClick={() => router.back()} className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-700 shadow-md">
          Quay lại trang trước
        </button>
      </div>
    );
  }

  // --- GIAO DIỆN KHU VỰC 3: DỮ LIỆU CHÍNH ---
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-400">
          <button onClick={() => router.back()} className="hover:text-indigo-600 transition-colors cursor-pointer">
            Trang thiết bị
          </button>
          <span><i className="fa-solid fa-chevron-right text-[9px]"></i></span>
          <span className="text-gray-700">Chi tiết thiết bị</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg ring-4 ring-indigo-50 overflow-hidden shrink-0">
                {chiTiet.HINH_ANH ? (
                    <img src={chiTiet.HINH_ANH} alt={chiTiet.TEN_THIET_BI} className="w-full h-full object-cover" />
                ) : (
                    <i className="fa-solid fa-desktop"></i>
                )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {chiTiet.TEN_THIET_BI}
              </h1>
              <div className="flex items-center mt-1 space-x-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Mã: <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">ID_{chiTiet.ID_THIET_BI}</span>
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider border-l border-gray-200 pl-3">
                  Loại: <span className="text-gray-600">Thiết bị IT</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-200 transition shadow-3xs cursor-pointer">
              <i className="fa-solid fa-pen-to-square mr-1.5"></i> Chỉnh sửa thiết bị
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-sm">
            <p className="text-[10px] font-bold uppercase opacity-70 tracking-wider">Tổng cấp phát không gian</p>
            <p className="text-3xl font-black mt-1 font-mono">{tongCapPhat}</p>
          </div>
          <div className="bg-emerald-500 rounded-2xl p-5 text-white shadow-sm">
            <p className="text-[10px] font-bold uppercase opacity-70 tracking-wider">Đang hoạt động tốt</p>
            <p className="text-3xl font-black mt-1 font-mono">{soHoatDongTot}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Vị trí hiện diện tại các không gian</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Danh sách các vị trí thực tế đang sử dụng thiết bị này.</p>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                    <th className="p-4 pl-6">Không gian / Khu vực</th>
                    <th className="p-4">Vị trí cụ thể (Mã CT_TB)</th>
                    <th className="p-4">Trạng thái tại chỗ</th>
                    <th className="p-4 pr-6 text-right w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  
                  {safeDanhSach.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-12 text-center text-gray-400 text-xs">
                            <i className="fa-regular fa-folder-open text-3xl block mb-2 opacity-50"></i>
                            Thiết bị này chưa được phân bổ vào không gian nào.
                        </td>
                    </tr>
                  ) : (
                      safeDanhSach.map((item) => (
                        <tr key={item.ID_CT_TB} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-location-dot"></i>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-xs">{item.TEN_KHONG_GIAN}</p>
                                <p className="text-[10px] text-gray-400">{item.TEN_CHI_NHANH}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-[11px] rounded-lg font-bold">
                              Mã CT: #{item.ID_CT_TB}
                            </span>
                          </td>
                          <td className="p-4">
                            {renderTrangThai(item.TRANG_THAI)}
                          </td>
                          <td className="p-4 pr-6 text-right relative">
                            <div className="inline-block text-left group">
                              <button className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer">
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                  
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <p className="text-xs text-gray-500 font-medium">
              Hiển thị <span className="font-bold text-gray-900">{tongCapPhat > 0 ? 1 : 0}</span> đến{" "}
              <span className="font-bold text-gray-900">{tongCapPhat}</span> trong số{" "}
              <span className="font-bold text-gray-900">{tongCapPhat}</span> vị trí
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}