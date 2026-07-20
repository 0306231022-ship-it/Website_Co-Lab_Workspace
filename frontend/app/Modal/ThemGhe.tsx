"use client";
import React, { useState , useEffect } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { DanhMucGhe } from "@/interface/DanhMucGhe";
import { useModalContext } from "@/context/QuanLiMoal";
interface ID{
    id: number,
    toa_x: number,
    toa_y: number
}
function ThemGhe({DuLieu} : {DuLieu: ID}){
     const { CloseAllModals } = useModalContext();
    const [DanhMuc,setdanhmuc] = useState<DanhMucGhe[]>([]);
    const [iddm,setiddm] = useState<string>('');
    const [tenghe,settenghe] = useState<string>('')
     const {  CloseMoDal } = useModalContext();
    useEffect(()=>{
        const laydl = async()=>{
            try {
               const ketqua = await api.CallAPI(undefined,{url:`/admin/loaidanhmuc?Loai=1`, PhuongThuc:2})
                if(ketqua.success){
                    setdanhmuc(ketqua.dulieu)
                }
            } catch (error) {
                console.error("Lỗi khi tạo ghế mới:", error);
                ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
            }
        }
        laydl();
    },[])
    const them = async()=>{
        try {
            if(!DuLieu.id){
                ThongBao.ThongBao_CanhBao('Vui lòng kiểm tra thông tin gửi đi!');
                return;
            }
              const submitData = new FormData();
              submitData.append('ID_DANH_MUC', String(iddm))
              submitData.append('ID_KHONG_GIAN' ,String(DuLieu.id))
              submitData.append('TOA_X' , String(DuLieu.toa_x));
              submitData.append('TOA_Y' , String(DuLieu.toa_y))
              submitData.append('TEN_GHE' , String(tenghe))
            const kq = await api.CallAPI(submitData, {url:'/admin/themghe' , PhuongThuc:1});
            if(kq.success){
                CloseAllModals();
                ThongBao.ThongBao_ThanhCong(kq.message);
            }else{
                ThongBao.ThongBao_Loi(kq.message)
            }
        } catch (error) {
             console.error("Lỗi khi tạo ghê mới:", error);
            ThongBao.ThongBao_Loi("Đã xảy ra lỗi kết nối đến máy chủ!");
        }
    }
    return (
        <>
        <div className="p-5 space-y-4">
            
            <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                    Tên / Mã số ghế <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-xs"><i className="fa-solid fa-font"></i></span>
                    <input type="text"
                            onChange={(e)=>{settenghe(e.target.value)}}
                           className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white text-sm font-bold text-gray-900 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none transition-all placeholder:text-gray-300" 
                           placeholder="Ví dụ: A-01, VIP-10..." 
                           value={tenghe}/>
                </div>
            </div>

            <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                    Danh mục loại ghế
                </label>
                <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-xs"><i className="fa-solid fa-layer-group"></i></span>
                    <select onChange={(e)=>{setiddm(e.target.value)}} value={iddm} className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white text-sm font-bold text-gray-700 rounded-xl pl-9 pr-10 py-2.5 focus:outline-none transition-all cursor-pointer appearance-none">
                        <option value="" disabled hidden>-- Chọn danh mục loại ghế --</option>
                        {
                            DanhMuc && DanhMuc.length>0 ? (
                                DanhMuc.map((item)=>(
                                     <option key={item.ID_DANHMUC} value={item.ID_DANHMUC}>{item.TEN_DANHMUC}</option>
                                ))
                               
                            ):(
                               <option disabled value=""> Không có danh mục nào!</option>
                            )
                        }
                    </select>
                    <span className="absolute right-3.5 text-gray-400 pointer-events-none text-[10px]"><i className="fa-solid fa-chevron-down"></i></span>
                </div>
            </div>


        </div>

        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-2">
            <button type="button"   onClick={()=>{CloseMoDal()}} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer">
                Hủy bỏ
            </button>
            <button type="button" onClick={()=>{them()}} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/10 flex items-center cursor-pointer">
                <i className="fa-solid fa-check mr-1.5"></i> Xác nhận tạo ghế
            </button>
        </div>
        </>
    )
};
export default ThemGhe;