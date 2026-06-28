"use client";
import React from "react";
import NavLink from "@/component/NavLink";
import "./globals.css"; // Đảm bảo import file css tổng của bạn

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <body>
        {/* Khung Flex layout cố định toàn màn hình */}
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
          
          {/* ================= SIDEBAR CỐ ĐỊNH ================= */}
          <aside className="w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col justify-between h-full z-20 shrink-0">
           <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* Nếu chưa cấu hình màu brand, tạm thời dùng màu sky/blue hoặc cấu hình ở Bước 2 nhé */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900">
                Co-lab<span className="text-blue-500">.</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Workspace</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 px-4 custom-scrollbar">
          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Khám phá</p>
            <nav className="space-y-1.5">
              <NavLink 
                href="/"
                activeClassName="bg-blue-50 text-blue-600 font-bold"
                className="flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-600 rounded-xl relative group transition-all duration-300">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-md"></div>
                <div className="flex items-center gap-3 font-semibold">
                  <i className="fa-solid fa-house w-5 text-center text-lg"></i>
                  <span>Trang chủ</span>
                </div>
              </NavLink>
            </nav>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cá nhân</p>
            <nav className="space-y-1.5">
              <a href="#" className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-slate-700 rounded-xl relative group transition-all duration-300">
                <div className="flex items-center gap-3 font-semibold">
                  <i className="fa-solid fa-id-card w-5 text-center text-lg"></i>
                  <span>Thông tin cá nhân</span>
                </div>
              </a>

              <a href="#" className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-slate-700 rounded-xl relative group transition-all duration-300">
                <div className="flex items-center gap-3 font-semibold">
                  <i className="fa-solid fa-clock-rotate-left w-5 text-center text-lg"></i>
                  <span>Lịch sử đặt lịch</span>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  12
                </span>
              </a>

              <a href="#" className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-slate-700 rounded-xl relative group transition-all duration-300">
                <div className="flex items-center gap-3 font-semibold">
                  <i className="fas fa-envelope w-5 text-center text-lg"></i>
                  <span>Thông báo</span>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  12
                </span>
              </a>
            </nav>
          </div>
        </div>

        <div className="p-3 m-4 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 mb-1">
            <i className="fa-solid fa-lock text-blue-500"></i> Trải nghiệm đầy đủ
          </h4>
          <p className="text-[10px] text-slate-500 mb-3 px-1 leading-tight">Đăng nhập để xem sơ đồ và tiến hành đặt chỗ.</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer">
              Đăng nhập
            </button>
            <button className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer">
              Đăng ký
            </button>
          </div>
        </div>
          </aside>

          {/* ================= THẺ MAIN ĐỘNG ================= */}
          {/* Thẻ main này bao bọc {children}. Khi chuyển route, chỉ có phần {children} thay đổi */}
          <main className="flex-1 overflow-y-auto relative bg-slate-50 flex flex-col h-full">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}