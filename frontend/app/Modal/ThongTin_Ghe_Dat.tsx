import React, { useState, useEffect } from 'react';
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import * as fun from '@/FUNCTION/function';
import { Ghe } from '@/interface/ghe';
import { LichDat} from '@/interface/LichDat';


interface LichDaDat{
    KHUNG_BATDAU:string,
    KHUNG_KETTHUC: string
}
function ThongTin({DuLieu} : { DuLieu : LichDat}) {
  // 1. Lấy ngày hiện tại chuẩn YYYY-MM-DD để chặn chọn ngày quá khứ
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayString();
  const [ngayDat, setNgayDat] = useState(todayDate);
  const [gioBatDau, setGioBatDau] = useState<string>('');
  const [gioKetThuc, setGioKetThuc] = useState<string>('');
  const [lichDaDat, setLichDaDat] = useState<LichDaDat[]>([]);
  const [loading,setloading] = useState<boolean>(false);
  const [err, setErr] = useState<string[]>([]);
  const batDau = new Date(gioBatDau);
  const ketThuc = new Date(gioKetThuc);
 const tongGio = (ketThuc.getTime() - batDau.getTime()) / (1000 * 60 * 60);
  useEffect(()=>{
    const layGT = async()=>{
        setloading(true)
        try {
            const data = await api.CallAPI(undefined,{url: `/admin/DanhSach_lichDat_theoidghe_Hientai?ID_GHE=${DuLieu.thongTinGhe.ID_GHE}`, PhuongThuc:2 });
            if (data && data.success) {
                setLichDaDat(data.dulieu || []);
            } else {
                setLichDaDat([]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách lịch đặt hiện tại theo ghế:", error);
        } finally{
            setloading(false)
        }
    }
    layGT();
  },[DuLieu.thongTinGhe.ID_GHE])

  const fetchLichDaDat = async(selectedDate : string) => {
    setloading(true)
    try {
        const data = await api.CallAPI(undefined,{url:`/admin/lichdatghe_theothoigian?THOIGIAN=${fun.formatToBackendDateTime(selectedDate)}&ID_GHE=${DuLieu.thongTinGhe.ID_GHE}` , PhuongThuc:2});
        if(data.validate){
            setErr(data.errors);
            ThongBao.ThongBao_CanhBao(data.message)
            return;
        }
         if (data && data.success) {
            setLichDaDat(data.dulieu || []);
        } else {
            setLichDaDat([]);
        }
    } catch (error) {
         console.error("Lỗi lấy danh sách lịch đặt hiện tại theo ghế:", error);
    } finally {
        setloading(false)
    }
  };
  const handleDatCho = async() => {
    if (gioKetThuc <= gioBatDau) {
      ThongBao.ThongBao_CanhBao("Giờ kết thúc phải lớn hơn giờ bắt đầu!");
      return;
    }
    try {
         const dataToSend = new FormData();
        dataToSend.append('ID_GHE' , String(DuLieu.thongTinGhe.ID_GHE));
        dataToSend.append('KHUNG_BATDAU', String(fun.formatToBackendDateTime(gioBatDau)));
        dataToSend.append('KHUNG_KETTHUC' , String(fun.formatToBackendDateTime(gioKetThuc)));
        dataToSend.append("LoaiND", String(0));
        const DatLich = await api.CallAPI(dataToSend,{url:'/nguoiDung/LichDat', PhuongThuc:1});
        alert(JSON.stringify(DatLich))
         if(DatLich.validate){
            setErr(DatLich.errors);
            ThongBao.ThongBao_CanhBao(DatLich.message)
            return;
        }
        if(DatLich.success){
            ThongBao.ThongBao_ThanhCong(DatLich.message)
        }
        if(DatLich.success===false){
            ThongBao.ThongBao_Loi(DatLich.message)
        }
    } catch (error) {
        console.error("Lỗi đặt lịch:", error);
        ThongBao.ThongBao_CanhBao('Có lỗi sảy ra!')
    }
  };

  return (
    <>
        <div className="p-6 bg-gradient-to-b from-blue-50/70 to-white border-b border-slate-100 pr-16">
        {err && err.length > 0 && (
        <div className="w-full mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-left animate-pulse">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-xs mb-1.5">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Thông tin chọn ngày không hợp lệ:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {err.map((item, index) => (
              <li key={index} className="text-[11px] text-red-500 font-medium">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center font-black shadow-md shadow-blue-500/20 ring-4 ring-blue-100">
              <span className="text-[10px] uppercase tracking-widest text-blue-200 -mb-0.5">Ghế</span>
              <span id="modalSeatName" className="text-xl">A-06</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Ghế cá nhân</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                <i className="fa-solid fa-location-dot text-blue-500"></i> Dãy A — Khu Zone A
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
    
            <div className="text-right">
              <span className="text-2xl font-black text-blue-600">{DuLieu.thongTinGhe.ID_GHE}</span>
              <span className="text-xs font-bold text-slate-400"> / giờ</span>
            </div>
          </div>
        </div>

      
        <div className="p-6 bg-white space-y-6">
          
     

            {/* Hàng 2: CHỌN GIỜ BẮT ĐẦU VÀ KẾT THÚC ĐẶT KẾ TIẾP */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  Giờ bắt đầu
                </label>
                <div className="relative group">
                  <i className="fa-regular fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-base pointer-events-none z-10"></i>
                  <input 
                     type="datetime-local" 
                    className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-11 pr-3 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-sm cursor-pointer relative" 
                    value={gioBatDau}
                    min={todayDate}
                    onChange={(e) =>{
                        setGioBatDau(e.target.value);
                        fetchLichDaDat(e.target.value);
                        setNgayDat(e.target.value);
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  Giờ kết thúc
                </label>
                <div className="relative group">
                  <i className="fa-regular fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-base pointer-events-none z-10"></i>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-11 pr-3 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-sm cursor-pointer relative" 
                    value={gioKetThuc}
                    min={gioBatDau}
                    onChange={(e) => setGioKetThuc(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Hàng 3: DANH SÁCH LỊCH ĐÃ ĐẶT (Được load dựa theo Ngày ở trên) */}
         

          <div className="border-t border-slate-200 border-dashed my-2"></div>

          {/* Phần Footer & Button Xác nhận */}
          <div>
            <div className="flex justify-between items-end mb-4 px-1">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-0.5">Vui lòng kiểm tra lại giờ đặt</span>
                <span className="text-sm font-bold text-slate-800">Tạm tính:</span>
              </div>
              <span className="text-3xl font-black text-blue-600 tracking-tight">30.000đ</span>
            </div>

            <button 
              onClick={handleDatCho}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer text-sm tracking-wide"
            >
              Xác nhận đặt chỗ <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
    </>
  );
}

export default ThongTin;