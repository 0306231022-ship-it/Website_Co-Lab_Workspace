"use client";
import React, { useState , useEffect } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { Ghe } from "@/interface/ghe";
import Image from "next/image";
import * as fun from '@/FUNCTION/function';
import { useModalContext } from "@/context/QuanLiMoal";
interface dulieu {
    ID_GHE: number
}
interface ThongTin_DatLich {
    KHUNG_BATDAU: string,
    KHUNG_KETTHUC: string,
    TENND : string,
    HINH_ANH: string,
    EMAIL : string,

}
function ThongTinGhe({DuLieu} : {DuLieu : dulieu}){
    const [ThongTin,setThongTin] = useState< Ghe | null>(null);
    const [thongTin_DatL,setTT] = useState<ThongTin_DatLich | null>(null);
    const { OpenMoDal } = useModalContext();
    useEffect(()=>{
        const laydl = async()=>{
            try {
                const lay = await api.CallAPI(undefined,{url:`/admin/ChiTiet_ghe?ID_GHE=${DuLieu}` , PhuongThuc:2});
                if(lay.success){
                    setThongTin(lay.dulieu.ThongTinGhe);
                    if(lay.dulieu.NguoiDatHienTai !== null){
                        setTT(lay.dulieu.NguoiDatHienTai)
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết ghế:", error);
                ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
            }
        }
        laydl();
    },[DuLieu])
    return (
        <>

    
    <div className="bg-white w-full max-w-2xl  border border-gray-100 flex transform scale-100 transition-transform">
        
        <div className="w-full md:w-2/5 bg-gray-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Mã vị trí</span>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mt-0.5">A-{ThongTin?.ID_GHE}</h2>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-gray-200 flex items-center justify-center text-gray-500 text-xl">
                        <i className="fa-solid fa-chair"></i>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3.5">
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tên ghế (Tài sản)</span>
                        <p className="text-sm font-extrabold text-indigo-900 mt-0.5">{ThongTin?.TEN_GHE}</p>
                    </div>
                    
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Thuộc khu vực</span>
                        <p className="text-sm font-bold text-gray-800">{ThongTin?.TEN_KHONG_GIAN}</p>
                    </div>
                    
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Loại chỗ ngồi</span>
                        <p className="text-sm font-medium text-gray-600">{ThongTin?.TEN_DANHMUC}</p>
                    </div>
                    <div>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Giá thuê theo giờ</span>
                                <p className="text-base font-black text-amber-600 mt-0.5">
                                    {/* Giả định field dữ liệu trả về từ API là GIA_THEO_GIO hoặc bạn có thể thay thế cho đúng */}
                                    50000
                                    <span className="text-xs font-normal text-gray-400 lowercase"> / giờ</span>
                                </p>
                            </div>
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Trạng thái kỹ thuật</span>
                        {
                            ThongTin?.TRANG_THAI===1 ? (
                                                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span> Thiết bị hoạt động tốt
                        </span>
                            ):(
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span> Đang trong quá trình tu sửa
                        </span>
                            )
                        }
  
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
                <button type="button" onClick={()=>{OpenMoDal({DuLieu:DuLieu.ID_GHE}, {TenTrang:'ChinhSuaGhe'})}} className="w-full px-4 py-2.5 bg-white border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 text-gray-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center cursor-pointer">
                    <i className="fa-solid fa-pen-to-square mr-2 text-[11px]"></i> Chỉnh sửa
                </button>
            </div>
        </div>

        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between relative">
            
    

            <div className="space-y-5">
                <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">Tình trạng sử dụng hiện tại</span>

                <div className="space-y-4">
                {thongTin_DatL !== null? (
    /* 🔴 TRẠNG THÁI: ĐANG CÓ NGƯỜI SỬ DỤNG (MÀU ĐỎ/HỒNG) */
    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200/60 shadow-3xs transition-all">
        <span className="relative flex h-2 w-2 mr-2">
            {/* Hiệu ứng sóng nhấp nháy lan tỏa */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
        <span>ĐANG CÓ NGƯỜI SỬ DỤNG</span>
    </div>
) : (
    /* 🟢 TRẠNG THÁI: TRỐNG / SẴN SÀNG (MÀU XANH LÁ) */
    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-3xs transition-all">
        <span className="relative flex h-2 w-2 mr-2">
            {/* Chấm xanh lá cây tĩnh đại diện cho trạng thái sẵn sàng ổn định */}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>TRỐNG / SẴN SÀNG</span>
    </div>
)}
        {
            thongTin_DatL !== null && (
                  <div className="bg-indigo-950/5 border border-indigo-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                            
                             <Image src={`http://localhost:3001/${thongTin_DatL.HINH_ANH}`} alt={thongTin_DatL.TENND} fill   unoptimized className="object-cover w-full h-full"  />
                                          
                            <div>
                                <p className="text-sm font-black text-gray-900">{thongTin_DatL.TENND}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-100/50 text-xs">
                            <div>
                                <span className="text-gray-400 block font-medium">Thời gian bắt đầu  </span>
                                <span className="font-bold text-gray-800"><i className="fa-regular fa-clock mr-1 text-indigo-500"></i>{fun.formatTime(thongTin_DatL.KHUNG_BATDAU) + '-' + fun.formatDate(thongTin_DatL.KHUNG_BATDAU)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Thời gian kết thúc</span>
                                <span className="font-bold text-gray-800"><i className="fa-regular fa-calendar-xmark mr-1 text-indigo-500"></i>{fun.formatTime(thongTin_DatL.KHUNG_KETTHUC) + '-' + fun.formatDate(thongTin_DatL.KHUNG_KETTHUC)}</span>
                            </div>
                        </div>
                    </div>
            )
        }
                  
                </div>

            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button type="button" className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition md:hidden cursor-pointer">
                    Đóng
                </button>
                <button type="button" className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition cursor-pointer">
                    <i className="fa-solid fa-history mr-1.5 text-[11px]"></i> Lịch sử đặt ghế
                </button>
                <button type="button" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer">
                    Hoàn tất xem
                </button>
            </div>

        </div>

    </div>

        </>
    )
};
export default ThongTinGhe;