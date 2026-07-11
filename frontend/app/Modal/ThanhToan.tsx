"use client";
import React, { useState, useEffect } from 'react';
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import QRCode from "react-qr-code"; 

interface ThanhToanProps {
  id: number;
  TongTien: number;
}

function ThanhToan({ DuLieu, onCancel }: { DuLieu: ThanhToanProps; onCancel?: () => void }) {
  const [qrUrl, setQrUrl] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 phút = 900 giây
  const [hasFetched, setHasFetched] = useState<boolean>(false); // Khóa chống lặp API

  // Lấy ra các biến cụ thể để tối ưu hóa useEffect dependency
  const datLichId = DuLieu?.id;
  const tongTienHienTai = DuLieu?.TongTien;

  // 1. Gọi API lấy chuỗi URL thanh toán khi Component mount (Chỉ chạy khi ID thay đổi)
  useEffect(() => {
    if (!datLichId || hasFetched) return;

    const fetchPaymentUrl = async () => {
      try {
        setLoading(true);
        setHasFetched(true); // Khóa luồng ngay lập tức

        // Đồng bộ PhuongThuc: 2 (Nếu dự án của bạn quy định 2 là GET)
        const ketqua = await api.CallAPI(undefined, {
          url: `/NguoiDung/ThanhToan?id=${datLichId}&TongTien=${tongTienHienTai}`, 
          PhuongThuc: 2 
        });

        if (ketqua && ketqua.success && ketqua.paymentUrl) {
          setQrUrl(ketqua.paymentUrl); 
        } else {
          ThongBao.ThongBao_CanhBao(ketqua?.message || "Không thể khởi tạo link thanh toán từ hệ thống.");
          setHasFetched(false); // Mở khóa để cho phép thử lại nếu lỗi
        }
      } catch (error) {
        console.error("❌ Lỗi lấy thông tin thanh toán:", error);
        ThongBao.ThongBao_CanhBao("Đã xảy ra lỗi khởi tạo thanh toán, vui lòng thử lại!");
        setHasFetched(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentUrl();
  }, [datLichId, tongTienHienTai, hasFetched]);

  // 2. Bộ đếm ngược 15 phút
  useEffect(() => {
    if (timeLeft <= 0) {
      ThongBao.ThongBao_CanhBao("Mã thanh toán đã hết hạn!");
      if (onCancel) onCancel(); 
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); 
  }, [timeLeft, onCancel]);

  // 3. Hàm kiểm tra trạng thái thanh toán ngầm (Short Polling) - 3 giây/lần
  useEffect(() => {
    if (!qrUrl || timeLeft <= 0 || !datLichId) return;

    const checkPaymentStatus = setInterval(async () => {
      try {
        // Đồng bộ PhuongThuc: 2 (Vì đây là một lệnh lấy dữ liệu GET)
        const check = await api.CallAPI(undefined, {
          url: `/NguoiDung/CheckStatusThanhToan?id=${datLichId}`,
          PhuongThuc: 2 
        });

        if (check && check.isPaid) {
          clearInterval(checkPaymentStatus);
          if (ThongBao.ThongBao_ThanhCong) {
            ThongBao.ThongBao_ThanhCong("🎉 Đặt lịch và thanh toán thành công!");
          }
          window.location.href = "/lich-su-dat";
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái:", error);
      }
    }, 3000);

    return () => clearInterval(checkPaymentStatus);
  }, [qrUrl, timeLeft, datLichId]);

  // Hàm định dạng giây thành mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-[400px] max-h-[92vh] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005baa] to-[#0074db] px-6 pt-6 pb-5 text-white relative shrink-0">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white text-[#005baa] font-black tracking-tighter text-sm px-2 py-0.5 rounded-lg flex flex-col items-center leading-none select-none">
            <span>VN</span><span className="text-[9px] text-red-600 -mt-0.5">PAY</span>
          </div>
          <div className="h-4 w-[1px] bg-white/30"></div>
          <span className="text-xs font-medium tracking-wide text-blue-100">Cổng thanh toán quốc gia</span>
        </div>

        <div className="text-center mt-2">
          <span className="block text-[11px] text-blue-200 uppercase tracking-widest font-semibold mb-0.5">Số tiền thanh toán</span>
          <h2 className="text-3xl font-black tracking-tight font-mono">
            {Number(tongTienHienTai || 0).toLocaleString('vi-VN')} <span className="text-lg font-normal text-blue-100">đ</span>
          </h2>
        </div>
      </div>

      {/* Thân Modal */}
      <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex flex-col items-center text-center relative">
          
          {/* Bộ đếm ngược */}
          <div className="mb-4 bg-red-50 text-red-600 text-[11px] font-bold px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5">
            <i className="fa-regular fa-clock animate-pulse"></i>
            <span>Mã QR hết hạn sau: <span className="font-mono text-xs text-red-700">{formatTime(timeLeft)}</span></span>
          </div>

          {/* Ô chứa mã QR */}
          <div className="w-48 h-48 bg-white border-2 border-slate-100 rounded-xl p-3 flex items-center justify-center relative group shadow-inner">
            <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-[#005baa] rounded-tl"></div>
            <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-[#005baa] rounded-tr"></div>
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-[#005baa] rounded-bl"></div>
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-[#005baa] rounded-br"></div>
            
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-[#005baa] border-t-transparent rounded-full"></span>
                <span>Đang tải QR...</span>
              </div>
            ) : qrUrl ? (
              <div 
                onClick={() => window.open(qrUrl, '_blank')} 
                className="cursor-pointer hover:scale-102 transition-transform title='Bấm để mở trang thanh toán VNPAY'"
              >
                <QRCode
                  value={qrUrl}
                  size={160}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 260 260`}
                />
              </div>
            ) : (
              <span className="text-xs text-red-500 font-bold">Lỗi tải dữ liệu</span>
            )}
          </div>

          <p className="text-xs font-bold text-slate-700 mt-4 leading-snug">
            Mẹo: Nhấp trực tiếp vào mã QR trên nếu ứng dụng Ngân hàng của bạn không hỗ trợ quét link trực tiếp!
          </p>
        </div>

        {/* Hướng dẫn */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/50 space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info text-[#005baa]"></i> Hướng dẫn thanh toán nhanh
          </h4>
          <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal font-medium">
            <li>Bạn có thể bấm vào mã QR để mở cổng liên kết VNPAY.</li>
            <li>Hoặc sử dụng một thiết bị khác quét mã QR để tiến hành thanh toán qua ứng dụng ngân hàng.</li>
            <li>Hệ thống sẽ tự động cập nhật hóa đơn ngay khi nhận được tiền.</li>
          </ol>
        </div>

        {/* Chi tiết giao dịch */}
        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
          <span>Mã lịch đặt: <span className="text-slate-700 font-mono">#{datLichId}</span></span>
          <span>Trạng thái: <span className="text-yellow-600 font-bold">Chờ thanh toán</span></span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 bg-white border-t border-slate-100 shrink-0 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 py-2.5 rounded-xl border border-slate-100">
          <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#005baa] border-t-transparent rounded-full"></span>
          <span>Hệ thống đang kiểm tra giao dịch tự động...</span>
        </div>
        <button 
          onClick={onCancel}
          className="w-full text-slate-400 hover:text-red-500 text-xs font-bold transition-colors py-1 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left-long mr-1"></i> Hủy giao dịch này
        </button>
      </div>
    </div>
  );
}

export default ThanhToan;