import React, { useState, useEffect } from 'react';
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import * as fun from '@/FUNCTION/function';
import QRCode from "react-qr-code"; // Import thư viện tạo mã QR

interface ThanhToanProps {
  id: number;
  TongTien: number;
}

function ThanhToan({ DuLieu, onCancel }: { DuLieu: ThanhToanProps, onCancel?: () => void }) {
  const [qrUrl, setQrUrl] = useState<string>(""); // Lưu chuỗi URL thanh toán VNPay
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 phút đổi ra giây = 900 giây

  // 1. Gọi API lấy chuỗi URL thanh toán khi Component mount
  useEffect(() => {
    const fetchPaymentUrl = async () => {
      try {
        setLoading(true);
        // Lưu ý: Fix lại dấu "?" thừa trong chuỗi query ban đầu của bạn ở đây: ?id=${DuLieu.id}
        const ketqua = await api.CallAPI(undefined, {
          url: `/NguoiDung/ThanhToan?id=${DuLieu.id}&TongTien=${DuLieu.TongTien}`, 
          PhuongThuc: 2 // Giả định 2 là POST hoặc GET tùy config của bạn
        });
        alert(JSON.stringify(ketqua))

        if (ketqua && ketqua.paymentUrl) {
          setQrUrl(ketqua.paymentUrl); // Backend trả về link dạng: https://sandbox.vnpayment.vn/...
        } else {
          ThongBao.ThongBao_CanhBao("Không thể khởi tạo link thanh toán từ hệ thống.");
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin thanh toán:", error);
        ThongBao.ThongBao_CanhBao("Đã xảy ra lỗi, vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentUrl();
  }, [DuLieu.id, DuLieu.TongTien]);

  // 2. Bộ đếm ngược 15 phút (900 giây)
  useEffect(() => {
    if (timeLeft <= 0) {
      ThongBao.ThongBao_CanhBao("Mã QR đã hết hạn thanh toán!");
      if (onCancel) onCancel(); // Gọi hàm đóng modal hoặc chuyển trang khi hết giờ
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Clear interval tránh tràn bộ nhớ
  }, [timeLeft]);

  // 3. Hàm kiểm tra trạng thái thanh toán ngầm (Short Polling) - Cứ 3 giây check 1 lần
  useEffect(() => {
    if (!qrUrl || timeLeft <= 0) return;

    const checkPaymentStatus = setInterval(async () => {
      try {
        const check = await api.CallAPI(undefined, {
          url: `/NguoiDung/CheckStatusThanhToan?id=${DuLieu.id}`,
          PhuongThuc: 1 // GET
        });

        if (check && check.isPaid) {
          clearInterval(checkPaymentStatus);
          ThongBao.ThongBao_CanhBao("🎉 Đặt lịch và thanh toán thành công!");
          // Xử lý tiếp theo (Ví dụ: Chuyển trang lịch sử hoặc reload thành công)
          window.location.href = "/lich-su-dat";
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái:", error);
      }
    }, 3000);

    return () => clearInterval(checkPaymentStatus);
  }, [qrUrl, timeLeft]);

  // Hàm helper định dạng giây thành mm:ss (Ví dụ: 899s -> 14:59)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="w-full max-w-[400px] max-h-[92vh] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005baa] to-[#0074db] px-6 pt-6 pb-5 text-white relative shrink-0">
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white text-[#005baa] font-black tracking-tighter text-sm px-2 py-0.5 rounded-lg flex flex-col items-center leading-none">
              <span>VN</span><span className="text-[9px] text-red-600 -mt-0.5">PAY</span>
            </div>
            <div className="h-4 w-[1px] bg-white/30"></div>
            <span className="text-xs font-medium tracking-wide text-blue-100">Cổng thanh toán quốc gia</span>
          </div>

          <div className="text-center mt-2">
            <span className="block text-[11px] text-blue-200 uppercase tracking-widest font-semibold mb-0.5">Số tiền thanh toán</span>
            {/* Đổ dữ liệu thật từ biến TongTien và định dạng tiền tệ Việt Nam */}
            <h2 className="text-3xl font-black tracking-tight font-mono">
              {DuLieu.TongTien.toLocaleString('vi-VN')} <span className="text-lg font-normal text-blue-100">đ</span>
            </h2>
          </div>
        </div>

        {/* Thân Modal */}
        <div className="p-6 overflow-y-auto custom-scroll flex-1 space-y-5 bg-slate-50">
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex flex-col items-center text-center relative">
            
            {/* Bộ đếm ngược hiển thị thời gian thật */}
            <div className="mb-4 bg-red-50 text-red-600 text-[11px] font-bold px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5 animate-pulse">
              <i className="fa-regular fa-clock"></i>
              <span>Mã QR hết hạn sau: <span className="font-mono text-xs">{formatTime(timeLeft)}</span></span>
            </div>

            {/* Ô chứa mã QR */}
            <div className="w-48 h-48 bg-white border-2 border-slate-100 rounded-xl p-3 flex items-center justify-center relative group shadow-inner">
              <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-[#005baa] rounded-tl"></div>
              <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-[#005baa] rounded-tr"></div>
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-[#005baa] rounded-bl"></div>
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-[#005baa] rounded-br"></div>
              
              {loading ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                  <i className="fa-solid fa-spinner animate-spin text-xl text-[#005baa]"></i>
                  <span>Đang tải QR...</span>
                </div>
              ) : qrUrl ? (
                // Đổ thư viện react-qr-code vào đây
                <QRCode
                  value={qrUrl}
                  size={160}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 260 260`}
                />
              ) : (
                <span className="text-xs text-red-500 font-bold">Lỗi tải mã QR</span>
              )}
              
              <div className="absolute bg-white p-1 rounded-md shadow border border-slate-100 text-[8px] font-black text-[#005baa] tracking-tighter scale-90">
                VNPAY
              </div>
            </div>

            <p className="text-xs font-bold text-slate-700 mt-4 leading-snug">
              Phương thức: Quét mã QR bằng Ứng dụng Ngân hàng / Ví điện tử
            </p>
          </div>

          {/* Hướng dẫn */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/50 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-circle-info text-[#005baa]"></i> Hướng dẫn thanh toán nhanh
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal font-medium">
              <li>Mở ứng dụng Mobile Banking của Ngân hàng bạn dùng (Vietcombank, Agribank, Techcombank,...) hoặc Ví VNPAY.</li>
              <li>Chọn chức năng <span className="font-bold text-slate-800">QR Pay</span> hoặc <span className="font-bold text-slate-800">Quét mã QR</span>.</li>
              <li>Quét mã QR ở phía trên và xác nhận thanh toán trên điện thoại.</li>
            </ol>
          </div>

          {/* Chi tiết giao dịch bổ sung */}
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
            <span>Mã lịch đặt: <span className="text-slate-700 font-mono">#{DuLieu.id}</span></span>
            <span>Trạng thái: <span className="text-yellow-600 font-bold">Chờ quét</span></span>
          </div>

        </div>

        {/* Footer trạng thái chờ */}
        <div className="p-5 bg-white border-t border-slate-100 shrink-0 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 py-2.5 rounded-xl border border-slate-100">
            <i className="fa-solid fa-circle-notch animate-spin text-[#005baa]"></i>
            <span>Đang chờ bạn quét mã thanh toán...</span>
          </div>

          <button 
            onClick={onCancel}
            className="w-full text-slate-400 hover:text-red-500 text-xs font-bold transition-colors py-1"
          >
            <i className="fa-solid fa-arrow-left-long mr-1"></i> Hủy giao dịch này
          </button>
        </div>

      </div>
    </>
  );
}

export default ThanhToan;