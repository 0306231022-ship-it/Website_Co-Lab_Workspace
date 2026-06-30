"use client";
import { useParams } from 'next/navigation'; // Sửa dòng này

export default function NguoiDung() {
  const params = useParams();
  const id = params?.id;

  return (
    <>
        <div className=" p-16 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <div className="relative group">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100"/>
                            <label className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <i className="fa-solid fa-camera text-xs mb-1"></i>Thay ảnh
                                <input type="file" className="hidden"/>
                            </label>
                        </div>
                        <div>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-lg font-bold text-slate-900">Bàn Thị Phương Linh</h1>
                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-100">Quản trị viên</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Mã số nhân sự: <span className="font-mono text-slate-600">EMP-2026-89</span></p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    
                    <div className="bg-white border border-slate-200/60 rounded-xl shadow-xs p-5 space-y-4">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Thông tin cơ bản</h3>
                                <p className="text-[11px] text-slate-400">Cập nhật thông tin định danh cá nhân của bạn trên hệ thống.</p>
                            </div>
                            <i className="fa-solid fa-id-card text-slate-300 text-lg"></i>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Họ và tên</label>
                                <input type="text" value="Bàn Thị Phương Linh" className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"/>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Địa chỉ Email</label>
                                <input type="email" value="linh.ntk@co-lab.com.vn" disabled className="w-full text-xs font-medium bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-500 cursor-not-allowed"/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-xl shadow-xs p-5 space-y-4">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Đổi mật khẩu</h3>
                                <p className="text-[11px] text-slate-400">Đảm bảo mật khẩu dài hơn 8 ký tự để bảo mật tài khoản tốt nhất.</p>
                            </div>
                            <i className="fa-solid fa-shield-keyhole text-slate-300 text-lg"></i>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Mật khẩu hiện tại</label>
                                <input type="password" placeholder="••••••••" className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Mật khẩu mới</label>
                                    <input type="password" placeholder="Nhập mật khẩu mới" className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"/>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Xác nhận mật khẩu mới</label>
                                    <input type="password" placeholder="Nhập lại mật khẩu mới" className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"/>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs cursor-pointer">
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2">
                        <button type="button" className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer">
                            Huỷ bỏ
                        </button>
                        <button type="submit" className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer">
                            <i className="fa-solid fa-floppy-disk"></i>
                            <span>Cập nhật hồ sơ</span>
                        </button>
                    </div>

                </div>
    </>
  );
}