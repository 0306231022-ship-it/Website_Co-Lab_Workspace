"use client";
import * as api from '@/API/API';
import React, { useState, useEffect } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as fun from '@/FUNCTION/function';

interface ThongKe {
    TONG: number;
    HOATDONG: number;
    DOANHTHU: number;
}

export interface ILichDatChiTiet {
    ID_LICH_DAT: number;
    TRANG_THAI: string; 
    KHUNG_BATDAU: Date | string; 
    KHUNG_KETTHUC: Date | string;
    TENND: string;
    EMAIL: string;
    GIA_TIEN: number | null;
    TEN_DOI_TUONG: string; 
    LOAI_DAT: 'GHE' | 'KHONG_GIAN'; 
    TEN_CHI_NHANH: string; 
}

function QuanLiDatDon() {
    const limit = 3; // Cấu hình limit = 3 theo yêu cầu
    const [page, setpage] = useState<number>(1);
    const [ThongKe, setThongKe] = useState<ThongKe | null>(null);
    const [danhsach, setDanhSach] = useState<ILichDatChiTiet[]>([]);
    const [tongDanhSach, setTongDanhSach] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // 1. useEffect lấy thống kê (chạy 1 lần khi component mount)
    useEffect(() => {
        const loadThongKe = async () => {
            try {
                const dulieu1 = await api.CallAPI(undefined, { url: '/admin/thongke_lichdat', PhuongThuc: 2 });
                if (dulieu1.success) {
                    setThongKe(dulieu1.dulieu);
                }
            } catch (error) {
                console.error("Lỗi hệ thống thống kê:", error);
            }
        };
        loadThongKe();
    }, []);

    // 2. useEffect lấy danh sách lịch đặt (Chạy lại mỗi khi `page` thay đổi)
    // Gửi page và limit dưới dạng Query Params trong cấu hình của tham số thứ 2
    useEffect(() => {
        const loadDanhSach = async () => {
            setLoading(true);
            try {
                const response = await api.CallAPI(undefined, { 
                    url: `/admin/danhsach_lichdat?page=${page}&limit=${limit}`, 
                    PhuongThuc: 2, 
                });
              

                if (response.success) {
                    setDanhSach(response.danhsach);
                    setTongDanhSach(response.TongDanhSach[0].total);
                } else {
                    ThongBao.ThongBao_CanhBao(response.message || "Không thể tải danh sách");
                }
            } catch (error) {
                console.error("Lỗi hệ thống danh sách:", error);
                ThongBao.ThongBao_CanhBao( "Lỗi kết nối máy chủ");
            } finally {
                setLoading(false);
            }
        };
        loadDanhSach();
    }, [page]);

    // Tính tổng số trang dựa trên tổng số bản ghi và limit
    const totalPages = Math.ceil(tongDanhSach / limit) || 1;

    // Hàm phụ trợ tạo giao diện Badge trạng thái đơn hàng
    const renderBadgeTrangThai = (status: string) => {
        switch (status) {
            case 'Đang sử dụng':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> Đang sử dụng
                    </span>
                );
            case 'Chờ xác nhận':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Chờ xác nhận
                    </span>
                );
            case 'Đã hoàn thành':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Đã hoàn thành
                    </span>
                );
            case 'Đã huỷ':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        Đã huỷ
                    </span>
                );
            default:
                return <span className="px-2 py-1 bg-gray-100 rounded text-[10px]">{status}</span>;
        }
    };

    return (
        <>
            {/* Khối Thống Kê */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-400">Tổng số đơn</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{fun.formatShortNumber(Number(ThongKe?.TONG || 0))}</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-sm"><i className="fa-solid fa-list-check"></i></div>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-400">Đang hoạt động</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">{fun.formatShortNumber(Number(ThongKe?.HOATDONG || 0))}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-sm"><i className="fa-solid fa-circle-play"></i></div>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-400">Doanh thu tháng</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{fun.formatShortNumber(Number(ThongKe?.DOANHTHU || 0))}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center text-sm"><i className="fa-solid fa-dollar-sign"></i></div>
                </div>
            </div>

            {/* Khối Bảng Danh Sách & Tìm Kiếm */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl max-w-max border border-slate-200/40">
                        <button className="bg-white shadow-xs text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">Tất cả</button>
                        <button className="text-slate-500 hover:text-slate-800 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer">Chờ xác nhận</button>
                        <button className="text-slate-500 hover:text-slate-800 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer">Đang sử dụng</button>
                        <button className="text-slate-500 hover:text-slate-800 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer">Đã hoàn thành</button>
                        <button className="text-slate-500 hover:text-slate-800 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer">Đã huỷ</button>
                    </div>
                    
                    <div className="relative w-full md:w-72">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input type="text" placeholder="Tìm kiếm mã đơn, khách hàng..." className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"/>
                    </div>
                </div>

                {/* Bảng Hiển Thị */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="py-3.5 px-5">Mã đơn</th>
                                <th className="py-3.5 px-5">Khách hàng</th>
                                <th className="py-3.5 px-5">Không gian / Tiện ích</th>
                                <th className="py-3.5 px-5">Thời gian đặt</th>
                                <th className="py-3.5 px-5">Tổng tiền</th>
                                <th className="py-3.5 px-5">Trạng thái</th>
                                <th className="py-3.5 px-5 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">Đang tải danh sách dữ liệu...</td>
                                </tr>
                            ) : danhsach.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">Không tìm thấy đơn đặt lịch nào.</td>
                                </tr>
                            ) : (
                                danhsach.map((item) => (
                                    <tr key={item.ID_LICH_DAT} className="hover:bg-slate-50/50 transition">
                                        <td className="py-4 px-5 font-mono font-bold text-slate-900">
                                            #CLB-{item.ID_LICH_DAT}
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="font-semibold text-slate-800">{item.TENND}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{item.EMAIL}</div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="font-medium text-slate-800">
                                                {item.LOAI_DAT === 'GHE' ? 'Ghế: ' : 'Không gian: '}{item.TEN_DOI_TUONG}
                                            </div>
                                            <div className="text-[10px] text-indigo-500 font-semibold mt-0.5">
                                                <i className="fa-solid fa-building text-[9px] mr-1"></i>{item.TEN_CHI_NHANH}
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-slate-600">
                                            <div>{new Date(item.KHUNG_BATDAU).toLocaleDateString('vi-VN')}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {new Date(item.KHUNG_BATDAU).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(item.KHUNG_KETTHUC).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 font-bold text-slate-900">
                                            {item.GIA_TIEN !== null ? `${item.GIA_TIEN.toLocaleString('vi-VN')}đ` : 'Chưa có hóa đơn'}
                                        </td>
                                        <td className="py-4 px-5">
                                            {renderBadgeTrangThai(item.TRANG_THAI)}
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center justify-center space-x-2">
                                                {item.TRANG_THAI === 'Chờ xác nhận' ? (
                                                    <>
                                                        <button title="Xác nhận duyệt đơn" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"><i className="fa-solid fa-circle-check text-sm"></i></button>
                                                        <button title="Huỷ đơn" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"><i className="fa-solid fa-circle-xmark text-sm"></i></button>
                                                    </>
                                                ) : (
                                                    <button title="Xem chi tiết" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"><i className="fa-solid fa-eye text-sm"></i></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Khối Thanh Phân Trang */}
                <div className="bg-slate-50/50 border-t border-slate-200/60 px-5 py-3.5 flex items-center justify-between mt-auto">
                    <p className="text-[11px] text-slate-500 font-medium">
                        Hiển thị <span className="font-bold text-slate-700">{tongDanhSach === 0 ? 0 : (page - 1) * limit + 1} - {Math.min(page * limit, tongDanhSach)}</span> trong tổng số <span className="font-bold text-slate-700">{tongDanhSach}</span> đơn đặt chỗ
                    </p>
                    
                    <div className="flex items-center space-x-1">
                        {/* Nút lùi trang */}
                        <button 
                            disabled={page === 1}
                            onClick={() => setpage(prev => Math.max(prev - 1, 1))}
                            className={`p-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 transition ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        
                    
                    
                                <span
                    
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer bg-indigo-600 text-white border-indigo-600 shadow-xs`}
                                >
                                {page}
                                </span>
                

                        {/* Nút tiến trang */}
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setpage(prev => Math.min(prev + 1, totalPages))}
                            className={`p-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 transition ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}

export default QuanLiDatDon;