"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from "react-qr-code";
interface ChiTietNguoiDung {
    TENND: string;
    EMAIL: string;
}

interface ChiTietThoiGian {
    KHUNG_BATDAU: string;
    KHUNG_KETTHUC: string;
}

interface ChiTietGheKhongGian {
    ID_GHE: number | null;
    ID_KHONG_GIAN: number | null;
    TEN_GHE: string | null;
    TEN_KHONG_GIAN: string | null;
    TEN_CHI_NHANH: string | null;
}

interface ChiTietHoaDon {
    ID_HOADON: number;
    GIA_TIEN: string;
    NGAY_TAO: string;
    TRANG_THAI: number;
}

interface LichDat {
    cHITiet_NguoiDung: ChiTietNguoiDung;
    ChiTiet_ThoiGian: ChiTietThoiGian;
    ChiTiet_Ghe_KhongGian: ChiTietGheKhongGian;
    ChiTiet_HoaDon: ChiTietHoaDon;
}

export interface ResponseChiTietLichDat {
    lichDat: LichDat;
}

function ChiTietLichDat() {
  const { id } = useParams();
  const [lichDat, setLichDat] = useState<LichDat | null>(null);
  const router = useRouter();
  const localIP = "127.0.0.1"; // Thay bằng địa chỉ IP của máy tính chạy server
  const qrUrl = `http://${localIP}:3000/admin/checkin?room_id=${lichDat?.ChiTiet_Ghe_KhongGian?.ID_GHE || ''}`;
  useEffect(() => {
    const fetchLichDat = async () => {
      if (!id) {
        ThongBao.ThongBao_Loi('ID lịch đặt không hợp lệ.');
        return;
      }
      try {
        const res = await api.CallAPI(undefined, { url: `/NguoiDung/LICHDAT?Id=${id}`, PhuongThuc: 2 });
        if (res && res.success) {
          setLichDat(res.lichDat);
        } else {
          router.push('/admin'); 
          ThongBao.ThongBao_Loi(res.message);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu lịch đặt:', error);
        ThongBao.ThongBao_Loi('Đã xảy ra lỗi khi tải dữ liệu lịch đặt.');
      }
    }
    fetchLichDat();
  }, [id]);

  // Định dạng hiển thị ngày/tháng từ chuỗi thời gian (Hỗ trợ định dạng ISO hoặc YYYY-MM-DD)
  const renderDateDetails = () => {
    if (!lichDat?.ChiTiet_ThoiGian?.KHUNG_BATDAU) return { day: '--', month: '--', fullDate: 'Chưa cập nhật' };
    try {
      const dateObj = new Date(lichDat.ChiTiet_ThoiGian.KHUNG_BATDAU);
      if (isNaN(dateObj.getTime())) return { day: '--', month: '--', fullDate: 'Chưa cập nhật' };
      
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][dateObj.getDay()];

      return {
        day,
        month: `Thg ${month}`,
        fullDate: `${dayOfWeek}, ${day} tháng ${month}, ${year}`
      };
    } catch {
      return { day: '--', month: '--', fullDate: 'Chưa cập nhật' };
    }
  };


const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
  // Hàm format giá tiền dạng đồng (ví dụ: 120000 -> 120.000đ)
  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return '0đ';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN').format(numericAmount) + 'đ';
  };
  const getStatusDetails = (start: string | undefined, end: string | undefined) => {
  if (!start || !end) {
    return {
      text: "Không rõ",
      className: "bg-slate-50 text-slate-700 border-slate-200/60",
      dotClassName: "bg-slate-500"
    };
  }

  try {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return {
        text: "Không rõ",
        className: "bg-slate-50 text-slate-700 border-slate-200/60",
        dotClassName: "bg-slate-500"
      };
    }

    if (now < startTime) {
      return {
        text: "Sắp tới",
        className: "bg-amber-50 text-amber-700 border-amber-200/60",
        dotClassName: "bg-amber-500 animate-pulse"
      };
    } else if (now >= startTime && now <= endTime) {
      return {
        text: "Đang diễn ra",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        dotClassName: "bg-emerald-500 animate-ping"
      };
    } else {
      return {
        text: "Đã hoàn thành",
        className: "bg-slate-100 text-slate-600 border-slate-200",
        dotClassName: "bg-slate-400"
      };
    }
  } catch {
    return {
      text: "Không rõ",
      className: "bg-slate-50 text-slate-700 border-slate-200/60",
      dotClassName: "bg-slate-500"
    };
  }
};

  const { day, month, fullDate } = renderDateDetails();


  if (!lichDat) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 font-medium">Đang tải thông tin lịch đặt...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        {/* Nút Quay lại & Breadcrumb */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm">
              <i className="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <h2 className="text-base font-bold text-slate-800">Quay lại danh sách</h2>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div>
              <nav className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-1 uppercase tracking-wider">
                <a href="#" className="hover:text-brand-600 transition">Cá nhân</a>
                <i className="fa-solid fa-chevron-right text-[8px] text-slate-300"></i>
                <a href="#" className="hover:text-brand-600 transition">Lịch sử đặt lịch</a>
                <i className="fa-solid fa-chevron-right text-[8px] text-slate-300"></i>
                <span className="text-slate-700 font-bold">Chi tiết</span>
              </nav>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Mã đặt chỗ: <span className="text-brand-600">#{lichDat.ChiTiet_HoaDon?.ID_HOADON || id}</span>
              </h1>
            </div>
            <div>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${ getStatusDetails(lichDat.ChiTiet_ThoiGian?.KHUNG_BATDAU, lichDat.ChiTiet_ThoiGian?.KHUNG_KETTHUC).className}`}>
                <span className={`w-2 h-2 rounded-full ${ getStatusDetails(lichDat.ChiTiet_ThoiGian?.KHUNG_BATDAU, lichDat.ChiTiet_ThoiGian?.KHUNG_KETTHUC).dotClassName}`}></span> { getStatusDetails(lichDat.ChiTiet_ThoiGian?.KHUNG_BATDAU, lichDat.ChiTiet_ThoiGian?.KHUNG_KETTHUC).text }
              </span>
            </div>
          </div>
        </div>

        {/* Bố cục Vé thông tin tổng thể */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row relative">
          
          {/* Cột trái: Thông tin chi tiết lịch hẹn */}
          <div className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-200 border-dashed relative">
            
            {/* Điểm cắt vé bên phải (Chỉ hiện trên desktop) */}
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200 z-10"></div>

            {/* Khối 1: Thời gian sử dụng */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fa-regular fa-clock text-brand-500"></i> Thời gian sử dụng
              </h3>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center text-brand-600 shadow-sm shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                  <span className="text-2xl font-black leading-none mt-0.5">{day}</span>
                </div>
                <div>
                  <div>
  <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
    {formatTime(lichDat.ChiTiet_ThoiGian?.KHUNG_BATDAU)} 
    <i className="fa-solid fa-arrow-right text-slate-300 text-sm"></i> 
    {formatTime(lichDat.ChiTiet_ThoiGian?.KHUNG_KETTHUC)}
  </p>
  
  
</div>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">{fullDate}</p>
                </div>
              </div>
            </div>

            {/* Khối 2: Vị trí & Không gian */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-brand-500"></i> Không gian & Vị trí
              </h3>
              <div className="bg-slate-50/60 rounded-xl p-4 md:p-5 border border-slate-100 flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-500 shrink-0 shadow-sm">
                  <i className="fa-solid fa-desktop text-lg"></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-800">
                   không gian: {lichDat.ChiTiet_Ghe_KhongGian?.TEN_KHONG_GIAN || 'N/A'}
                  </h4>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Chi nhánh: {lichDat.ChiTiet_Ghe_KhongGian?.TEN_CHI_NHANH || 'Chưa xác định'}
                  </p>
                  
                  <div className="mt-3 bg-white border border-slate-200 rounded-xl p-2.5 inline-flex flex-col items-center justify-center min-w-[100px] shadow-sm">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Vị trí ghế</span>
                    <span className="text-xl font-black text-brand-600 leading-none">
                      {lichDat.ChiTiet_Ghe_KhongGian?.TEN_GHE || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Khối 3: Người đặt */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fa-regular fa-user text-brand-500"></i> Người đặt
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 rounded-xl p-4 border border-slate-100">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Họ và tên</p>
                  <p className="text-sm font-bold text-slate-800">
                    {lichDat.cHITiet_NguoiDung?.TENND || 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-sm font-bold text-slate-800 break-all">
                    {lichDat.cHITiet_NguoiDung?.EMAIL || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Cột phải: Check-in & Thanh toán */}
          <div className="w-full md:w-80 bg-slate-50/50 p-6 md:p-8 flex flex-col justify-between gap-8 relative">
            
            {/* Điểm cắt vé bên trái (Chỉ hiện trên desktop) */}
            <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200 z-10"></div>

            {/* Khu vực QR Check-in */}
            <div className="flex flex-col items-center text-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quét mã để Check-in</h3>
              <div className="w-32 h-32 bg-white border-2 border-slate-800 p-2 rounded-xl flex items-center justify-center relative shadow-inner">
                <QRCode value={qrUrl} size={300} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>
              <p className="text-[11px] text-slate-400 mt-4 font-medium leading-relaxed">Vui lòng đưa mã này cho lễ tân khi bạn đến nhận chỗ.</p>
            </div>

            {/* Khu vực chi tiết thanh toán */}
            <div className="border-t border-slate-200/80 border-dashed pt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i className="fa-solid fa-receipt text-brand-500"></i> Chi tiết thanh toán
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span>Phí dịch vụ</span>
                  <span className="text-slate-800 font-semibold">
                    {formatCurrency(lichDat.ChiTiet_HoaDon?.GIA_TIEN)}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 border-dashed flex justify-between items-baseline">
                  <span className="text-slate-800 font-bold">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-brand-600">
                    {formatCurrency(lichDat.ChiTiet_HoaDon?.GIA_TIEN)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-xl text-xs font-bold border border-emerald-100 shadow-sm">
                <i className="fa-solid fa-circle-check text-emerald-500 text-sm"></i> 
                {lichDat.ChiTiet_HoaDon?.TRANG_THAI === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </div>
            </div>

          </div>
        </div>

        {/* Các nút hành động phía dưới */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-2">
          {lichDat.ChiTiet_HoaDon?.TRANG_THAI === 1 ? (
            <button className="px-5 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
              <i className="fa-solid fa-check"></i> Đã thanh toán
            </button>
          ) : (
            <button className="px-5 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
              <i className="fa-regular fa-circle-xmark"></i> Hủy lịch đặt
            </button>
          )}
          <button className="px-5 py-3 font-bold rounded-xl hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
            <i className="fa-solid fa-receipt"></i> Xem hóa đơn
          </button>
        </div>

      </div>
    </>
  );
}

export default ChiTietLichDat;