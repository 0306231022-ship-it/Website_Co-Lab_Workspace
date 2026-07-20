"use client";
import React, { useState, useEffect } from "react";
import * as api from "@/API/API";
import * as ThongBao from "@/FUNCTION/ThongBao";
import { objChiNhanh } from "@/interface/ChiNhanh";
import {useModalContext } from "@/context/QuanLiMoal";
import Image from "next/image";
import Link from "next/link";
export default function HomePage() {
  const [loading, setLoading] = useState<boolean>(true); 
  const [page, setpage] = useState<number>(1);
  const [chiNhanh, setChiNhanh] = useState<objChiNhanh[]>([]);
  const [TongDanhSach, setTongDanhSach] = useState<number>(1);
    const { OpenMoDal } = useModalContext();
  // 1. Quản lý State cho Input Tìm kiếm và Select Trạng thái
  const [TimKiem, setTimKiem] = useState<string>(""); 
  const [trangThai, setTrangThai] = useState<string>(""); 

  useEffect(() => {
    const laydl = async () => {
      try {
        setLoading(true); 
        const dulieu = await api.CallAPI(undefined, { 
          url: `/admin/laydanhsach?page=${page}&DiaChi=${TimKiem}&TrangThai=${trangThai}`, 
          PhuongThuc: 2 
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); 

  const TimKiem_ChiNhanh = async () => {
    try {
      if (TimKiem.trim() === "" && trangThai === "") {
        ThongBao.ThongBao_CanhBao("Vui lòng nhập thông tin hoặc chọn trạng thái để tìm kiếm!");
        return;
      }
      setLoading(true);
      setpage(1);

      const timkiem = await api.CallAPI(undefined, {
        url: `/admin/TimKiem?TrangThai=${trangThai}&DiaChi=${TimKiem}`,
        PhuongThuc: 2
      });

      if (timkiem.success) {
        setChiNhanh(timkiem.danhsach || timkiem.DanhSach); 
        setTongDanhSach(timkiem.TongDanhSach || timkiem.TongDS);
      } else {
        setChiNhanh([]);
        setTongDanhSach(0);
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
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
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
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div id="view-branches" className="space-y-6 block">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Hệ thống Chi nhánh</h2>
            
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="flex flex-col md:flex-row w-full lg:w-auto items-center gap-3">
                
                {/* 2a. Ô Input Tìm kiếm - Đã gán value và onChange */}
                <div className="relative w-full md:w-72 lg:w-80 group">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                  <input 
                    type="text" 
                    value={TimKiem}
                    onChange={(e) => setTimKiem(e.target.value)}
                    placeholder="Tìm kiếm theo tên chi nhánh, địa chỉ..." 
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* 2b. Ô Select Trạng thái - Đã gán value và onChange */}
                <div className="relative w-full md:w-48 group">
                  <i className="fa-solid fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                  <select 
                    value={trangThai}
                    onChange={(e) => setTrangThai(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-10 pr-8 py-2.5 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-slate-600 cursor-pointer"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="1">Đang hoạt động</option> {/* Đổi value thành số 1 khớp với API của bạn */}
                    <option value="2">Đang bảo trì</option>
                    <option value="0">Tạm ngưng</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
                </div>

                {/* 3b. Nút Tìm kiếm - Đã gán sự kiện onClick */}
                <button 
                  onClick={TimKiem_ChiNhanh}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-300 whitespace-nowrap"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>

          <button onClick={()=>{OpenMoDal(undefined,{TenTrang:'ThemChiNhanh'})}} className="ml-auto w-fit flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 group cursor-pointer">
            <i className="fa-solid fa-plus mr-2 transition-transform duration-300 group-hover:rotate-90"></i>
            Thêm chi nhánh mới
          </button>

          {/* Danh sách thẻ chi nhánh */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chiNhanh && chiNhanh.length > 0 ? (
              chiNhanh.map((item) => (
                <>
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group cursor-pointer">
        <div className="relative">
                  <Image 
                     src={`http://localhost:3001/${item.HINHANH}`} 
                     width={500}
                     height={192} 
                     alt={`${item.TEN_CHI_NHANH}`} unoptimized className="w-full h-48 object-cover" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] uppercase font-extrabold px-3 py-1.5 rounded-full shadow-sm">
                    {
                        item.TRANG_THAI === 1 ? 'Đang họat động' :'Ngưng hoạt động hoặc đang bảo trì'
                    }
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{item.TEN_CHI_NHANH}</h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      <i className="fa-solid fa-map-location-dot mr-1.5 text-slate-400"></i>
                     {item.DIA_CHI}
                    </p>
                  </div>
                  <div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1.5" title="Bàn làm việc tự do"><i className="fa-solid fa-desktop text-blue-500"></i> <span>{item.TongLoai1} không gian làm việc chung</span></div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="flex items-center gap-1.5" title="Phòng họp"><i className="fa-solid fa-people-roof text-emerald-500"></i> <span>{item.TongLoai2} phòng họp</span></div>
                      </div>
                    </div>
                    <Link href={`ChiNhanh/chi-tiet-chi-nhanh/${item.ID_CHI_NHANH}`}  className="w-full mt-5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-100 font-bold py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2">
                      <span>Xem chi tiết không gian</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </Link>
                  </div>
                </div>
                   </div>
                </>
              ))
            ) : (
                       <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full my-8 transition-all">
      {/* Vòng tròn chứa Icon kính lúp/định vị trống */}
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400 border border-slate-200 shadow-inner">
        <i className="fa-solid fa-map-location-dot text-2xl animate-bounce"></i>
      </div>
      
      {/* Tiêu đề thông báo */}
      <h3 className="text-lg font-bold text-slate-700 mb-1">
        Không tìm thấy chi nhánh nào
      </h3>
      
      {/* Cụ thể hơn cho người dùng */}
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
        Chúng tôi không tìm thấy kết quả nào phù hợp với địa chỉ <span className="font-semibold text-slate-700">{TimKiem}</span>. Vui lòng thử lại bằng một từ khóa khác.
      </p>

      {/* Nút bấm nhanh để xóa tìm kiếm và quay lại danh sách gốc (Tùy chọn) */}
      {TimKiem.trim() !== "" && (
        <button 
          onClick={() => { setTimKiem(""); setpage(1); }}
          className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition cursor-pointer"
        >
          <i className="fa-solid fa-rotate-left mr-1.5"></i> Xem tất cả chi nhánh
        </button>
      )}
    </div>
            )}
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