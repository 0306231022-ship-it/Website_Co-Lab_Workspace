"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as fun from '@/FUNCTION/function';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from "react-qr-code";
import { socket } from '@/FUNCTION/socket';
import { useSearchParams } from "next/navigation";
interface ChiTietNguoiDung {
  TENND: string;
  EMAIL: string;
}

interface ChiTietThoiGian {
  KHUNG_BATDAU: string;
  KHUNG_KETTHUC: string;
  TRANG_THAI: number;
  THOIGIAN_VAO: string | null;
  THOIGIAN_RA: string | null;
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

  const qrUrl_checkin = `https://bacteria-widely-sizing.ngrok-free.dev/api/NguoiDung/check-in?id=${id}`;
  const qrUrl_checkout = `https://bacteria-widely-sizing.ngrok-free.dev/api/NguoiDung/check-out?id=${id}`;
  const searchParams = useSearchParams();
  const fetchLichDat1 = useCallback(async () => {

    if (!id) {
      ThongBao.ThongBao_Loi('ID lịch đặt không hợp lệ.');
      return;
    }
    try {
      const res = await api.CallAPI(undefined, { url: `/NguoiDung/lich-dat?id=${id}`, PhuongThuc: 2 });
      if (res && res.success) {
        setLichDat(res.lichDat);
      } else {
        ThongBao.ThongBao_Loi(res.message);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu lịch đặt:', error);
      ThongBao.ThongBao_Loi('Đã xảy ra lỗi khi tải dữ liệu lịch đặt.');
    }
  }, [id]);

  useEffect(() => {
    const laydl1 = async () => {
      await fetchLichDat1();
    };
    laydl1();
  }, [fetchLichDat1]);
  useEffect(()=>{
    socket.emit('thong-bao-thanhtoan', id)
    const query = searchParams.toString();
    const themhoa_don = async()=>{
      try {
        await api.CallAPI(undefined,{url:`/NguoiDung/XacNhan_ThanhToan?${query}&id=${id}`, PhuongThuc:2});
      } catch (error) {
           console.error('Lỗi khi tạo hóa đơn từ lịch đặt:', error);
           ThongBao.ThongBao_Loi('Đã xảy ra lỗi khi tạo hóa đơn từ lịch đặt.');
      }
    }
    themhoa_don();
  },[searchParams,id])
  useEffect(() => {
    socket.on("thong-bao-checkout", (data) => {
      if (data.success) {
        ThongBao.ThongBao_ThanhCong(data.message);
        fetchLichDat1();
      } else {
        ThongBao.ThongBao_CanhBao(data.message || data.mesage);
      }
    });
    return () => {
      socket.off("thong-bao-checkout");
    };
  }, [fetchLichDat1]);

  useEffect(() => {
    socket.on("thong-bao-checkin", (data) => {
      if (data.success) {
        ThongBao.ThongBao_ThanhCong(data.message);
        fetchLichDat1();
      } else {
        ThongBao.ThongBao_CanhBao(data.message || data.mesage);
      }
    });
    return () => {
      socket.off("thong-bao-checkin");
    };
  }, [fetchLichDat1]);

  useEffect(() => {
    socket.on("thong-bao-thanhtoan", (data) => {
      if (data.success) {
        ThongBao.ThongBao_ThanhCong(data.message);
        fetchLichDat1();
      } else {
        ThongBao.ThongBao_CanhBao(data.message || data.mesage);
      }
    });
    return () => {
      socket.off("thong-bao-thanhtoan");
    };
  }, [fetchLichDat1]);

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

  const getStatusDetails = (start: string | undefined, end: string | undefined) => {
    if (lichDat?.ChiTiet_ThoiGian?.TRANG_THAI === 2) {
      return {
        text: "Đã hủy đơn",
        className: "bg-rose-50 text-rose-700 border-rose-200/60",
        dotClassName: "bg-rose-500"
      };
    }

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
  const ThanhToan = async()=>{
    try {
      const chuyenhuong_thanhtoan = await api.CallAPI(undefined,{url:`/NguoiDung/ThanhToan?id=${id}`, PhuongThuc:2});
                  if (chuyenhuong_thanhtoan && chuyenhuong_thanhtoan.success && chuyenhuong_thanhtoan.paymentUrl) {
                     window.open(chuyenhuong_thanhtoan.paymentUrl, '_blank')
                  } else {
                    ThongBao.ThongBao_CanhBao(chuyenhuong_thanhtoan?.message || "Không thể khởi tạo link thanh toán từ hệ thống.");
                  }
    } catch (error) {
       console.error("Lỗi lấy lịch sử đặt lịch:", error);
    }
  }

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
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${getStatusDetails(lichDat.ChiTiet_ThoiGian?.KHUNG_BATDAU, lichDat.ChiTiet_ThoiGian?.KHUNG_KETTHUC).className}`}>
                <span className={`w-2 h-2 rounded-full ${getStatusDetails(lichDat.ChiTiet_ThoiGian?.KHUNG_BATDAU, lichDat.ChiTiet_ThoiGian?.KHUNG_KETTHUC).dotClassName}`}></span> {getStatusDetails(lichDat.ChiTiet_ThoiGian?.KHUNG_BATDAU, lichDat.ChiTiet_ThoiGian?.KHUNG_KETTHUC).text}
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
                <i className="fa-regular fa-clock text-brand-500"></i> Thời gian đăng ký sử dụng
              </h3>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center text-brand-600 shadow-sm shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                  <span className="text-2xl font-black leading-none mt-0.5">{day}</span>
                </div>
                <div>
                  <div>
                    <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      {fun.formatTime(lichDat.ChiTiet_ThoiGian?.KHUNG_BATDAU)}
                      <i className="fa-solid fa-arrow-right text-slate-300 text-sm"></i>
                      {fun.formatTime(lichDat.ChiTiet_ThoiGian?.KHUNG_KETTHUC)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">{fullDate}</p>
                </div>
              </div>

              {/* KHỐI MỚI THÊM: Thời gian Check-in / Check-out thực tế */}
              {(lichDat.ChiTiet_ThoiGian?.THOIGIAN_VAO || lichDat.ChiTiet_ThoiGian?.THOIGIAN_RA) && (
                <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Giờ vào thực tế
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {lichDat.ChiTiet_ThoiGian?.THOIGIAN_VAO ? fun.formatTime(lichDat.ChiTiet_ThoiGian.THOIGIAN_VAO) : '--:--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Giờ ra thực tế
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {lichDat.ChiTiet_ThoiGian?.THOIGIAN_RA ? fun.formatTime(lichDat.ChiTiet_ThoiGian.THOIGIAN_RA) : '--:--'}
                    </p>
                  </div>
                </div>
              )}
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
                    Không gian: {lichDat.ChiTiet_Ghe_KhongGian?.TEN_KHONG_GIAN || 'N/A'}
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

            {/* Khu vực QR Code theo trạng thái */}
            <div className="flex flex-col items-center text-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              {lichDat.ChiTiet_ThoiGian.TRANG_THAI === 2 ? (
                /* 1. ĐƠN ĐÃ BỊ HỦY */
                <p className="text-rose-600 font-bold py-8">Đơn đã bị hủy</p>
              ) : lichDat.ChiTiet_ThoiGian.THOIGIAN_VAO !== null && lichDat.ChiTiet_ThoiGian.THOIGIAN_RA !== null ? (
                /* 2. CẢ HAI KHÁC NULL => ĐƠN ĐÃ HOÀN THÀNH */
                <div className="py-6 flex flex-col items-center gap-2">
                  <i className="fa-solid fa-circle-check text-slate-400 text-4xl mb-2"></i>
                  <p className="text-slate-600 font-bold">Lịch đặt đã hoàn thành</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">Cảm ơn bạn đã sử dụng dịch vụ của không gian Co-Lab!</p>
                </div>
              ) : lichDat.ChiTiet_ThoiGian.THOIGIAN_VAO !== null ? (
                /* 3. ĐÃ VÀO NHƯNG CHƯA RA => HIỂN THỊ MÃ CHECK-OUT */
                <>
                  <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-4">Quét mã để Check-out</h3>
                  <div className="w-32 h-32 bg-white border-2 border-slate-800 p-2 rounded-xl flex items-center justify-center relative shadow-inner">
                    <QRCode value={qrUrl_checkout} size={300} bgColor="#ffffff" fgColor="#000000" level="H" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-4 font-medium leading-relaxed">Vui lòng đưa mã này cho lễ tân khi bạn rời khỏi chỗ ngồi.</p>
                </>
              ) : (
                /* 4. THOIGIAN_VAO === NULL => HIỂN THỊ MÃ CHECK-IN */
                <>
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Quét mã để Check-in</h3>
                  <div className="w-32 h-32 bg-white border-2 border-slate-800 p-2 rounded-xl flex items-center justify-center relative shadow-inner">
                    <QRCode value={qrUrl_checkin} size={300} bgColor="#ffffff" fgColor="#000000" level="H" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-4 font-medium leading-relaxed">Vui lòng đưa mã này cho lễ tân khi bạn đến nhận chỗ.</p>
                </>
              )}
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
                    {fun.formatCurrency(lichDat.ChiTiet_HoaDon?.GIA_TIEN)}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 border-dashed flex justify-between items-baseline">
                  <span className="text-slate-800 font-bold">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-brand-600">
                    {fun.formatCurrency(lichDat.ChiTiet_HoaDon?.GIA_TIEN)}
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
          {lichDat.ChiTiet_ThoiGian?.TRANG_THAI !== 2 && (
            <>
              {lichDat.ChiTiet_HoaDon?.TRANG_THAI === 1 ? (
                <button className="px-5 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
                  <i className="fa-solid fa-check"></i> Đã thanh toán
                </button>
              ) : (
                <button className="px-5 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
                  <i className="fa-regular fa-circle-xmark"></i> Hủy lịch đặt
                </button>
              )}
              {/* Nút Xem hóa đơn được bọc tại đây, sẽ ẩn hoàn toàn khi đơn hàng bị hủy */}
              <button className="px-5 py-3 font-bold rounded-xl hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50">
                <i className="fa-solid fa-receipt"></i> Xem hóa đơn
              </button>
            </>
          )}
          {
            lichDat.ChiTiet_ThoiGian.TRANG_THAI === 0 && (
               <button onClick={()=>{ThanhToan();}} className="px-5 py-3 font-bold rounded-xl hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
                  <i className="fa-solid fa-check"></i> Thanh toán
                </button>
            )
          }
        </div>

      </div>
    </>
  );
}

export default ChiTietLichDat;