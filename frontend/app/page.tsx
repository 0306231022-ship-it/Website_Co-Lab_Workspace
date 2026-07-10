"use client";
import React, { useState, useEffect } from "react";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import ChiNhanh from "@/component/ChiNhanh";
import { objChiNhanh } from "@/interface/ChiNhanh";

export default function HomePage() {
  const [loading, setLoading] = useState<boolean>(true); 
  const [page, setpage] = useState<number>(1);
  const [chiNhanh, setChiNhanh] = useState<objChiNhanh[]>([]);
  const [TongDanhSach, setTongDanhSach] = useState<number>(1);
  const [TimKiem, setTimKiem] = useState<string>("");


  useEffect(() => {
    const laydl = async () => {
      try {
        setLoading(true); 
        const dulieu = await api.CallAPI(undefined, { url: `/admin/laydanhsach?page=${page}&DiaChi=${TimKiem}` , PhuongThuc:2 });
        if (dulieu.success) {
          setChiNhanh(dulieu.DanhSach);
          setTongDanhSach(dulieu.TongDS);
        } else {
          setChiNhanh([]);
        }
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    laydl();
  }, [page,TimKiem]);

 const TimKiem_ChiNhanh = async () => {
  try {
    if (TimKiem.trim() === "") {
      ThongBao.ThongBao_CanhBao("Vui lòng nhập thông tin tìm kiếm!");
      return;
    }
    setLoading(true);

    const timkiem = await api.CallAPI(undefined, {
      url: `/admin/TimKiem?TrangThai=1&DiaChi=${TimKiem}`,
      PhuongThuc:2
    });

    if (timkiem.success) {
      setChiNhanh(timkiem.danhsach); 
      setTongDanhSach(timkiem.TongDanhSach);
    }
  } catch (error) {
    console.error("Lỗi tìm kiếm thông tin:", error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        {/* Giả lập tiêu đề đang load */}
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        
        {/* Giả lập 3 thẻ card chi nhánh đang load */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm animate-pulse">
              <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
              <div className="h-5 bg-slate-200 rounded-md w-2/3"></div>
              <div className="h-4 bg-slate-200 rounded-md w-full"></div>
              <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>


      {/* Nội dung cuộn bên dưới */}
      <div className="p-8 max-w-6xl w-full mx-auto space-y-8 flex-1">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm mb-4 inline-block">Mạng lưới Không gian làm việc</span>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Tìm không gian làm việc lý tưởng của bạn
            </h1>
            <p className="text-slate-300 font-light text-sm leading-relaxed">
              Môi trường chuyên nghiệp, linh hoạt và đầy đủ tiện nghi. Chọn một chi nhánh bên dưới để tham quan không gian trước khi đặt chỗ.
            </p>
          </div>
          <div className="absolute right-[-5%] bottom-[-50%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* HỆ THỐNG CHI NHÁNH */}
        <div id="view-branches" className="space-y-6 block">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Hệ thống Chi nhánh</h2>
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-80">
                <i className="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text"
                  value={TimKiem}
                  onChange={(e) => { setTimKiem(e.target.value) }} 
                  placeholder="Tìm kiếm theo tên đường, quận, thành phố..." 
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <button onClick={TimKiem_ChiNhanh} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-colors whitespace-nowrap cursor-pointer">
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Danh sách thẻ chi nhánh */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {
              chiNhanh && chiNhanh.length > 0 ? (
                chiNhanh.map((item) => (
                  <ChiNhanh key={item.ID_CHI_NHANH} DuLieu={item} />
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">Không có dữ liệu chi nhánh nào.</p>
              )
            }
          </div>

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-4">
            <p className="text-sm text-slate-500 hidden sm:block">
              Đang hiển thị <span className="font-bold text-slate-800">{(page - 1) * 3 + 1}</span> đến <span className="font-bold text-slate-800">{Math.min(page * 3, TongDanhSach)}</span> trong tổng số <span className="font-bold text-slate-800">{TongDanhSach}</span> chi nhánh
            </p>
            <nav className="flex items-center gap-1 w-full sm:w-auto justify-center">
              <button onClick={() => setpage(p => p - 1)} disabled={page === 1} className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>
              <span className="w-10 h-10 flex items-center justify-center text-slate-400">{page}</span>
              <button onClick={() => setpage(p => p + 1)} disabled={page >= TongDanhSach / 3} className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition">
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}