"use client";
import React, { useState, useEffect } from "react";
import { ThietBi } from "@/interface/ThietBi";
import * as api from "@/API/API";
import * as ThongBao from '@/FUNCTION/ThongBao';
import { useParams } from 'next/navigation';

function CapTrangThietBi() {
    // 1. Quản lý States dữ liệu và Phân trang
    const [dsThietBi, setDsThietBi] = useState<ThietBi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page1, setPage1] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { idkhonggian } = useParams();
    const [errors, setErrors] = useState<string[]>([]);
    useEffect(() => {
           const fetchDevicesList = async () => {
        try {
            setLoading(true);
            const result = await  api.CallAPI(undefined,{url:`/admin/thietbi?page=${page1}`, PhuongThuc:2});
            if (result.success) {
                setDsThietBi(result.data || []);
                setTotalItems(result.pagination?.totalItems || 0);
                setTotalPages(result.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách thiết bị:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchDevicesList();
    }, [page1]);

   

    // 5. Xử lý logic Checkbox cá nhân & Checkbox tất cả (Select All)
    const handleCheckboxChange = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const currentIds = dsThietBi.map(item => item.ID_THIET_BI)
            setSelectedIds(prev => Array.from(new Set([...prev, ...currentIds])));
        } else {
            const currentIds = dsThietBi.map(item => item.ID_THIET_BI);
            setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
        }
    };

    const isAllSelectedOnPage = dsThietBi.length > 0 && dsThietBi.every(item => selectedIds.includes(item.ID_THIET_BI));
    const handleSubmitAllocation = async () => {
        setLoading(true)
        if (selectedIds.length === 0) {
            ThongBao.ThongBao_CanhBao("Vui lòng chọn ít nhất một thiết bị để tiến hành cấp!");
            setLoading(false)
            return;
        }
        try {
            const formData = new FormData();
            formData.append("ID_KHONG_GIAN", String(idkhonggian));
            formData.append("_ID_THIET_BI",JSON.stringify(selectedIds));
            const ketqua = await api.CallAPI(formData,{url:'/admin/CapThietBi' , PhuongThuc:1});
             if (ketqua.validate) {
                setErrors(ketqua.errors);
                setLoading(false);
                return;
            }
            if(ketqua.success){
                ThongBao.ThongBao_ThanhCong(ketqua.message)
            }else{
                ThongBao.ThongBao_Loi(ketqua.message)
            }
        } catch (error) {
            console.error("Lỗi khi cấp danh sách thiết bị:", error);
        }
    };

    const isFirstPage = page1 === 1;
    const isLastPage = page1 === totalPages || totalPages <= 1;


    return (
        <>
 {errors.length > 0 && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
            <i className="fa-solid fa-triangle-exclamation text-sm"></i> Phát hiện {errors.length} lỗi cần điều chỉnh:
          </p>
          <ul className="list-disc list-inside text-xs text-red-600 font-semibold space-y-1 pl-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
                    {/* Vùng hiển thị Table Danh sách */}
                    <div className="flex-1 overflow-y-auto min-h-[250px]">
                        {loading ? (
                            /* Giao diện Loading mượt mà */
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
                                <div className="w-8 h-8 border-3 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                                <p className="text-xs font-medium">Đang tải danh sách kho thiết bị...</p>
                            </div>
                        ) : dsThietBi.length > 0 ? (
                            
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-gray-50/70 text-gray-400 font-black uppercase tracking-wider sticky top-0 border-b border-gray-100 z-10">
                                    <tr>
                                        <th className="p-3 pl-6 w-12 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={isAllSelectedOnPage}
                                                onChange={handleSelectAllChange}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-3">Thiết bị / Thương hiệu</th>
                                        <th className="p-3">Mã số thiết bị</th>
                                        <th className="p-3 pr-6">Trạng thái kho</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                                    {dsThietBi.map((item) => {
                                        const isChecked = selectedIds.includes(item.ID_THIET_BI);
                                        return (
                                            <tr key={item.ID_THIET_BI} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-3 pl-6 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked}
                                                        onChange={() => handleCheckboxChange(item.ID_THIET_BI)}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center space-x-2.5">
                                                        <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center text-xs">
                                                            <i className={item.HINH_ANH}></i>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{item.TEN_THIET_BI}</p>
                                                            <p className="text-[10px] text-gray-400">Thiết bị lưu trữ trong kho</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 font-mono text-[11px] text-slate-500">
                                                    #EQUIP-{item.ID_THIET_BI}
                                                </td>
                                                <td className="p-3 pr-6">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span> Sẵn sàng cấp
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            /* Empty State - Không tìm thấy thiết bị */
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-lg mb-3 border border-amber-100">
                                    <i className="fa-solid fa-boxes-stacked"></i>
                                </div>
                                <h4 className="text-sm font-bold text-gray-800">Kho không có thiết bị này</h4>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs">Không tìm thấy thiết bị tương thích với từ khóa tìm kiếm hoặc bộ lọc hiện tại.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination & Footer Điều hướng động */}
                    {!loading && totalItems > 0 && (
                        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
                            <span>
                                Hiển thị {Math.min((page1 - 1) * 10 + 1, totalItems)} - {Math.min(page1 * 10, totalItems)} trong tổng số {totalItems} thiết bị
                            </span>

                            <div className="flex items-center space-x-1.5">
                                <button 
                                    type="button"
                                    onClick={() => setPage1(prev => Math.max(prev - 1, 1))}
                                    disabled={isFirstPage}
                                    className={`w-7 h-7 border rounded-lg flex items-center justify-center transition-all duration-200 
                                        ${isFirstPage 
                                            ? "bg-gray-50/70 border-gray-200 text-gray-300 opacity-50 cursor-not-allowed select-none" 
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50 hover:border-gray-300 active:scale-95 cursor-pointer"
                                        }`}
                                >
                                    <i className="fa-solid fa-chevron-left text-[9px]"></i>
                                </button>  

                                <button type="button" className="w-7 h-7 bg-indigo-50 border border-indigo-200/80 rounded-lg flex items-center justify-center text-indigo-600 font-black shadow-xs select-none">
                                    {page1}
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => setPage1(prev => Math.min(prev + 1, totalPages))}
                                    disabled={isLastPage}
                                    className={`w-7 h-7 border rounded-lg flex items-center justify-center transition-all duration-200 
                                        ${isLastPage 
                                            ? "bg-gray-50/70 border-gray-200 text-gray-300 opacity-50 cursor-not-allowed select-none" 
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50 hover:border-gray-300 active:scale-95 cursor-pointer"
                                        }`}
                                >
                                    <i className="fa-solid fa-chevron-right text-[9px]"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Footer */}
                    <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
                        <p className="text-xs text-gray-500 font-medium">
                            Đã chọn <span className="font-bold text-indigo-600">{selectedIds.length}</span> trang thiết bị
                        </p>
                        <div className="flex space-x-2">
                            <button type="button" className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer">
                                Đóng lại
                            </button>
                            <button 
                                type="button" 
                                onClick={()=>{handleSubmitAllocation()}}
                                disabled={selectedIds.length === 0}
                                className={`px-5 py-2 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center 
                                    ${selectedIds.length === 0 
                                        ? "bg-purple-400 opacity-60 cursor-not-allowed" 
                                        : "bg-purple-600 hover:bg-purple-700 shadow-purple-100 cursor-pointer active:scale-98"
                                    }`}
                            >
                                <i className="fa-solid fa-arrow-right-to-bracket mr-2 text-[10px]"></i> Xác nhận cấp thiết bị
                            </button>
                        </div>
                    </div>
        </>
    );
}

export default CapTrangThietBi;