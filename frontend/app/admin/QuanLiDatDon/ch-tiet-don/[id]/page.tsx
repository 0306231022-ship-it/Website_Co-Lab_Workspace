"use client";
import { useParams } from 'next/navigation';
import { objChiNhanh } from '@/interface/ChiNhanh';
import React, { useState, useEffect } from "react";
import * as api from '@/API/API';
function ChiTietDon(){
    const { id} = useParams();
    useEffect(()=>{
        const laydl= async()=>{
            try {
                const chinhanh = await api.CallAPI(undefined,{url:`/admin/thongtin_chinhanh_khonggian?id=${id}`, PhuongThuc:2})
            } catch (error) {
                
            }
        }
        laydl();
    },[id])

    return(
        <>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-start gap-4 flex-1">
                            <a href="#" className="inline-flex items-center justify-center p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-xs group shrink-0 mt-0.5" title="Quay lại danh sách">
                                <i className="fa-solid fa-arrow-left transition-transform duration-200 group-hover:-translate-x-0.5"></i>
                            </a>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-base font-bold text-slate-900">Chi tiết đơn đặt hàng #CLB-2026-9041</h1>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> Đang sử dụng
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">Khởi tạo bởi hệ thống tự động vào lúc 07:42 - 14/06/2026</p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-[11px] font-medium text-slate-400">Tổng giá trị đơn</p>
                            <p className="text-xl font-extrabold text-indigo-600 mt-0.5">1,320,000 đ</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs"><i className="fa-solid fa-file-invoice"></i></div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Đặt đơn thành công</p>
                                <p className="text-[10px] text-slate-400 font-mono">14/06 · 07:42</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs"><i className="fa-solid fa-credit-card"></i></div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Đã thanh toán online</p>
                                <p className="text-[10px] text-slate-400 font-mono">14/06 · 07:45</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-200"><i className="fa-solid fa-door-open"></i></div>
                            <div>
                                <p className="text-xs font-bold text-indigo-600">Đã nhận phòng</p>
                                <p className="text-[10px] text-indigo-400 font-mono">14/06 · 08:02</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-40">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold"><i className="fa-solid fa-flag-checkered"></i></div>
                            <div>
                                <p className="text-xs font-bold text-slate-700">Trả phòng</p>
                                <p className="text-[10px] text-slate-400">Chưa diễn ra</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-border-all text-indigo-500"></i> Thông tin dịch vụ đặt chỗ
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <i className="fa-solid fa-layer-group text-[9px]"></i> Cấp 1: Thông tin chi nhánh
                                    </p>
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                                            <i className="fa-solid fa-store text-sm"></i>
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-bold text-slate-900">Co-Lab Workspace - Cơ sở Quận 1</h4>
                                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <i className="fa-solid fa-location-dot text-[10px] text-slate-400 shrink-0"></i> 
                                                123 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP. HCM
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs ml-4 relative before:absolute before:top-[-12px] before:left-[-16px] before:w-4 before:h-[32px] before:border-l-2 before:border-b-2 before:border-slate-200 before:rounded-bl-lg">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <i className="fa-solid fa-cubes text-[9px]"></i> Cấp 2: Thông tin không gian
                                    </p>
                                    <div className="flex gap-4">
                                        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=150&auto=format&fit=crop" alt="Workspace" className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"/>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-slate-900">Phòng họp Dedicated Meeting Room (M-01)</h4>
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200">Tầng 4</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Không gian yên tĩnh phù hợp cho làm việc nhóm, brainstorm hoặc ký kết hợp đồng trực tiếp.</p>
                                            <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-medium">
                                                <span><i className="fa-solid fa-users text-slate-400 mr-1"></i> Sức chứa: 8 - 10 người</span>
                                                <span><i className="fa-solid fa-wifi text-slate-400 mr-1"></i> Wi-Fi 6 siêu tốc</span>
                                                <span><i className="fa-solid fa-tv text-slate-400 mr-1"></i> Smart TV & Bảng kính</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Thời gian bắt đầu</p>
                                    <p className="text-xs font-bold text-slate-800 mt-1">08:00 — 14/06/2026</p>
                                </div>
                                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Thời gian kết thúc (Dự kiến)</p>
                                    <p className="text-xs font-bold text-slate-800 mt-1">12:00 — 14/06/2026</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-receipt text-indigo-500"></i> Bảng phân rã chi phí
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs text-slate-600">
                                    <span>Giá thuê phòng họp (300,000 đ / giờ × 4 giờ)</span>
                                    <span className="font-medium text-slate-900">1,200,000 đ</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-600">
                                    <span>Thuế GTGT (VAT 10%)</span>
                                    <span className="font-medium text-slate-900">120,000 đ</span>
                                </div>
                                
                                <div className="border-t border-slate-100 pt-3 flex justify-between text-xs font-bold text-slate-900">
                                    <span className="text-sm">Tổng cộng tiền thực trả (Đã bao gồm thuế)</span>
                                    <span className="text-base text-indigo-600 font-extrabold">1,320,000 đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-user-tie text-indigo-500"></i> Thông tin khách hàng
                            </h3>
                            
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-3">
                                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop" alt="Customer" className="w-10 h-10 rounded-full object-cover border border-slate-100"/>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Trần Hoàng Long</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">long.th@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-credit-card text-indigo-500"></i> Giao dịch tài chính
                            </h3>
                            
                            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                                        <i className="fa-solid fa-globe"></i> Thanh toán Online (VNPay)
                                    </span>
                                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">Thành công</span>
                                </div>
                                <div className="text-[11px] text-emerald-700 space-y-1 font-medium">
                                    <p>Mã giao dịch VNPay: <span className="font-mono font-bold">VNPAY-8942014</span></p>
                                    <p>Thời gian nhận: 14/06/2026 — 07:45</p>
                                    <p>Số tiền khớp lệnh: 1,320,000 đ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200/60">
                    <button type="button" className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 border border-slate-200 bg-white rounded-xl transition-all cursor-pointer">
                        <i className="fa-solid fa-print mr-1.5 text-slate-400"></i>In hóa đơn
                    </button>
                    <button type="button" className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Hoàn thành đơn đặt</span>
                    </button>
                </div>
        </>
    )
};
export default ChiTietDon;