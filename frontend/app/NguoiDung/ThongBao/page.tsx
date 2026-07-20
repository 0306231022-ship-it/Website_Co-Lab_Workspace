"use client";
import { useState, useEffect } from "react";
import * as api from '@/API/API';
import * as Thongbao from '@/FUNCTION/ThongBao';
interface ThongBao {
    ID_THONGBAO: number;
    TIEU_DE: string;
    NOI_DUNG: string;
    TRANG_THAI: number; // 0: Chưa đọc, 1: Đã đọc
    LOAI_THONGBAO: number; // 1: Lịch hẹn, 2: Ưu đãi, 3: Giao dịch, 4: Hệ thống
    IDND: number;
    NGAY_TAO: string;
}

function ThongBaoComponent() {
    const [thongBao, setThongBao] = useState<ThongBao[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 1. Gọi API lấy danh sách thông báo
    useEffect(() => {
        const laydl = async () => {
            setIsLoading(true);
            try {
                  const formData = new FormData();
                formData.append("LoaiND", String(0));
                const response = await api.CallAPI(formData, { 
                    url: `/NguoiDung/layDS_thongbao?page=${page}`, 
                    PhuongThuc: 2 
                });
                // Kiểm tra response từ API (sửa lỗi laydl.success của code cũ)
                if (response && response.success) {
                    const data: ThongBao[] = response.data || [];
                    
                    if (page === 1) {
                        setThongBao(data);
                    } else {
                        setThongBao(prev => [...prev, ...data]);
                    }

                    // Nếu API trả về ít hơn số lượng item quy định của 1 trang (ví dụ 10), thì hết dữ liệu
                    if (data.length < 10) {
                        setHasMore(false);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách thông báo:", error);
            } finally {
                setIsLoading(false);
            }
        };

        laydl();
    }, [page]);
    const handleXoaMot = async(id: number) => {
        const XacNhan = await Thongbao.ThongBao_XacNhanTT('Bạn có chắc muốn xóa dòng thông báo này?');
        if(!XacNhan) return;
        try {
            const formData = new FormData();
            formData.append("ID_THONGBAO", String(id));
            const xoa = await api.CallAPI(formData,{url:'/NguoiDung/XoaTheoid' , PhuongThuc:1});
            if(xoa.success){
                 setThongBao(prev => prev.filter(item => item.ID_THONGBAO !== id));
                Thongbao.ThongBao_ThanhCong(xoa.message)
            }else{
                Thongbao.ThongBao_Loi(xoa.message)
            }
        } catch (error) {
            console.error("Lỗi hệ thống", error);
        }
    };

    const handleXoaTatCa = async() => {
        const XacNhan = await Thongbao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn xóa tất cả thông báo không?')
        if(!XacNhan) return;
        try {
            const xoa = await api.CallAPI(undefined,{url:'/NguoiDung/XoaTatCa', PhuongThuc:1});
            if(xoa.success){
                setThongBao([]);
                setHasMore(false);
                Thongbao.ThongBao_ThanhCong(xoa.message);
            }else{
                Thongbao.ThongBao_Loi(xoa.message)
            }
        } catch (error) {
             console.error("Lỗi hệ thống", error);
        }
        
    };

    // Hàm phụ trợ: Trả về style và icon tương ứng với từng loại thông báo
    const getLoaiConfig = (loai: number) => {
        switch(loai) {
            case 1: // Lịch sắp tới
                return {
                    label: "Lịch sắp tới",
                    bgIcon: "bg-white text-amber-500 border-amber-100",
                    icon: "fa-regular fa-clock",
                    badgeColor: "text-slate-500"
                };
            case 2: // Ưu đãi
                return {
                    label: "Ưu đãi",
                    bgIcon: "bg-white text-rose-500 border-rose-100",
                    icon: "fa-solid fa-gift",
                    badgeColor: "text-slate-500"
                };
            case 3: // Giao dịch
                return {
                    label: "Giao dịch",
                    bgIcon: "bg-white text-emerald-500 border-emerald-100",
                    icon: "fa-solid fa-file-invoice-dollar",
                    badgeColor: "text-slate-500"
                };
            default: // 4 hoặc mặc định: Hệ thống
                return {
                    label: "Hệ thống",
                    bgIcon: "bg-slate-50 text-brand-500 border-slate-100",
                    icon: "fa-solid fa-bullhorn",
                    badgeColor: "text-slate-400"
                };
        }
    };

    return (
        <div className="p-4 mx-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <nav className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-3">
                        <a href="#" className="hover:text-brand-600 transition">Cá nhân</a>
                        <i className="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
                        <span className="text-slate-800 font-bold">Thông báo</span>
                    </nav>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thông báo của bạn</h1>
                    <p className="text-sm text-slate-500 mt-1">Cập nhật những thông tin mới nhất về lịch đặt và hệ thống.</p>
                </div>
                
                {thongBao.length > 0 && (
                    <button 
                        onClick={handleXoaTatCa}
                        className="text-smp my-4 font-semibold text-rose-600 hover:text-white hover:bg-rose-600 transition flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100 shadow-sm"
                    >
                        <i className="fa-regular fa-trash-can"></i> Xóa tất cả
                    </button>
                )}
            </div>

            {/* Danh sách thông báo */}
            <div className="space-y-3">
                {thongBao.length === 0 && !isLoading ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <i className="fa-regular fa-bell-slash text-4xl text-slate-300 mb-3 block"></i>
                        <p className="text-slate-500 font-medium">Bạn không có thông báo nào!</p>
                    </div>
                ) : (
                    thongBao.map((item) => {
                        const config = getLoaiConfig(item.LOAI_THONGBAO);
                        const isChuaDoc = item.TRANG_THAI === 0;

                        return (
                            <div 
                                key={item.ID_THONGBAO}
                                className={`p-5 border rounded-2xl flex gap-4 items-start relative hover:shadow-md transition-shadow cursor-pointer group ${
                                    isChuaDoc ? 'bg-brand-50 border-brand-100' : 'bg-white border-slate-200 opacity-85'
                                }`}
                            >
                                {/* Dấu chấm thông báo chưa đọc (Màn hình lớn) */}
                                {isChuaDoc && (
                                    <div className="absolute top-6 right-14 w-2 h-2 bg-brand-500 rounded-full hidden sm:block"></div>
                                )}
                                
                                {/* Nút xóa 1 item */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ cha
                                        handleXoaMot(item.ID_THONGBAO);
                                    }}
                                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100" 
                                    title="Xóa thông báo này"
                                >
                                    <i className="fa-regular fa-trash-can text-sm"></i>
                                </button>

                                {/* Icon theo Loại */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm shrink-0 text-xl border ${config.bgIcon}`}>
                                    <i className={config.icon}></i>
                                </div>
                                
                                {/* Nội dung */}
                                <div className="flex-1 pr-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${config.badgeColor}`}>
                                            {config.label}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            • {new Date(item.NGAY_TAO).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    
                                    <h3 className={`text-base flex items-center gap-2 ${isChuaDoc ? 'font-bold text-slate-900' : 'font-semibold text-slate-600'}`}>
                                        {item.TIEU_DE}
                                        {/* Dấu chấm thông báo chưa đọc (Màn hình nhỏ) */}
                                        {isChuaDoc && <span className="w-2 h-2 bg-brand-500 rounded-full sm:hidden"></span>}
                                    </h3>
                                    
                                    <p className={`text-sm mt-1 leading-relaxed ${isChuaDoc ? 'text-slate-600' : 'text-slate-400'}`}>
                                        {item.NOI_DUNG}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {hasMore && thongBao.length > 0 && (
                <div className="pt-6 text-center">
                    <button 
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        <i className={`fa-solid ${isLoading ? 'fa-spinner animate-spin' : 'fa-spinner'}`}></i> 
                        {isLoading ? 'Đang tải...' : 'Tải thêm thông báo'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ThongBaoComponent;

