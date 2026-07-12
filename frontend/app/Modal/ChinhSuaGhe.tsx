"use client";
import React, { useState, useEffect } from "react";
import * as api from "@/API/API";
import { DanhMucGhe } from "@/interface/DanhMucGhe";
import * as ThongBao from '@/FUNCTION/ThongBao';
import { Ghe } from "@/interface/ghe";
import { useModalContext } from "@/context/QuanLiMoal";

interface gheProps {
    id: number;
}

function ChinhSuaGhe({ DuLieu }: { DuLieu: gheProps }) {
    const [DanhMuc, setdanhmuc] = useState<DanhMucGhe[]>([]);
    const [ThongTin, setThongTin] = useState<Ghe | null>(null);
     const {  CloseMoDal } = useModalContext();
    // States quản lý dữ liệu chỉnh sửa form
    const [tenGhe, setTenGhe] = useState<string>('');
    const [idDanhMuc, setIdDanhMuc] = useState<number>(0);

    // Tải dữ liệu ban đầu
    useEffect(() => {
        const laydl = async () => {
            try {
                const [ketqua1, ketqua2] = await Promise.all([
                    api.CallAPI(undefined, { url: `/admin/loaidanhmuc?Loai=1`, PhuongThuc: 2 }),
                    api.CallAPI(undefined, { url: `/admin/ChiTiet_ghe?ID_GHE=${DuLieu.id}`, PhuongThuc: 2 })
                ]);
        
                if (ketqua1.success) {
                    setdanhmuc(ketqua1.dulieu);
                }
                if (ketqua2.success) {
                    const dataGhe: Ghe = ketqua2.dulieu.ThongTinGhe;
                    setThongTin(dataGhe);
                    setTenGhe(dataGhe.TEN_GHE);
                    setIdDanhMuc(dataGhe.ID_DANH_MUC);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin ghế:", error);
                ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
            }
        };
        laydl();
    }, [DuLieu.id]);

    // URL 1: Xử lý thay đổi tên ghế
    const handleDoiTen = async () => {
        if (!tenGhe.trim()) return ThongBao.ThongBao_Loi("Tên ghế không được để trống!");
        if(tenGhe===ThongTin?.TEN_GHE){
            ThongBao.ThongBao_CanhBao('Thông tin chưa thay đổi!');
            return 
        }
        try {
             const formData = new FormData();
             formData.append('ID_GHE' , String(DuLieu.id));
             formData.append('TEN_GHE', String(tenGhe))
            const res = await api.CallAPI(formData, { url: `/admin/CapNhatTen_ghe`, PhuongThuc: 1 });
            if (res.success) {
                ThongBao.ThongBao_ThanhCong("Cập nhật tên ghế thành công!");
            } else {
                ThongBao.ThongBao_Loi(res.message || "Cập nhật thất bại!");
            }
        } catch (error) {
              console.error("Lỗi cập nhật tên ghế:", error);
            ThongBao.ThongBao_Loi("Lỗi hệ thống khi cập nhật tên!");
        }
    };

    // URL 2: Xử lý thay đổi danh mục ghế
    const handleDoiDanhMuc = async () => {
        try {
            const formData = new FormData();
             formData.append('ID_GHE' , String(DuLieu.id));
             formData.append('ID_DANH_MUC' , String(idDanhMuc));
            const res = await api.CallAPI(formData, { url: `/admin/CapNhatDanhMuc_ghe`, PhuongThuc: 1 });
            if (res.success) {
                ThongBao.ThongBao_ThanhCong("Cập nhật danh mục ghế thành công!");
            } else {
                ThongBao.ThongBao_Loi(res.message || "Cập nhật thất bại!");
            }
        } catch (error) {
             console.error("Lỗi cập nhật danh mục ghế:", error);
            ThongBao.ThongBao_Loi("Lỗi hệ thống khi cập nhật danh mục!");
        }
    };

    // URL 3: Xử lý đổi trạng thái vận hành (1: Hoạt động, 2: Ngưng hoạt động)
    const handleDoiTrangThai = async (statusHienTai: number) => {
        const XacNhan = await ThongBao.ThongBao_XacNhanTT('Bạn có muốn thay đổi trạng thái vận hành không?');
        if(!XacNhan) return;
        const statusMoi = statusHienTai === 1 ? 2 : 1;
        try {
             const formData = new FormData();
             formData.append('ID_GHE' , String(DuLieu.id));
             formData.append('TRANG_THAI' , String(statusMoi));
            const res = await api.CallAPI(formData, { url: `/admin/CapNhatTrangThai_ghe`, PhuongThuc: 1 });
            if (res.success) {
                if (ThongTin) setThongTin({ ...ThongTin, TRANG_THAI: statusMoi });
                ThongBao.ThongBao_ThanhCong("Thay đổi trạng thái vận hành thành công!");
            } else {
                ThongBao.ThongBao_Loi(res.message || "Thay đổi trạng thái thất bại!");
            }
        } catch (error) {
            ThongBao.ThongBao_Loi("Lỗi hệ thống khi đổi trạng thái!");
            console.error("Lỗi cập nhật trạng thái ghế:", error);
        }
    };

    return (
        <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-xs">
            {/* Header thông tin vị trí cố định */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="text-base font-black text-slate-800">Cấu hình thiết lập</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Khu vực: <span className="font-semibold text-slate-600">{ThongTin?.TEN_KHONG_GIAN || "Đang tải..."}</span></p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-black text-xs">
                    Mã ghế: A-{ThongTin?.ID_GHE}
                </span>
            </div>

            <div className="p-6 space-y-6">
                {/* PHÂN ĐOẠN 1: CHỈNH SỬA TÊN */}
                <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                        Tên ghế (Tên tài sản) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                <i className="fa-solid fa-signature text-sm"></i>
                            </span>
                            <input 
                                type="text" 
                                required 
                                value={tenGhe}
                                onChange={(e) => setTenGhe(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-bold"
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={handleDoiTen}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex-shrink-0"
                        >
                            Lưu tên
                        </button>
                    </div>
                </div>

                {/* PHÂN ĐOẠN 2: CHỈNH SỬA DANH MỤC */}
                <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                        Danh mục ghế <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                                <i className="fa-solid fa-list-ul text-sm"></i>
                            </span>
                            <select 
                                value={idDanhMuc} 
                                onChange={(e) => setIdDanhMuc(Number(e.target.value))}  
                                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-sm font-bold text-slate-700 rounded-xl pl-9 pr-10 py-2.5 focus:outline-none transition-all cursor-pointer appearance-none"
                            >
                                {DanhMuc && DanhMuc.length > 0 ? (
                                    DanhMuc.map((item) => (
                                        <option key={item.ID_DANHMUC} value={item.ID_DANHMUC}>
                                            {item.TEN_DANHMUC}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled value={0}>Không có danh mục nào!</option>
                                )}
                            </select>
                            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 pointer-events-none">
                                <i className="fa-solid fa-chevron-down text-[10px]"></i>
                            </span>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleDoiDanhMuc}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex-shrink-0"
                        >
                            Lưu loại ghế
                        </button>
                    </div>
                </div>

                {/* PHÂN ĐOẠN 3: ĐỔI TRẠNG THÁI VẬN HÀNH */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái vận hành hiện tại</label>
                    {ThongTin?.TRANG_THAI === 1 ? (
                        <button 
                            type="button" 
                            onClick={() => handleDoiTrangThai(1)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold transition-all cursor-pointer"
                        >
                            <div className="flex items-center space-x-2.5">
                                <i className="fa-solid fa-circle text-[10px] text-emerald-500 animate-pulse"></i>
                                <span>Ghế đang HOẠT ĐỘNG tốt</span>
                            </div>
                            <span className="text-xs text-rose-600 bg-white px-2 py-1 rounded-lg border border-emerald-200 font-bold shadow-2xs">
                                <i className="fa-solid fa-power-off mr-1"></i> Tạm ngưng
                            </span>
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={() => handleDoiTrangThai(2)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-800 rounded-xl text-sm font-bold transition-all cursor-pointer"
                        >
                            <div className="flex items-center space-x-2.5">
                                <i className="fa-solid fa-circle text-[10px] text-rose-500"></i>
                                <span>Ghế đang TẠM NGƯNG (Hỏng hóc / Bảo trì)</span>
                            </div>
                            <span className="text-xs text-emerald-600 bg-white px-2 py-1 rounded-lg border border-rose-200 font-bold shadow-2xs">
                                <i className="fa-solid fa-check mr-1"></i> Mở hoạt động
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Khối đóng modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <button type="button"  onClick={()=>{CloseMoDal()}} className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer">
                    Đóng cửa sổ
                </button>
            </div>
        </div>
    );
}

export default ChinhSuaGhe;