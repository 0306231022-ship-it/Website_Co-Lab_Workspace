"use client";
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as fun from '@/FUNCTION/function';
import Image from "next/image";
import { NguoiDung } from '@/interface/NguoiDung';
export interface IBookingDetail {

  ID_LICH_DAT: number;
  KHUNG_BATDAU: string; 
  KHUNG_KETTHUC: string;
  HINH_THUC_DAT: 'Đặt Phòng' | 'Đặt Ghế';


  TEN_GHE: string | null;

 
  ID_KHONG_GIAN_THUCTE: number;
  TEN_KHONG_GIAN: string;
  ANH_KHONG_GIAN: string;
  TEN_CHI_NHANH: string;
  DIA_CHI_CHI_NHANH: string;
  ANH_CHI_NHANH: string; 
}
export interface IOrderTimelineDetail {
  ID_LICH_DAT: number;
  MA_TRANG_THAI: number;
  TEN_TRANG_THAI: string; 
  TONG_GIA_TRI_DON: number;


  MOC_DAT_DON_THANH_CONG: string;        
  MOC_DA_THANH_TOAN_ONLINE: string | null; 
  MOC_DA_NHAN_PHONG: string | null;      
  MOC_TRA_PHONG: string | null;           
}
interface IPaymentTransaction {
  MA_GIAO_DICH: string; // Mã giao dịch (Ví dụ: từ VNPAY hoặc hệ thống)
  NGAY_TAO: string;     // Ngày tạo giao dịch (chuỗi định dạng Datetime từ MySQL)
  SO_TIEN: number;      // Số tiền khớp lệnh thanh toán
}
function ChiTietDon(){
    const { id} = useParams();
    const [bookingDetail, setBookingDetail] = useState<IBookingDetail | null>(null);
    const [nguoidung,setnguoidung] = useState<NguoiDung | null>(null);
    const [orderDetail, setOrderDetail] = useState<IOrderTimelineDetail | null>(null);
    const [transaction, setTransaction] = useState<IPaymentTransaction | null>(null);
    const [gia,setgia] = useState<number>(0)
    useEffect(()=>{
        const laydl= async()=>{
            try {
                const [chinhanh, khachang,thongtin_hottdong,DonGia] = await Promise.all([
                    api.CallAPI(undefined,{url:`/admin/thongtin_chinhanh_khonggian?id=${id}`, PhuongThuc:2}),
                    api.CallAPI(undefined,{url:`/admin/thongtin_khachhang?id=${id}`, PhuongThuc:2}),
                    api.CallAPI(undefined,{url:`/admin/thongtin_hoatdong?id=${id}`, PhuongThuc:2}),
                    api.CallAPI(undefined,{url:`/admin/laygiatien_thanhtoan?id=${id}`, PhuongThuc:2})
                ]) 
                if(chinhanh.success){
                    setBookingDetail(chinhanh.dulieu);
                }else{
                    ThongBao.ThongBao_CanhBao(chinhanh.message)
                }
                if(khachang.success){
                    setnguoidung(khachang.dulieu)
                }else{
                     ThongBao.ThongBao_CanhBao(khachang.message)
                }
                if(thongtin_hottdong.success){
                    setOrderDetail(thongtin_hottdong.dulieu)
                }else{
                   ThongBao.ThongBao_CanhBao(khachang.message)
                }
                if(DonGia.success){
                    setgia(DonGia.GiaTien)
                    if(DonGia.ThanhToan!==null){
                        setTransaction(DonGia.ThanhToan)
                    }
                }

            } catch (error) {
                 console.error("Lỗi xảy ra:", error);
            }
        }
        laydl();
    },[id])

    return(
        <>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-start gap-4 flex-1">
                            <button onClick={() => window.history.back()} className="inline-flex items-center justify-center p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-xs group shrink-0 mt-0.5" title="Quay lại danh sách">
                                <i className="fa-solid fa-arrow-left transition-transform duration-200 group-hover:-translate-x-0.5"></i>
                            </button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-base font-bold text-slate-900">Chi tiết đơn đặt hàng #CLB-{id}</h1>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> {orderDetail?.TEN_TRANG_THAI}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-[11px] font-medium text-slate-400">Tổng giá trị đơn</p>
                            <p className="text-xl font-extrabold text-indigo-600 mt-0.5">{fun.formatCurrency(gia)}</p>
                        </div>
                    </div>

<div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
  {/* Đã loại bỏ thẻ div bọc flex-col ở giữa, đưa các mốc trực tiếp ra grid cha */}

  {/* MỐC 1: ĐẶT ĐƠN THÀNH CÔNG */}
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0">
      <i className="fa-solid fa-file-invoice"></i>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-800">Đặt đơn thành công</p>
      <p className="text-[10px] text-slate-400 font-mono">
        {`${fun.formatTime(String(orderDetail?.MOC_DAT_DON_THANH_CONG))} - ${fun.formatDate(String(orderDetail?.MOC_DAT_DON_THANH_CONG))}`}
      </p>
    </div>
  </div>

  {/* MỐC 2: ĐÃ THANH TOÁN ONLINE */}
  <div className={`flex items-center gap-3 ${!orderDetail?.MOC_DA_THANH_TOAN_ONLINE ? 'opacity-40' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      orderDetail?.MOC_DA_THANH_TOAN_ONLINE 
        ? 'bg-indigo-600 text-white shadow-xs' 
        : 'bg-slate-100 text-slate-500'
    }`}>
      <i className="fa-solid fa-credit-card"></i>
    </div>
    <div>
      <p className={`text-xs font-bold ${orderDetail?.MOC_DA_THANH_TOAN_ONLINE ? 'text-slate-800' : 'text-slate-700'}`}>
        Đã thanh toán online
      </p>
      <p className="text-[10px] text-slate-400 font-mono">
        {orderDetail?.MOC_DA_THANH_TOAN_ONLINE 
          ? `${fun.formatTime(orderDetail.MOC_DA_THANH_TOAN_ONLINE)} - ${fun.formatDate(orderDetail.MOC_DA_THANH_TOAN_ONLINE)}`
          : 'Chưa diễn ra'}
      </p>
    </div>
  </div>

  {/* MỐC 3: ĐÃ NHẬN PHÒNG */}
  <div className={`flex items-center gap-3 ${!orderDetail?.MOC_DA_NHAN_PHONG ? 'opacity-40' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      orderDetail?.MOC_DA_NHAN_PHONG 
        ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' 
        : 'bg-slate-100 text-slate-500'
    }`}>
      <i className="fa-solid fa-door-open"></i>
    </div>
    <div>
      <p className={`text-xs font-bold ${orderDetail?.MOC_DA_NHAN_PHONG ? 'text-indigo-600' : 'text-slate-700'}`}>
        Đã nhận phòng
      </p>
      <p className={`text-[10px] font-mono ${orderDetail?.MOC_DA_NHAN_PHONG ? 'text-indigo-400' : 'text-slate-400'}`}>
        {orderDetail?.MOC_DA_NHAN_PHONG 
          ? `${fun.formatTime(orderDetail.MOC_DA_NHAN_PHONG)} - ${fun.formatDate(orderDetail.MOC_DA_NHAN_PHONG)}`
          : 'Chưa diễn ra'}
      </p>
    </div>
  </div>

  {/* MỐC 4: TRẢ PHÒNG (Đã sửa thêm dấu ! phủ định logic) */}
  <div className={`flex items-center gap-3 ${!orderDetail?.MOC_TRA_PHONG ? 'opacity-40' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      orderDetail?.MOC_TRA_PHONG 
        ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' 
        : 'bg-slate-100 text-slate-500'
    }`}>
      <i className="fa-solid fa-flag-checkered"></i>
    </div>
    <div>
      <p className={`text-xs font-bold ${orderDetail?.MOC_TRA_PHONG ? 'text-indigo-600' : 'text-slate-700'}`}>
        Trả phòng
      </p>
      <p className="text-[10px] text-slate-400 font-mono">
        {orderDetail?.MOC_TRA_PHONG 
          ? `${fun.formatTime(orderDetail.MOC_TRA_PHONG)} - ${fun.formatDate(orderDetail.MOC_TRA_PHONG)}`
          : 'Chưa diễn ra'}
      </p>
    </div>
  </div>
</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-border-all text-indigo-500"></i> Thông tin dịch vụ đặt chỗ
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <i className="fa-solid fa-layer-group text-[9px]"></i> Cấp 1: Thông tin chi nhánh
                                    </p>
                                    <div className="flex items-start gap-3">

                                              <Image 
                                                             src={`http://localhost:3001/${bookingDetail?.ANH_CHI_NHANH}`} 
                                                             width={500}
                                                             height={192} 
                                                             alt={`${bookingDetail?.TEN_CHI_NHANH}`} unoptimized className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0" />
                                   
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-bold text-slate-900">{bookingDetail?.TEN_CHI_NHANH}</h4>
                                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <i className="fa-solid fa-location-dot text-[10px] text-slate-400 shrink-0"></i> 
                                               {bookingDetail?.DIA_CHI_CHI_NHANH}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs ml-4 relative before:absolute before:top-[-12px] before:left-[-16px] before:w-4 before:h-[32px] before:border-l-2 before:border-b-2 before:border-slate-200 before:rounded-bl-lg">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <i className="fa-solid fa-cubes text-[9px]"></i> Cấp 2: Thông tin không gian
                                    </p>
                                    <div className="flex gap-4">
                                         <Image 
                                                             src={`http://localhost:3001/${bookingDetail?.ANH_KHONG_GIAN}`} 
                                                             width={500}
                                                             height={192} 
                                                             alt={`${bookingDetail?.TEN_KHONG_GIAN}`} unoptimized className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0" />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-slate-900">{bookingDetail?.TEN_KHONG_GIAN}</h4>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Đặt phòng theo: {bookingDetail?.HINH_THUC_DAT}</p>
                                            <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-medium">
                                                {
                                                    bookingDetail?.TEN_GHE && (
                                                        <>
                                                         <span><i className="fa-solid fa-users text-slate-400 mr-1"></i> Vị trí: ghế {bookingDetail.TEN_GHE}</span>
                                                        </>
                                                    )
                                                }
                                               
                                              
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Thời gian bắt đầu</p>
                                    <p className="text-xs font-bold text-slate-800 mt-1">{fun.formatTime(String(bookingDetail?.KHUNG_BATDAU))} — {fun.formatDate(String(bookingDetail?.KHUNG_BATDAU))}</p>
                                </div>
                                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Thời gian kết thúc (Theo lịch đặt)</p>
                                    <p className="text-xs font-bold text-slate-800 mt-1">{fun.formatTime(String(bookingDetail?.KHUNG_KETTHUC))} — {fun.formatDate(String(bookingDetail?.KHUNG_KETTHUC))}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-receipt text-indigo-500"></i> Bảng phân rã chi phí
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs text-slate-600">
                                    <span>Giá thuê phòng họp: </span>
                                    <span className="font-medium text-slate-900">{fun.formatCurrency(gia)}</span>
                                </div>
                        
                                <div className="border-t border-slate-100 pt-3 flex justify-between text-xs font-bold text-slate-900">
                                    <span className="text-sm">Tổng cộng tiền thực trả:</span>
                                    <span className="text-base text-indigo-600 font-extrabold">{fun.formatCurrency(gia)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-user-tie text-indigo-500"></i> Thông tin khách hàng
                            </h3>
                            
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-3">
                                       <Image 
                                                             src={`http://localhost:3001/${nguoidung?.HINH_ANH}`} 
                                                             width={500}
                                                             height={192} 
                                                             alt={`${nguoidung?.TENND}`} unoptimized className="w-10 h-10 rounded-full object-cover border border-slate-100"/>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{nguoidung?.TENND}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{nguoidung?.EMAIL}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-credit-card text-indigo-500"></i> Giao dịch tài chính
                            </h3>
                            
                            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                                        <i className="fa-solid fa-globe"></i> Thanh toán Online (VNPay)
                                    </span>
                                </div>
                                {
                                    transaction !== null ? (
                                             <div className="text-[11px] text-emerald-700 space-y-1 font-medium">
                                    <p>Mã giao dịch VNPay: <span className="font-mono font-bold">VNPAY-{transaction.MA_GIAO_DICH}</span></p>
                                    <p>Thời gian nhận: {fun.formatDate(transaction.NGAY_TAO)}</p>
                                    <p>Số tiền khớp lệnh: {fun.formatCurrency(transaction.SO_TIEN)}</p>
                                </div>
                                    ) : (
                                             <div className="text-[11px] text-emerald-700 space-y-1 font-medium">
                                   <p>Đơn hàng chưa thanh toán</p>
                                </div>
                                    )
                                }
                           
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200/60">
                    <button type="button" className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Hoàn thành đơn đặt</span>
                    </button>
                </div>
        </>
    )
};
export default ChiTietDon;