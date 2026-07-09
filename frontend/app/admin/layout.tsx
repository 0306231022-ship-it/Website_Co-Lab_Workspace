"use client";
import * as api from '@/API/API';
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import * as ThongBao from '@/FUNCTION/ThongBao';
import { NguoiDung } from "@/interface/NguoiDung";
import Image from "next/image";
import NavLink from "@/component/NavLink";
import Link from 'next/link';
import {socket} from '@/FUNCTION/socket';
export default function AdminLayout({

  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
 
  const [isOpenProfile, setIsOpenProfile] = useState(false);
   const [ThongTin, setThongTin] = useState<NguoiDung | null>(null);
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token_admin="))
          ?.split("=")[1];
        const formData = new FormData();
        formData.append("LoaiND", String(1));
        const res = await api.CallAPI(formData, {
          url: "/NguoiDung/kiemtra_dangnhap",
          PhuongThuc: 1,
          token: `token_admin=${token}`,
        });
        if(res.success){
            setThongTin(res.dulieu);
        }

        if (!res.success) {
          router.push('/');
        }
      } catch (error) {
        console.error("Lỗi hệ thống tại Layout:", error);
      }
    }
    checkAuth();
  }, [router]);
   useEffect(() => {
      socket.on('DangNhap', (item) => {
        setThongTin(item.ThongTinNguoiDung);
      });
      return () => {
        socket.off('DangNhap');
      };
      }, []);

  // Đóng các menu khi click ra ngoài vùng dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#profile-dropdown-container")) {
        setIsOpenProfile(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);
  const DangXuat = async()=>{
     const XacNhan = await ThongBao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn đăng xuất không?');
     if(!XacNhan) return ;
          try {
             const formdata = new FormData();
            formdata.append('LoaiND', String(1));
            const response = await api.CallAPI(formdata, { url: '/NguoiDung/dangxuat', PhuongThuc: 1 });
            await fetch("/api/auth/logout", { method: "POST", body: JSON.stringify({LoaiND: 1}), });
            if(response.success){
               ThongBao.ThongBao_ThanhCong(response.message)
               setThongTin(null);
               router.push("/");
            }
          } catch (error) {
            console.error("Lỗi đăng xuất:", error);
          }
  }


  return (
    <>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        
        {/* SIDEBAR */}
        <aside id="sidebar" className="w-64 bg-slate-950 text-white flex flex-col justify-between fixed md:relative inset-y-0 left-0 z-50 transform -translate-x-full md:translate-x-0 md:flex shrink-0 transition-transform duration-300 ease-in-out border-r border-slate-900">
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="h-16 flex items-center justify-between border-b border-slate-900 px-6 shrink-0">
              <span className="text-base font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent flex items-center">
                <i className="fa-solid fa-cube mr-2.5 text-indigo-400 text-lg"></i>CO-LAB
              </span>
              <button className="md:hidden text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <nav className="flex-1 mt-6 px-4 space-y-6">
              <div>

                <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">Hệ thống</p>
                <div className="space-y-1">
                <NavLink href={`/admin`}
                         activeClassName="bg-indigo-600"
                        className="flex items-center space-x-3  text-white px-4 py-2.5 rounded-xl transition-all font-semibold shadow-md">
                    <i className="fa-solid fa-chart-pie w-5 text-center text-base"></i>
                    <span className="text-sm">Tổng quan</span>
                  </NavLink>
                   <NavLink href={`/admin/ChiNhanh`}
                        activeClassName="bg-indigo-600"
                        className="flex items-center space-x-3  text-white px-4 py-2.5 rounded-xl transition-all font-semibold shadow-md">
                    <i className="fa-solid fa-map-location-dot w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                    <span className="text-sm">Quản lý chi nhánh</span>
                  </NavLink>
                  <a href="#" className="flex items-center justify-between text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 hover:translate-x-1 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium group">
                    <div className="flex items-center space-x-3">
                      <i className="fa-solid fa-file-invoice-dollar w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                      <span className="text-sm">Quản lý đặt đơn</span>
                    </div>
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs animate-pulse">5</span>
                  </a>
                  <NavLink href={`/admin/QuanLiKhachHang`}
                        activeClassName="bg-indigo-600"
                        className="flex items-center space-x-3  text-white px-4 py-2.5 rounded-xl transition-all font-semibold shadow-md">
                    <i className="fa-solid fa-users w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                    <span className="text-sm">Khách hàng</span>
                  </NavLink>
                </div>
              </div>
              <div>
                <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">Danh mục & Cấu hình</p>
                <div className="space-y-1">
                   <NavLink href={`/admin/QuanLiGia`}
                        activeClassName="bg-indigo-600"
                        className="flex items-center space-x-3  text-white px-4 py-2.5 rounded-xl transition-all font-semibold shadow-md">
                    <i className="fa-solid fa-tags w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                    <span className="text-sm">Quản lý đơn giá</span>
                 </NavLink>
                  <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 hover:translate-x-1 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium group">
                    <i className="fa-solid fa-chair w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                    <span className="text-sm">Quản lý danh mục ghế</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 hover:translate-x-1 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium group">
                    <i className="fa-solid fa-laptop-house w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                    <span className="text-sm">Quản lý trang thiết bị</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>


          <div className="p-4 border-t border-slate-900 shrink-0 group">
            <button onClick={DangXuat} className="w-full flex items-center justify-center space-x-2 bg-slate-900/50 hover:bg-rose-500 hover:text-white text-slate-400 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium border border-slate-800 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/25 hover:-translate-y-0.5 active:translate-y-0">
              <i className="fa-solid fa-right-from-bracket transition-transform duration-300 group-hover:-translate-x-1"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        <div id="sidebar-overlay" className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 hidden md:hidden"></div>

        {/* MAIN LAYOUT CONTENT */}
        <div className="flex-1 flex flex-col overflow-y-auto">
            
          {/* HEADER CHỨA KHU VỰC DROPDOWNS */}
          <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
            <div className="flex items-center">
              <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition mr-2">
                <i className="fa-solid fa-bars text-lg"></i>
              </button>
              <h2 className="hidden md:block text-sm font-semibold text-slate-500">Hệ thống quản lý không gian làm việc</h2>
            </div>

            <div className="flex items-center space-x-4">
              
              {/* DROPDOWN 1: THÔNG BÁO */}
              <div className="relative inline-block text-left" id="notification-dropdown-container">
                <Link href={`/admin/ThongBao`}
                
                  className={`relative p-2 rounded-xl transition-all focus:outline-none text-indigo-600 bg-indigo-50`}
                >
                  <i className="fa-solid fa-bell text-lg"></i>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                </Link>
              </div>

              <div className="h-5 w-px bg-slate-200"></div>
              
              {/* DROPDOWN 2: THÔNG TIN CÁ NHÂN */}
              <div className="relative inline-block text-left" id="profile-dropdown-container">
                <button 
                  onClick={() => {
                    setIsOpenProfile(!isOpenProfile)
                  }}
                  className={`flex items-center space-x-3 p-1.5 rounded-xl transition-all cursor-pointer group focus:outline-none ${isOpenProfile ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                     <Image
                       src={`http://localhost:3001/${ThongTin?.HINH_ANH}`}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      width={500}
                     height={192}
                     unoptimized
                />
                  <div className="hidden md:block text-left leading-tight">
                    <p className="text-xs font-bold text-slate-700">{ThongTin?.TENND}</p>
                    <p className="text-[10px] text-emerald-500 font-medium flex items-center mt-0.5">Hệ thống trực tuyến</p>
                  </div>
                  <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover:text-slate-600 hidden md:block transition-transform duration-200 ${isOpenProfile ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Giao diện Menu Cá nhân đóng mở thông qua State */}
                <div 
                  className={`absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-1 transition-all duration-200 origin-top-right transform ${
                    isOpenProfile ? 'block opacity-100 scale-100' : 'hidden opacity-0 scale-95'
                  }`}
                >
                  <Link href={'/admin/CaNhan'} className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 font-medium">
                    <i className="fa-regular fa-user text-slate-400 w-4 text-center"></i>
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={DangXuat}  className="flex items-center space-x-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-bold transition-colors">
                    <i className="fa-solid fa-right-from-bracket text-base w-5 text-center"></i>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>

            </div>
          </header>

          {/* MAIN PAGE */}
          <main className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-1">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}