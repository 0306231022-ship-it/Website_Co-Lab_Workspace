"use client";

import { useEffect, useState } from "react";
import { CallAPI } from "@/API/API";
import Link from "next/link";
import { LichDatItems } from "@/interface/LichDat";
import { socket } from '@/FUNCTION/socket';
function LichSuLichDat() {
    const [danhSach, setDanhSach] = useState<LichDatItems[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [tabHienTai, setTabHienTai] = useState<string>("all");
    
    const [trangHienTai, setTrangHienTai] = useState<number>(1);
    const [tongSoDong, setTongSoDong] = useState<number>(0); 
    const itemsPerPage = 3; 

    const tongSoTrang = Math.ceil(tongSoDong / itemsPerPage) || 1;
      if (socket.connected) {
        socket.emit("thong-bao-thanhtoan", id);
     } 
    useEffect(() => {
        const layDuLieuLichDat = async () => {
            try {
                setLoading(true);
                const res = await CallAPI(undefined, {
                    url: `/NguoiDung/lichsu_datlich?page=${trangHienTai}&limit=${itemsPerPage}&LoaiND=0`, 
                    PhuongThuc: 2, 
                });
    
                if (res && res.success) {
                    setDanhSach(res.DanhSach || []); 
                    setTongSoDong(res.TongSo || 0);   
                }
            } catch (error) {
                console.error("Lỗi lấy lịch sử đặt lịch:", error);
            } finally {
                setLoading(false);
            }
        };

        layDuLieuLichDat();
    }, [trangHienTai, tabHienTai]);

    const handleTabChange = (tab: string) => {
        setTabHienTai(tab);
        setTrangHienTai(1);
    };

    // Hàm định dạng hiển thị ngày giờ chi tiết
    const dinhDangNgayThang = (chuoiNgay: string) => {
        const date = new Date(chuoiNgay);
        if (isNaN(date.getTime())) return { ngayThangNam: "../../....", gio: "00:00" };
        
        const ngay = date.getDate().toString().padStart(2, '0');
        const thang = (date.getMonth() + 1).toString().padStart(2, '0');
        const nam = date.getFullYear();
        const gio = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return {
            ngayThangNam: `${ngay}/${thang}/${nam}`,
            gio: gio
        };
    };

    return (
        <>
        <div className="p-8 w-full min-h-screen space-y-8 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-8 flex-1">
                {/* Tiêu đề & Breadcrumb */}
                <div>
                    <nav className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-3">
                        <a href="#" className="hover:text-brand-600 transition">Cá nhân</a>
                        <i className="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
                        <span className="text-slate-800 font-bold">Lịch sử đặt lịch</span>
                    </nav>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lịch sử đặt lịch</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý và xem lại tất cả các giao dịch đặt chỗ của bạn tại hệ thống Co-lab.</p>
                </div>

                {/* Bộ lọc Tabs */}
                <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-sm w-fit">
                    {["all", "saptoi", "hoanthanh", "dahuy"].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors capitalize ${tabHienTai === tab ? "bg-brand-50 text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                        >
                            {tab === "all" ? "Tất cả" : tab === "saptoi" ? "Sắp tới" : tab === "hoanthanh" ? "Đã hoàn thành" : "Đã hủy"}
                        </button>
                    ))}
                </div>

                {/* Khu vực kết quả */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center text-slate-400 font-medium shadow-sm">
                            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            Đang tải trang dữ liệu {trangHienTai}...
                        </div>
                    ) : danhSach.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center max-w-xl mx-auto my-10 shadow-sm flex flex-col items-center space-y-5">
                            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                                <i className="fa-solid fa-calendar-xmark text-3xl text-slate-300"></i>
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-lg font-bold text-slate-800">Không tìm thấy lịch sử đặt</h3>
                                <p className="text-sm text-slate-400 max-w-sm">Hiện tại phân mục này chưa ghi nhận lượt đặt chỗ nào.</p>
                            </div>
                        </div>
                    ) : (
                        danhSach.map((item) => {
                            const laDatGheLe = item.ID_GHE !== null;
                            
                            // Định dạng thời gian bắt đầu và kết thúc từ DB
                            const bd = dinhDangNgayThang(item.KHUNG_BATDAU);
                            const kt = dinhDangNgayThang(item.KHUNG_KETTHUC);

                            return (
                                <div key={item.ID_LICH_DAT} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${laDatGheLe ? "bg-brand-500" : "bg-emerald-500"}`}></div>
                                    
                                    <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
                                        
                                        {/* CỘT 1: THÔNG TIN KHÔNG GIAN / VỊ TRÍ */}
                                        <div className="flex-1 min-w-[250px]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${laDatGheLe ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                                                    {laDatGheLe ? "Đặt Ghế lẻ" : "Đặt Phòng riêng"}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">Mã: #CL-{item.ID_LICH_DAT}</span>
                                            </div>
                                            <h3 className="text-base font-bold text-slate-900">{item.TEN_KHONG_GIAN}</h3>
                                            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                                                <i className="fa-solid fa-location-dot text-slate-400 text-xs"></i> 
                                                {item.TEN_CHI_NHANH} 
                                                <span className="mx-1 text-slate-300">•</span> 
                                                Vị trí: <span className="font-semibold text-slate-700">{laDatGheLe ? `Ghế số ${item.ID_GHE}` : `Toàn bộ phòng`}</span>
                                            </p>
                                        </div>

                                        {/* CỘT 2: KHUNG THỜI GIAN BẮT ĐẦU & KẾT THÚC THỰC TẾ */}
                                        <div className="flex flex-wrap gap-4 items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 w-full lg:w-auto">
                                            <div className="text-xs">
                                                <span className="block font-medium text-slate-400 uppercase tracking-wider">Bắt đầu</span>
                                                <span className="text-sm font-bold text-slate-700">{bd.gio}</span>
                                                <span className="text-[11px] text-slate-500 block">{bd.ngayThangNam}</span>
                                            </div>
                                            
                                            <div className="text-slate-300 flex items-center justify-center px-1">
                                                <i className="fa-solid fa-arrow-right-long text-sm"></i>
                                            </div>

                                            <div className="text-xs">
                                                <span className="block font-medium text-slate-400 uppercase tracking-wider">Kết thúc</span>
                                                <span className="text-sm font-bold text-slate-700">{kt.gio}</span>
                                                <span className="text-[11px] text-slate-500 block">{kt.ngayThangNam}</span>
                                            </div>
                                        </div>

                                        {/* CỘT 3: HÀNH ĐỘNG - LUÔN CÓ NÚT XEM CHI TIẾT */}
                                        <div className="flex items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 justify-end">
                                    
            
                                       <Link href={`/NguoiDung/lich-su-dat-lich/chi-tiet-lich-dat/${item.ID_LICH_DAT}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
    <i className="fa-regular fa-eye"></i>
    <span>Xem chi tiết</span>
</Link>
                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* Phân trang */}
            {danhSach.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 mt-8 data-table-pagination">
    {/* Thống kê số lượng */}
    <p className="text-sm text-slate-500 font-medium order-2 sm:order-1">
        Hiển thị <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{(trangHienTai - 1) * itemsPerPage + 1}-{Math.min(trangHienTai * itemsPerPage, tongSoDong)}</span> trong tổng số <span className="font-bold text-slate-900">{tongSoDong}</span> lượt đặt
    </p>
    
    {/* Cụm nút chuyển trang */}
    <div className="flex items-center gap-1.5 order-1 sm:order-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
        {/* Nút Quay lại */}
        <button 
            onClick={() => setTrangHienTai(prev => Math.max(prev - 1, 1))}
            disabled={trangHienTai === 1}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 font-medium transition-all duration-200 ${
                trangHienTai === 1 
                ? "cursor-not-allowed bg-slate-50 text-slate-300 border-slate-100" 
                : "hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-95"
            }`}
            title="Trang trước"
        >
            <i className="fa-solid fa-chevron-left text-xs"></i>
        </button>

        {/* Vòng lặp kết hợp thông minh: Nếu tổng số trang ít thì hiện hết, nếu nhiều (> 5 trang) thì tự động rút gọn bằng dấu ba chấm "..." */}
        {Array.from({ length: tongSoTrang }, (_, index) => {
            const soTrang = index + 1;
            
            // Logic hiển thị thu gọn trang (Chỉ hiện trang đầu, trang cuối, trang hiện tại và các trang liền kề)
            if (tongSoTrang > 5 && soTrang !== 1 && soTrang !== tongSoTrang && Math.abs(soTrang - trangHienTai) > 1) {
                if (soTrang === 2 && trangHienTai > 3) {
                    return <span key="dots-left" className="w-9 h-9 flex items-center justify-center text-slate-400 text-xs font-bold">...</span>;
                }
                if (soTrang === tongSoTrang - 1 && trangHienTai < tongSoTrang - 2) {
                    return <span key="dots-right" className="w-9 h-9 flex items-center justify-center text-slate-400 text-xs font-bold">...</span>;
                }
                return null;
            }

            return (
                <button
                    key={soTrang}
                    onClick={() => setTrangHienTai(soTrang)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                        trangHienTai === soTrang 
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100 border border-indigo-600" // Đổi thành indigo-600 để phòng lỗi màu brand không lên
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600"
                    }`}
                >
                    {soTrang}
                </button>
            );
        })}

        {/* Nút Kế tiếp */}
        <button 
            onClick={() => setTrangHienTai(prev => Math.min(prev + 1, tongSoTrang))}
            disabled={trangHienTai === tongSoTrang}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 font-medium transition-all duration-200 ${
                trangHienTai === tongSoTrang 
                ? "cursor-not-allowed bg-slate-50 text-slate-300 border-slate-100" 
                : "hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-95"
            }`}
            title="Trang sau"
        >
            <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
    </div>
</div>
            )}
        </div>
        </>
    );
}

export default LichSuLichDat;