"use client";
import React, { useState, useEffect } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { Ghe } from "@/interface/ghe";
import Image from "next/image";
import * as fun from '@/FUNCTION/function';
import { useModalContext } from "@/context/QuanLiMoal";

interface dulieu {
    ID_GHE: number;
}

interface ThongTin_DatLich {
    KHUNG_BATDAU: string;
    KHUNG_KETTHUC: string;
    TENND: string;
    HINH_ANH: string;
    EMAIL: string;
}

function ThongTinGhe({ DuLieu }: { DuLieu: dulieu }) {
    const [ThongTin, setThongTin] = useState<Ghe | null>(null);
    const [thongTin_DatL, setTT] = useState<ThongTin_DatLich | null>(null);
    const { OpenMoDal } = useModalContext();

    useEffect(() => {
        const laydl = async () => {
            try {
                // Sửa logic truyền param nếu DuLieu là Object {ID_GHE: ...} hoặc số đơn thuần
                const idGhe = typeof DuLieu === 'object' ? (DuLieu).ID_GHE : DuLieu;
                const lay = await api.CallAPI(undefined, { url: `/admin/ChiTiet_ghe?ID_GHE=${idGhe}`, PhuongThuc: 2 });
                
                if (lay.success) {
                    setThongTin(lay.dulieu.ThongTinGhe);
                    if (lay.dulieu.NguoiDatHienTai !== null && lay.dulieu.NguoiDatHienTai.length > 0) {
                        setTT(lay.dulieu.NguoiDatHienTai[0]);
                    } else {
                        setTT(null);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết ghế:", error);
                ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
            }
        };
        laydl();
    }, [DuLieu]);

    return (
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row overflow-hidden transition-all duration-300">
            
            {/* CỘT TRÁI: THÔNG TIN CƠ BẢN CỦA GHẾ */}
            <div className="w-full md:w-5/12 bg-slate-50/70 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
                <div className="space-y-6">
                    {/* Header ID Ghế */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã vị trí</span>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">A-{ThongTin?.ID_GHE || '--'}</h2>
                        </div>
                        <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-2xs">
                            <i className="fa-solid fa-chair"></i>
                        </div>
                    </div>

                    {/* Danh sách thuộc tính */}
                    <div className="space-y-4 px-1">
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tên ghế (Tài sản)</span>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{ThongTin?.TEN_GHE || 'Chưa cập nhật'}</p>
                        </div>
                        
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Thuộc khu vực</span>
                            <p className="text-sm font-medium text-slate-700 mt-0.5">
                                <i className="fa-solid fa-map-location-dot text-slate-400 mr-1.5 text-xs"></i>
                                {ThongTin?.TEN_KHONG_GIAN || 'Chưa rõ'}
                            </p>
                        </div>
                        
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Loại chỗ ngồi</span>
                            <p className="text-sm font-medium text-slate-700 mt-0.5">
                                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-200/60 text-slate-700 rounded-md">
                                    {ThongTin?.TEN_DANHMUC || 'Mặc định'}
                                </span>
                            </p>
                        </div>

                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Giá thuê theo giờ</span>
                            <p className="text-lg font-black text-amber-600 mt-0.5">
                                {ThongTin?.DON_GIA ? fun.formatCurrency(ThongTin.DON_GIA) : '0đ'}
                                <span className="text-xs font-normal text-slate-400 lowercase"> / giờ</span>
                            </p>
                        </div>

                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Trạng thái kỹ thuật</span>
                            {ThongTin?.TRANG_THAI === 1 ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span> Hoạt động tốt
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span> Đang bảo trì / Sửa chữa
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Nút chỉnh sửa */}
                <div className="mt-8 pt-4 border-t border-slate-200/60">
                    <button 
                        type="button" 
                        onClick={() => OpenMoDal({id:ThongTin?.ID_GHE}, { TenTrang: 'ChinhSuaGhe' })} 
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <i className="fa-solid fa-pen-to-square text-xs"></i> Chỉnh sửa thiết lập
                    </button>
                </div>
            </div>

            {/* CỘT PHẢI: TRẠNG THÁI ĐẶT CHỖ HIỆN TẠI */}
            <div className="w-full md:w-7/12 p-6 flex flex-col justify-between bg-white">
                <div className="space-y-5">
                    <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Tình trạng sử dụng</span>

                    {/* Badge Trạng thái */}
                    <div>
                        {thongTin_DatL !== null ? (
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/50 shadow-2xs">
                                <span className="relative flex h-2 w-2 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                                </span>
                                ĐANG CÓ NGƯỜI SỬ DỤNG
                            </div>
                        ) : (
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                                TRỐNG / SẴN SÀNG ĐÓN KHÁCH
                            </div>
                        )}
                    </div>

                    {/* Box chi tiết người đặt */}
                    {thongTin_DatL !== null ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4 shadow-3xs">
                            <div className="flex items-center space-x-3">
                                {/* Khung bọc Image bộc bắt buộc có relative và kích thước cố định */}
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-white shadow-xs flex-shrink-0">
                                    <Image 
                                        src={`http://localhost:3001/${thongTin_DatL.HINH_ANH}`} 
                                        alt={thongTin_DatL.TENND} 
                                        fill 
                                        unoptimized 
                                        className="object-cover" 
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{thongTin_DatL.TENND}</p>
                                    <p className="text-xs text-slate-400 font-medium">{thongTin_DatL.EMAIL}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-slate-200/60 text-xs">
                                <div>
                                    <span className="text-slate-400 block font-semibold mb-0.5">Thời gian bắt đầu</span>
                                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                        <i className="fa-regular fa-clock text-indigo-500"></i>
                                        {fun.formatTime(thongTin_DatL.KHUNG_BATDAU)} | {fun.formatDate(thongTin_DatL.KHUNG_BATDAU)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-semibold mb-0.5">Thời gian kết thúc</span>
                                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                        <i className="fa-regular fa-calendar-xmark text-rose-500"></i>
                                        {fun.formatTime(thongTin_DatL.KHUNG_KETTHUC)} | {fun.formatDate(thongTin_DatL.KHUNG_KETTHUC)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 p-4">
                            <i className="fa-solid fa-calendar-check text-2xl mb-2 text-slate-300"></i>
                            <p className="text-xs font-medium">Hiện tại không có lịch đặt chỗ nào cho vị trí này.</p>
                        </div>
                    )}
                </div>

                {/* Khối Actions bên dưới */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button type="button" className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                        <i className="fa-solid fa-history text-[11px]"></i> Lịch sử đặt
                    </button>
                    <button type="button" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer">
                        Hoàn tất xem
                    </button>
                </div>
            </div>
            
        </div>
    );
}

export default ThongTinGhe;