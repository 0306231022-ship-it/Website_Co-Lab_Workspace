"use client";
import { useState, useEffect, useMemo } from "react";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import * as fun from "@/FUNCTION/function";
import Link from "next/link";
export interface ThietBi {
  ID_THIET_BI: number;
  TEN_THIET_BI: string;
  HINH_ANH: string;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
}

export interface ThietBiResponse {
  success: boolean;
  data: ThietBi[];
  pagination: Pagination;
}

export interface ThietBiDetailResponse {
  success: boolean;
  data: ThietBi;
}

export default function QuanLyThietBi() {
     
  // 1. Khai báo các State quản lý dữ liệu và giao diện
  const [danhSachThietBi, setDanhSachThietBi] = useState<ThietBi[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 2. Gọi API lấy dữ liệu từ Backend
  useEffect(() => {
    const laydl = async () => {
      setIsLoading(true);
      try {
        const response: ThietBiResponse = await api.CallAPI(undefined, {
          url: `/admin/danhsachthietbi?page=${page}`,
          PhuongThuc: 2,
        });

        if (response && response.success) {
          const data = response.data || [];
          setDanhSachThietBi(data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
        ThongBao.ThongBao_Loi("Lỗi khi lấy danh sách thiết bị!");
      } finally {
        setIsLoading(false);
      }
    };
    laydl();
  }, [page]);

  // 3. Lọc dữ liệu phía Client (Tìm kiếm theo tên hoặc mã ID)
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return danhSachThietBi;
    return danhSachThietBi.filter(
      (item) =>
        item.TEN_THIET_BI.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ID_THIET_BI.toString().includes(searchTerm),
    );
  }, [danhSachThietBi, searchTerm]);

  // Tính toán số hiển thị phân trang (Ví dụ: 1 đến 10 trong số 239)
  const itemStart = pagination.totalItems > 0 ? (page - 1) * 10 + 1 : 0;
  const itemEnd = Math.min(page * 10, pagination.totalItems);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            Kho trang thiết bị{" "}
            <span className="ml-3 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-bold">
              {pagination.totalItems} items
            </span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-3xs transition-all cursor-pointer flex items-center"
          >
            <i className="fa-solid fa-cloud-arrow-down mr-2"></i> Xuất Excel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center"
          >
            <i className="fa-solid fa-plus mr-2"></i> Nhập thiết bị mới
          </button>
        </div>
      </div>

      {/* --- THỐNG KÊ NHANH --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-boxes-stacked"></i>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Tổng số lượng
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5 font-mono">
              {pagination.totalItems}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-plug-circle-check"></i>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Đang sử dụng
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5 font-mono">
              {pagination.totalItems > 0
                ? Math.floor(pagination.totalItems * 0.9)
                : 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Đang bảo trì/Sửa chữa
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5 font-mono">
              {pagination.totalItems > 0
                ? Math.ceil(pagination.totalItems * 0.1)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* --- THANH CÔNG CỤ TÌM KIẾM & LỌC --- */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc mã số định danh..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all placeholder:font-normal"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 cursor-pointer focus:outline-none focus:border-indigo-500 min-w-[160px]">
            <option value="">Tất cả danh mục</option>
            <option value="it">Thiết bị IT</option>
            <option value="furniture">Nội thất</option>
          </select>
          <select className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 cursor-pointer focus:outline-none focus:border-indigo-500 min-w-[150px]">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang sử dụng</option>
            <option value="maintenance">Đang bảo trì</option>
          </select>
        </div>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-gray-400 text-[11px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="p-4 pl-6">Thông tin thiết bị</th>
                <th className="p-4">Mã định danh</th>
                <th className="p-4 pr-6 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <i className="fa-solid fa-spinner animate-spin text-2xl text-indigo-600"></i>
                      <span className="text-xs font-semibold">
                        Đang tải danh sách thiết bị...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <i className="fa-solid fa-box-open text-3xl text-gray-300"></i>
                      <span className="text-xs font-semibold">
                        Không tìm thấy thiết bị nào phù hợp!
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.ID_THIET_BI}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3">
                        {/* Kiểm tra hình ảnh, nếu có thì hiện ảnh, không thì hiện icon */}
                        {item.HINH_ANH ? (
                          <img
                            src={item.HINH_ANH}
                            alt={item.TEN_THIET_BI}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                            <i className="fa-solid fa-desktop text-lg"></i>
                          </div>
                        )}
                        <div>
                          <p className="font-black text-gray-900">
                            {item.TEN_THIET_BI}
                          </p>
                          <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                            ID hệ thống: #{item.ID_THIET_BI}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-500">
                      DEV-TB-{item.ID_THIET_BI.toString().padStart(4, "0")}
                    </td>
                    <td className="p-4 pr-6 text-right">
                 <Link
    href={`/admin/QuanLyThietBi/chitietthietbi/${item.ID_THIET_BI}`}
    className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
    title="Xem chi tiết"
  >
    <i className="fa-solid fa-eye"></i>
  </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PHÂN TRANG (PAGINATION) --- */}
        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">
            Hiển thị{" "}
            <span className="font-bold text-gray-900">{itemStart}</span> đến{" "}
            <span className="font-bold text-gray-900">{itemEnd}</span> trong số{" "}
            <span className="font-bold text-gray-900">
              {pagination.totalItems}
            </span>{" "}
            thiết bị
          </p>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <i className="fa-solid fa-chevron-left text-[10px]"></i>
            </button>

            {/* Lặp tạo các nút số trang */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  disabled={isLoading}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    page === num
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "border border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
                  }`}
                >
                  {num}
                </button>
              ),
            )}

            <button
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, pagination.totalPages))
              }
              disabled={
                page === pagination.totalPages ||
                pagination.totalPages === 0 ||
                isLoading
              }
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
