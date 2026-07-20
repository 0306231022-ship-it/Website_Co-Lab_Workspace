"use client";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { objChiNhanh } from '@/interface/ChiNhanh';
import { ChiTietKhongGian } from '@/interface/KhongGian';
import {useModalContext } from "@/context/QuanLiMoal";
import Link from 'next/link';
import * as fun from '@/FUNCTION/function';

function ChiTietChiNhanh() {
    const { idChiNhanh } = useParams();
    const { OpenMoDal } = useModalContext();
    const [chitiet1, setChiTiet1] = useState<objChiNhanh | null>(null);
    const [chitiet2, setChiTiet2] = useState<ChiTietKhongGian | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Các state phục vụ bộ lọc tìm kiếm
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("");

    const [page, setPage] = useState<number>(1);
    const limit = 3;

    // Fetch thông tin chi nhánh lần đầu
    useEffect(() => {
        const fetchChiNhanh = async () => {
            try {
                const response = await api.CallAPI(undefined, { url: `/admin/laychitiet?IDCN=${idChiNhanh}`, PhuongThuc: 2 });
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
        if (idChiNhanh) fetchChiNhanh();
    }, [idChiNhanh]);

    // Hàm gọi API lấy danh sách không gian (Xử lý đồng bộ Phân trang + Tìm kiếm + Loại hình)
    const fetchKhongGian = async (HanhDong: 'next' | 'prev' | 'search', trangChiDinh?: number) => {
        let trangMoi = page;
        if (HanhDong === 'next') trangMoi = page + 1;
        else if (HanhDong === 'prev') trangMoi = Math.max(page - 1, 1);
        else if (HanhDong === 'search') trangMoi = 1; // Tìm kiếm/Lọc thì bắt buộc reset về trang 1
        
        if (trangChiDinh) trangMoi = trangChiDinh;
        
        setPage(trangMoi);

        try {
            const response = await api.CallAPI(undefined, { 
                url: `/admin/laydanhsachkhonggian?IDCN=${idChiNhanh}&page=${trangMoi}&limit=${limit}&TimKiem=${encodeURIComponent(searchFilter)}&Loai=${typeFilter}`, 
                PhuongThuc: 2 
            });
            if (response.success) {
                setChiTiet2({
                    DanhSach: response.DanhSach || [],
                    TongDanhSach: response.TongDanhSach || 0
                });
            } else {
                ThongBao.ThongBao_CanhBao('Không tìm thấy thông tin không gian phù hợp');
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin không gian:", error);
            ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin không gian');
        }
    };

    // Hàm thực thi tìm kiếm khi nhấn Enter hoặc click nút tìm kiếm
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchKhongGian('search');
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="font-medium text-slate-500 text-sm tracking-wide">Đang tải dữ liệu chi nhánh...</p>
            </div>
        );
    }

    // Đổ dữ liệu động thực tế từ API vào Component, nếu null thì lấy Object fallback chống lỗi
    const thongTinChiNhanh = chitiet1 || {
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
                <button onClick={() => window.history.back()} className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-200">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-4 h-4 transform transition-transform duration-200 group-hover:-translate-x-1"
                     >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Quay lại
                </button>
                {/* Khu vực 1: Thông tin chi tiết & Thống kê số lượng */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center space-x-5">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-200 shrink-0">
                            <i className="fa-solid fa-building-flag"></i>
                        </div>
                        <div>
                            {/* Đổ tên chi nhánh động */}
                            <h1 className="text-2xl font-extrabold text-gray-900">{thongTinChiNhanh.TEN_CHI_NHANH}</h1>
                            {/* Đổ địa chỉ động */}
                            <p className="text-sm text-gray-500 mt-1">
                                <i className="fa-solid fa-location-dot mr-2 text-indigo-500"></i>
                                {thongTinChiNhanh.DIA_CHI}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 justify-between sm:justify-end">
                        <div className="text-left sm:text-right border-l sm:border-l-0 sm:border-r border-gray-200 pl-4 sm:pl-0 sm:pr-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng Không Gian</p>
                            {/* Hiển thị số lượng thống kê động từ API */}
                            <p className="text-2xl font-black text-indigo-600 mt-0.5">{tongSoKhongGian}</p>
                        </div>
                        < button onClick={()=>{OpenMoDal(thongTinChiNhanh,{TenTrang:'ChinhSuaChiNhanh'})}} className="px-4 py-2.5 bg-white border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 text-gray-700 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center shrink-0">
                            <i className="fa-solid fa-pen-to-square mr-2"></i> Chỉnh sửa
                        </button>
                    </div>
                </div>

                {/* Khu vực 2: Thanh tìm kiếm và Bộ lọc */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <i className="fa-solid fa-layer-group mr-3 text-indigo-500"></i>
                            Danh sách Không gian trực thuộc
                        </h2>
                        <button onClick={()=>{OpenMoDal(undefined,{TenTrang:'ThemKhongGian'})}} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-md flex items-center self-start md:self-auto shrink-0">
                            <i className="fa-solid fa-plus mr-2"></i> Thêm Không gian mới
                        </button>
                    </div>

                    {/* Form tìm kiếm và select */}
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                            <input 
                                type="text" 
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Tìm kiếm tên không gian, tầng... (Nhấn Enter)" 
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-medium"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                            >
                                <option value="">Tất cả loại hình</option>
                                <option value="1">Khu vực chung</option>
                                <option value="0">Phòng họp</option>
                            </select>
                            <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center">
                                Tìm kiếm
                            </button>
                        </div>
                    </form>
                </div>

                {/* Khu vực 3: Render danh sách các không gian từ API */}
                {danhSachKhongGian.length === 0 ? (
                    <>
                                          <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full my-6 transition-all">
        {/* Vòng tròn chứa Icon đệm động */}
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400 border border-slate-200 shadow-inner">
            <i className="fa-solid fa-store-slash text-2xl animate-pulse"></i>
        </div>
        
        {/* Tiêu đề thông báo */}
        <h3 className="text-lg font-bold text-slate-700 mb-1">
            Không tìm thấy không gian phù hợp
        </h3>
        
        {/* Mô tả chi tiết */}
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Hiện tại chi nhánh này chưa có không gian nào thuộc bộ lọc bạn chọn hoặc đang tạm thời đóng cửa để nâng cấp. Vui lòng thay đổi tùy chọn tìm kiếm.
        </p>
    </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {danhSachKhongGian.map((space) => {
                            const isLoaiChung = space.LOAI_KHONG_GIAN === 1;
                            const isBaoTri = space.TRANG_THAI === 2;
                            return (
                                <div 
                                    key={space.ID_KHONG_GIAN}
                                    className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full border-slate-200/80 shadow-sm relative z-10 hover:shadow-md hover:-translate-y-0.5}`}
                                >
                                    {/* Ảnh không gian */}
                                    <div className="w-full h-44 relative bg-slate-100 overflow-hidden">
                                        {space.HINHANH && (
                                            <Image
                                                src={`http://localhost:3001/${space.HINHANH}`}
                                                alt={space.TEN_KHONG_GIAN}
                                                width={500}
                                                height={300}
                                                unoptimized
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {/* Badge trạng thái loại hình */}
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

                                    {/* Thông tin thẻ */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className={`text-base font-bold mb-1 line-clamp-1 ${isBaoTri ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                            {space.TEN_KHONG_GIAN}
                                        </h3>
                                        
                                        <p className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                                            {isLoaiChung ? (
                                                <><i className="fa-solid fa-chair text-slate-400 w-4"></i> Ghế tự do, full tiện ích</>
                                            ) : (
                                                <><i className="fa-solid fa-users text-slate-400 w-4"></i> Dầy đủ phụ kiện</>
                                            )}
                                        </p>
                                        
                                        {/* Giá thuê & Chi tiết */}
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
                                                            {
                                                                                                                               space.ID_GIA && `${fun.formatCurrency(String(space.DON_GIA))}`
                                                                                                                           }<span className="text-[11px] font-normal text-slate-400">/giờ</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="relative z-40">
                                                    <Link
                                                        href={`/admin/ChiNhanh/chi-tiet-chi-nhanh/${idChiNhanh}/chi-tiet-khong-gian/${space.ID_KHONG_GIAN}`}
                                                        className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 font-bold py-2 px-3 rounded-xl text-xs transition-all duration-300"
                                                    >
                                                        Xem chi tiết
                                                    </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Khu vực 4: Điều hướng phân trang */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-slate-100 gap-4">
                    <p className="text-xs text-slate-400 font-medium">
                        Hiển thị <span className="font-bold text-slate-700">{danhSachKhongGian.length}</span> trên tổng số <span className="font-bold text-slate-700">{tongSoKhongGian}</span> không gian
                    </p>
                    <nav className="flex items-center gap-1.5">
                        <button 
                            type="button"
                            onClick={() => fetchKhongGian('prev')} 
                            disabled={page === 1} 
                            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <i className="fa-solid fa-chevron-left text-[10px]"></i>
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm">{page}</span>
                        <button 
                            type="button"
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
    );
}

export default ChiTietChiNhanh;