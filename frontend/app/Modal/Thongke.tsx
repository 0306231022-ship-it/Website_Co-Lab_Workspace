"use client";
import React, { useState, useEffect } from "react";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";

// Import các thư viện vẽ biểu đồ
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Đăng ký các thành phần Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// =====================================================================
// 1. KHAI BÁO INTERFACE 
// =====================================================================

export interface ThongKeTongQuan {
    TongChiNhanh: number;     
    ChiNhanhMoi: number;      
    DoanhThuThang: number;    
    PhanTramDoanhThu: number; 
    TongDonHang: number;      
    PhanTramDonHang: number;  
    KhachHangMoi: number;     
    PhanTramKhachHang: number;
}

export interface HieuSuatChiNhanh {
    ID_CHI_NHANH: number;     
    TEN_CHI_NHANH: string;    
    NGUOI_QUAN_LY: string;    
    TONG_DOANH_THU: number;   
    TIEN_DO: number;          
}

// =====================================================================
// 2. COMPONENT CHÍNH
// =====================================================================

export default function BaoCaoThongKe() {
    const [tongQuan, setTongQuan] = useState<ThongKeTongQuan | null>(null);
    const [danhSachHieuSuat, setDanhSachHieuSuat] = useState<HieuSuatChiNhanh[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [kyThongKe, setKyThongKe] = useState<string>("Tháng này");

    useEffect(() => {
        const fetchDuLieuThongKe = async () => {
            setLoading(true);
            try {
                const [resDoanhThu, resChiNhanh] = await Promise.all([
                    api.CallAPI(undefined, { url: `/admin/thongke-tongquan?ky=${kyThongKe}`, PhuongThuc: 2 }),
                    api.CallAPI(undefined, { url: `/admin/thongke-hieusuat?ky=${kyThongKe}`, PhuongThuc: 2 }) 
                ]);

                if (resDoanhThu?.success && resChiNhanh?.success) {
                    setTongQuan(resDoanhThu.data);
                    setDanhSachHieuSuat(resChiNhanh.data || []);
                } else {
                    ThongBao.ThongBao_Loi("Không thể lấy dữ liệu thống kê từ máy chủ!");
                    setTongQuan(null);
                    setDanhSachHieuSuat([]);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                ThongBao.ThongBao_Loi("Lỗi kết nối khi tải báo cáo hoạt động!");
                setTongQuan(null);
                setDanhSachHieuSuat([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDuLieuThongKe();
    }, [kyThongKe]);

    // Định dạng tiền tệ
    const formatTienTe = (tien: number) => {
        if (!tien) return "0 đ";
        if (tien >= 1000000000) return (tien / 1000000000).toFixed(2) + " Tỷ";
        return new Intl.NumberFormat('vi-VN').format(tien) + " đ";
    };

    // Render badge theo % tiến độ
    const renderTrangThai = (phanTram: number) => {
        const pt = Number(phanTram) || 0;
        if (pt >= 80) return { bgBar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800", text: "Đạt Chỉ Tiêu" };
        if (pt >= 50) return { bgBar: "bg-amber-500", badge: "bg-amber-100 text-amber-800", text: "Cần Cố Gắng" };
        return { bgBar: "bg-red-500", badge: "bg-red-100 text-red-800", text: "Cảnh Báo Chậm" };
    };

    // =====================================================================
    // 3. CẤU HÌNH DỮ LIỆU BIỂU ĐỒ (Dựa trên API trả về)
    // =====================================================================

    // 3.1. Biểu đồ cột (Doanh thu các chi nhánh)
    const barChartData = {
        labels: danhSachHieuSuat.map(item => item.TEN_CHI_NHANH),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: danhSachHieuSuat.map(item => item.TONG_DOANH_THU),
                backgroundColor: 'rgba(16, 185, 129, 0.8)', // Xanh Emerald
                borderRadius: 6,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // Ẩn chú thích vì chỉ có 1 cột
        },
    };

    // 3.2. Biểu đồ tròn (Tỷ lệ đóng góp)
    // Tạo mảng màu đẹp cho các chi nhánh
    const pieColors = [
        'rgba(16, 185, 129, 0.8)', // Emerald
        'rgba(245, 158, 11, 0.8)', // Amber
        'rgba(59, 130, 246, 0.8)', // Blue
        'rgba(239, 68, 68, 0.8)',  // Red
        'rgba(139, 92, 246, 0.8)', // Violet
    ];

    const doughnutChartData = {
        labels: danhSachHieuSuat.map(item => item.TEN_CHI_NHANH),
        datasets: [
            {
                data: danhSachHieuSuat.map(item => item.TONG_DOANH_THU),
                backgroundColor: pieColors.slice(0, danhSachHieuSuat.length),
                borderWidth: 0,
            },
        ],
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'bottom' as const,
                labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
            },
        },
        cutout: '65%', // Biến thành dạng nhẫn Doughnut
    };

    return (
        <div className="bg-gray-50 font-sans antialiased text-gray-800 w-full min-h-screen">
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-gray-600 text-xl"><i className="fa-solid fa-bars"></i></button>
                    <h1 className="text-xl font-semibold text-gray-800">Báo Cáo Hoạt Động Chi Nhánh</h1>
                </div>
            </header>

            <div className="p-6 max-w-7xl w-full mx-auto space-y-6">

                {/* 4 CARD TỔNG QUAN */}
                

                {/* BIỂU ĐỒ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Hiệu Suất Doanh Thu Các Chi Nhánh</h2>
                            <select 
                                value={kyThongKe}
                                onChange={(e) => setKyThongKe(e.target.value)}
                                className="text-sm border border-gray-300 rounded-md p-1.5 bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="Tháng này">Tháng này</option>
                                <option value="Quý này">Quý này</option>
                                <option value="Năm nay">Năm nay</option>
                            </select>
                        </div>
                        <div className="h-80 relative w-full pt-4">
                            {/* Render Biểu đồ Cột */}
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-gray-400"><i className="fa-solid fa-spinner animate-spin mr-2"></i> Đang tải biểu đồ...</div>
                            ) : danhSachHieuSuat.length > 0 ? (
                                <Bar data={barChartData} options={barChartOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">Không có dữ liệu biểu đồ</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Tỷ Lệ Đơn Hàng Theo Miền</h2>
                        <div className="h-80 relative flex items-center justify-center w-full pb-4">
                            {/* Render Biểu đồ Tròn */}
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-gray-400"><i className="fa-solid fa-spinner animate-spin mr-2"></i> Đang tải biểu đồ...</div>
                            ) : danhSachHieuSuat.length > 0 ? (
                                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">Không có dữ liệu biểu đồ</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BẢNG TRẠNG THÁI HOẠT ĐỘNG */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Bảng Trạng Thái Hoạt Động</h2>
                        <button className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition cursor-pointer">
                            <i className="fa-solid fa-download mr-1"></i> Xuất File Excel
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                                    <th className="py-3 px-6">Tên Chi Nhánh</th>
                                    <th className="py-3 px-6">Người Quản Lý</th>
                                    <th className="py-3 px-6 text-right">Doanh Thu</th>
                                    <th className="py-3 px-6">Tiến Độ Mục Tiêu</th>
                                    <th className="py-3 px-6">Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">Đang tải dữ liệu thực tế từ máy chủ...</td></tr>
                                ) : danhSachHieuSuat.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">Không có dữ liệu chi nhánh nào trong kỳ này.</td></tr>
                                ) : (
                                    danhSachHieuSuat.map((item) => {
                                        const trangThai = renderTrangThai(item.TIEN_DO);
                                        return (
                                            <tr key={item.ID_CHI_NHANH} className="hover:bg-gray-50/70 transition">
                                                <td className="py-4 px-6 font-semibold text-gray-900">{item.TEN_CHI_NHANH}</td>
                                                <td className="py-4 px-6 text-gray-600">{item.NGUOI_QUAN_LY || "Chưa cập nhật"}</td>
                                                <td className="py-4 px-6 font-medium text-gray-800 text-right">{new Intl.NumberFormat('vi-VN').format(item.TONG_DOANH_THU || 0)} đ</td>
                                                <td className="py-4 px-6 w-1/4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className={`${trangThai.bgBar} h-2 rounded-full`} style={{ width: `${Math.min(item.TIEN_DO || 0, 100)}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-600">{item.TIEN_DO || 0}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2.5 py-1 text-xs font-medium ${trangThai.badge} rounded-full`}>
                                                        {trangThai.text}
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

            </div>
        </div>
    );
}