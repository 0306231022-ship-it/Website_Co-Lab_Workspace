"use client";
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';
import { useEffect, useState } from 'react';
import ThongKe from "../Modal/Thongke";
import * as fun from '@/FUNCTION/function';

interface LichDatItem {
    ID_LICH_DAT: number;
    TenKhachHang: string;
    KHUNG_BATDAU: string;
    KHUNG_KETTHUC: string;
    TRANG_THAI: number;
}

interface DashboardData {
    DanhSach: LichDatItem[];
    TongLich: number;
    DoanhThu: number; 
    ghe: number;
    phong: number;
    TongChiNhanh: number;
    TongKhongGian:number
}

function Admin() {
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        DanhSach: [],
        TongLich: 0,
        DoanhThu: 0,
        ghe: 0,
        phong: 0,
        TongChiNhanh:0,
        TongKhongGian:0
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
       const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.CallAPI(undefined,{url:'/admin/layTongQuan', PhuongThuc:2}) 
            if (response && response.success) {
                setDashboardData({
                    DanhSach: response.DanhSach,
                    TongLich: response.TongLich,
                    DoanhThu: parseFloat(response.DoanhThu || "0"),
                    ghe: response.ghe,
                    phong: response.phong,
                    TongChiNhanh:response.TongChiNhanh,
                    TongKhongGian:response.TongKhongGian
                });
            } else {
                ThongBao.ThongBao_CanhBao("Lấy dữ liệu thất bại");
            }
        } catch (error) {
            console.error("Lỗi gọi API Dashboard:", error);
            ThongBao.ThongBao_CanhBao("Đã xảy ra lỗi kết nối hệ thống.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
    }, []);
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')} Tháng ${String(today.getMonth() + 1).padStart(2, '0')}, ${today.getFullYear()}`;
    return (
        <>
            {/* Header tổng quan */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Bảng Quản Trị Hệ Thống</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Theo dõi hoạt động tổng thể, quản lý đặt chỗ và tối ưu hóa tài nguyên.</p>
                </div>
                <div className="flex items-center space-x-2.5 bg-white border border-slate-200/60 px-3 py-1.5 rounded-xl shadow-xs self-start sm:self-auto text-xs font-semibold text-slate-600">
                    <i className="fa-regular fa-calendar text-indigo-500"></i>

                    <span>{formattedDate}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Đặt đơn mới</span>
                        <span className="text-2xl font-bold text-slate-800 tracking-tight mt-1 block">
                            {isLoading ? '...' : `${dashboardData.TongLich} đơn`}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <i className="fa-solid fa-file-invoice-dollar text-base"></i>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Hiệu suất ghế</span>
                        <span className="text-2xl font-bold text-slate-800 tracking-tight mt-1 block">
                            {isLoading ? '...' : `${dashboardData.ghe}% Tải`}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <i className="fa-solid fa-chair text-base"></i>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Hiệu suất phòng</span>
                        <span className="text-2xl font-bold text-slate-800 tracking-tight mt-1 block">
                            {isLoading ? '...' : `${dashboardData.phong}% Tải`}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <i className="fa-solid fa-users text-base"></i>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Doanh thu tạm tính</span>
                        <span className="text-xl font-bold text-slate-800 tracking-tight mt-1.5 block">
                            {isLoading ? '...' : fun.formatCurrency(dashboardData.DoanhThu)}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                        <i className="fa-solid fa-wallet text-base"></i>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Tổng chi nhánh</span>
                        <span className="text-xl font-bold text-slate-800 tracking-tight mt-1.5 block">
                             {isLoading ? '...' : `${dashboardData.TongChiNhanh} chi nhánh` }
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                        <i className="fa-solid fa-wallet text-base"></i>
                    </div>
                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Tổng không gian</span>
                        <span className="text-xl font-bold text-slate-800 tracking-tight mt-1.5 block">
                            {isLoading ? '...' : `${dashboardData.TongKhongGian} không gian` }
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                        <i className="fa-solid fa-wallet text-base"></i>
                    </div>
                </div>
                
            </div>

            {/* Khối Bảng Danh Sách và Tiến trình hiệu suất */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                
                {/* Bảng dữ liệu lấy từ mảng DanhSach */}
                <div className="xl:col-span-2 bg-white border border-slate-200/60 rounded-xl shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Danh sách đặt đơn gần đây</h2>
                            <p className="text-[11px] text-slate-400">Cập nhật phiên đặt chỗ và trạng thái hóa đơn của khách hàng</p>
                        </div>
                        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-all">Xem tất cả đơn</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Khách hàng</th>
                                    <th className="px-5 py-3 font-semibold">Khung giờ đặt</th>
                                    <th className="px-5 py-3 font-semibold">Trạng thái đơn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/70 font-medium text-slate-600">
                                {isLoading ? (
                                    <tr><td colSpan={3} className="text-center py-6 text-slate-400">Đang tải dữ liệu...</td></tr>
                                ) : dashboardData.DanhSach.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-6 text-slate-400">Không có đơn nào trong hôm nay.</td></tr>
                                ) : (
                                    dashboardData.DanhSach.map((item) => {
                                        const status = fun.getStatusDetails(item.TRANG_THAI);
                                        return (
                                            <tr key={item.ID_LICH_DAT} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-5 py-3.5 flex items-center space-x-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px]">
                                                        {fun.getInitials(item.TenKhachHang)}
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{item.TenKhachHang}</span>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-500">
                                                    {fun.formatTime(item.KHUNG_BATDAU)} - {fun.formatTime(item.KHUNG_KETTHUC)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${status.css}`}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cột Tiến Trình Hiệu Suất bên phải */}

                <div className="space-y-4">
                    <div className="bg-white border border-slate-200/60 rounded-xl p-5 space-y-4 shadow-xs">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Hiệu suất tài nguyên hôm nay</h3>
                            <p className="text-[11px] text-slate-400">Trạng thái lấp đầy của danh mục Ghế & Phòng</p>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="text-slate-600">Ghế đơn (Hot Desk)</span>

                                    <span className="text-indigo-600">{dashboardData.ghe}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                    <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${dashboardData.ghe}%` }}></div>

                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${dashboardData.ghe}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="text-slate-600">Phòng họp cố định</span>
                                    <span className="text-indigo-600">{dashboardData.phong}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                    <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${dashboardData.phong}%` }}></div>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${dashboardData.phong}` }}></div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <div className="mt-6">
                <ThongKe />
            </div>

        </>
    )
};


export default Admin;