"use client";
import React from "react";
import NavLink from "@/component/NavLink";
import "./globals.css";
import { AppMDProvider, useModalContext } from "@/context/QuanLiMoal";
import { useState , useEffect } from "react";
import * as api from '@/API/API';
import * as ThongBao from '@/FUNCTION/ThongBao';
import { socket } from '@/FUNCTION/socket';
import { usePathname } from 'next/navigation';

interface NguoiDung {
    TENND: string;
    EMAIL: string;
    HINH_ANH: string;
    IDND:number;
}



function LayoutContent({ children }: { children: React.ReactNode }) {
  const { OpenMoDal } = useModalContext();
  const [DangNhap, setDangNhap] = useState<boolean>(false);
  const [ThongTin, setThongTin] = useState<NguoiDung | null>(null);

  // 1. Kiểm tra xem người dùng có đang truy cập vào trang Admin hay không
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const KiemTra = async () => {
    try {
       const formdata = new FormData();
      formdata.append('LoaiND', String(0));
      const kiemtra = await api.CallAPI(formdata, { url: '/NguoiDung/kiemtra_dangnhap', PhuongThuc: 1 });
    
      if (kiemtra.success) {
        setDangNhap(true);
        setThongTin(kiemtra.dulieu);
      } else {
        setDangNhap(false);
        setThongTin(null);
      }
    } catch (error) {
      console.error("Lỗi xảy ra:", error);
    }
  };

  useEffect(() => {
    // Chỉ chạy kiểm tra đăng nhập nếu KHÔNG PHẢI trang admin
    if (!isAdminPage) {
      const load = async () => {
          await KiemTra();
      };
      load();
    }
  }, [isAdminPage]);

  useEffect(() => {
    // Chỉ lắng nghe socket đăng nhập nếu KHÔNG PHẢI trang admin
    if (!isAdminPage) {
      socket.on('DangNhap', (item) => {
        setDangNhap(true);
        setThongTin(item.ThongTinNguoiDung);
      });

      return () => {
        socket.off('DangNhap');
      };
    }
  }, [isAdminPage]);

  const handleLogout = async () => {
      const XacNhan = await ThongBao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn đăng xuất không?');
      if(!XacNhan) return ;
      try {
        const response = await api.CallAPI(undefined, { url: '/NguoiDung/dangxuat', PhuongThuc: 1 });
        if(response.success){
           ThongBao.ThongBao_ThanhCong(response.message)
           setDangNhap(false);
           setThongTin(null);
        }
      } catch (error) {
        console.error("Lỗi đăng xuất:", error);
      }
  };

  // 2. NẾU LÀ TRANG ADMIN: Trả về trang trống hoàn toàn, không dính dáng layout cũ
  if (isAdminPage) {
    return <>{children}</>;
  }

  // 3. NẾU LÀ TRANG THƯỜNG: Render đầy đủ Sidebar + Header cũ
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      
      {/* ================= SIDEBAR CỐ ĐỊNH ================= */}
      <aside className="w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col justify-between h-full z-20 shrink-0">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
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
        // Lúc thường: Chữ xám (text-slate-700), di chuột vào thì đổi nền xám nhẹ (hover:bg-slate-50)
        className="flex items-center justify-between px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl relative group transition-all duration-300">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-md"></div>
                <div className="flex items-center gap-3 font-semibold">
                  <i className="fa-solid fa-house w-5 text-center text-lg"></i>
                  <span>Trang chủ</span>
                </div>
              </NavLink>
            </nav>
          </div>

          <div className="mb-6">
            {DangNhap ? (
              <>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cá nhân</p>
                <nav className="space-y-1.5">
                  <NavLink 
                     href={`/NguoiDung/${ThongTin?.IDND}`}
                   activeClassName="bg-blue-50 text-blue-600 font-bold"
            className="flex items-center justify-between px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl relative group transition-all duration-300">
                    <div className="flex items-center gap-3 font-semibold">
                      <i className="fa-solid fa-id-card w-5 text-center text-lg"></i>
                      <span>Thông tin cá nhân</span>
                    </div>
                  </NavLink>

                  <a href="#" className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-slate-700 rounded-xl relative group transition-all duration-300">
                    <div className="flex items-center gap-3 font-semibold">
                      <i className="fa-solid fa-clock-rotate-left w-5 text-center text-lg"></i>
                      <span>Lịch sử đặt lịch</span>
                    </div>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      12
                    </span>
                  </a>

                <NavLink 
                     href={`/NguoiDung/ThongBao`}
                   activeClassName="bg-blue-50 text-blue-600 font-bold"
            className="flex items-center justify-between px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl relative group transition-all duration-300">
                    <div className="flex items-center gap-3 font-semibold">
                      <i className="fas fa-envelope w-5 text-center text-lg"></i>
                      <span>Thông báo</span>
                    </div>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      12
                    </span>
                  </NavLink>
                </nav>
              </>
            ) : ''}
          </div>
        </div>

        {/* ================= PHẦN DƯỚI CÙNG: USER HOẶC LOGIN/REGISTER ================= */}
        <div className="p-1 m-4 text-center">
          {DangNhap ? (
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-inner">
              <div className="flex items-center gap-3 w-full mb-3">
               <img
                  src={`http://localhost:3001/${ThongTin?.HINH_ANH}`}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{ThongTin?.EMAIL}</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{ThongTin?.TENND || "Thành viên"}</p>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 mb-1">
                <i className="fa-solid fa-lock text-blue-500"></i> Trải nghiệm đầy đủ
              </h4>
              <p className="text-[10px] text-slate-500 mb-3 px-1 leading-tight">Đăng nhập để xem sơ đồ và tiến hành đặt chỗ.</p>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => OpenMoDal(null, { TenTrang: 'DangNhap', TieuDe: 'Đăng nhập', icon: 'fa-solid fa-user-plus' })} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button 
                  type="button"
                  onClick={() => OpenMoDal(null, { TenTrang: 'DangKy', TieuDe: 'Đăng ký thành viên', icon: 'fa-solid fa-user-plus' })} 
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ================= THẺ MAIN ĐỘNG ================= */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50 flex flex-col h-full">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Khám phá không gian</h2>
          <div className="flex gap-3">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hệ thống hoạt động bình thường
            </span>
          </div>
        </header>
        {children}
      </main>

    </div>
  );
}

// --- ROOT LAYOUT GỐC ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <AppMDProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppMDProvider>
      </body>
    </html>
  );
}