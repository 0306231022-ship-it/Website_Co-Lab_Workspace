"use client";
import { useState, useEffect, useMemo } from "react";
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';

export interface BangGia {
    ID_GIA: number;
    TEN_GIA: string;
    MOTA: string;
    NGAY_TAO: string;
    NGAY_KET_THUC: string | null;
    DON_GIA: string;
    DANHMUC_GHE: number;
}

export interface Pagination {
    totalItems: number;
    totalPages: number;
}

export interface BangGiaResponse {
    success: boolean;
    data: BangGia[];
    pagination: Pagination;
}

// Hàm định dạng tiền tệ VNĐ
const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return "0 đ";
    return new Intl.NumberFormat('vi-VN').format(num) + " đ";
};

export default function QuanLyGia() {
    const [page, setPage] = useState<number>(1);
    const [bangGia, setBangGia] = useState<BangGia[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Gọi API lấy danh sách giá theo page
    useEffect(() => {
        const fetchDanhSachGia = async () => {
            setLoading(true);
            try {
                const res = await api.CallAPI(undefined, { 
                    url: `/admin/layDS_Gia?page=${page}`, 
                    PhuongThuc: 2 
                });
            
                if (res && res.success) {
                    setBangGia(res.data || []);
                    setPagination(res.pagination || null);
                } else {
                    ThongBao.ThongBao_Loi("Không thể tải danh sách bảng giá!");
                }
            } catch (error) {
                console.error("Lỗi khi gọi API layDS_Gia:", error);
                ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
            } finally {
                setLoading(false);
            }
        };

        fetchDanhSachGia();
    }, [page]);

    // Lọc dữ liệu theo từ khóa tìm kiếm
    const filteredBangGia = useMemo(() => {
        if (!searchTerm.trim()) return bangGia;
        return bangGia.filter(item => 
            item.TEN_GIA.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.MOTA.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bangGia, searchTerm]);

    // Xử lý chuyển trang
    const handlePageChange = (newPage: number) => {
        if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-400 mb-1">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Cấu hình hệ thống</a>
                        <span><i className="fa-solid fa-chevron-right text-[9px]"></i></span>
                        <span className="text-gray-700">Quản lý bảng giá</span>
                    </nav>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cấu hình Giá áp dụng</h1>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                        Thiết lập các khung giá tiêu chuẩn theo giờ, ngày, tháng để áp dụng cho hệ thống tài chính.
                    </p>
                </div>
                
                <div>
                    <button type="button" className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5">
                        <i className="fa-solid fa-plus text-[10px]"></i>
                        <span>Tạo gói giá mới</span>
                    </button>
                </div>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
                
                {/* SEARCH BAR */}
                <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm tên gói giá, mô tả..." 
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="overflow-x-auto min-h-[300px] relative">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                            <div className="animate-spin inline-block w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
                            <span className="text-xs font-medium text-gray-500">Đang tải cấu hình giá...</span>
                        </div>
                    ) : null}

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <th className="py-3.5 px-6">Tên gói giá / Định danh</th>
                                <th className="py-3.5 px-6">Mô tả</th>
                                <th className="py-3.5 px-6 text-right">Đơn giá định mức</th>
                                <th className="py-3.5 px-6 text-center">Trạng thái áp dụng</th>
                                <th className="py-3.5 px-6 text-center w-24">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-600">
                            {!loading && filteredBangGia.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                                        <i className="fa-regular fa-folder-open text-3xl mb-2 block"></i>
                                        Không tìm thấy gói giá nào áp dụng.
                                    </td>
                                </tr>
                            ) : (
                                filteredBangGia.map((item) => {
                                    // Giả định: Nếu NGAY_KET_THUC là null thì gói đang "Hoạt động", ngược lại là "Tạm ngưng"
                                    const isActive = !item.NGAY_KET_THUC;

                                    return (
                                        <tr key={item.ID_GIA} className={`hover:bg-gray-50/50 transition-colors ${!isActive ? 'bg-red-50/5' : ''}`}>
                                            <td className="py-4 px-6">
                                                <span className={`font-black block text-sm ${isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                                    {item.TEN_GIA}
                                                </span>
                                                <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                                    ID: #{item.ID_GIA} - CAT: {item.DANHMUC_GHE}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-500 max-w-xs truncate">
                                                {item.MOTA || "Chưa có mô tả"}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-black font-mono text-sm ${isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                                    {formatCurrency(item.DON_GIA)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {isActive ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5"></span> Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
                                                        <span className="w-1 h-1 bg-red-500 rounded-full mr-1.5"></span> Tạm ngưng
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button 
                                                    className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer" 
                                                    title="Xem chi tiết"
                                                >
                                                    <i className="fa-solid fa-eye text-sm"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] font-medium text-gray-500 gap-3">
                    <span>
                        Hiển thị {filteredBangGia.length} của tổng số {pagination?.totalItems || 0} cấu hình bảng giá áp dụng
                    </span>
                    
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center space-x-1">
                            <button 
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <i className="fa-solid fa-chevron-left text-[9px]"></i>
                            </button>
                            
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`px-2.5 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                                        page === p 
                                            ? 'bg-indigo-600 text-white shadow-3xs' 
                                            : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-600'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button 
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === pagination.totalPages}
                                className="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <i className="fa-solid fa-chevron-right text-[9px]"></i>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}