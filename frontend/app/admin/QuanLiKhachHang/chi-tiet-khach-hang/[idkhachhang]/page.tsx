'use client'
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import type { NguoiDung } from '@/interface/NguoiDung';
import Image from "next/image";
import * as fun from '@/FUNCTION/function';
import * as ThongBao from '@/FUNCTION/ThongBao';
import { LichDatItems } from '@/interface/LichDat';

function ChiTietKhachHang(){
    const params = useParams();
    const id = params?.idkhachhang;
    const [ThongTin, setThongTin] = useState<NguoiDung | null>(null);
    const [err, setErr] = useState<string[]>([]);
    
    // --- PHÂN TRANG LOGIC ---
    const [page, setpage] = useState<number>(1);
    const [tongSoDong, setTongSoDong] = useState<number>(0);
    const limit = 3; // Đồng bộ với limit Backend đang nhận (ví dụ 3 dòng/trang)
    const tongSoTrang = Math.ceil(tongSoDong / limit) || 1;

    const [danhSach, setDanhSach] = useState<LichDatItems[]>([]);
    const [loading, setloading] = useState<boolean>(false);

    useEffect(()=>{
        const truyvan = async()=>{
            if(!id) return;
            const dulieu1 = await api.CallAPI(undefined,{url:`/NguoiDung/ThongTin?id=${id}`, PhuongThuc:2});
           if(dulieu1.success){
                setThongTin(dulieu1.dulieu);
           }
        }
        truyvan();
    },[id])

    useEffect(()=>{
        const loadDL = async()=>{
            if(!id) return;
            setloading(true)
            try {
                // Đảm bảo gửi đúng tham số limit lên API nếu backend cần
                const ketqua = await api.CallAPI(undefined,{url:`/NguoiDung/lichsu_datlich_nguoidung?id=${id}&page=${page}&limit=${limit}`, PhuongThuc:2});
                if (ketqua && ketqua.success) {
                    setDanhSach(ketqua.DanhSach || []); 
                    setTongSoDong(ketqua.TongSo || 0);   
                }
            } catch (error) {
                 console.error('Lỗi khi tải dữ liệu lịch đặt:', error);
                 ThongBao.ThongBao_Loi('Đã xảy ra lỗi khi tải dữ liệu lịch đặt.');
            } finally {
                setloading(false)
            }
        };
        loadDL();
    },[id, page])

    const ChuyenTrangThai_TaiKhoan = async(TrangThai : number)=>{
        try {
            const XacNhan = TrangThai===1 ? await ThongBao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn mở lại tài khoản này không?') :
                                            await ThongBao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn khóa tài khoản này không?');
            if(!XacNhan) return;
            const formData = new FormData();
            formData.append("IDND", String(id));
            formData.append('TrangThai', String(TrangThai));
            const CapNhat = await api.CallAPI(formData,{url:'/NguoiDung/CapNhat_TrangThai' , PhuongThuc:1});
            if(CapNhat.validate){
                setErr(CapNhat.errors);
                return;
            }
            if(CapNhat.success){
                ThongBao.ThongBao_ThanhCong(CapNhat.message);
                // Cập nhật lại state UI ngay lập tức mà không cần reload trang
                setThongTin(prev => prev ? {...prev, TRANG_THAI: TrangThai} : null);
                return;
            }else{
                ThongBao.ThongBao_Loi(CapNhat.message);
                return;
            }
        } catch (error) {
            console.error("Lỗi hệ thống:", error);
        }
    }

    // Các hàm điều hướng phân trang
    const trangTruoc = () => { if (page > 1) setpage(page - 1); }
    const trangKeTiep = () => { if (page < tongSoTrang) setpage(page + 1); }

    // Tính toán số dòng hiển thị thực tế trên UI (Ví dụ: Hiển thị 1-3 trên 12)
    const dongBatDau = tongSoDong === 0 ? 0 : (page - 1) * limit + 1;
    const dongKetThuc = Math.min(page * limit, tongSoDong);

    return(
        <div className="max-w-7xl mx-auto space-y-6 p-4">
            {/* Header Toolbar */}
            <div className="flex items-center space-x-3">
               <button onClick={() => window.history.back()} className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-all cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform transition-transform duration-200 group-hover:-translate-x-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Quay lại
                </button>
                <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hồ sơ hệ thống</span>
                    <h1 className="text-base font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                        Chi tiết khách hàng <span className="font-mono text-xs text-indigo-600 lowercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-bold">#{ThongTin?.IDND || id}</span>
                    </h1>
                </div>
            </div>

            {/* Layout chính */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* CỘT TRÁI: THÔNG TIN USER */}
                <div className="space-y-4 lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                        {err && err.length > 0 && (
                            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                                <div className="flex items-center gap-2 text-red-600 font-semibold text-xs mb-1.5">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <span>Thông tin chỉnh sửa không hợp lệ:</span>
                                </div>
                                <ul className="list-disc list-inside space-y-0.5">
                                    {err.map((item, index) => (
                                        <li key={index} className="text-[11px] text-red-500 font-medium">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="p-6 flex flex-col items-center text-center border-b border-slate-100 bg-slate-50/50">
                            <div className="w-20 h-20 relative rounded-full overflow-hidden mb-3 border-2 border-white shadow-md bg-indigo-50 flex items-center justify-center">
                                {ThongTin?.HINH_ANH ? (
                                    <Image src={`http://localhost:3001/${ThongTin?.HINH_ANH}`} width={80} height={80} alt={`${ThongTin?.TENND}`} unoptimized className="object-cover w-full h-full" />
                                ) : (
                                    <i className="fa-solid fa-user text-2xl text-indigo-300"></i>
                                )}
                            </div>
                            <h2 className="text-sm font-black text-slate-900">{ThongTin?.TENND || 'Chưa cập nhật'}</h2>
                            <p className="text-[11px] text-slate-400 font-semibold pt-0.5">
                                Thành viên từ: {ThongTin?.NGAY_TAO ? fun.formatDate(String(ThongTin?.NGAY_TAO)) : '--/--/----'}
                            </p>
                            
                            <div className="mt-3">
                                {ThongTin?.TRANG_THAI === 1 ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shadow-xs">Hoạt động</span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold shadow-xs">Bị khóa</span>
                                )}
                            </div>
                        </div>

                        <div className="p-5 space-y-4 text-xs font-semibold">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase text-slate-400 block tracking-wider font-black">Địa chỉ Email</span>
                                <span className="text-slate-800 font-medium block break-all">{ThongTin?.EMAIL || 'Chưa có email'}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase text-slate-400 block tracking-wider font-black">Tổng số lượt thuê</span>
                                <span className="text-indigo-600 font-bold block">{tongSoDong} lượt đặt chỗ</span>
                            </div>
                        </div>
                    </div>

                    {/* Kiểm soát tài khoản */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center space-y-3">
                        <span className="text-[10px] uppercase text-slate-400 block tracking-wider font-black text-left">Kiểm soát hệ thống</span>
                        
                        <div className="flex justify-center items-center w-full">
                            {ThongTin?.TRANG_THAI === 1 ? (
                                <button onClick={() => ChuyenTrangThai_TaiKhoan(0)} type="button" className="w-full py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-[12px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-xs active:scale-98 cursor-pointer">
                                    <i className="fa-solid fa-user-lock text-[13px]"></i>
                                    <span>Khóa tài khoản</span>
                                </button>
                            ) : (
                                <button onClick={() => ChuyenTrangThai_TaiKhoan(1)} type="button" className="w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 text-[12px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-xs active:scale-98 cursor-pointer">
                                    <i className="fa-solid fa-user-check text-[13px]"></i>
                                    <span>Mở khóa tài khoản</span>
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Khi tài khoản bị khóa, khách hàng sẽ lập tức bị đăng xuất và không thể tiếp tục thực hiện đặt chỗ.</p>
                    </div>
                </div>

                {/* CỘT PHẢI: LỊCH SỬ ĐẶT CHỖ */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-1.5 border border-slate-200 rounded-xl shadow-xs flex select-none">
                        <button type="button" className="flex-1 py-2 text-center text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <i className="fa-solid fa-receipt mr-1.5"></i> Lịch sử đặt chỗ cá nhân
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Danh sách ghế đặt</h3>
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Trang {page}/{tongSoTrang}</span>
                        </div>

                        <div className="overflow-x-auto min-h-[220px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                                        <th className="py-3 px-4 w-24">Mã Đơn</th>
                                        <th className="py-3 px-4">Chi nhánh / Vị trí</th>
                                        <th className="py-3 px-4">Thời gian thuê</th>
                                        <th className="py-3 px-4 text-center w-20">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                Đang lấy dữ liệu trang {page}...
                                            </td>
                                        </tr>
                                    ) : danhSach.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-400 space-y-2">
                                                <i className="fa-solid fa-calendar-xmark text-2xl text-slate-300 block"></i>
                                                <span className="text-sm font-medium text-slate-500 block">Không tìm thấy lịch sử đặt</span>
                                                <span className="text-[11px] text-slate-400">Thành viên này chưa thực hiện bất kỳ giao dịch nào.</span>
                                            </td>
                                        </tr>
                                    ) : (
                                        danhSach.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/60 transition">
                                                <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                                                    #BK-{String(item.ID_GHE || index).padStart(4, '0')}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900">{item.TEN_CHI_NHANH}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium"> 
                                                        {item.TEN_KHONG_GIAN} <span className="font-bold text-indigo-600 font-mono">{item.ID_GHE !== null && `[Vị trí: ${item.ID_GHE}]`}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 font-medium">
                                                    <div>{fun.formatDate(item.KHUNG_BATDAU)}</div>
                                                    <div className="text-[10px] text-slate-400 font-normal font-mono">
                                                        {fun.formatTime(item.KHUNG_BATDAU)} - {item.KHUNG_KETTHUC}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center justify-center">
                                                        <button type="button" className="w-7 h-7 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-100 hover:border-indigo-100 transition flex items-center justify-center cursor-pointer" title="Xem hóa đơn chi tiết">
                                                            <i className="fa-solid fa-file-invoice-dollar text-xs"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* THANH PHÂN TRANG (PAGINATION BAR) */}
                        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-white text-[11px] font-semibold text-slate-500 select-none">
                            <div>
                                Hiển thị <span className="text-slate-900 font-bold">{dongBatDau}-{dongKetThuc}</span> trên <span className="text-slate-900 font-bold">{tongSoDong}</span> kết quả
                            </div>
                            <div className="flex items-center space-x-1">
                                {/* Nút Trang Trước */}
                                <button 
                                    onClick={trangTruoc}
                                    disabled={page === 1 || loading}
                                    type="button" 
                                    className="w-7 h-7 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md flex items-center justify-center disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                                >
                                    <i className="fa-solid fa-chevron-left text-[9px]"></i>
                                </button>
                                
                                {/* Chỉ số trang hiện tại */}
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold">
                                    {page}
                                </span>

                                {/* Nút Trang Kế Tiếp */}
                                <button 
                                    onClick={trangKeTiep}
                                    disabled={page === tongSoTrang || loading}
                                    type="button" 
                                    className="w-7 h-7 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md flex items-center justify-center disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                                >
                                    <i className="fa-solid fa-chevron-right text-[9px]"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
export default ChiTietKhachHang;