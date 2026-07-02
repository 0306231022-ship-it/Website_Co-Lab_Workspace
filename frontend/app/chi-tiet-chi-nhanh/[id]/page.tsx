"use client";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export interface ChiNhanh {
    ID_CHI_NHANH: number;
    TEN_CHI_NHANH: string;
    DIA_CHI: string;
    NGAY_NHAP: string;
    NGAY_CAP_NHAT: string;
    TRANG_THAI: number; 
    NGAY_BAO_TRI: string | null;
    NGAY_XONG: string | null;
    HINHANH: string;
}

export interface KhongGian {
    ID_KHONG_GIAN: number;
    TEN_KHONG_GIAN: string;
    LOAI_KHONG_GIAN: number; 
    TRANG_THAI: number;      
    ID_GIA: number;
    NGAY_TAO: string;
    NGAY_CAP_NHAT: string;
    NGAY_BAO_TRI: string | null;
    NGAY_XONG: string | null;
    ID_CHI_NHANH: number;
    HINHANH: string;
}

export interface ChiTietKhongGian {
    DanhSach: KhongGian[];
    TongDanhSach: number;
}

export interface ChiTietChiNhanhResponse {
    chitiet1: ChiNhanh[];
    chitiet2: ChiTietKhongGian;
}

function ChiTietChiNhanh() {
    const { id } = useParams();
    const router = useRouter();
    
    const [chitiet1, setChiTiet1] = useState<ChiNhanh[] | null>(null);
    const [chitiet2, setChiTiet2] = useState<ChiTietKhongGian | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [searchFilter, setSearchFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const [page, setPage] = useState<number>(1);
    const limit = 3;
    useEffect(() => {
        const fetchChiNhanh = async () => {
            try {
                const response = await api.CallAPI(undefined, { url: `/admin/laychitiet?IDCN=${id}`, PhuongThuc: 2 });
                if (response.success) {
                    setChiTiet1(response.chitiet1);
                    setChiTiet2(response.chitiet2); 
                } else {
                    ThongBao.ThongBao_CanhBao('Không tìm thấy thông tin chi nhánh hoặc dữ liệu trống');
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin chi nhánh:", error);
                ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin chi nhánh');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchChiNhanh();
    }, [id]);
    const fetchKhongGian = async (HanhDong: 'next' | 'prev') => {
        const trangMoi = HanhDong === 'next' ? page + 1 : Math.max(page - 1, 1);
        setPage(trangMoi);
        try {
            const response = await api.CallAPI(undefined, { 
                url: `/admin/laydanhsachkhonggian?IDCN=${id}&page=${trangMoi}&limit=${limit}&TimKiem=${searchFilter}&Loai=${typeFilter}`, 
                PhuongThuc: 2 
            });
            if (response.success) {
                setChiTiet2({
                    DanhSach: response.DanhSach || [],
                    TongDanhSach: response.TongDanhSach || 0
                });
            } else {
                ThongBao.ThongBao_CanhBao('Không tìm thấy thông tin không gian hoặc dữ liệu trống');
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin không gian:", error);
            ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin không gian');
        }
    };
    const TimKiem = async()=>{
        try {
            const Timkiem = await api.CallAPI(undefined,{url:`/admin/TimKiem_khonggian?IDCN=${id}&TimKiem=${searchFilter}&Loai=${typeFilter}`, PhuongThuc:2})
             if (Timkiem.success) {
                setChiTiet2({
                    DanhSach: Timkiem.danhsach || [],
                    TongDanhSach: Timkiem.TongDanhSach || 0
                });
            } else {
                ThongBao.ThongBao_CanhBao('Không tìm thấy thông tin không gian hoặc dữ liệu trống');
            }
        } catch (error) {
             console.error("Lỗi khi tải thông tin không gian:", error);
            ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin không gian');
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="font-medium text-slate-500 text-sm tracking-wide">Đang tải dữ liệu chi nhánh...</p>
            </div>
        );
    }

    const thongTinChiNhanh = chitiet1?.[0] || {
        ID_CHI_NHANH: 0,
        TEN_CHI_NHANH: "Không rõ chi nhánh",
        DIA_CHI: "Chưa có địa chỉ",
        TRANG_THAI: 0,
        HINHANH: ""
    };

    const danhSachKhongGian = chitiet2?.DanhSach || [];
    const tongSoKhongGian = chitiet2?.TongDanhSach || 0;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto text-slate-800 bg-slate-50/50 min-h-screen">
            <div className="w-full space-y-6">
                
                {/* Navigation Breadcrumb */}
                <nav className="flex items-center gap-2.5 text-xs md:text-sm font-medium text-slate-500 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm w-fit">
                    <button 
                        onClick={() => router.back()} 
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                        title="Quay lại"
                    >
                        <i className="fa-solid fa-arrow-left text-xs"></i>
                    </button>
                    <span className="hover:text-brand-600 transition cursor-pointer" onClick={() => router.push('/admin/chi-nhanh')}>Hệ thống chi nhánh</span>
                    <i className="fa-solid fa-chevron-right text-[9px] text-slate-300"></i>
                    <span className="text-slate-900 font-semibold max-w-[200px] truncate">{thongTinChiNhanh.TEN_CHI_NHANH}</span>
                </nav>

                {/* Banner Chi Nhánh */}
                <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[200px]">
                    <div className="md:w-1/3 min-h-[200px] md:min-h-auto relative overflow-hidden group">
                        {thongTinChiNhanh.HINHANH && (
                            <Image
                                src={`http://localhost:3001/${thongTinChiNhanh.HINHANH}`} 
                                alt={thongTinChiNhanh.TEN_CHI_NHANH}
                                width={500}
                                height={300}
                                className="w-full h-full object-cover transition duration-500 group-hover:scale-105" 
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent md:hidden"></div>
                    </div>
                    <div className="p-6 md:p-8 md:w-2/3 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50/40">
                        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                            <span className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-xl border border-slate-200">
                                {thongTinChiNhanh.ID_CHI_NHANH === 1 ? "🌟 Trụ sở chính" : "🏢 Chi nhánh"}
                            </span>
                            {thongTinChiNhanh.TRANG_THAI === 1 ? (
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Hoạt động
                                </span>
                            ) : (
                                <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Bảo trì / Đóng cửa
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-2 tracking-tight leading-tight">{thongTinChiNhanh.TEN_CHI_NHANH}</h1>
                        <p className="text-sm text-slate-500 flex items-start gap-2 max-w-2xl leading-relaxed">
                            <i className="fa-solid fa-location-dot text-rose-500 mt-1 shrink-0"></i> <span>{thongTinChiNhanh.DIA_CHI}</span>
                        </p>
                    </div>
                </div>

                {/* Khối bộ lọc và Danh sách không gian */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <i className="fa-solid fa-cubes text-brand-600"></i> Danh sách không gian làm việc
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Lọc, quản lý cấu hình vị trí và trạng thái đặt phòng.</p>
                        </div>
                        
                        {/* Bộ lọc */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                    
    <div className="relative w-full sm:w-52">
        <i className="fa-solid fa-sliders absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50/80 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-9 pr-8 py-3 focus:outline-none focus:border-slate-400 appearance-none cursor-pointer transition-all"
        >
            <option value="all">Tất cả loại không gian</option>
            <option value="1">Không gian chung</option>
            <option value="2">Không gian họp</option>
        </select>
        <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"></i>
    </div>
    
    {/* Ô nhập và Nút tìm kiếm gộp nhóm */}
    <div className="flex items-center gap-2 w-full sm:w-80">
        <div className="relative flex-1">
            <input 
                type="text" 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Tìm tên phòng, không gian..." 
                className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl pl-4 pr-4 py-3 focus:outline-none focus:border-slate-400 placeholder-slate-400 transition-all" 
            />
        </div>
        
        {/* ✨ ĐÃ THÊM: Nút Tìm kiếm thiết kế đồng bộ UI */}
        <button
            onClick={() => {TimKiem()}}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all active:scale-95 shadow-sm shrink-0 flex items-center gap-1.5 h-[40px]"
        >
            <i className="fa-solid fa-magnifying-glass text-[11px]"></i>
            <span>Tìm kiếm</span>
        </button>
    </div>

                        </div>
                    </div>

                    {/* Danh sách Không Gian */}
                    {danhSachKhongGian.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium text-sm">Không tìm thấy không gian nào phù hợp.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {danhSachKhongGian.map((space) => {
                                const isBaoTri = space.TRANG_THAI === 0 || space.NGAY_BAO_TRI !== null;
                                const isLoaiChung = space.LOAI_KHONG_GIAN === 1;

                                return (
                                    <div 
                                        key={space.ID_KHONG_GIAN}
                                        className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full border-slate-200/80 shadow-sm relative z-10
                                            ${isBaoTri ? 'bg-slate-50/60 opacity-80' : 'hover:shadow-md hover:-translate-y-0.5'}`}
                                    >
                                        {/* Phần ảnh của không gian */}
                                        <div className="w-full h-44 relative bg-slate-100 overflow-hidden">
                                            {space.HINHANH && (
                                                <Image
                                                    src={`http://localhost:3001/${space.HINHANH}`} // ✅ ĐÃ SỬA: Lấy đúng ảnh của không gian thay vì ảnh chi nhánh
                                                    alt={space.TEN_KHONG_GIAN}
                                                    width={500}
                                                    height={300}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            {/* Badge */}
                                            <div className="absolute top-3 left-3 z-20">
                                                {isBaoTri ? (
                                                    <span className="bg-slate-900/90 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm backdrop-blur-sm">
                                                        ⚙️ Bảo trì
                                                    </span>
                                                ) : isLoaiChung ? (
                                                    <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                                        ☕ Không gian chung
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                                        💼 Phòng họp
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nội dung thông tin */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className={`text-base font-bold mb-1 line-clamp-1 ${isBaoTri ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                {space.TEN_KHONG_GIAN}
                                            </h3>
                                            
                                            <p className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                                                {isLoaiChung ? (
                                                    <><i className="fa-solid fa-chair text-slate-400 w-4"></i> Ghế tự do, full tiện ích</>
                                                ) : (
                                                    <><i className="fa-solid fa-users text-slate-400 w-4"></i> Cách âm, có máy chiếu</>
                                                )}
                                            </p>
                                            
                                            {/* Chân Card */}
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 relative z-30">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                                                        {isLoaiChung ? "Chế độ áp dụng" : "Chi phí thuê"}
                                                    </p>
                                                    <div className="font-bold text-slate-800">
                                                        {isLoaiChung ? (
                                                            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Membership</span>
                                                        ) : (
                                                            <span className="font-black text-sm md:text-base text-slate-900">
                                                                {space.ID_GIA?.toLocaleString('vi-VN')}đ<span className="text-[11px] font-normal text-slate-400">/g</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="relative z-40">
                                                    {isBaoTri ? (
                                                        <button className="bg-slate-100 text-slate-400 text-xs font-bold px-4 py-2.5 rounded-xl cursor-not-allowed border border-slate-200/50" disabled>
                                                            Tạm đóng
                                                        </button>
                                                    ) : isLoaiChung ? (
                                                        <button className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-100 font-bold py-2 px-3 rounded-xl text-xs transition-all duration-300">
                                                            Xem sơ đồ
                                                        </button>
                                                    ) : (
                                                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all duration-300">
                                                            Đặt phòng
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Điều hướng Phân Trang */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-slate-100 gap-4">
                        <p className="text-xs text-slate-400 font-medium">
                            Hiển thị <span className="font-bold text-slate-700">{danhSachKhongGian.length}</span> trên tổng số <span className="font-bold text-slate-700">{tongSoKhongGian}</span> không gian
                        </p>
                        <nav className="flex items-center gap-1.5">
                            <button 
                                onClick={() => fetchKhongGian('prev')} 
                                disabled={page === 1} 
                                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fa-solid fa-chevron-left text-[10px]"></i>
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm">{page}</span>
                            <button 
                                onClick={() => fetchKhongGian('next')} 
                                disabled={page >= Math.ceil(tongSoKhongGian / limit)} 
                                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fa-solid fa-chevron-right text-[10px]"></i>
                            </button>
                        </nav>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ChiTietChiNhanh;