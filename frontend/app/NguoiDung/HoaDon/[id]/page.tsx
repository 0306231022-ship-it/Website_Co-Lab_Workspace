"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from 'next/navigation';
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';
import { useRouter } from 'next/navigation';
interface HoaDon {
    ID_HOADON: number;
    GIA_TIEN: string;
    NGAY_TAO: string | null;
    TRANG_THAI: number;
    ID_LICHDAT: number;
    TENND: string;
    EMAIL: string;
    ID_KHONG_GIAN_THUCTE: number;
    TEN_KHONG_GIAN: string;
    TEN_CHI_NHANH: string;
    DIA_CHI: string;
    TEN_GHE: string | null;
}



// Hàm định dạng tiền tệ VNĐ
const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return "0 đ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num).replace('₫', 'đ');
};

// Hàm định dạng ngày giờ (VD: 14/06/2026 · 07:45)
const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Chưa cập nhật";
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date).replace(',', ' ·');
    } catch {
        return dateString;
    }
};

function ChitietHoaDon() {
    const [hoaDon, setHoaDon] = useState<HoaDon | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { id } = useParams();
const router = useRouter();
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Gọi API với id lịch đặt
                const res = await api.CallAPI(undefined, { 
                    url: `/NguoiDung/chitiethoadon?ID_LICH_DAT=${id}`, 
                    PhuongThuc: 2 
                });
                if (res.success) {
                    setHoaDon(res.data[0][0]);
                } else {
                    ThongBao.ThongBao_Loi("Không tìm thấy thông tin hóa đơn!");
                }
            } catch (error) {
                console.error("Lỗi khi tải hóa đơn:", error);
                ThongBao.ThongBao_Loi("Đã xảy ra lỗi khi tải dữ liệu!");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Tính toán tiền dịch vụ, VAT (10%) và tổng thanh toán
    const chiPhi = useMemo(() => {
        if (!hoaDon) return { giaGoc: 0, vat: 0, tongTien: 0 };
        const giaGoc = parseFloat(hoaDon.GIA_TIEN) || 0;
        const vat = giaGoc * 0.1; // Giả sử thuế VAT 10%
        const tongTien = giaGoc + vat;
        return { giaGoc, vat, tongTien };
    }, [hoaDon]);

    // Màn hình Loading
    if (loading) {
        return (
            <div className="p-10 mx-auto w-full max-w-2xl text-center">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3"></div>
                <p className="text-sm font-medium text-slate-500">Đang tải hóa đơn dịch vụ...</p>
            </div>
        );
    }

    // Màn hình khi không có dữ liệu
    if (!hoaDon) {
        return (
            <div className="p-8 mx-auto w-full max-w-md text-center bg-white rounded-2xl border border-slate-200 mt-10 shadow-sm">
                <i className="fa-solid fa-file-circle-exclamation text-4xl text-amber-500 mb-3"></i>
                <h3 className="font-bold text-slate-800 text-base">Không tìm thấy hóa đơn</h3>
                <p className="text-xs text-slate-500 mt-1">Hóa đơn cho lịch đặt này không tồn tại hoặc đã bị xóa.</p>
            </div>
        );
    }

    const isPaid = hoaDon.TRANG_THAI === 1; // Giả sử 1 là Đã thanh toán

    return (
        <div className="p-4 mx-auto w-full max-w-2xl">
            <div className="print-card w-full max-w-3xl bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
                
                {/* TEM TRẠNG THÁI */}
                <div className={`absolute top-8 right-6 sm:right-10 pointer-events-none select-none rotate-12 opacity-20 border-4 font-extrabold text-sm tracking-widest uppercase px-3 py-1 rounded-lg ${
                    isPaid ? 'border-emerald-600 text-emerald-600' : 'border-amber-600 text-amber-600'
                }`}>
                    {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </div>
                 <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm">
              <i className="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <h2 className="text-base font-bold text-slate-800">Quay lại danh sách</h2>
          </div>

                {/* HEADER HÓA ĐƠN */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
                    <div className="space-y-2">
                        <div className="text-base font-extrabold tracking-wider text-slate-900 flex items-center">
                            <i className="fa-solid fa-cube mr-2 text-indigo-600 text-lg"></i>CO-LAB WORKSPACE
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs">
                           Chi nhánh: {hoaDon.TEN_CHI_NHANH} <br/> 
                           Địa chỉ: {hoaDon?.DIA_CHI}<br/>
                        </div>
                    </div>
                    <div className="text-left sm:text-right space-y-1 w-full sm:w-auto">
                        <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide">Hóa đơn dịch vụ</h1>
                        <p className="text-xs font-mono font-bold text-indigo-600">
                           #INV-2026-{(hoaDon?.ID_HOADON ?? 0).toString().padStart(4, '0')}
                        </p>
                        <div className="text-[11px] text-slate-400 font-medium pt-1">
                            <p>Ngày lập: {formatDate(hoaDon.NGAY_TAO)}</p>
                            <p>Hạn thanh toán: Liền ngay</p>
                        </div>
                    </div>
                </div>

                {/* THÔNG TIN KHÁCH HÀNG & GIAO DỊCH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-b border-slate-100">
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khách hàng thanh toán</p>
                        <p className="text-xs font-bold text-slate-900">{hoaDon.TENND || "Khách hàng vãng lai"}</p>
                        <p className="text-[11px] text-slate-500 font-medium font-mono">{hoaDon.EMAIL || "Chưa cung cấp email"}</p>
                    </div>
                    <div className="space-y-1.5 sm:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hình thức giao dịch</p>
                        <p className="text-xs font-bold text-emerald-600 flex items-center sm:justify-end gap-1">
                            <i className="fa-solid fa-globe text-[11px]"></i> Thanh toán Trực tuyến
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                            Mã lịch đặt: <span className="font-mono font-bold text-slate-700">#BOOK-{hoaDon.ID_LICHDAT}</span>
                        </p>
                    </div>
                </div>

                {/* BẢNG DỊCH VỤ */}
                <div className="py-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-200/60 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                                    <th className="py-2.5 px-3">Mô tả dịch vụ đặt chỗ</th>
                                    <th className="py-2.5 px-3 text-center">Vị trí / Ghế</th>
                                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                <tr>
                                    <td className="py-4 px-3 max-w-sm">
                                        <div className="font-bold text-slate-900">{hoaDon.TEN_KHONG_GIAN}</div>
                                        <div className="text-[10px] text-slate-400 mt-1">
                                            {hoaDon.TEN_CHI_NHANH} — Ngày tạo: {formatDate(hoaDon.NGAY_TAO)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-3 text-center font-semibold text-slate-800">
                                        {hoaDon.TEN_GHE ? `Ghế ${hoaDon.TEN_GHE}` : "Khu vực chung / Nguyên phòng"}
                                    </td>
                                    <td className="py-4 px-3 text-right font-bold text-slate-900 font-mono">
                                        {formatCurrency(chiPhi.giaGoc)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TỔNG TIỀN & VAT */}
                <div className="border-t border-slate-100 pt-6 flex flex-col items-end space-y-2 text-xs">
                    <div className="w-full sm:w-64 flex justify-between text-slate-500">
                        <span>Cộng tiền dịch vụ:</span>
                        <span className="font-semibold text-slate-800 font-mono">{formatCurrency(chiPhi.giaGoc)}</span>
                    </div>
                    <div className="w-full sm:w-64 flex justify-between text-slate-500">
                        <span>Thuế giá trị gia tăng (VAT 10%):</span>
                        <span className="font-semibold text-slate-800 font-mono">{formatCurrency(chiPhi.vat)}</span>
                    </div>
                    <div className="w-full sm:w-64 flex justify-between border-t border-slate-100 pt-3 text-slate-900 font-bold">
                        <span className="text-sm">Tổng cộng thực trả:</span>
                        <span className="text-base font-extrabold text-indigo-600 font-mono">{formatCurrency(chiPhi.tongTien)}</span>
                    </div>
                    <div className="pt-2 text-[11px] text-slate-400 italic text-right w-full">
                        (Giá trên đã bao gồm các chi phí dịch vụ đi kèm tại không gian)
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
                    <div className="text-[11px] text-slate-400 font-medium">
                        <p className="font-semibold text-slate-500 mb-0.5">Cảm ơn bạn đã lựa chọn Co-Lab Workspace!</p>
                        <p>Hóa đơn điện tử được lưu trữ và bảo mật trực tuyến.</p>
                    </div>
                    <div className="text-center sm:text-right space-y-1 shrink-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đại diện Co-Lab</p>
                        <div className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1 flex items-center justify-center gap-1">
                            <i className="fa-solid fa-signature"></i> Hệ thống đã Ký số
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ChitietHoaDon;