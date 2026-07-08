"use client"
import { useState, useEffect, useMemo } from "react";
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as fun from '@/FUNCTION/function';
import {useModalContext } from "@/context/QuanLiMoal";
export interface DanhMuc {
    ID_DANHMUC: number;
    TEN_DANHMUC: string;
    TRANG_THAI: number;
    DON_GIA: string | null;
}

export interface Pagination {
    totalItems: number;
    totalPages: number;
}

export interface DanhMucResponse {
    success: boolean;
    data: DanhMuc[];
    pagination: Pagination;
}

export default function DanhMucGhe() {
    // 1. Khai báo các State quản lý dữ liệu
     const { OpenMoDal } = useModalContext();
    const [danhSachs, setDanhSachs] = useState<DanhMuc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [pagination, setPagination] = useState<Pagination>({ totalItems: 0, totalPages: 1 });
    
    // State cho bộ lọc và tìm kiếm
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");

    // 2. Gọi API lấy dữ liệu
    useEffect(() => {
        const laydl = async () => {
            setIsLoading(true);
            try {
                const response: DanhMucResponse = await api.CallAPI(undefined, { 
                    url: `/admin/danhsachdanhmucghe?page=${page}`, 
                    PhuongThuc: 2 
                });
                
                if (response && response.success) {
                    const data = response.data || [];
                    setDanhSachs(data);
                    if (response.pagination) {
                        setPagination(response.pagination);
                    }
                }
            } catch  {
                ThongBao.ThongBao_Loi("Lỗi khi lấy danh sách danh mục:");
            } finally {
                setIsLoading(false);
            }
        }; 
        laydl();
    }, [page]);

    // 3. Tính toán số liệu thống kê (dựa trên dữ liệu trang hiện tại)
    const totalActive = useMemo(() => danhSachs.filter(item => item.TRANG_THAI === 1).length, [danhSachs]);
    const totalLocked = useMemo(() => danhSachs.filter(item => item.TRANG_THAI !== 1).length, [danhSachs]);

    // 4. Lọc dữ liệu theo từ khóa tìm kiếm và trạng thái (Client-side filtering)
    const filteredData = useMemo(() => {
        return danhSachs.filter(item => {
            const matchName = item.TEN_DANHMUC.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = filterStatus === "" || item.TRANG_THAI.toString() === filterStatus;
            return matchName && matchStatus;
        });
    }, [danhSachs, searchTerm, filterStatus]);

    // Hàm hỗ trợ format tiền tệ VNĐ
    const formatCurrency = (amount: string | null) => {
        if (!amount) return "Chưa thiết lập";
        const num = parseFloat(amount);
        return isNaN(num) ? "0 đ" : `${num.toLocaleString('vi-VN')} đ`;
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-inner">
                        <i className="fa-solid fa-chair"></i>
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Quản lý Danh mục Ghế</h1>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">Cấu hình phân loại chỗ ngồi và thiết lập đơn giá tuyến tính theo giờ</p>
                    </div>
                </div>
                  <button 
               onClick={()=>{OpenMoDal(undefined,{TenTrang:'ThemDanhMucGhe'})}}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center justify-center space-x-1.5" >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Tạo gói giá mới</span>
            </button>
            </div>

            {/* Thẻ thống kê (Metrics) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số danh mục</span>
                        <span className="text-2xl font-black text-slate-800 font-mono block">
                            {pagination.totalItems < 10 ? `0${pagination.totalItems}` : pagination.totalItems}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center text-base">
                        <i className="fa-solid fa-boxes-stacked"></i>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Đang hoạt động (trang này)</span>
                        <span className="text-2xl font-black text-emerald-600 font-mono block">
                            {totalActive < 10 ? `0${totalActive}` : totalActive}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-base">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tạm khóa / Bảo trì</span>
                        <span className="text-2xl font-black text-amber-500 font-mono block">
                            {totalLocked < 10 ? `0${totalLocked}` : totalLocked}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-base">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                </div>
            </div>

            {/* Bảng dữ liệu & Bộ lọc */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
                
                {/* Bộ lọc */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:max-w-xs flex items-center">
                        <i className="fa-solid fa-magnifying-glass absolute left-3.5 text-slate-400 text-xs pointer-events-none"></i>
                        <input 
                            type="text" 
                            placeholder="Tìm tên danh mục (TEN_DANHMUC)..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 shadow-3xs transition-all font-medium placeholder:text-slate-400"
                        />
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 shadow-3xs font-medium text-slate-600 cursor-pointer"
                        >
                            <option value="">-- Tất cả trạng thái --</option>
                            <option value="1">1 - Đang hoạt động</option>
                            <option value="0">0 - Tạm khóa</option>
                        </select>
                    </div>
                </div>

                {/* Bảng hiển thị */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-3.5 font-mono w-24 text-center">ID_DANHMUC</th>
                                <th className="px-6 py-3.5">TEN_DANHMUC (Tên danh mục ghế)</th>
                                <th className="px-6 py-3.5 text-right">Đơn giá hiện hành</th>
                                <th className="px-6 py-3.5 text-center w-40">TRANG_THAI</th>
                                <th className="px-6 py-3.5 text-center w-36">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        <i className="fa-solid fa-spinner animate-spin mr-2"></i> Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        Không tìm thấy danh mục ghế nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.ID_DANHMUC} className={`hover:bg-slate-50/50 transition-colors ${item.TRANG_THAI !== 1 ? 'bg-slate-50/30' : ''}`}>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-400 text-center bg-slate-50/10">
                                            {item.ID_DANHMUC}
                                        </td>
                                        <td className={`px-6 py-4 ${item.TRANG_THAI !== 1 ? 'opacity-70' : ''}`}>
                                            <div className={`font-bold text-slate-900 ${item.TRANG_THAI !== 1 ? 'line-through' : ''}`}>
                                                {item.TEN_DANHMUC}
                                            </div>
                                            {item.TRANG_THAI !== 1 && (
                                                <span className="text-[10px] text-amber-600 font-medium block mt-0.5">
                                                    <i className="fa-solid fa-screwdriver-wrench text-[9px] mr-1"></i> Đang tạm đóng / bảo trì
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-right ${item.TRANG_THAI !== 1 ? 'opacity-60' : ''}`}>
                                            <div className="font-mono font-extrabold text-slate-900">
                                                {formatCurrency(item.DON_GIA)}
                                            </div>
                                            <span className="text-[10px] text-indigo-500 font-bold block mt-0.5">
                                                <i className="fa-solid fa-clock-rotate-left text-[9px] mr-0.5"></i> Tuyến tính / phút
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.TRANG_THAI === 1 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 1 - Hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 0 - Tạm khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                
                                                <button  onClick={()=>{OpenMoDal(undefined,{TenTrang:'ChinhSuaDMGhe'})}} title="Sửa danh mục" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer">
                                                    <i className="fa-solid fa-pen text-xs"></i>
                                                </button>
                                                {item.TRANG_THAI === 1 ? (
                                                    <button title="Cấu hình / Thay đổi giá" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer">
                                                        <i className="fa-solid fa-tags text-xs"></i>
                                                    </button>
                                                ) : (
                                                    <button disabled title="Không thể đổi giá khi đang khóa danh mục" className="p-2 text-slate-300 rounded-lg cursor-not-allowed">
                                                        <i className="fa-solid fa-tags text-xs"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Phân trang */}
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                    <span>
                        Hiển thị {danhSachs.length > 0 ? 1 : 0} - {danhSachs.length} trên tổng số {pagination.totalItems} danh mục
                    </span>
                    <div className="flex items-center gap-1">
                        <button 
                            type="button" 
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1 || isLoading}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                            <i className="fa-solid fa-angle-left"></i>
                        </button>
                        
                        <button type="button" className="px-3 py-1.5 bg-emerald-600 border border-emerald-600 text-white rounded-lg font-bold">
                            {page}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                            disabled={page >= pagination.totalPages || isLoading}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                            <i className="fa-solid fa-angle-right"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}