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
    ChartOptions
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export interface HieuSuatChiNhanh {
    ID_CHI_NHANH: number;     
    TEN_CHI_NHANH: string;    
    NGUOI_QUAN_LY: string;    
    TONG_DOANH_THU: number;   
    TIEN_DO: number;          
}

export default function BaoCaoThongKe() {
    
    const [danhSachHieuSuat, setDanhSachHieuSuat] = useState<HieuSuatChiNhanh[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [kyThongKe, setKyThongKe] = useState<string>("Tháng này");

    useEffect(() => {
        const fetchDuLieuThongKe = async () => {
            setLoading(true);
            try {
                const resChiNhanh = await api.CallAPI(undefined, { url: `/admin/thongke-hieusuat?ky=${kyThongKe}`, PhuongThuc: 2 }) 
                if (resChiNhanh?.success) {
                    setDanhSachHieuSuat(resChiNhanh.data || []);
                } else {
                    ThongBao.ThongBao_Loi("Không thể lấy dữ liệu thống kê từ máy chủ!");
                    setDanhSachHieuSuat([]);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                ThongBao.ThongBao_Loi("Lỗi kết nối khi tải báo cáo hoạt động!");
                setDanhSachHieuSuat([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDuLieuThongKe();
    }, [kyThongKe]);

    const renderTrangThai = (phanTram: number) => {
        const pt = Number(phanTram) || 0;
        if (pt >= 80) return { bgBar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800", text: "Đạt Chỉ Tiêu" };
        if (pt >= 50) return { bgBar: "bg-amber-500", badge: "bg-amber-100 text-amber-800", text: "Cần Cố Gắng" };
        return { bgBar: "bg-red-500", badge: "bg-red-100 text-red-800", text: "Cảnh Báo Chậm" };
    };
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

  const doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { 
            position: 'bottom' as const,
            labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const label = context.label || '';
                    const datasetData = context.dataset.data;
                    const total = datasetData.reduce((sum: number, value) => {
                        return sum + (Number(value) || 0);
                    }, 0);

                    const currentValue = Number(context.raw) || 0;
                    const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : 0;

                    return ` ${label}: ${percentage}%`;
                }
            }
        }
    },
    cutout: '65%',
};

    return (
        <div className="bg-gray-50 font-sans antialiased text-gray-800 w-full min-h-screen">

            <div className="p-6 max-w-7xl w-full mx-auto space-y-6">

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
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Tỷ Lệ % theo chi nhánh</h2>
                        <div className="h-80 relative flex items-center justify-center w-full pb-4">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Bảng Trạng Thái Hoạt Động</h2>
           
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                                    <th className="py-3 px-6">Tên Chi Nhánh</th>
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