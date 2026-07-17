"use client";
import { useParams} from 'next/navigation';
import React, { useState, useEffect } from "react";
import * as api from "@/API/API";
import { KhongGian } from '@/interface/KhongGian';
import { LichDatItems } from '@/interface/LichDat';
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as fun from '@/FUNCTION/function';
import Image from "next/image";
import { useModalContext } from "@/context/QuanLiMoal";

// Interface phục vụ danh sách bảng giá hiển thị trong select option
interface BangGia {
    ID_GIA: number;
    TEN_DANHMUC: string;
    DON_GIA: number;
}

function ChinhSuaKhongGian() {
    const { idkhonggian } = useParams();
     const {  CloseMoDal } = useModalContext();
    const [loading, setloading] = useState<boolean>(false);
    const [khonggian, setkhonggian] = useState<KhongGian | null>(null);
    const [LichDatCuoi, setLichDatCuoi] = useState<LichDatItems | null>(null);
    
    // --- Các State phục vụ dữ liệu form chỉnh sửa ---
    const [TenKhongGian, setTenKhongGian] = useState<string>("");
    const [TrangThai, setTrangThai] = useState<string>("active");
    const [anhChiNhanh, setAnhChiNhanh] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [errors, setErrors] = useState<string[]>([]);
    
    // State cho khung giờ bảo trì
    const [ThoiGianBatDauDong, setThoiGianBatDauDong] = useState<string>("");
    const [ThoiGianDuKienMo, setThoiGianDuKienMo] = useState<string>("");


    const [danhSachGia, setDanhSachGia] = useState<BangGia[]>([]);
    const [idBangGia, setIdBangGia] = useState<string>("");

    // --- Lấy dữ liệu ban đầu từ Server ---
  useEffect(() => {
    const laythongtin = async () => {
        setloading(true);
        try {
            // 1. Lấy thông tin chi tiết không gian hiện tại
            const laydl = await api.CallAPI(undefined, { url: `/admin/ThongTin?id=${idkhonggian}`, PhuongThuc: 2 });
            
            if (laydl.success) {
                const dataKg = laydl.dulieu?.KhongGian?.[0];
                
     

                setkhonggian(dataKg || null);
                

                setLichDatCuoi(laydl.dulieu?.LichDatCuoi?.[0] || null);
                
                setTenKhongGian(dataKg?.TEN_KHONG_GIAN || "");
                setTrangThai((dataKg?.TRANG_THAI ?? 1) === 1 ? 'active' : 'maintenance');
                if (dataKg?.HINHANH) {
                    setPreviewUrl(`http://localhost:3001/${dataKg.HINHANH}`);
                }
            }

            // 2. Lấy danh sách bảng giá để đổ vào select option
            const resGia = await api.CallAPI(undefined, { url: "/admin/DanhSachBangGia", PhuongThuc: 2 });
          
            if (resGia.success) {
                setDanhSachGia(resGia.dulieu || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin không gian:", error);
            ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin dữ liệu');
        } finally {
            setloading(false);
        }
    };
    if (idkhonggian) laythongtin();
}, [idkhonggian]);
    useEffect(() => {
        const layDanhSachGia = async () => {
          try {
            const res = await api.CallAPI(undefined, { url: "/admin/ChonGia", PhuongThuc: 2 });
            if (res.success) {
              setDanhSachGia(res.dulieu || []);
            }
          } catch (error) {
            console.error("Lỗi lấy danh sách bảng giá:", error);
          }
        };

        layDanhSachGia();

      }, []);

    const handleThayDoiAnh = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAnhChiNhanh(file);
            const urlXemTruoc = URL.createObjectURL(file);
            setPreviewUrl(urlXemTruoc);
        }
    };

    const handleLuuCauHinh = async () => {
        setloading(true);
        try {
            let coCapNhat = false;

            // URL 1: Cập nhật Tên không gian
            if(TenKhongGian !== khonggian?.TEN_KHONG_GIAN){
                if(!TenKhongGian){
                    ThongBao.ThongBao_CanhBao('Vui lòng nhập thông tin tên không gian!');
                    setloading(false);
                    return;
                }
                const formData = new FormData();
                formData.append('IDKG' , String(idkhonggian));
                formData.append('TenKG' , TenKhongGian);
                const resNhom1 = await api.CallAPI(formData, { url: `/admin/ChinhSuaTen_kg`, PhuongThuc: 1 });
                if (resNhom1.validate) {
                    setErrors(resNhom1.errors);
                    setloading(false);
                    return;
                }
                if (!resNhom1.success) {
                    ThongBao.ThongBao_Loi("Lỗi cập nhật thông tin: " + resNhom1.message);
                    setloading(false);
                    return;
                }
                ThongBao.ThongBao_ThanhCong(resNhom1.message);
                coCapNhat = true;
            }

            // URL 2: Cập nhật Trạng thái vận hành
            const trangThaiSoHienTai = TrangThai === 'active' ? 1 : 0; 
            if (trangThaiSoHienTai !== khonggian?.TRANG_THAI) {
                if (!TrangThai) {
                    ThongBao.ThongBao_CanhBao('Vui lòng chọn thông tin trạng thái!');
                    setloading(false);
                    return;
                }
                if (TrangThai === "maintenance") {
                    if (!ThoiGianBatDauDong || !ThoiGianDuKienMo) {
                        ThongBao.ThongBao_CanhBao("Vui lòng chọn đầy đủ khung giờ bắt đầu và kết thúc bảo trì!");
                        setloading(false);
                        return;
                    }
                }
                const formData = new FormData();
                formData.append('NgayBatDau', ThoiGianBatDauDong);
                formData.append('NgayHoanThanh', ThoiGianDuKienMo);
                formData.append('IDKG', String(idkhonggian));
                formData.append('TrangThai', TrangThai);
                const resNhom2 = await api.CallAPI(formData, { url: `/admin/ChinhSua_TrangThai_KhongGian`, PhuongThuc: 1 });
                if (resNhom2.validate) {
                    setErrors(resNhom2.errors);
                    setloading(false);
                    return;
                }
                if (!resNhom2.success) {
                    ThongBao.ThongBao_Loi("Lỗi cập nhật thông tin: " + resNhom2.message);
                    setloading(false);
                    return;
                }
                ThongBao.ThongBao_ThanhCong(resNhom2.message);
                coCapNhat = true;
            }
            const idGiaGoc = khonggian?.ID_GIA ? String(khonggian.ID_GIA) : "";
            if (idBangGia && idBangGia.trim() !== "" && idBangGia !== String(idGiaGoc)) {
                const formData = new FormData();
                formData.append('IDKG', String(idkhonggian));
                formData.append('IDBangGia', idBangGia); // Giá trị ID bảng giá mới được chọn

                const resNhom4 = await api.CallAPI(formData, { url: `/admin/ChinhSuaGia_kg`, PhuongThuc: 1 });
                if (resNhom4.validate) {
                    setErrors(resNhom4.errors);
                    setloading(false);
                    return;
                }
                if (!resNhom4.success) {
                    ThongBao.ThongBao_Loi("Lỗi cập nhật đơn giá: " + resNhom4.message);
                    setloading(false);
                    return;
                }
                ThongBao.ThongBao_ThanhCong(resNhom4.message);
                coCapNhat = true;
            }

            // URL 3: Cập nhật Hình ảnh
            if(anhChiNhanh !== null){
                const formData = new FormData();
                formData.append("IDKG", String(idkhonggian));
                formData.append("file", anhChiNhanh);
                const resNhom3 = await api.CallAPI(formData, { url: `/admin/ChinhSuaAnh`, PhuongThuc: 1 });
                if (!resNhom3.success) {
                    ThongBao.ThongBao_Loi("Lỗi cập nhật hình ảnh: " + resNhom3.message);
                    setloading(false);
                    return;
                }
                ThongBao.ThongBao_ThanhCong(resNhom3.message);
                coCapNhat = true;
            }

            if (!coCapNhat) {
                ThongBao.ThongBao_CanhBao("Bạn chưa thay đổi thông tin nào!");
            }
        } catch (error) {
            console.error("Lỗi hệ thống khi gọi các API cập nhật:", error);
            ThongBao.ThongBao_CanhBao("Không thể kết nối đến máy chủ.");
        } finally {
            setloading(false);
        }
    };

    return (
        <>
            <div className="relative w-full max-w-md bg-white">
                <div className="space-y-0">
                    <div className="p-6 space-y-4">
                        {errors.length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                                    <i className="fa-solid fa-triangle-exclamation text-sm"></i> Phát hiện {errors.length} lỗi cần điều chỉnh:
                                </p>
                                <ul className="list-disc list-inside text-xs text-red-600 font-semibold space-y-1 pl-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 1. KHU VỰC: CHỈNH SỬA & XEM TRƯỚC ẢNH */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">Hình ảnh không gian</label>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100/50 transition-all relative group">
                                {previewUrl ? (
                                    <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-inner">
                                        <Image src={previewUrl} alt="Ảnh xem trước" fill unoptimized className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                                            <p className="text-white text-xs font-bold bg-indigo-600/90 px-3 py-1.5 rounded-lg shadow-sm">Thay đổi ảnh khác</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <i className="fa-solid fa-cloud-arrow-up text-gray-400 text-3xl mb-2"></i>
                                        <p className="text-xs text-gray-500 font-semibold">Bấm để tải ảnh lên</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleThayDoiAnh} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            </div>
                        </div>

                        {/* 2. KHU VỰC: TÊN KHÔNG GIAN */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">Tên không gian <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                                    <i className="fa-solid fa-building text-xs"></i>
                                </span>
                                <input 
                                    type="text" 
                                    value={TenKhongGian}
                                    onChange={(e) => setTenKhongGian(e.target.value)}
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all" 
                                />
                            </div>
                        </div>

                        {/* 🌟 3. KHU VỰC THÊM MỚI: CHỈNH SỬA ĐƠN GIÁ KHÔNG GIAN */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">id Đơn giá hiện tại:{khonggian?.ID_GIA}</label>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">Cấu hình đơn giá áp dụng</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                                    <i className="fa-solid fa-tags text-xs"></i>
                                </span>
                                <select 
                                    value={idBangGia} 
                                    onChange={(e) => setIdBangGia(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-gray-400">-- Để trống hoặc chọn giá mặc định --</option>
                                    {danhSachGia.map((item) => (
                                        <option key={item.ID_GIA} value={item.ID_GIA}>
                                            {fun.formatCurrency(item.DON_GIA)} (đ/giờ)
                                        </option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 pointer-events-none">
                                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                </span>
                            </div>
                        </div>

                        {/* 4. KHU VỰC: TRẠNG THÁI VẬN HÀNH */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">Trạng thái vận hành <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                                    <i className="fa-solid fa-circle-dot text-xs"></i>
                                </span>
                                <select 
                                    value={TrangThai} 
                                    onChange={(e) => setTrangThai(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="active">🟢 Đang hoạt động bình thường</option>
                                    <option value="maintenance">🟡 Tạm ngưng (Bảo trì / Sửa chữa kỹ thuật)</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 pointer-events-none">
                                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                </span>
                            </div>
                        </div>

                        {/* 5. KHU VỰC: CẢNH BÁO LỊCH ĐẶT & ẤN ĐỊNH KHUNG GIỜ BẢO TRÌ */}
                        <div id="emptyTimeAlert" className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3.5 animate-in fade-in duration-300">
                            <div className="flex items-start space-x-2">
                                <i className="fa-solid fa-calendar-clock text-amber-600 mt-0.5 text-sm"></i>
                                <div>
                                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">Thời gian trống (Không có khách thuê)</h4>
                                    <p className="text-[11px] text-amber-700 font-medium mt-0.5">Hệ thống ghi nhận lịch đặt cuối cùng kết thúc lúc:</p>
                                </div>
                            </div>

                            <div className="bg-white/90 border border-amber-100 rounded-xl p-3 font-mono text-xs text-amber-950 space-y-1.5 font-bold">
                                <div className="flex items-center justify-between">
                                    {LichDatCuoi ? (
                                        <span>• ({fun.formatDate(String(LichDatCuoi?.KHUNG_BATDAU))}): từ {fun.formatTime(String(LichDatCuoi?.KHUNG_BATDAU))} - {fun.formatTime(String(LichDatCuoi?.KHUNG_KETTHUC))}</span>
                                    ) : (
                                        <span className="text-gray-400 font-sans font-normal italic">Chưa từng có lịch đặt trước đó</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-1.5 border-t border-amber-200/60 space-y-2">
                                <label className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">Ấn định khung giờ đóng cửa tạm thời:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-amber-600 block">Bắt đầu đóng</span>
                                        <input 
                                            type="datetime-local" 
                                            value={ThoiGianBatDauDong} 
                                            onChange={(e) => setThoiGianBatDauDong(e.target.value)}
                                            required={TrangThai === "maintenance"}
                                            className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-amber-600 block">Dự kiến mở lại</span>
                                        <input 
                                            type="datetime-local" 
                                            value={ThoiGianDuKienMo} 
                                            onChange={(e) => setThoiGianDuKienMo(e.target.value)}
                                            required={TrangThai === "maintenance"}
                                            className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end space-x-2">
                        <button 
                            type="button" 
                              onClick={()=>{CloseMoDal()}}
                            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl border border-gray-200 transition-all cursor-pointer"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleLuuCauHinh()}
                            disabled={loading}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        >
                            {loading ? "Đang xử lý..." : "Lưu cấu hình"}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ChinhSuaKhongGian;