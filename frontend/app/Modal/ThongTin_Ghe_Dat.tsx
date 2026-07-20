import React, { useState, useEffect } from 'react';
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import * as fun from '@/FUNCTION/function';
import { Ghe } from '@/interface/ghe';

interface DuLieuModal {
  thongTinGhe: Ghe;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  idKhongGian:number;
}

interface LichDaDat {
  KHUNG_BATDAU: string;
  KHUNG_KETTHUC: string;
}

function ThongTin({ DuLieu }: { DuLieu: DuLieuModal }) {
  const { thongTinGhe, thoiGianBatDau: initialBatDau, thoiGianKetThuc: initialKetThuc } = DuLieu;

  const [gioBatDau, setGioBatDau] = useState<string>(initialBatDau || '');
  const [gioKetThuc, setGioKetThuc] = useState<string>(initialKetThuc || '');
  const [lichDaDat, setLichDaDat] = useState<LichDaDat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string[]>([]);
  const [thongTinGheChiTiet, setThongTinGheChiTiet] = useState<Ghe | null>(thongTinGhe || null);

  const batDauDate = new Date(gioBatDau);
  const ketThucDate = new Date(gioKetThuc);
  const tongGio = +((ketThucDate.getTime() - batDauDate.getTime()) / (1000 * 60 * 60)).toFixed(2);

  // 🔥 HÀM KIỂM TRA TRÙNG LỊCH (OVERLAP CHECK)
  const checkKinhLich = (): boolean => {
    if (!gioBatDau || !gioKetThuc || lichDaDat.length === 0) return false;
    
    const userStart = new Date(gioBatDau).getTime();
    const userEnd = new Date(gioKetThuc).getTime();

    if (userEnd <= userStart) return true; // Thời gian không hợp lệ coi như khóa nút luôn

    // Duyệt qua danh sách lịch bận từ API trả về
    return lichDaDat.some(lich => {
      const bookedStart = new Date(lich.KHUNG_BATDAU).getTime();
      const bookedEnd = new Date(lich.KHUNG_KETTHUC).getTime();

      // Công thức kiểm tra giao thoa: Khung giờ chọn nằm đè hoặc giao nhau với khung giờ cũ
      return userStart < bookedEnd && userEnd > bookedStart;
    });
  };

  const isTrungLich = checkKinhLich(); // Biến trạng thái để khóa/ẩn nút

  useEffect(() => {
    const layThongTinVaLich = async () => {
      if (!thongTinGhe?.ID_GHE) return;
      setLoading(true);
      try {
        const [dataLich, dataGhe] = await Promise.all([
          api.CallAPI(undefined, { url: `/admin/DanhSach_lichDat_theoidghe_Hientai?ID_GHE=${thongTinGhe.ID_GHE}`, PhuongThuc: 2 }),
          api.CallAPI(undefined, { url: `/admin/ThongTin_ghe_datdon?ID_GHE=${thongTinGhe.ID_GHE}`, PhuongThuc: 2 })
        ]);

        if (dataLich && dataLich.success) {
          setLichDaDat(dataLich.dulieu || []);
        }
        if (dataGhe && dataGhe.success) {
          setThongTinGheChiTiet(dataGhe.dulieu);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    layThongTinVaLich();
  }, [thongTinGhe?.ID_GHE]);

  const handleThoiGianThayDoi = async (selectedDateTime: string) => {
    if (!thongTinGhe?.ID_GHE || !selectedDateTime) return;
    setLoading(true);
    try {
      const data = await api.CallAPI(undefined, {
        url: `/admin/lichdatghe_theothoigian?THOIGIAN=${fun.formatToBackendDateTime(selectedDateTime)}&ID_GHE=${thongTinGhe.ID_GHE}`,
        PhuongThuc: 2
      });
      if (data && data.success) {
        setLichDaDat(data.dulieu || []);
      }
    } catch (error) {
      console.error("Lỗi cập nhật lịch bận:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatCho = async () => {
    if (isTrungLich) return; // Bảo vệ tầng UI chắc chắn
    if (gioKetThuc <= gioBatDau) {
      ThongBao.ThongBao_CanhBao("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append('ID_GHE', String(thongTinGhe?.ID_GHE));
      dataToSend.append('KHUNG_BATDAU', String(fun.formatToBackendDateTime(gioBatDau)));
      dataToSend.append('KHUNG_KETTHUC', String(fun.formatToBackendDateTime(gioKetThuc)));
      dataToSend.append("LoaiND", String(0));
      dataToSend.append('id', String(DuLieu.idKhongGian));
      const DatLich = await api.CallAPI(dataToSend, { url: '/nguoiDung/LichDat', PhuongThuc: 1 });
      
      if (DatLich.validate) {
        setErr(DatLich.errors);
        ThongBao.ThongBao_CanhBao(DatLich.message);
        return;
      }

      if (DatLich.success) {
        ThongBao.ThongBao_ThongTin("Khởi tạo đơn hàng thành công! Đang chuyển hướng thanh toán...");
        const chuyenhuong_thanhtoan = await api.CallAPI(undefined, { url: `/NguoiDung/ThanhToan?id=${DatLich.ID_LICHDAT}`, PhuongThuc: 2 });
        
        if (chuyenhuong_thanhtoan && chuyenhuong_thanhtoan.success && chuyenhuong_thanhtoan.paymentUrl) {
          window.open(chuyenhuong_thanhtoan.paymentUrl, '_blank');
        } else {
          ThongBao.ThongBao_CanhBao(chuyenhuong_thanhtoan?.message || "Không thể tạo liên kết thanh toán.");
        }
      } else {
        ThongBao.ThongBao_Loi(DatLich.message || "Đặt chỗ thất bại.");
      }
    } catch (error) {
      console.error("Lỗi hệ thống khi đặt lịch:", error);
      ThongBao.ThongBao_CanhBao('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <>
      {/* Khối Header */}
      <div className="p-6 bg-gradient-to-b from-blue-50/70 to-white border-b border-slate-100 pr-16">
        {/* Cảnh báo đỏ nếu trùng lịch trực quan hơn */}
        {isTrungLich && (
          <div className="w-full mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-left flex items-center gap-2.5 text-rose-600 font-bold text-xs animate-shake">
            <i className="fa-solid fa-ban text-sm"></i>
            <span>Khung giờ bạn chọn đã bị trùng lịch với người khác. Vui lòng chọn giờ khác!</span>
          </div>
        )}

        {err && err.length > 0 && (
          <div className="w-full mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-left">
            <ul className="list-disc list-inside space-y-0.5">
              {err.map((item, index) => (
                <li key={index} className="text-[11px] text-red-500 font-medium">{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center font-black shadow-md shadow-blue-500/20 ring-4 ring-blue-100">
            <span className="text-[10px] uppercase tracking-widest text-blue-200 -mb-0.5">Vị trí</span>
            <span className="text-xl">{thongTinGheChiTiet?.TEN_GHE || "Ghe"}</span>
          </div>
          <div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md uppercase tracking-wider">Đơn hàng tạm tính</span>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">Xác nhận đặt chỗ làm việc</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <i className="fa-solid fa-location-dot text-blue-500"></i> Không gian: {thongTinGheChiTiet?.TEN_KHONG_GIAN || "Đang cập nhật..."}
            </p>
          </div>
        </div>
      </div>

      {/* Khối Body */}
      <div className="p-6 bg-white space-y-5">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              className={`w-full bg-white border text-slate-800 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none transition shadow-sm cursor-pointer ${isTrungLich ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-blue-500'}`}
              value={gioBatDau}
              onChange={(e) => {
                setGioBatDau(e.target.value);
                handleThoiGianThayDoi(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Thời gian kết thúc</label>
            <input
              type="datetime-local"
              className={`w-full bg-white border text-slate-800 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none transition shadow-sm cursor-pointer ${isTrungLich ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-blue-500'}`}
              value={gioKetThuc}
              min={gioBatDau}
              onChange={(e) => setGioKetThuc(e.target.value)}
            />
          </div>
        </div>

        {/* Khối danh sách lịch trùng */}
        <div>
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-calendar-days text-slate-400"></i> Các khung giờ đã có người đặt trước trong ngày:
          </h4>

          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
            {loading ? (
              <div className="py-4 text-center text-xs text-slate-400 font-medium">
                <i className="fa-solid fa-circle-notch animate-spin mr-1.5"></i> Đang cập nhật dữ liệu khung giờ...
              </div>
            ) : lichDaDat && lichDaDat.length > 0 ? (
              lichDaDat.map((item, index) => (
                <div key={index} className="flex items-center justify-between border border-rose-100 bg-rose-50/40 px-3 py-2 rounded-lg">
                  <span className="text-xs font-bold text-slate-700">
                    {fun.formatTime(item.KHUNG_BATDAU)} - {fun.formatTime(item.KHUNG_KETTHUC)}
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-100/60 px-2 py-0.5 rounded">Kín lịch</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 text-slate-400 text-xs font-medium">
                Khung giờ ngày này hoàn toàn trống, bạn có thể yên tâm đặt đơn.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 border-dashed mx-6 my-1"></div>

      {/* Khối Footer & Nút xác nhận */}
      <div className="p-6 bg-white pt-2">
        <div className="flex justify-between items-end mb-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">Chi phí dự kiến</span>
            <div className="text-xs text-slate-600 font-medium">
              Đơn giá: <span className="font-bold text-slate-800">{fun.formatCurrency(thongTinGheChiTiet?.DON_GIA)}</span>/giờ x <span className="font-bold text-slate-800">{tongGio > 0 ? tongGio : 0} giờ</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600 tracking-tight">
              {fun.formatCurrency((Number(tongGio > 0 ? tongGio : 0) * Number(thongTinGheChiTiet?.DON_GIA)) || 0)}
            </span>
          </div>
        </div>

        {/* 🔥 ĐỔI ĐỘC QUYỀN TẠI ĐÂY: Vô hiệu hóa nút và đổi giao diện sang màu xám nếu bị trùng lịch */}
        <button
          onClick={handleDatCho}
          disabled={isTrungLich}
          className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm tracking-wide shadow-lg ${
            isTrungLich 
              ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed opacity-75' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isTrungLich ? (
            <> Khung giờ đã bị trùng lịch! <i className="fa-solid fa-ban text-xs"></i> </>
          ) : (
            <> Xác nhận đơn hàng & Thanh toán <i className="fa-solid fa-credit-card text-xs"></i> </>
          )}
        </button>
      </div>
    </>
  );
}

export default ThongTin;