"use client";
import SoDoGheCanvas from '@/component/Ghe';
import { useModalContext } from "@/context/QuanLiMoal";
import { Ghe } from '@/interface/ghe';
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation'; 
import * as fun from '@/FUNCTION/function';
function GheNgoi({ DuLieu }: { DuLieu: Ghe[] }) {
    const { OpenMoDal } = useModalContext();
    const params = useParams(); 
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [danhSachGheHienTai, setDanhSachGheHienTai] = useState<Ghe[]>(DuLieu);
    useEffect(() => {
        const fetchGheTheoKhungGio = async () => {
            if (startTime && endTime) {
                if (new Date(startTime) >= new Date(endTime)) {
                    ThongBao.ThongBao_CanhBao("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
                    return;
                }
                try {
                    const idKhongGian = params?.idKhongGian || DuLieu[0]?.ID_KHONG_GIAN;
                    if (!idKhongGian) return;
                    const thoigian = await api.CallAPI(undefined,{url:`/admin/danhsachghe_thoigian?id=${idKhongGian}&BatDau=${fun.formatToBackendDateTime(startTime)}&KetThuc=${fun.formatToBackendDateTime(endTime)}`,PhuongThuc:2});
                    alert(JSON.stringify(thoigian))
                    if (thoigian && thoigian.success) {
                        setDanhSachGheHienTai(thoigian.Ghe);
                    }
                } catch (error) {
                    console.error("Lỗi khi tải trạng thái ghế:", error);
                    ThongBao.ThongBao_CanhBao("Không thể tải trạng thái ghế vào khung giờ này!");
                }
            }
        };
        fetchGheTheoKhungGio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startTime, endTime]);
    const handleGheSelect = (thongTinGhe: Ghe) => {
        if (!startTime || !endTime) {
            ThongBao.ThongBao_CanhBao("Vui lòng chọn thời gian bắt đầu và kết thúc trước khi chọn ghế!");
            return;
        }
        OpenMoDal(
            { 
                thongTinGhe, 
                thoiGianBatDau: startTime, 
                thoiGianKetThuc: endTime 
            }, 
            { TenTrang: 'ThongTin_ghe' }
        );
    };

    return (
        <>
            <div className="md:col-span-7 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-5">
                <div>
                    <div className="border-t border-gray-100 pt-4 mt-2">
                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Thời gian sử dụng</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-gray-500">Thời gian bắt đầu</label>
                                <input 
                                    type="datetime-local"  
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                                    value={startTime} 
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-gray-500">Thời gian kết thúc</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                                    value={endTime} 
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tiêu đề & Chú thích */}
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-4 mt-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Sơ đồ vị trí chỗ ngồi</h3>
                            <p className="text-[11px] text-gray-400">Nhấp vào vị trí ghế trống trên sơ đồ để tiến hành lựa chọn</p>
                        </div>
                        <div className="flex gap-3 text-[10px] text-gray-500 font-medium">
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Trống
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded bg-red-500"></span> Đang có người
                            </span>
                        </div>
                    </div>
                
                    <SoDoGheCanvas danhSachGhe={danhSachGheHienTai} onGheClick={handleGheSelect} isReadOnly={false} />
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl text-center text-xs font-medium max-w-md mx-auto">
                        Vui lòng chọn một ghế trống bất kỳ trên sơ đồ
                    </div>
                </div>
            </div>
        </>
    );
}

export default GheNgoi;