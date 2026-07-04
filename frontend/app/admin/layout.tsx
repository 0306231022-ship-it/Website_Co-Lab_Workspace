import * as api from '@/API/API';
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
export default async function AdminLayout({

  children,
}: {
  children: React.ReactNode;
}) {
   
   const cookieStore = await cookies();
   const token = cookieStore.get("token_admin")?.value;
    try {
        const formData = new FormData();
        formData.append("LoaiND", String(1));
        const res = await api.CallAPI(formData, {
            url: "/NguoiDung/kiemtra_dangnhap",
            PhuongThuc: 1,
            token: `token_admin=${token}`,
        });
        if(!res.success){
            redirect('/')
        }
    } catch (error) {
        console.error("Lỗi hệ thống tại Layout:", error);
    }
    return (
        <>
                  <div className="flex h-screen overflow-hidden">
        
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
                            <a href="#" className="flex items-center space-x-3 bg-indigo-600 text-white px-4 py-2.5 rounded-xl transition-all font-semibold shadow-md">
                                <i className="fa-solid fa-chart-pie w-5 text-center text-base"></i>
                                <span className="text-sm">Tổng quan</span>
                            </a>
                            <a href="./QuanLyChiNhanh.html" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 hover:translate-x-1 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium group">
                                <i className="fa-solid fa-map-location-dot w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                                <span className="text-sm">Quản lý chi nhánh</span>
                            </a>
                            <a href="#" className="flex items-center justify-between text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 hover:translate-x-1 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium group">
                                <div className="flex items-center space-x-3">
                                    <i className="fa-solid fa-file-invoice-dollar w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                                    <span className="text-sm">Quản lý đặt đơn</span>
                                </div>
                                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs animate-pulse">5</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 hover:translate-x-1 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium group">
                                <i className="fa-solid fa-users w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
                                <span className="text-sm">Khách hàng</span>
                            </a>
                        </div>
                    </div>

                    <div>
                        <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">Danh mục & Cấu hình</p>
                        <div className="space-y-1">
                           <Link
    href="/admin/QLGia"
    className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 hover:translate-x-1 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium group"
>
    <i className="fa-solid fa-tags w-5 text-center text-base transition-transform duration-300 group-hover:scale-110"></i>
    <span className="text-sm">Quản lý đơn giá</span>
</Link>
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
                <button className="w-full flex items-center justify-center space-x-2 bg-slate-900/50 hover:bg-rose-500 hover:text-white text-slate-400 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium border border-slate-800 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/25 hover:-translate-y-0.5 active:translate-y-0">
                    <i className="fa-solid fa-right-from-bracket transition-transform duration-300 group-hover:-translate-x-1"></i>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>

        <div id="sidebar-overlay"  className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 hidden md:hidden"></div>

        <div className="flex-1 flex flex-col overflow-y-auto">
            
            <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
                <div className="flex items-center">
                    <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition mr-2">
                        <i className="fa-solid fa-bars text-lg"></i>
                    </button>
                    <h2 className="hidden md:block text-sm font-semibold text-slate-500">Hệ thống quản lý không gian làm việc</h2>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative inline-block text-left" id="notification-dropdown-container">
                        <button  className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all focus:outline-none">
                            <i className="fa-solid fa-bell text-lg"></i>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div id="notification-menu" className="hidden absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top-right transform scale-95 opacity-0">
                           <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <span className="font-bold text-sm text-slate-800">Thông báo</span>
                                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">2 Mới</span>
                            </div>
                            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                                <a href="#" className="flex px-4 py-3.5 bg-indigo-50/30 hover:bg-slate-50 transition-colors relative group">
                                    <div className="mr-3 mt-0.5 w-8 h-8 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-calendar-check text-sm"></i>
                                    </div>
                                    <div className="pr-2">
                                        <p className="text-xs font-semibold text-slate-800 leading-tight">Yêu cầu đặt chỗ mới từ phòng họp M-01 cần duyệt.</p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium"><i className="fa-regular fa-clock mr-1"></i>5 phút trước</p>
                                    </div>
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                </a>
                                <a href="#" className="flex px-4 py-3.5 bg-indigo-50/30 hover:bg-slate-50 transition-colors relative group">
                                    <div className="mr-3 mt-0.5 w-8 h-8 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                                    </div>
                                    <div className="pr-2">
                                        <p className="text-xs font-semibold text-slate-800 leading-tight">Cảnh báo: Điều hòa phòng M-02 ngưng hoạt động.</p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium"><i className="fa-regular fa-clock mr-1"></i>1 giờ trước</p>
                                    </div>
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                </a>
                                <a href="#" className="flex px-4 py-3.5 hover:bg-slate-50 transition-colors group">
                                    <div className="mr-3 mt-0.5 w-8 h-8 bg-slate-100 rounded-xl text-slate-500 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-user-plus text-sm"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-600 leading-tight">Khách hàng <span className="font-semibold text-slate-800">Lê Văn An</span> đã check-in thành công.</p>
                                        <p className="text-[10px] text-slate-400 mt-1"><i className="fa-regular fa-clock mr-1"></i>2 giờ trước</p>
                                    </div>
                                </a>
                            </div>
                            <div className="p-2 border-t border-slate-100 text-center bg-slate-50/30">
                                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 block py-1">Xem tất cả thông báo</a>
                            </div>
                        </div>
                    </div>

                    <div className="h-5 w-px bg-slate-200"></div>
                    
                    <div className="relative inline-block text-left" id="profile-dropdown-container">
                        <button  className="flex items-center space-x-3 p-1.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group focus:outline-none">
                            <img className="h-8 w-8 rounded-lg object-cover ring-2 ring-slate-100" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" alt="Admin"/>
                            <div className="hidden md:block text-left leading-tight">
                                <p className="text-xs font-bold text-slate-700">Admin Workspace</p>
                                <p className="text-[10px] text-emerald-500 font-medium flex items-center mt-0.5">Hệ thống trực tuyến</p>
                            </div>
                            <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover:text-slate-600 hidden md:block" id="profile-chevron"></i>
                        </button>
                        <div id="profile-menu" className="hidden absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-1 transition-all duration-200 origin-top-right transform scale-95 opacity-0">
                            <a href="#" className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 font-medium">
                                <i className="fa-regular fa-user text-slate-400 w-4 text-center"></i>
                                <span>Hồ sơ cá nhân</span>
                            </a>
            
                            <a href="#" className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
                                <i className="fa-regular fa-circle-question text-slate-400 text-base w-5 text-center"></i>
                                <span>Hỗ trợ trợ giúp</span>
                            </a>
                            
                            <div className="border-t border-slate-100 my-1"></div>
                            
                            <a href="#" className="flex items-center space-x-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-bold transition-colors">
                                <i className="fa-solid fa-right-from-bracket text-base w-5 text-center"></i>
                                <span>Đăng xuất</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>
            <main className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-1">{children}</main>
        </div>
    </div>
        </>
    )
};