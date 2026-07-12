"use client";
import React, { useState } from "react";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import { useModalContext } from "@/context/QuanLiMoal";
export interface THIETBI {
    id: number;
    ten: string;
    hinhanh: string;
}
export default function ChinhSuaThietBi({ DuLieu}: {DuLieu : THIETBI}) {
    // 1. Tạo các biến State và khởi tạo bằng giá trị gốc
     const {  CloseMoDal } = useModalContext();
    const [ten, setTen] = useState<string>(DuLieu?.ten || "");
    const [hinhanh, setHinhAnh] = useState<string>(DuLieu?.hinhanh || "");
    const [loading, setLoading] = useState<boolean>(false);
    const [err, setErr] = useState<string[]>([]);
    // 2. Hàm xử lý gửi dữ liệu lên Server
    const handleSubmit = async () => {
        let ThayDoi = false;
        if(ten !== DuLieu.ten){
            if (!ten.trim()) {
                ThongBao.ThongBao_Loi("Vui lòng không để trống tên thiết bị!");
                return;
            }
             setLoading(true);
             try {
                const formData = new FormData();
                formData.append('ID_THIET_BI' , String(DuLieu.id));
                formData.append('TEN_THIET_BI', ten);
                const ketqua = await api.CallAPI(formData,{url:'/admin/chinhsua_ten', PhuongThuc:1});
                if(ketqua.validate){
                     setErr(ketqua.errors);
                    return;
                }
                if(ketqua.success){
                    ThongBao.ThongBao_ThanhCong(ketqua.message)
                }else{
                    ThongBao.ThongBao_Loi(ketqua.message)
                }
             } catch (error) {
                   console.error("Lỗi khi chỉnh sửa thông tin thiết bị:", error);
                    ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
             } finally {
                setLoading(false)
             }
             ThayDoi = true;
        }
        if(hinhanh!==DuLieu.hinhanh){
             if (!hinhanh.trim()) {
                ThongBao.ThongBao_Loi("Vui lòng không để trống className icon!");
                return;
            }
             setLoading(true);
             try {
                const formData = new FormData();
                formData.append('ID_THIET_BI' , String(DuLieu.id));
                formData.append('HINH_ANH', hinhanh);
                const ketqua = await api.CallAPI(formData,{url:'/admin/chinhsua_anh', PhuongThuc:1});
                if(ketqua.validate){
                     setErr(ketqua.errors);
                    return;
                }
                if(ketqua.success){
                    ThongBao.ThongBao_ThanhCong(ketqua.message)
                }else{
                    ThongBao.ThongBao_Loi(ketqua.message)
                }
             } catch (error) {
                   console.error("Lỗi khi chỉnh sửa thông tin thiết bị:", error);
                    ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
             } finally {
                setLoading(false)
             }
              ThayDoi = true;
        }
         if(!ThayDoi){
            ThongBao.ThongBao_CanhBao('Không có thông tin nào thay đổi');
            return;
        }
       
    };

    return (
        <div className="bg-white flex flex-col h-full">
            {/* Đổi thẻ <form> thành <div> */}
            <div className="p-6 space-y-5 flex-1">
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
                {/* TÊN THIẾT BỊ */}
                <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                        Tên thiết bị <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                            <i className="fa-solid fa-desktop text-xs"></i>
                        </span>
                        <input 
                            type="text" 
                            value={ten}
                            onChange={(e) => setTen(e.target.value)}
                            placeholder="Nhập tên thiết bị..." 
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                        />
                    </div>
                </div>

                {/* ICON THIẾT BỊ */}
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
                                value={hinhanh}
                                onChange={(e) => setHinhAnh(e.target.value)}
                                placeholder="Ví dụ: fa-solid fa-tv" 
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-sans placeholder:font-normal"
                            />
                        </div>
                        <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-lg shrink-0" title="Icon Xem trước">
                            {/* Khối Preview Icon Realtime */}
                            <i className={hinhanh || "fa-solid fa-question"}></i>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">
                        Sử dụng className của FontAwesome v6 (Ví dụ: <code className="bg-gray-50 px-1 py-0.5 rounded text-indigo-600 font-bold">fa-solid fa-tv</code>).
                    </p>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end space-x-2 shrink-0">
                <button 
                    type="button"
                    onClick={()=>{CloseMoDal()}}
                    disabled={loading}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl border border-gray-200 shadow-3xs transition-all cursor-pointer disabled:opacity-50"
                >
                    Hủy bỏ
                </button>
                <button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <i className="fa-solid fa-spinner animate-spin mr-1.5"></i> Đang xử lý...
                        </>
                    ) : (
                        "Lưu thay đổi"
                    )}
                </button>
            </div>
        </div>
    );
}