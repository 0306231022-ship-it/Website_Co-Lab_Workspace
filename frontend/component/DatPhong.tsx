"use client";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import * as fun from '@/FUNCTION/function';

interface LichDaDat {
    KHUNG_BATDAU: string,
    KHUNG_KETTHUC: string
}

function DatPhong({ DuLieu }: { DuLieu: string }) {
    const { idKhongGian } = useParams();
    const [err, setErr] = useState<string[]>([]);
    
    // Khởi tạo ngày hôm nay theo định dạng YYYY-MM-DD
    const getTodayString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Khởi tạo thời gian tối thiểu theo chuẩn ISO cục bộ YYYY-MM-DDTHH:mm để truyền vào thuộc tính min
    const [minDateTime] = useState<string>(() => {
        const bayGio = new Date();
        return bayGio.toLocaleString('sv-SE').replace(' ', 'T').substring(0, 16);
    });

    const todayDate = getTodayString();
    const [loading, setloading] = useState<boolean>(false);
    const [ngayDat, setNgayDat] = useState(todayDate);
    const [gioBatDau, setGioBatDau] = useState<string>('');
    const [gioKetThuc, setGioKetThuc] = useState<string>('');
    const [lichDaDat, setLichDaDat] = useState<LichDaDat[]>([]);

    const batDau = new Date(gioBatDau);
    const ketThuc = new Date(gioKetThuc);
    const tongGio = (ketThuc.getTime() - batDau.getTime()) / (1000 * 60 * 60);

    // 🔥 LOGIC KIỂM TRA TRÙNG LỊCH ĐẶT VÀ THỜI GIAN HỢP LỆ
    const kiemTraLichTrungNhau = () => {
        if (!gioBatDau || !gioKetThuc) return { trung: false, message: "" };

        const startChon = new Date(gioBatDau);
        const endChon = new Date(gioKetThuc);
        const bayGio = new Date();

        // 1. Kiểm tra giờ quá khứ
        if (startChon < bayGio) {
            return { trung: true, message: "Thời gian bắt đầu không được ở trong quá khứ!" };
        }

        // 2. Kiểm tra logic bắt đầu - kết thúc
        if (endChon <= startChon) {
            return { trung: true, message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu!" };
        }

        // 3. Kiểm tra xem có đè chéo lên lịch đã tồn tại không
        for (const lich of lichDaDat) {
            const startDaDat = new Date(lich.KHUNG_BATDAU);
            const endDaDat = new Date(lich.KHUNG_KETTHUC);

            // Công thức kiểm tra giao thoa: (Bắt đầu 1 < Kết thúc 2) VÀ (Kết thúc 1 > Bắt đầu 2)
            if (startChon < endDaDat && endChon > startDaDat) {
                return { 
                    trung: true, 
                    message: `Khung giờ này đã có người đặt! TRÙNG LỊCH: (${fun.formatTime(lich.KHUNG_BATDAU)} - ${fun.formatTime(lich.KHUNG_KETTHUC)})` 
                };
            }
        }

        return { trung: false, message: "" };
    };

    const ketQuaKiemTra = kiemTraLichTrungNhau();
    const laLichHopLe = gioBatDau && gioKetThuc && !ketQuaKiemTra.trung;

    const laydl = async () => {
        setloading(true)
        try {
            const dulieu2 = await api.CallAPI(undefined, { url: `/admin/DanhSach_theo_khonggian?IDKG=${idKhongGian}`, PhuongThuc: 2 })
            if (dulieu2 && dulieu2.success) {
                setLichDaDat(dulieu2.dulieu || []);
            } else {
                setLichDaDat([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin không gian:", error);
            ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin không gian');
        } finally {
            setloading(false)
        }
    }

    useEffect(() => {
        const haha = async () => {
            await laydl()
        }
        haha();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchLichDaDat = async (selectedDate: string) => {
        if (!selectedDate) return;
        setloading(true)
        try {
            const data = await api.CallAPI(undefined, { url: `/admin/lichdatkhonggian_theothoigian?THOIGIAN=${fun.formatToBackendDateTime(selectedDate)}&IDKG=${idKhongGian}`, PhuongThuc: 2 });

            if (data.validate) {
                setErr(data.errors);
                ThongBao.ThongBao_CanhBao(data.message)
                return;
            }
            if (data && data.success) {
                setLichDaDat(data.dulieu || []);
            } else {
                setLichDaDat([]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách lịch đặt hiện tại theo ghế:", error);
        } finally {
            setloading(false)
        }
    };

    const handleDatCho = async () => {
        if (!laLichHopLe) {
            ThongBao.ThongBao_CanhBao(ketQuaKiemTra.message || "Vui lòng kiểm tra lại thời gian chọn!");
            return;
        }

        try {
            const dataToSend = new FormData();
            dataToSend.append('ID_KHONG_GIAN', String(idKhongGian));
            dataToSend.append('KHUNG_BATDAU', String(fun.formatToBackendDateTime(gioBatDau)));
            dataToSend.append('KHUNG_KETTHUC', String(fun.formatToBackendDateTime(gioKetThuc)));
            dataToSend.append("LoaiND", String(0));
            dataToSend.append('id', String(idKhongGian));
            const DatLich = await api.CallAPI(dataToSend, { url: '/nguoiDung/LichDat', PhuongThuc: 1 });

            if (DatLich.validate) {
                setErr(DatLich.errors);
                ThongBao.ThongBao_CanhBao(DatLich.message)
                return;
            }
            if (DatLich.success) {
                const chuyenhuong_thanhtoan = await api.CallAPI(undefined, { url: `/NguoiDung/ThanhToan?id=${DatLich.ID_LICHDAT}`, PhuongThuc: 2 });
                if (chuyenhuong_thanhtoan && chuyenhuong_thanhtoan.success && chuyenhuong_thanhtoan.paymentUrl) {
                    window.open(chuyenhuong_thanhtoan.paymentUrl, '_blank')
                } else {
                    ThongBao.ThongBao_CanhBao(chuyenhuong_thanhtoan?.message || "Không thể khởi tạo link thanh toán từ hệ thống.");
                }
            }
            if (DatLich.success === false) {
                ThongBao.ThongBao_Loi(DatLich.message)
            }
        } catch (error) {
            console.error("Lỗi đặt lịch:", error);
            ThongBao.ThongBao_CanhBao('Có lỗi xảy ra!')
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 animate-pulse">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
                    <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4 rounded-xl h-48 bg-slate-200"></div>
                    <div className="md:col-span-8 flex flex-col justify-between py-2">
                        <div className="space-y-3">
                            <div className="h-7 bg-slate-200 rounded-md w-2/3"></div>
                            <div className="h-5 bg-slate-200 rounded-md w-1/4"></div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                            <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="md:col-span-7 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                    <div className="mb-4">
                        {err.length > 0 && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                                <div className="flex items-center mb-2 font-semibold">
                                    <svg className="mr-2 h-5 w-5 flex-shrink-0 text-red-800" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Có lỗi xảy ra, vui lòng kiểm tra lại:</span>
                                </div>
                                <ul className="list-inside list-disc pl-2 space-y-1">
                                    {err.map((itemErr, index) => (
                                        <li key={index} className="font-medium">{itemErr}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 🔥 HIỂN THỊ CẢNH BÁO KHI TRÙNG LỊCH HOẶC LỖI THỜI GIAN NGAY TRÊN GIAO DIỆN */}
                        {ketQuaKiemTra.trung && (
                            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 font-semibold flex items-start gap-2 animate-fadeIn">
                                <i className="fa-solid fa-triangle-exclamation text-amber-600 text-sm mt-0.5"></i>
                                <div>{ketQuaKiemTra.message}</div>
                            </div>
                        )}

                        <h3 className="text-sm font-bold text-gray-800">Thông tin đặt phòng họp</h3>
                        <p className="text-[11px] text-gray-400">Vui lòng điền đầy đủ thông tin để tiến hành đặt không gian họp</p>
                    </div>

                    <div className="text-right">
                        <span className="text-2xl font-black text-blue-600">{fun.formatCurrency(DuLieu)}</span>
                        <span className="text-xs font-bold text-slate-400"> / giờ</span>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Giờ bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    value={gioBatDau}
                                    min={minDateTime} // Chặn lịch quá khứ ở UI click
                                    onChange={(e) => {
                                        setGioBatDau(e.target.value);
                                        fetchLichDaDat(e.target.value);
                                        setNgayDat(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Giờ kết thúc</label>
                                <input
                                    type="datetime-local"
                                    value={gioKetThuc}
                                    min={gioBatDau || minDateTime} // Kết thúc phải sau thời gian bắt đầu
                                    onChange={(e) => setGioKetThuc(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-calendar-xmark text-slate-400"></i> Lịch kín ngày : {fun.formatDate(ngayDat)}
                                </h4>
                            </div>
                            <div className="w-full max-w-md mx-auto p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                {lichDaDat && lichDaDat.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-rose-200">
                                        {lichDaDat.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between border border-rose-100 bg-gradient-to-r from-rose-50/50 to-transparent px-4 py-3 rounded-xl hover:border-rose-200 transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-rose-100/60 flex items-center justify-center text-rose-500">
                                                        <i className="fa-regular fa-clock text-xs"></i>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800">
                                                            {fun.formatTime(item.KHUNG_BATDAU)} - {fun.formatTime(item.KHUNG_KETTHUC)}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">Thời gian cố định</span>
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                    Đã đặt
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                                            <i className="fa-regular fa-calendar-xmark text-sm"></i>
                                        </div>
                                        <p className="text-xs font-medium text-slate-500">
                                            Không có lịch đặt nào trong ngày hôm nay
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-4 px-1 mt-4">
                    <div>
                        <span className="text-xs font-bold text-slate-400 block mb-0.5">Vui lòng kiểm tra lại giờ đặt</span>
                        <span className="text-sm font-bold text-slate-800">Tạm tính: {laLichHopLe ? (tongGio || 0) : 0} giờ</span>
                    </div>
                    <span className="text-3xl font-black text-blue-600 tracking-tight">
                        {fun.formatCurrency(laLichHopLe ? (tongGio * Number(DuLieu)) : 0)}
                    </span>
                </div>

                {/* 🔥 NÚT BẤM HÀNH ĐỘNG - TỰ ĐỘNG DISABLED KHI TRÙNG HOẶC THIẾU THÔNG TIN */}
                <div className="mt-5 border-t border-gray-100 pt-4">
                    <button
                        onClick={handleDatCho}
                        disabled={!laLichHopLe}
                        className={`w-full py-2.5 text-white font-medium text-sm rounded-xl transition-all shadow-sm ${
                            laLichHopLe 
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 cursor-pointer' 
                                : 'bg-gray-300 shadow-none cursor-not-allowed opacity-75'
                        }`}
                    >
                        {ketQuaKiemTra.trung ? "Không thể đặt - Khung giờ không hợp lệ" : "Xác nhận thông tin phòng họp"}
                    </button>
                </div>
            </div>
        </>
    )
}

export default DatPhong;