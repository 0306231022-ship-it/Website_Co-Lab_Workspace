'use client'
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import type { NguoiDung } from '@/interface/NguoiDung';
import Image from "next/image";
import * as fun from '@/FUNCTION/function';
import * as ThongBao from '@/FUNCTION/ThongBao';
function ChiTietKhachHang(){
    const params = useParams();
    const id = params?.idkhachhang;
    const [ThongTin, setThongTin] = useState<NguoiDung | null>(null);
    const [err, setErr] = useState<string[]>([]);
    useEffect(()=>{
        const truyvan = async()=>{
            const dulieu1 = await api.CallAPI(undefined,{url:`/NguoiDung/ThongTin?id=${id}`, PhuongThuc:2});
           if(dulieu1.success){
                setThongTin(dulieu1.dulieu);
           }
        }
        truyvan();
    },[id])
    const ChuyenTrangThai_TaiKhoan = async(TrangThai : number)=>{
        try {
            const XacNhan = TrangThai===1 ? await ThongBao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn mở lại tài khoản này không?') :
                                            await ThongBao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn khóa tài khoản này không?');
            if(!XacNhan) return;
            const formData = new FormData();
            formData.append("IDND", String(id));
            formData.append('TrangThai', String(TrangThai));
            const CapNhat = await api.CallAPI(formData,{url:'/NguoiDung/CapNhat_TrangThai' , PhuongThuc:1});
            if(CapNhat.validate){
                setErr(CapNhat.errors);
                return;
            }
            if(CapNhat.success){
                ThongBao.ThongBao_ThanhCong(CapNhat.message);
                return;
            }else{
                ThongBao.ThongBao_Loi(CapNhat.message);
                return;
            }
        } catch (error) {
            console.error("Lỗi hệ thống:", error);
        }
    }

    return(
        <>
          <div className="max-w-7xl mx-auto space-y-6">
        

        <div className="flex items-center space-x-3">
           <button onClick={() => window.history.back()} className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-200">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-4 h-4 transform transition-transform duration-200 group-hover:-translate-x-1"
                     >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Quay lại
                </button>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hồ sơ hệ thống</span>
                <h1 className="text-base font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                    Chi tiết khách hàng <span className="font-mono text-xs text-indigo-600 lowercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-bold">#{ThongTin?.IDND}</span>
                </h1>
            </div>
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
           
            <div className="space-y-4 lg:col-span-1">
                
            
                <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden">
                    {err && err.length > 0 && (
        <div className="w-full mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-left animate-pulse">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-xs mb-1.5">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Thông tin chỉnh sửa không hợp lệ:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {err.map((item, index) => (
              <li key={index} className="text-[11px] text-red-500 font-medium">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
                    <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
                        <Image src={`http://localhost:3001/${ThongTin?.HINH_ANH}`} width={500} height={192} alt={`${ThongTin?.TENND}`} unoptimized className="w-15 h-15 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-[10px]" />
                        <h2 className="text-sm font-black text-slate-900">{ThongTin?.TENND}</h2>
                        <p className="text-[11px] text-slate-400 font-semibold pt-0.5">Thành viên từ: {fun.formatDate(String(ThongTin?.NGAY_TAO))}</p>
                        
                     
                        <div className="mt-3">
                              {
                                    ThongTin?.TRANG_THAI === 1 ? (
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Hoạt động</span>
                                    ):(
                                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold"> Bị khóa</span>
                                    )
                                }
                        </div>
                    </div>

                   
                    <div className="p-5 space-y-4 text-xs font-semibold">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-slate-400 block tracking-wider font-black">Địa chỉ Email</span>
                            <span className="text-slate-800 font-medium block break-all">{ThongTin?.EMAIL}</span>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-slate-400 block tracking-wider font-black">Tổng số lượt thuê</span>
                            <span className="text-slate-800 block">12 lượt đặt chỗ</span>
                        </div>
                    </div>
                </div>

               
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-2">
                    <span className="text-[10px] uppercase text-slate-400 block tracking-wider font-black mb-1">Kiểm soát tài khoản</span>
                    
      <div className="flex justify-center items-center w-full"> {/* Thêm justify-center để căn giữa nằm ngang */}
    {ThongTin?.TRANG_THAI === 1 ? (
        <button
            onClick={()=>{ChuyenTrangThai_TaiKhoan(0)}}
            type="button" 
            className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 text-[12px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm shadow-rose-100 active:scale-95 cursor-pointer"
        >
            <i className="fa-solid fa-user-lock text-[13px]"></i>
            <span>Khóa tài khoản</span>
        </button>
    ) : (
        <button 
            type="button"
            onClick={()=>{ChuyenTrangThai_TaiKhoan(1)}}
            className="px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-[12px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm shadow-emerald-100 active:scale-95 cursor-pointer"
        >
            <i className="fa-solid fa-user-check text-[13px]"></i>
            <span>Mở khóa tài khoản</span>
        </button>
    )}
</div>
                    <p className="text-[10px] text-slate-400 font-medium text-center pt-1">Khi bị khóa, tài khoản này sẽ không thể đăng nhập vào hệ thống đặt ghế.</p>
                </div>

            </div>


            <div className="lg:col-span-2 space-y-4">
                
            
                <div className="bg-white p-1.5 border border-slate-200 rounded-xl shadow-3xs flex space-x-1 select-none">
                    <button type="button" className="flex-1 py-2 text-center text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg transition-all cursor-pointer">
                        <i className="fa-solid fa-receipt mr-1.5"></i> Lịch sử đặt chỗ
                    </button>
                </div>

            
                <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden flex flex-col">
                    
                    <div className="p-4 border-b border-slate-100 bg-white">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Danh sách ghế đã đặt gần đây</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                                    <th className="py-3 px-4 w-12">Mã Đơn</th>
                                    <th className="py-3 px-4">Chi nhánh / Vị trí</th>
                                    <th className="py-3 px-4">Thời gian thuê</th>
                                    <th className="py-3 px-4">Chi phí</th>
                                    <th className="py-3 px-4">Trạng thái đơn</th>
                                    <th className="py-3 px-4 text-center w-20">Hóa đơn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                
                             
                                <tr className="hover:bg-slate-50/40 transition">
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#BK-9801</td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-900">Co-Lab Quận 1</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Khu A &bull; Ghế Công Thái Học <span className="font-bold text-indigo-600 font-mono">[A-01]</span></div>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                                        <div>12/06/2026</div>
                                        <div className="text-[10px] text-slate-400 font-normal font-mono">08:00 - 12:00 (4 giờ)</div>
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-slate-900">100,000 đ</td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Hoàn thành</span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                     
                                        <div className="flex items-center justify-center">
                                            <button type="button" className="w-7 h-7 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-100 hover:border-indigo-100 transition flex items-center justify-center cursor-pointer" title="Xem hóa đơn chi tiết">
                                                <i className="fa-solid fa-file-invoice-dollar text-xs"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                            
                                <tr className="hover:bg-slate-50/40 transition">
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#BK-9524</td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-900">Co-Lab Quận 1</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Khu A &bull; Ghế Công Thái Học <span className="font-bold text-indigo-600 font-mono">[A-02]</span></div>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                                        <div>05/06/2026</div>
                                        <div className="text-[10px] text-slate-400 font-normal font-mono">13:00 - 17:00 (4 giờ)</div>
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-slate-900">100,000 đ</td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Hoàn thành</span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center justify-center">
                                            <button type="button" className="w-7 h-7 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-100 hover:border-indigo-100 transition flex items-center justify-center cursor-pointer"><i className="fa-solid fa-file-invoice-dollar text-xs"></i></button>
                                        </div>
                                    </td>
                                </tr>

                             
                                <tr className="hover:bg-slate-50/40 transition bg-slate-50/30">
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#BK-9102</td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-400 line-through">Co-Lab Bình Thạnh</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Khu B &bull; Ghế Tiêu Chuẩn [B-12]</div>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-400">
                                        <div className="line-through">28/05/2026</div>
                                        <div className="text-[10px] font-mono">09:00 - 11:00 (2 giờ)</div>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-400 font-medium line-through">30,000 đ</td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold">Đã hủy đơn</span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center justify-center">
                        
                                            <button type="button" className="w-7 h-7 text-slate-300 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center cursor-not-allowed" disabled>
                                                <i className="fa-solid fa-file-invoice-dollar text-xs"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                 
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-white text-[11px] font-semibold text-slate-500 select-none">
                        <div>Hiển thị <span className="text-slate-900 font-bold">1-3</span> trên <span className="text-slate-900 font-bold">12</span> đơn đặt chỗ</div>
                        <div className="flex items-center space-x-1">
                            <button type="button" className="w-6 h-6 border border-slate-200 text-slate-400 rounded-md flex items-center justify-center disabled:opacity-40" disabled>
                                <i className="fa-solid fa-chevron-left text-[9px]"></i>
                            </button>
                            <button type="button" className="w-6 h-6 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md flex items-center justify-center cursor-pointer">
                                <i className="fa-solid fa-chevron-right text-[9px]"></i>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
        </>
    )
};
export default ChiTietKhachHang;