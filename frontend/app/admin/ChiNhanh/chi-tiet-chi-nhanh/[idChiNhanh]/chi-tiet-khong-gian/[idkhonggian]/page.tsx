"use client";
import { useModalContext } from "@/context/QuanLiMoal";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { ThietBi } from "@/interface/ThietBi";
import { Ghe } from '@/interface/ghe';
import SoDoGheCanvas from '@/component/Ghe';
import { objChiNhanh } from '@/interface/ChiNhanh';
import { KhongGian } from '@/interface/KhongGian';
import Image from "next/image";
import * as fun from '@/FUNCTION/function';
import Link from 'next/link';
import {  LichDatItems } from "@/interface/LichDat";
import {socket} from '@/FUNCTION/socket';

function ChiTietKhongGian() {
    const { OpenMoDal } = useModalContext();
    const [page1, setpage1] = useState<number>(1);
    const [loading1, setloading1] = useState<boolean>(false);
    const [ThietBi, setThietBi] = useState<ThietBi[]>([]);
    const { idkhonggian, idChiNhanh } = useParams();
    const [err, setErr] = useState<string[]>([]);
    const [TongDanhSach1, setTongDanhSach1] = useState<number>(0);
    const dongBatDau = TongDanhSach1 === 0 ? 0 : (page1 - 1) * 10 + 1;
    const dongKetThuc = Math.min(page1 * 10, TongDanhSach1);
    const [chinhanh, setchinhanh] = useState<objChiNhanh | null>(null);
    const [khonggian, setkhonggian] = useState<KhongGian | null>(null);
    const [ghe, setghe] = useState<Ghe[]>([]);
    const [tongGioThue, setTongGioThue] = useState<number>(0);
    const [tiLeLapDay, setTiLeLapDay] = useState<number>(0);
    const [DonGia, setDonGia] = useState<number>(0);
    const [tongghe, settongghe] = useState<number>(0);
    const [gioketiep,setgioketiep] = useState< LichDatItems | null>(null);
    const [id_hientai,setid_hientai] = useState<string>('');

    // Effect 1: Tải danh sách thiết bị khi chuyển trang (Phân trang)
    useEffect(() => {
        if (page1 === 1) return;
        const loaddl = async () => {
            setloading1(true);
            try {
                const dulieu = await api.CallAPI(undefined, { url: `/admin/DanhSachThietBi_theoKhongGian?page=${page1}&IDKG=${idkhonggian}`, PhuongThuc: 2 });
                if (dulieu.validate) {
                    setErr(dulieu.errors);
                    return;
                }
                if (dulieu.success) {
                    setThietBi(dulieu.ThietBi.DanhSach);
                    setTongDanhSach1(dulieu.ThietBi.TongDanhSach);
                } else {
                    ThongBao.ThongBao_CanhBao('Không tìm thấy thông tin thiết bị thuộc không gian!');
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin thiết bị:", error);
                ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin thiết bị');
            } finally {
                setloading1(false);
            }
        };
        loaddl();
    }, [page1, idkhonggian]);
    useEffect(() => {
        const loadl = async () => {
            try {
                const [dulieu1, dulieu2] = await Promise.all([
                    api.CallAPI(undefined, { url: `/admin/ChiTiet_KhongGian?IDKG=${idkhonggian}&IDCN=${idChiNhanh}`, PhuongThuc: 2 }),
                    api.CallAPI(undefined, { url: `/admin/thongke?id=${idkhonggian}`, PhuongThuc: 2 }),
                ]);
                if (dulieu1.validate) {
                    setErr(dulieu1.errors);
                    return;
                }
                if (dulieu1.success) {
                    setchinhanh(dulieu1.DanhSach.ChiNhanh);
                    setkhonggian(dulieu1.DanhSach.KhongGian.KhongGian);
                    socket.emit("join_space_room", {
                        idKhongGian: idkhonggian,
                        loaiKhongGian: dulieu1.DanhSach.KhongGian.KhongGian.LOAI_KHONG_GIAN
                    });
                    setThietBi(dulieu1.DanhSach.ThietBi.DanhSach);
                    setTongDanhSach1(dulieu1.DanhSach.ThietBi.TongDanhSach);
                    const danhSachGheChuan = dulieu1.DanhSach.Ghe || dulieu1.DanhSach.ghe || dulieu1.DanhSach.DanhSachGhe || [];
                    setghe(danhSachGheChuan);
                    const danhsach_lich_ketiep = dulieu1.DanhSach.KhongGian.lichKeTiep || null;
                    setgioketiep(danhsach_lich_ketiep);
                    const lich_hientai = dulieu1.DanhSach.KhongGian.lichHienTai || '';
                    setid_hientai(lich_hientai)
                }
                if (dulieu2 && dulieu2.success) {
                    setTongGioThue(dulieu2.dulieu.TongGioThue || 0);
                    setTiLeLapDay(dulieu2.dulieu.Tile_LapDay || 0);
                    setDonGia(dulieu2.dulieu.DonGia || 0);
                    settongghe(dulieu2.dulieu.TongSoGhe || 0);
                } else {
                    console.error("Không thể tải dữ liệu thống kê từ API 2");
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin chi tiết không gian:", error);
                ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin không gian');
            }
        };
        loadl();
    }, [idChiNhanh, idkhonggian]);
      useEffect(() => {
        socket.on("update_schedule", async(data) => {
          if (data.success) {
              const [dulieu1, dulieu2] = await Promise.all([
                    api.CallAPI(undefined, { url: `/admin/ChiTiet_KhongGian?IDKG=${idkhonggian}&IDCN=${idChiNhanh}`, PhuongThuc: 2 }),
                    api.CallAPI(undefined, { url: `/admin/thongke?id=${idkhonggian}`, PhuongThuc: 2 }),
                ]);
                if (dulieu1.validate) {
                    setErr(dulieu1.errors);
                    return;
                }
                if (dulieu1.success) {
                    setchinhanh(dulieu1.DanhSach.ChiNhanh);
                    setkhonggian(dulieu1.DanhSach.KhongGian.KhongGian);
                    socket.emit("join_space_room", {
                        idKhongGian: idkhonggian,
                        loaiKhongGian: dulieu1.DanhSach.KhongGian.KhongGian.LOAI_KHONG_GIAN
                    });
                    setThietBi(dulieu1.DanhSach.ThietBi.DanhSach);
                    setTongDanhSach1(dulieu1.DanhSach.ThietBi.TongDanhSach);
                    const danhSachGheChuan = dulieu1.DanhSach.Ghe || dulieu1.DanhSach.ghe || dulieu1.DanhSach.DanhSachGhe || [];
                    setghe(danhSachGheChuan);
                    const danhsach_lich_ketiep = dulieu1.DanhSach.KhongGian.lichKeTiep || null;
                    setgioketiep(danhsach_lich_ketiep);
                    const lich_hientai = dulieu1.DanhSach.KhongGian.lichHienTai || '';
                    setid_hientai(lich_hientai)
                }
                if (dulieu2 && dulieu2.success) {
                    setTongGioThue(dulieu2.dulieu.TongGioThue || 0);
                    setTiLeLapDay(dulieu2.dulieu.Tile_LapDay || 0);
                    setDonGia(dulieu2.dulieu.DonGia || 0);
                    settongghe(dulieu2.dulieu.TongSoGhe || 0);
                } else {
                    console.error("Không thể tải dữ liệu thống kê từ API 2");
                }
          } else {
            ThongBao.ThongBao_CanhBao(data.message || data.mesage);
          }
        });
        return () => {
          socket.off("update_schedule");
        };
      }, [idkhonggian, idChiNhanh]);

    const handleDeleteAllocation = async (idThietBi: number) => {
        const XacNhan = await ThongBao.ThongBao_XacNhanTT('Bạn có chắn chắn muốn xóa thiết bị này?');
        if (!XacNhan) return;
        setloading1(true);
        try {
            const formData = new FormData();
            formData.append("ID_KHONG_GIAN", String(idkhonggian));
            formData.append("ID_THIET_BI", String(idThietBi));
            const ketqua = await api.CallAPI(formData, { url: '/admin/XoaTB_KG', PhuongThuc: 1 });
            if (ketqua.success) {
                ThongBao.ThongBao_ThanhCong(ketqua.message || "Đã gỡ thiết bị khỏi không gian!")
                setTongDanhSach1(prev => prev - 1);
            } else {
                ThongBao.ThongBao_Loi(ketqua.message || "Xóa thiết bị thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi gỡ thiết bị:", error);
            ThongBao.ThongBao_Loi("Không thể kết nối đến máy chủ.");
        } finally {
            setloading1(false);
        }
    };

    const handleGheSelect = (thongTinGhe: Ghe) => {
        OpenMoDal(thongTinGhe.ID_GHE,{TenTrang:'ThongTinGhe'})
    };

    const soGheDangThue = ghe.filter(g => g.DangCoNguoiDat === 1).length;
    const phanTramMatDo = tongghe > 0 ? (soGheDangThue / tongghe) * 100 : (ghe.length > 0 ? (soGheDangThue / ghe.length) * 100 : 0);
    
    return (
        <>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* HEADER TIÊU ĐỀ */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                    <div className="flex items-start space-x-3.5">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl border border-indigo-100 shrink-0">
                            <i className="fa-solid fa-users-viewfinder"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{khonggian?.TEN_KHONG_GIAN}</h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    <i className="fa-solid fa-earth-asia mr-1.5 text-indigo-500 text-[10px]"></i> Loại: {khonggian?.LOAI_KHONG_GIAN === 1 ? 'Không gian chung' : 'Phòng họp'}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> {khonggian?.TRANG_THAI === 1 ? 'Hoạt động' : 'Ngưng hoạt động'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium mt-1"><i className="fa-solid fa-location-dot mr-1 text-gray-300"></i> {chinhanh?.DIA_CHI || chinhanh?.DiaChi}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2.5 self-end sm:self-center">
                        <button onClick={() => window.history.back()} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition flex items-center">
                            <i className="fa-solid fa-arrow-left mr-2 text-xs"></i> Quay lại
                        </button>
                        <button onClick={() => { OpenMoDal(undefined, { TenTrang: 'ChinhSuaKhongGian', TieuDe: 'Cấu hình không gian', icon: 'fa-solid fa-sliders' }) }} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-md shadow-indigo-600/10 flex items-center">
                            <i className="fa-solid fa-pen-to-square mr-2 text-xs"></i> Chỉnh sửa không gian
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KHỐI THÔNG BÁO LỖI VALIDATE */}
                    {err && err.length > 0 && (
                        <div className="w-full lg:col-span-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-left animate-pulse">
                            <div className="flex items-center gap-2 text-red-600 font-semibold text-xs mb-1.5">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                <span>Thông tin không gian không hợp lệ:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-0.5">
                                {err.map((item, index) => (
                                    <li key={index} className="text-[11px] text-red-500 font-medium">{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* CỘT TRÁI & GIỮA: THÔNG TIN HÌNH ẢNH VÀ CANVAS SƠ ĐỒ */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* HÌNH ẢNH VÀ THÔNG TIN GIÁ */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-5 gap-5 p-5">
                            <div className="md:col-span-2 relative h-48 md:h-full rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                {khonggian?.HINHANH && (
                                    <Image src={`http://localhost:3001/${khonggian.HINHANH}`} width={500} height={192} unoptimized alt={`${khonggian?.TEN_KHONG_GIAN}`} className="w-full h-full object-cover" />
                                )}
                                <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black rounded-md tracking-wider uppercase">{khonggian?.LOAI_KHONG_GIAN === 1 ? 'Không gian chung' : 'Phòng họp'}</span>
                            </div>
                            <div className="md:col-span-3 grid grid-cols-2 gap-4">
                                {khonggian?.LOAI_KHONG_GIAN !== 1 && (
                                    <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-xl">
                                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Đơn giá thuê</span>
                                        <span className="text-xl font-black text-indigo-600">{fun.formatCurrency(DonGia)}<span className="text-xs font-bold text-gray-400">/giờ</span></span>
                                    </div>
                                )}
                                {khonggian?.LOAI_KHONG_GIAN === 1 && (
                                    <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-xl">
                                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Sức chứa tối đa</span>
                                        <span className="text-xl font-black text-gray-900">{tongghe || ghe.length} <span className="text-xs font-bold text-gray-400">Chỗ ngồi</span></span>
                                    </div>
                                )}
                                <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-xl">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Hình thức đặt</span>
                                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg inline-block mt-1">{khonggian?.LOAI_KHONG_GIAN === 1 ? 'Đặt theo ghế' : 'Đặt theo phòng'}</span>
                                </div>
                            </div>
                        </div>

                        {/* SƠ ĐỒ GHẾ NGỒI CANVAS TRỰC QUAN */}
                        <div id="floorPlanSection" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            {khonggian?.LOAI_KHONG_GIAN === 1 && (
                                ghe.length > 0 ? (
                                    <>
                                        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
                                                    <i className="fa-solid fa-map-location-dot mr-2 text-indigo-500"></i> Sơ đồ vị trí ghế ngồi trực quan
                                                </h3>
                                                <Link href={`/CauHinh2D/${idkhonggian}`} className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 text-[11px] font-bold rounded-lg transition flex items-center group">
                                                    <i className="fa-solid fa-sliders mr-1.5 text-gray-400 group-hover:text-indigo-500 text-[10px]"></i> Thiết lập sơ đồ
                                                </Link>
                                            </div>
                                            <div className="flex items-center flex-wrap gap-3 text-xs font-bold">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                                                    <span className="text-gray-500">Đang trống</span>
                                                </div>
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
                                                    <span className="text-gray-900">Đã thuê</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gray-50/50 flex flex-col items-center justify-center">
                                            <div className="w-full max-w-2xl bg-slate-50 border border-slate-200/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                                <div className="flex justify-center mb-8">
                                                    <div className="inline-flex items-center gap-2 bg-slate-200/70 text-slate-500 text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase border border-slate-300/30 shadow-2xs">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        Lối vào chính
                                                    </div>
                                                </div>

       {/* 🎯 KHU VỰC HIỂN THỊ CHÍNH - ĐÃ FIX LỖI CO COONG/LỆCH TRÁI */}
<div className="w-full bg-slate-100/60 p-4 md:p-8 flex flex-col items-center justify-center overflow-hidden relative select-none rounded-xl">
    
    {/* Box đệm căn giữa cố định */}
    <div className="w-full flex justify-center items-center">
        <SoDoGheCanvas 
            danhSachGhe={ghe} 
            onGheClick={handleGheSelect} 
            setGhe={setghe} 
            isReadOnly={true}
        />
    </div>
    
    {/* Nhãn hệ thống nhỏ góc dưới */}
    <div className="mt-4 bg-slate-900/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center space-x-2 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Chế độ xem trực quan sơ đồ không gian</span>
    </div>
</div>                                  
                                                <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                                                    <i className="fa-solid fa-angles-down text-[10px] text-sky-400 animate-bounce"></i> 
                                                    <span>Hướng ban công ngoài trời</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-12 text-center bg-gray-50/50 flex flex-col items-center justify-center">
                                        <p className="text-sm text-gray-400 font-medium mb-3">Không gian này chưa có sơ đồ ghế hoặc chưa có ghế nào được tạo.</p>
                                        <Link href={`/CauHinh2D/${idkhonggian}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent text-xs font-bold rounded-xl transition flex items-center group shadow-md">
                                            <i className="fa-solid fa-sliders mr-1.5 text-[10px]"></i> Cấu hình thiết lập sơ đồ mới ngay
                                        </Link>
                                    </div>
                                )
                            )}
                        </div>

                        {/* DANH SÁCH THIẾT BỊ CƠ SỞ VẬT CHẤT */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
                                    <i className="fa-solid fa-cubes mr-2 text-indigo-500"></i> Danh sách thiết bị cơ sở vật chất
                                </h3>
                                <span className="text-[11px] bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-lg">Tổng số: {TongDanhSach1} thiết bị</span>
                                <button onClick={() => { OpenMoDal(undefined, { TenTrang: 'CapThietBi' }) }} type="button" className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 text-[11px] font-bold rounded-lg transition flex items-center group">
                                    <i className="fa-solid fa-plus mr-1.5 text-gray-400 group-hover:text-indigo-500 text-[10px]"></i> Cấp thiết bị
                                </button>
                            </div>
                            
                            {loading1 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <p className="text-xs font-medium">Đang tải danh sách thiết bị...</p>
                                </div>
                            ) : (
                                ThietBi && ThietBi.length > 0 ? (
                                    <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                                        {ThietBi.map((item) => (
                                            <div key={item.ID_THIET_BI} className="flex items-center justify-between p-4 hover:bg-slate-50/60 transition-all duration-200 group">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center text-base border border-slate-100 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                                        <i className={item.HINH_ANH || "fa-solid fa-cube"}></i>
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.TEN_THIET_BI}</span>
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400 font-medium">
                                                            <span>Mã tài sản:</span>
                                                            <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600 text-[10px]">#{item.ID_THIET_BI}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 group-hover:bg-indigo-50 rounded-lg text-xs font-black text-slate-700 group-hover:text-indigo-700 transition-colors">SL: {item.SO_LUONG}</span>
                                                    </div>
                                                    <button type="button" onClick={() => handleDeleteAllocation(item.ID_THIET_BI)} className="w-7 h-7 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all cursor-pointer border border-red-100 mx-auto" title="Gỡ thiết bị này">
                                                        <i className="fa-solid fa-trash-can text-[11px]"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-xs text-center">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-lg mb-3 border border-amber-100">
                                            <i className="fa-solid fa-boxes-stacked"></i>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-800">Không tìm thấy thiết bị</h4>
                                        <p className="text-xs text-gray-400 mt-1 max-w-xs">Không gian này hiện chưa được cấu hình hoặc bổ sung các trang thiết bị tiện ích.</p>
                                    </div>
                                )
                            )}

                            {/* PHÂN TRANG DANH SÁCH THIẾT BI */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                                <div>Hiển thị <span className="text-slate-900 font-bold">{dongBatDau}-{dongKetThuc}</span> trên <span className="text-slate-900 font-bold">{TongDanhSach1}</span> kết quả</div>
                                <div className="flex items-center space-x-1">
                                    <button disabled={page1 === 1} onClick={() => { setpage1(p => p - 1) }} className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <i className="fa-solid fa-chevron-left text-[10px]"></i>
                                    </button>
                                    <span className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-800">{page1}</span>
                                    <button disabled={page1 >= Math.ceil(TongDanhSach1 / 10)} onClick={() => { setpage1(p => p + 1) }} className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <i className="fa-solid fa-chevron-right text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: BÁO CÁO THỜI GIAN THỰC VÀ HIỆU SUẤT */}
                    <div className="space-y-6">
                     
                    
                    {/* LIVE DENSITY STATUS */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
    {/* Live Status Header */}
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span> 
        Trạng thái thực tế
    </h3>
    
    {/* Main Content Box */}
    <div className="p-4 bg-slate-50/60 border border-slate-100/80 rounded-xl space-y-4">
        {khonggian?.LOAI_KHONG_GIAN === 1 ? (
            /* ================= GIAO DIỆN KHÔNG GIAN GHẾ NGỒI ================= */
            <>
                {/* Mật độ ghế */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Mật độ ghế hiện tại:</span>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100/60 shadow-3xs">
                        {soGheDangThue} / {tongghe || ghe.length} Ghế
                    </span>
                </div>

                {/* Thanh Progress Bar */}
                <div className="space-y-1.5">
                    <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden p-[2px] border border-slate-300/30">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-700 ease-out shadow-xs" 
                            style={{ width: `${phanTramMatDo}%` }}
                        ></div>
                    </div>
                    <div className="text-right text-[10px] font-bold text-indigo-600/90 tracking-wide">
                        {phanTramMatDo.toFixed(1)}% Đang sử dụng
                    </div>
                </div>
            </>
        ) : (
            /* ================= GIAO DIỆN KHÔNG GIAN PHÒNG HỌP ================= */
            <>
                {/* Trạng thái phòng */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Trạng thái sử dụng:</span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-3xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {
                            id_hientai ==="" ? 'Phòng đang trống' : ' Đang có lịch họp'
                        }
                    </span>
                </div>

                {/* Khung giờ bận kế tiếp */}
                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl text-[11px] font-bold shadow-3xs">
             {gioketiep && typeof gioketiep === 'object' && 'KHUNG_BATDAU' in gioketiep && (
    <>
        <span className="text-slate-500 flex items-center">
            <i className="fa-regular fa-clock mr-2 text-amber-500 text-sm"></i>
            Lịch bận kế tiếp:
        </span>
        <span className="font-mono text-slate-700 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md">
            {fun.formatTime(gioketiep.KHUNG_BATDAU)} {" - "}{fun.formatTime(gioketiep.KHUNG_KETTHUC)}
        </span>
    </>
)}
                
                </div>
            </>
        )}
    </div>
</div>
                        {/* HIỆU SUẤT HOẠT ĐỘNG (DỮ LIỆU ĐỘNG) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest"><i className="fa-solid fa-chart-pie mr-1 text-indigo-500"></i> Hiệu suất hoạt động</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 bg-gray-50 border border-gray-200/60 rounded-xl text-center">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tỷ lệ lấp đầy</span>
                                    <span className="text-lg font-mono font-black text-emerald-600">{tiLeLapDay}%</span>
                                </div>
                                <div className="p-3.5 bg-gray-50 border border-gray-200/60 rounded-xl text-center">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tổng giờ thuê</span>
                                    <span className="text-lg font-mono font-black text-emerald-600">{tongGioThue}h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChiTietKhongGian;