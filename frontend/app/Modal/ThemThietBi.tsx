"use client";
import React, { useState } from "react";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
export default function Themthietbi() {
    
    const [tenThietBi, setTenThietBi] = useState<string>("");
    const [hinhAnh, setHinhAnh] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    
    const handleSubmit = async () => {
        
        if (!tenThietBi.trim()) {
            ThongBao.ThongBao_Loi("Vui lòng nhập tên thiết bị!");
            return;
        }
        if (!hinhAnh.trim()) {
            ThongBao.ThongBao_Loi("Vui lòng nhập className icon hiển thị!");
            return;
        }

        
        const submitData = new FormData();
        submitData.append("TEN_THIET_BI", tenThietBi.trim());
        submitData.append("HINH_ANH", hinhAnh.trim());

        setLoading(true);
        try {
            
            const res = await api.CallAPI(submitData, {
                url: "/admin/themthietbi",
                PhuongThuc: 1 
            });

            if (res && res.success) {
                ThongBao.ThongBao_ThanhCong(res.message || "Thêm thiết bị thành công!");
                setTenThietBi("");
                setHinhAnh("");
            } else {
                ThongBao.ThongBao_Loi(res?.message || "Thêm thiết bị thất bại, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Lỗi khi thêm thiết bị:", error);
            ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
        } finally {
            setLoading(false);
        }
    };

    return (
        
        <div className="p-6 space-y-5 flex flex-col h-full bg-white">
            
            {/* TÊN THIẾT BỊ */}
            <div className="space-y-1.5 flex-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                    Tên thiết bị <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                        <i className="fa-solid fa-heading text-xs"></i>
                    </span>
                    <input 
                        type="text" 
                        value={tenThietBi}
                        onChange={(e) => setTenThietBi(e.target.value)}
                        placeholder="Ví dụ: Màn hình Dell UltraSharp 27 Inch..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-normal"
                    />
                </div>
            </div>

            {/* CLASSNAME ICON */}
            <div className="space-y-1.5 flex-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                    className Icon hiển thị (FontAwesome) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                            <i className="fa-solid fa-code text-xs"></i>
                        </span>
                        <input 
                            type="text" 
                            value={hinhAnh}
                            onChange={(e) => setHinhAnh(e.target.value)}
                            placeholder="Ví dụ: fa-solid fa-tv" 
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-sans placeholder:font-normal"
                        />
                    </div>
                    <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-lg shrink-0" title="Icon Xem trước">
                        
                        <i className={hinhAnh || "fa-solid fa-desktop"}></i>
                    </div>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                    Sử dụng className của FontAwesome v6 (Ví dụ: <code className="bg-gray-50 px-1 py-0.5 rounded text-indigo-600 font-bold">fa-solid fa-tv</code>).
                </p>
            </div>

            {/* FOOTER ACTIONS - THÊM CÁC NÚT THAO TÁC */}
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end space-x-2 shrink-0">
              
                <button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border border-indigo-600 transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5"></span>
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-cloud-arrow-up mr-1.5"></i> Thêm thiết bị
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}