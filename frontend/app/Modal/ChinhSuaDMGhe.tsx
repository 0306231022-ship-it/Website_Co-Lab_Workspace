"use client";
import React, { useState, useEffect } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useRouter, useSearchParams } from 'next/navigation';

export interface UpdateDanhMucGheRequest {
    ID_DANHMUC: number;
    TEN_DANHMUC: string;
    TRANG_THAI: number;
}

export interface UpdateDanhMucGheResponse {
    success?: boolean;
    validate?: boolean;
    errors?: string[];
    message?: string;
}

export default function Chinhsuadmghe() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id'); // Lấy ID từ URL (VD: ?id=1)

    // State quản lý trạng thái
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);
    const [err, setErr] = useState<string[]>([]);

    // 1. State lưu trữ dữ liệu form
    const [formData, setFormData] = useState<UpdateDanhMucGheRequest>({
        ID_DANHMUC: Number(idParam) || 0,
        TEN_DANHMUC: "",
        TRANG_THAI: 1
    });

    // 2. TỰ ĐỘNG TẢI DỮ LIỆU CŨ KHI MỞ TRANG (Giống luồng chi tiết)
    useEffect(() => {
        if (!idParam) {
            ThongBao.ThongBao_Loi?.("Không tìm thấy ID danh mục cần sửa!");
            setFetching(false);
            return;
        }

        const fetchDetail = async () => {
            setFetching(true);
            try {
                // Gọi API lấy thông tin cũ của danh mục (Bạn chỉnh URL cho khớp Backend nhé)
                const res = await api.CallAPI(undefined, {
                    url: `/admin/chitietdanhmucghe?id=${idParam}`,
                    PhuongThuc: 2 // 2 là GET
                });

                if (res && res.success && res.data) {
                    setFormData({
                        ID_DANHMUC: res.data.ID_DANHMUC || Number(idParam),
                        TEN_DANHMUC: res.data.TEN_DANHMUC || "",
                        TRANG_THAI: res.data.TRANG_THAI !== undefined ? Number(res.data.TRANG_THAI) : 1
                    });
                } else {
                    ThongBao.ThongBao_Loi?.("Không thể tải thông tin danh mục!");
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết danh mục:", error);
                ThongBao.ThongBao_Loi?.("Lỗi kết nối máy chủ khi tải dữ liệu!");
            } finally {
                setFetching(false);
            }
        };

        fetchDetail();
    }, [idParam]);

    // 3. Hàm xử lý khi gõ/chọn input (Giống hệt trang Thêm)
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setErr([]); // Xóa lỗi cũ khi người dùng bắt đầu chỉnh sửa lại

        setFormData((prev) => ({
            ...prev,
            [name]: name === "TRANG_THAI" || name === "ID_DANHMUC" ? Number(value) : value
        }));
    };

    // 4. Hàm gửi dữ liệu cập nhật (Sử dụng FormData chuẩn giống trang Thêm)
    const handleSubmit = async () => {
        setErr([]); 
        
        // Validate phía Client
        if (!formData.TEN_DANHMUC.trim()) {
            ThongBao.ThongBao_Loi?.("Vui lòng nhập tên danh mục ghế!");
            return;
        }

        // Đóng gói dữ liệu vào FormData
        const submitData = new FormData();
        submitData.append("ID_DANHMUC", String(formData.ID_DANHMUC));
        submitData.append("TEN_DANHMUC", formData.TEN_DANHMUC.trim());
        submitData.append("TRANG_THAI", String(formData.TRANG_THAI));

        setLoading(true);
        try {
            // Gọi API cập nhật (PhuongThuc: 1 là POST/PUT tùy API.ts của bạn)
            const res: UpdateDanhMucGheResponse = await api.CallAPI(submitData, { 
                url: "/admin/capnhatdanhmucghe", 
                PhuongThuc: 1 
            });
            
            // Xử lý lỗi Validate từ Backend gửi về
            if (res.validate) {
                setErr(res.errors || ["Dữ liệu cập nhật không hợp lệ!"]);
                return;
            }

            // Xử lý khi thành công
            if (res && res.success) {
                if (ThongBao.ThongBao_ThanhCong) {
                    ThongBao.ThongBao_ThanhCong(res.message || "Cập nhật danh mục ghế thành công!");
                } else {
                    alert(res.message || "Cập nhật danh mục ghế thành công!");
                }
                
                // Điều hướng về trang danh sách và làm mới dữ liệu
                router.push('/admin/danhsachdanhmucghe');
                router.refresh(); 
            } else {
                ThongBao.ThongBao_Loi?.(res?.message || "Cập nhật thất bại. Vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật danh mục:", error);
            ThongBao.ThongBao_Loi?.("Đã xảy ra lỗi kết nối đến máy chủ!");
        } finally {
            setLoading(false);
        }
    };

    // Màn hình chờ khi đang tải dữ liệu cũ
    if (fetching) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                <i className="fa-solid fa-spinner animate-spin text-2xl mb-2 text-amber-500"></i>
                <span className="text-xs font-semibold">Đang tải thông tin danh mục...</span>
            </div>
        );
    }

    return (
        <div className="">
            <div className="flex flex-col flex-1">
                <div className="p-6 space-y-4 flex-1">
                    
                    {/* HỘP THOẠI HIỂN THỊ LỖI TỪ BACKEND (GIỐNG TRANG THÊM) */}
                    {err && err.length > 0 && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                            <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                                <i className="fa-solid fa-triangle-exclamation"></i> Vui lòng kiểm tra lại:
                            </p>
                            <ul className="list-disc list-inside text-xs text-rose-600 font-medium space-y-0.5">
                                {err.map((errorMsg, index) => (
                                    <li key={index}>{errorMsg}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* MÃ DANH MỤC (KHÓA CHÍNH - READ ONLY) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            Mã danh mục (ID_DANHMUC)
                        </label>
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                readOnly 
                                name="ID_DANHMUC"
                                value={formData.ID_DANHMUC}
                                className="w-full text-xs font-mono font-bold px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed tracking-wider" 
                            />
                            <span className="absolute right-3.5 text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded font-sans flex items-center gap-1">
                                <i className="fa-solid fa-lock text-[9px]"></i> Khóa chính PK
                            </span>
                        </div>
                    </div>

                    {/* TÊN DANH MỤC GHẾ */}
                    <div className="space-y-1.5">
                        <label htmlFor="TEN_DANHMUC" className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                            Tên danh mục ghế (TEN_DANHMUC) <span className="text-rose-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="TEN_DANHMUC"
                            name="TEN_DANHMUC"
                            required
                            maxLength={255}
                            value={formData.TEN_DANHMUC}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Nhập tên danh mục ghế..." 
                            className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal disabled:bg-slate-50 disabled:text-slate-400"
                        />
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                            <span>Giới hạn tối đa 255 ký tự.</span>
                            <span>{formData.TEN_DANHMUC.length}/255</span>
                        </div>
                    </div>

                    {/* TRẠNG THÁI HOẠT ĐỘNG */}
                    <div className="space-y-1.5">
                        <label htmlFor="TRANG_THAI" className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                            Trạng thái hoạt động (TRANG_THAI)
                        </label>
                        <select 
                            id="TRANG_THAI" 
                            name="TRANG_THAI"
                            value={formData.TRANG_THAI}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-3xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-medium text-slate-700 cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value={1}>1 - Cho phép hoạt động (Active)</option>
                            <option value={0}>0 - Tạm khóa / Bảo trì (Inactive)</option>
                        </select>
                    </div>

                    {/* LƯU Ý HỆ THỐNG DÀNH RIÊNG CHO TRANG SỬA */}
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
                        <i className="fa-solid fa-triangle-exclamation text-amber-600 text-xs mt-0.5"></i>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide block">Lưu ý hệ thống</span>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Nếu bạn chuyển danh mục này sang trạng thái <span className="font-bold text-amber-700">0 - Tạm khóa</span>, toàn bộ các ghế thuộc danh mục này trên sơ đồ sẽ tự động ẩn khỏi giao diện đặt chỗ của khách hàng.
                            </p>
                        </div>
                    </div>

                </div>
                
                {/* FOOTER ACTIONS */}
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-2 shrink-0">
                    <button 
                        type="button" 
                        onClick={() => router.back()}
                        disabled={loading}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl border border-amber-500 transition-all shadow-md shadow-amber-100 cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5"></span>
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-check mr-1.5"></i> Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}