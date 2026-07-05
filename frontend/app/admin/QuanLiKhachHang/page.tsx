'use client'
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { NguoiDung } from '@/interface/NguoiDung';
import { ThongKeNguoiDung } from '@/interface/NguoiDung';
import * as fun from '@/FUNCTION/function';
import Image from "next/image";
import Link from 'next/link';
function DanhSachKhachHang(){
    const [loading,setloading] = useState<boolean>(false);
    const [page,setpage] = useState<number>(1);
    const [NguoiDung, setNguoiDung] = useState<NguoiDung[]>([]);
    const [ThongKe,setThongKe] =useState<ThongKeNguoiDung | null>(null);
    const [TongDanhSach,setTongDanhSach] = useState<number>(0);
    const [TrangThai,setTrangThai] = useState<number>(1);
    const [Timkiem,timkiem] = useState<string>('');
    useEffect(()=>{
        const laydl = async()=>{
        setloading(true)
            try {
                const dulieu = await api.CallAPI(undefined,{url:`/NguoiDung/LayDanhSach?page=${page}`, PhuongThuc:2})
                if(dulieu.success){
                    setNguoiDung(dulieu.DanhSach);
                    setThongKe(dulieu.ThongKe);
                    setTongDanhSach(dulieu.TongDanhSach);
                }

            } catch (error) {
                console.error("Lỗi hệ thống:", error);
            } finally {
                setloading(false)
            }
        }
        laydl();
    },[page])
    const Loc_Trang_hientai = ()=>{
        const ketqua = TrangThai===1 ? NguoiDung.filter(item=> item.TRANG_THAI===1) : NguoiDung.filter(item=> item.TRANG_THAI===0);
        setNguoiDung(ketqua);
    }
    const TimKiem = async()=>{
        try {
             const ketqua = await api.CallAPI(undefined,{url:`/NguoiDung/TimKiem?Ten=?${Timkiem}`, PhuongThuc:2});
             if(ketqua.success){
                setNguoiDung(ketqua.DanhSach);
                setTongDanhSach(ketqua.TongDanhSach)
             }
        } catch (error) {
             console.error("Lỗi hệ thống:", error);
        }
    }
  
    if(loading){
        return(
            <>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                            <div className="animate-spin inline-block w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
                            <span className="text-xs font-medium text-gray-500">Đang tải danh sách người dùng...</span>
                        </div>
            </>
        )
    }
    return(
        <>
        <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide">Quản lý khách hàng</h1>
                <p className="text-xs text-slate-500 font-medium">Xem, tìm kiếm và quản lý thông tin tài khoản khách hàng trên hệ thống.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base shrink-0">
                    <i className="fa-solid fa-users"></i>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng khách hàng</p>
                    <h3 className="text-lg font-black text-slate-900">{fun.formatShortNumber(ThongKe?.TongDanhSach ?? 0)}</h3>
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base shrink-0">
                    <i className="fa-solid fa-user-check"></i>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Đang hoạt động</p>
                    <h3 className="text-lg font-black text-slate-900">{fun.formatShortNumber(ThongKe?.DanhSachHoatDong ?? 0)}</h3>
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base shrink-0">
                    <i className="fa-solid fa-clock"></i>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mới trong tháng</p>
                    <h3 className="text-lg font-black text-slate-900">+{fun.formatShortNumber(ThongKe?.DanhSach_Thang ?? 0)}</h3>
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-base shrink-0">
                    <i className="fa-solid fa-user-slash"></i>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tài khoản bị khóa</p>
                    <h3 className="text-lg font-black text-slate-900">{ fun.formatShortNumber(((ThongKe?.TongDanhSach ?? 0) - (ThongKe?.DanhSachHoatDong ?? 0)))}</h3>
                </div>
            </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between bg-white">
                <div className="relative w-full md:w-80">
                    <button type='button' onClick={()=>{TimKiem()}} className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <i className="fa-solid fa-magnifying-glass text-xs"></i>
                    </button>
                    <input type="text" placeholder="Tìm tên..."
                    onChange={(e)=>{timkiem(e.target.value)}}
                           className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"/>
                </div>
                
                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                    <div className="relative w-full sm:w-40">
                        <select onChange={(e)=>{setTrangThai(Number(e.target.value))}} className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none">
                            <option value="1">Đang hoạt động</option>
                            <option value="0">Bị khóa</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none text-[9px]">
                            <i className="fa-solid fa-chevron-down"></i>
                        </span>
                    </div>
                    
                    <button onClick={()=>{Loc_Trang_hientai()}} type="button" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer">
                        <i className="fa-solid fa-filter"></i>
                        <span>Lọc</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                            <th className="py-3 px-5 w-12">ID</th>
                            <th className="py-3 px-5">Khách hàng</th>
                            <th className="py-3 px-5">Thông tin liên hệ</th>
                            <th className="py-3 px-5">Ngày đăng ký</th>
                            <th className="py-3 px-5">Trạng thái</th>
                            <th className="py-3 px-5 text-center w-20">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {
                            NguoiDung ? (
                                NguoiDung.map((item)=>(
                                    
                                    <tr key={item.IDND} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-5 font-mono text-slate-400 font-bold">#{item.IDND}</td>
                            <td className="py-3.5 px-5 font-bold text-slate-900">
                                <div className="flex items-center space-x-2.5">
                                    <Image src={`http://localhost:3001/${item.HINH_ANH}`} width={500} height={192} alt={`${item.TENND}`} unoptimized className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-[10px]" />
                                    <span>{item.TENND}</span>
                                </div>
                            </td>
                            <td className="py-3.5 px-5 text-slate-600 font-medium">
                                <div>{item.EMAIL}</div>
                            </td>
                            <td className="py-3.5 px-5 text-slate-500">{fun.formatDate(item.NGAY_TAO)}</td>
                            <td className="py-3.5 px-5">
                                {
                                    item.TRANG_THAI === 1 ? (
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Hoạt động</span>
                                    ):(
                                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold"> Bị khóa</span>
                                    )
                                }
        
                            </td>
                            <td className="py-3.5 px-5">
                                <div className="flex items-center justify-center">
                                    <Link href={`/admin/QuanLiKhachHang/chi-tiet-khach-hang/${item.IDND}`} className="w-7 h-7 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition flex items-center justify-center cursor-pointer" title="Xem chi tiết & lịch sử đặt"><i className="fa-solid fa-eye text-xs"></i></Link>
                                </div>
                            </td>
                        </tr>
                                ))
                            ) : (
     <tr>
                                    <td colSpan={6} className="py-12 bg-white">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                                                <i className="fa-solid fa-users-slash text-lg"></i>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy người dùng nào</h3>
                                            <p className="text-xs text-slate-400 mt-1 px-4">
                                                Không tìm thấy kết quả phù hợp với tiêu chí lọc hoặc từ khóa tìm kiếm hiện tại của bạn.
                                            </p>
    
                                        </div>
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-white text-xs font-semibold text-slate-500 select-none">
                <div>
                    Hiển thị <span className="text-slate-900 font-bold">{(10*page)-10+1}-{10* page}</span> trên <span className="text-slate-900 font-bold">{fun.formatShortNumber(TongDanhSach)}</span> khách hàng
                </div>
                <div className="flex items-center space-x-1">
                    <button type="button" onClick={()=>{setpage(p=>p-1)}} disabled={page===1} className="w-7 h-7 border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center transition text-slate-400 disabled:opacity-50 cursor-pointer">
                        <i className="fa-solid fa-chevron-left text-[10px]"></i>
                    </button>
                    <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold shadow-xs">{page}</span>
                    <button type="button"  onClick={()=>{setpage(p=>p+1)}} disabled={page >= TongDanhSach / 10} className="w-7 h-7 border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center transition text-slate-500 cursor-pointer">
                        <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            </div>

        </div>
    </div>
        </>
    )
};
export default DanhSachKhachHang;