"use client";
import * as ThongBao from '@/FUNCTION/ThongBao';
import * as api from '@/API/API';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { objChiNhanh } from '@/interface/ChiNhanh';
import { KhongGian } from '@/interface/KhongGian';
import { ThietBi } from '@/interface/ThietBi';
import Image from "next/image";
import * as fun from '@/FUNCTION/function';
import { Ghe } from '@/interface/ghe';
import SoDoGheCanvas from '@/component/Ghe';
import { useModalContext } from "@/context/QuanLiMoal";
import { useRouter } from 'next/navigation';
import {socket} from '@/FUNCTION/socket';
interface LichDaDat{
    KHUNG_BATDAU:string,
    KHUNG_KETTHUC: string
}
function ChiTietKhongGian() {
  const { OpenMoDal } = useModalContext();
  const { idChiNhanh , idKhongGian } = useParams();
  const [loading,setloading] = useState<boolean>(false);
  const [err, setErr] = useState<string[]>([]);
  const [chinhanh,setchinhanh] = useState< objChiNhanh | null>(null);
  const [khonggian, setkhonggian]  = useState< KhongGian | null>(null);
  const [ThietBi,setThietBi] =  useState<ThietBi[]>([]); 
  const [page,setpage] = useState<number>(1);
  const [TongDanhSach,setTongDanhSach] = useState<number>(1);
  const [ghe,setghe] = useState<Ghe[]>([]);
  const [lichDaDat, setLichDaDat] = useState<LichDaDat[]>([]);
  const router = useRouter();
     const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayDate = getTodayString();
  const [ngayDat, setNgayDat] = useState(todayDate);
  const [gioBatDau, setGioBatDau] = useState<string>('');
 const [gioKetThuc, setGioKetThuc] = useState<string>('');
 const batDau = new Date(gioBatDau);
  const ketThuc = new Date(gioKetThuc);
   const tongGio = (ketThuc.getTime() - batDau.getTime()) / (1000 * 60 * 60);
  useEffect(()=>{
    const laydl = async()=>{
       setloading(true)
      try {
        const [dulieu1,dulieu2] = await Promise.all([
          api.CallAPI(undefined,{url:`/admin/ChiTiet_KhongGian?IDKG=${idKhongGian}&IDCN=${idChiNhanh}`,PhuongThuc:2}),
          api.CallAPI(undefined,{url:`/admin/DanhSach_theo_khonggian?IDKG=${idKhongGian}`, PhuongThuc:2})
        ])
        if(dulieu1.validate){
          setErr(dulieu1.errors);
          return;
        }
        if (dulieu1.success) {
          setchinhanh(dulieu1.DanhSach.ChiNhanh);
          setkhonggian(dulieu1.DanhSach.KhongGian.KhongGian);
          socket.emit("join_space_room", {
            idKhongGian: idKhongGian,
            loaiKhongGian: dulieu1.DanhSach.KhongGian.KhongGian.LOAI_KHONG_GIAN
          });
          setThietBi(dulieu1.DanhSach.ThietBi.DanhSach);
          setTongDanhSach(dulieu1.DanhSach.ThietBi.TongDanhSach);
          const danhSachGheChuan = dulieu1.DanhSach.Ghe || dulieu1.DanhSach.ghe || dulieu1.DanhSach.DanhSachGhe || [];
          setghe(danhSachGheChuan);
        }
        if (dulieu2 && dulieu2.success) {
          setLichDaDat(dulieu2.dulieu || []);
        } else {
          setLichDaDat([]);
        }
      } catch (error) {
         console.error("Lỗi khi tải thông tin không gian:", error);
         ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin không gian');
      } finally {
        setloading(false)
      }
    }
    laydl();
  },[idChiNhanh,idKhongGian])
  useEffect(() => {
          socket.on("update_schedule", async(data) => {
            if (data.success) {
                   const [dulieu1,dulieu2] = await Promise.all([
          api.CallAPI(undefined,{url:`/admin/ChiTiet_KhongGian?IDKG=${idKhongGian}&IDCN=${idChiNhanh}`,PhuongThuc:2}),
          api.CallAPI(undefined,{url:`/admin/DanhSach_theo_khonggian?IDKG=${idKhongGian}`, PhuongThuc:2})
        ])
        if(dulieu1.validate){
          setErr(dulieu1.errors);
          return;
        }
        if (dulieu1.success) {
          setchinhanh(dulieu1.DanhSach.ChiNhanh);
          setkhonggian(dulieu1.DanhSach.KhongGian.KhongGian);
          socket.emit("join_space_room", {
            idKhongGian: idKhongGian,
            loaiKhongGian: dulieu1.DanhSach.KhongGian.KhongGian.LOAI_KHONG_GIAN
          });
          setThietBi(dulieu1.DanhSach.ThietBi.DanhSach);
          setTongDanhSach(dulieu1.DanhSach.ThietBi.TongDanhSach);
          const danhSachGheChuan = dulieu1.DanhSach.Ghe || dulieu1.DanhSach.ghe || dulieu1.DanhSach.DanhSachGhe || [];
          setghe(danhSachGheChuan);
        }
        if (dulieu2 && dulieu2.success) {
          setLichDaDat(dulieu2.dulieu || []);
        } else {
          setLichDaDat([]);
        }
            } else {
              ThongBao.ThongBao_CanhBao(data.message || data.mesage);
            }
          });
          return () => {
            socket.off("update_schedule");
          };
        }, [idKhongGian, idChiNhanh]);


  const getTrangThaiConfig = (trangThai: number) => {
  switch (trangThai) {
    case 1:
      return { text: "Đang hoạt động", className: "bg-emerald-50 text-emerald-600" };
    case 0:
      return { text: "Ngừng hoạt động", className: "bg-red-50 text-red-600" };
    case 2:
      return { text: "Đang bảo trì", className: "bg-amber-50 text-amber-600" };
    default:
      return { text: "Không rõ", className: "bg-gray-50 text-gray-600" };
  }
};
  const PhanTrang = async(HanhDong: 'next' | 'prev' | 'search', trangChiDinh?: number)=>{
    try {
       let trangMoi = page;
        if (HanhDong === 'next') trangMoi = page + 1;
        else if (HanhDong === 'prev') trangMoi = Math.max(page - 1, 1);
        if (trangChiDinh) trangMoi = trangChiDinh;
        setpage(trangMoi);
        const dulieu = await api.CallAPI(undefined,{url:`/admin/DanhSachThietBi_theoKhongGian?page=${page}&IDKG=${idKhongGian}` , PhuongThuc:2});
        if(dulieu.success){
          setThietBi(dulieu.DanhSach);
          setTongDanhSach(dulieu.TongDanhSach)
        }
    } catch (error) {
       console.error("Lỗi khi tải thông tin thiết bị:", error);
         ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin thiết bị');
    }
  }
 const handleGheSelect = (thongTinGhe: Ghe) => {
    OpenMoDal({thongTinGhe},{TenTrang:'ThongTin_ghe'});
  };
   const fetchLichDaDat = async(selectedDate : string) => {
      setloading(true)
      try {
          const data = await api.CallAPI(undefined,{url:`/admin/lichdatkhonggian_theothoigian?THOIGIAN=${fun.formatToBackendDateTime(selectedDate)}&IDKG=${idKhongGian}` , PhuongThuc:2});
      
          if(data.validate){
              setErr(data.errors);
              ThongBao.ThongBao_CanhBao(data.message)
              return;
          }
           if (data && data.success) {
              setLichDaDat(data.dulieu || []);
          } else {
              setLichDaDat([]);
          }
      } catch (error) {
           console.error("Lỗi lấy danh sách lịch đặt hiện tại theo ghế:", error);
      } finally {
          setloading(false)
      }
    };
      const handleDatCho = async() => {
        if (gioKetThuc <= gioBatDau) {
          ThongBao.ThongBao_CanhBao("Giờ kết thúc phải lớn hơn giờ bắt đầu!");
          return;
        }
        try {
             const dataToSend = new FormData();
            dataToSend.append('ID_KHONG_GIAN' , String(idKhongGian));
            dataToSend.append('KHUNG_BATDAU', String(fun.formatToBackendDateTime(gioBatDau)));
            dataToSend.append('KHUNG_KETTHUC' , String(fun.formatToBackendDateTime(gioKetThuc)));
            dataToSend.append("LoaiND", String(0));
            const DatLich = await api.CallAPI(dataToSend,{url:'/nguoiDung/LichDat', PhuongThuc:1});
           
             if(DatLich.validate){
                setErr(DatLich.errors);
                ThongBao.ThongBao_CanhBao(DatLich.message)
                return;
            }
            if(DatLich.success){
                 const chuyenhuong_thanhtoan = await api.CallAPI(undefined,{url:`/NguoiDung/ThanhToan?id=${DatLich.ID_LICHDAT}`, PhuongThuc:2});
                 if (chuyenhuong_thanhtoan && chuyenhuong_thanhtoan.success && chuyenhuong_thanhtoan.paymentUrl) {
                  window.open(chuyenhuong_thanhtoan.paymentUrl, '_blank')
                  } else {
                  ThongBao.ThongBao_CanhBao(chuyenhuong_thanhtoan?.message || "Không thể khởi tạo link thanh toán từ hệ thống.");
                }        
            }
            if(DatLich.success===false){
                ThongBao.ThongBao_Loi(DatLich.message)
            }
        } catch (error) {
            console.error("Lỗi đặt lịch:", error);
            ThongBao.ThongBao_CanhBao('Có lỗi sảy ra!')
        }
      };



  if(err && err.length>0){
    return (
        <div className="w-full mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-left animate-pulse">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-xs mb-1.5">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Thông tin không gian không hợp lệ:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {err.map((item, index) => (
              <li key={index} className="text-[11px] text-red-500 font-medium">
                {item}
              </li>
            ))}
          </ul>
        </div>
    
    )
  }
 if (loading) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 animate-pulse">
      {/* 1. Breadcrumb & Nút quay lại giả lập */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
        <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
      </div>

      {/* 2. CARD THÔNG TIN CHÍNH GIẢ LẬP */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 rounded-xl h-48 bg-slate-200"></div>
        <div className="md:col-span-8 flex flex-col justify-between py-2">
          <div className="space-y-3">
            <div className="h-7 bg-slate-200 rounded-md w-2/3"></div>
            <div className="h-5 bg-slate-200 rounded-md w-1/4"></div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
          </div>
        </div>
      </div>

      {/* 3. BẢNG THÔNG SỐ NHANH GIẢ LẬP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. KHỐI LƯỚI THIẾT BỊ VÀ SƠ ĐỒ/FORM GIẢ LẬP */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Cột thiết bị bên trái */}
        <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            </div>
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-6 bg-slate-200 rounded w-full mt-4"></div>
        </div>

        {/* Cột sơ đồ ghế / Form đặt lịch bên phải */}
        <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-32 bg-slate-100 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-slate-400">Đang chuẩn bị khu vực...</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-9 bg-slate-200 rounded-xl w-full"></div>
              <div className="h-9 bg-slate-200 rounded-xl w-full"></div>
            </div>
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-full mt-4"></div>
        </div>
      </div>
    </div>
  );
}
  return (
    <>
      {/* Thêm px-4 vào container chính */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <nav className="text-xs text-gray-500 flex items-center gap-2">
            <span>Trang chủ</span> <span>&gt;</span>
            <span>Không gian</span> <span>&gt;</span>
            <span className="text-gray-800 font-medium">Chi tiết không gian</span>
          </nav>

          {/* NÚT QUAY LẠI */}
          <button 
             onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-600 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-200 shadow-sm transition dynamic-btn"
          >
            ⬅ <span>Quay lại</span>
          </button>
        </div>


        <div className="space-y-6">
            
          {/* CARD THÔNG TIN CHÍNH */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 rounded-xl overflow-hidden h-48 bg-gray-200">
             <Image 
                src={`http://localhost:3001/${khonggian?.HINHANH}`} 
                width={500}
                height={192}
                 unoptimized
                alt={`${khonggian?.TEN_KHONG_GIAN}`} className="w-full h-48 object-cover" />
            </div>
            <div className="md:col-span-8 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{khonggian?.TEN_KHONG_GIAN}</h1>
                {(() => {
                  if (!khonggian) return null;
                  const config = getTrangThaiConfig(khonggian?.TRANG_THAI);
                  return (
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md mt-2 ${config.className}`}>
                      {config.text}
                   </span>
                     );
                  })()}
              </div>
              <div className="space-y-2 mt-4 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  📍 <span className="font-medium text-gray-800">{chinhanh?.TEN_CHI_NHANH || chinhanh?.TenChiNhanh}</span>
                </p>
                <p className="flex items-center gap-2 text-gray-500">
                  {chinhanh?.DIA_CHI || chinhanh?.DiaChi}
                </p>
              </div>
            </div>
          </div>

          {/* BẢNG THÔNG SỐ NHANH */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-lg">🏢</div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase">Loại không gian</p>
                <p className="text-sm font-bold text-gray-800">{khonggian?.LOAI_KHONG_GIAN === 1 ? 'không gian chung' : ' Phòng họp cá nhân'}</p>
              </div>
            </div>
            {
              khonggian?.LOAI_KHONG_GIAN === 1 && (
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center text-lg">🪑</div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase">Số ghế</p>
                <p className="text-sm font-bold text-gray-800">{ghe.length} ghế</p>
              </div>

            </div>
              )
            }
       
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center text-lg">📦</div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase">Thiết bị</p>
                <p className="text-sm font-bold text-gray-800">{TongDanhSach} thiết bị</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center text-lg">📅</div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase">Ngày tạo</p>
                <p className="text-sm font-bold text-gray-800">{fun.formatDate(String(khonggian?.NGAY_TAO))}</p>
              </div>
            </div>
          </div>

          {/* KHỐI LƯỚI THIẾT BỊ VÀ SƠ ĐỒ GHẾ */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* THIẾT BỊ (PHÂN TRANG) */}
            <div className="md:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-gray-800">Thiết bị trong không gian ({TongDanhSach})</h3>
                  <p className="text-[11px] text-gray-400">Danh sách thiết bị hỗ trợ tại khu vực</p>
                </div>
                
                  <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col gap-3"> 
  {/* Thay 'flex items-center' bằng 'flex flex-col' nếu ThietBi có nhiều hơn 1 phần tử */}
  {
    ThietBi && ThietBi.length > 0 ? (
      ThietBi.map((item) => (
        <div key={item.ID_THIET_BI}>
          <div className="flex items-center gap-3 w-full"> 
            {/* Khối chứa Icon */}
            <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center text-lg border shadow-sm flex-shrink-0">
              <i className={`${item.HINH_ANH}`}></i>
            </div>
            
            {/* Khối chứa Thông tin */}
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {item.TEN_THIET_BI}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Số lượng: <span className="font-bold text-gray-600">{item.SO_LUONG}</span>
              </p>
            </div>
          </div>
        </div>
      ))
    ) : (
      // Khối Empty State giữ nguyên
      <div className="empty-state w-full py-4 text-center">
        <div className="empty-state__icon flex justify-center mb-2">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <h3 className="empty-state__title text-sm text-gray-500 font-medium">Chưa có thiết bị nào</h3>
      </div>
    )
  }
</div>
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 text-[11px]">
                <span className="text-gray-400">Hiển thị {(5*page)-TongDanhSach+1}-{TongDanhSach*page} / {TongDanhSach}</span>
                <div className="inline-flex gap-1">
                  <button onClick={()=>{PhanTrang('prev')}} disabled={page === 1} aria-disabled className="w-6 h-6 rounded border border-gray-200 text-gray-400 bg-gray-50 flex items-center justify-center cursor-not-allowed" >◀</button>
                  <span className="w-6 h-6 rounded bg-emerald-600 text-white font-medium flex items-center justify-center">{page}</span>
                  <button onClick={()=>{PhanTrang('next')}} disabled={page >= TongDanhSach / 5} className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center transition">▶</button>
                </div>
              </div>
            </div>

          {/* SƠ ĐỒ GHẾ TRỰC QUAN */}
            {
              khonggian?.LOAI_KHONG_GIAN === 1 ? (
                <div className="md:col-span-7 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
  <div>


    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
      <div>
        <h3 className="text-sm font-bold text-gray-800">Sơ đồ vị trí chỗ ngồi</h3>
        <p className="text-[11px] text-gray-400">Nhấp vào vị trí ghế trống trên sơ đồ để tiến hành lựa chọn</p>
      </div>
      <div className="flex gap-3 text-[10px] text-gray-500 font-medium">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Trống</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Đang có người</span>
      </div>
    </div>
    <SoDoGheCanvas danhSachGhe={ghe} onGheClick={handleGheSelect}  isReadOnly={true} />
     <div className="mt-4 p-3 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl text-center text-xs font-medium max-w-md mx-auto">Vui lòng chọn một ghế trống bất kỳ trên sơ đồ</div>
     
  </div>
</div>
              ) : (
                <div className="md:col-span-7 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div>
        {/* Tiêu đề góc */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-800">Thông tin đặt phòng họp</h3>
          <p className="text-[11px] text-gray-400">Vui lòng điền đầy đủ thông tin để tiến hành đặt không gian họp</p>
        </div>
                    <div className="text-right">
                              <span className="text-2xl font-black text-blue-600">{fun.formatCurrency(String(khonggian?.DON_GIA))}</span>
                              <span className="text-xs font-bold text-slate-400"> / giờ</span>
                            </div>
        {/* Các trường nhập liệu */}
        <div className="space-y-4">
    
          <div className="grid grid-cols-2 gap-3">
           
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Giờ bắt đầu</label>
              <input 
                type="datetime-local"
                  value={gioBatDau}
                    min={todayDate}
                    onChange={(e) =>{
                        setGioBatDau(e.target.value);
                        fetchLichDaDat(e.target.value);
                        setNgayDat(e.target.value);
                    }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700"
              />
            </div>
            {/* Giờ kết thúc */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Giờ kết thúc</label>
              <input 
                type="datetime-local"
                value={gioKetThuc}
                min={gioBatDau}
                onChange={(e) => setGioKetThuc(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700"
              />
            </div>
          </div>

    
      

       <div>
              <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-calendar-xmark text-slate-400"></i> Lịch kín ngày : { fun.formatDate(ngayDat) }
              </h4>
            </div>
       <div className="w-full max-w-md mx-auto p-4 bg-white rounded-2xl shadow-sm border border-slate-100">


  {/* Khung chứa danh sách - Hỗ trợ cuộn chuẩn UX */}
  {lichDaDat && lichDaDat.length > 0 ? (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-rose-200">
      {lichDaDat.map((item, index) => (
        <div
          key={ index} // Sử dụng ID nếu có, nếu không dùng index trực tiếp tại thẻ ngoài cùng
          className="flex items-center justify-between border border-rose-100 bg-gradient-to-r from-rose-50/50 to-transparent px-4 py-3 rounded-xl hover:border-rose-200 transition-all duration-200"
        >
          {/* Thời gian */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-100/60 flex items-center justify-center text-rose-500">
              <i className="fa-regular fa-clock text-xs"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">
                {fun.formatTime(item.KHUNG_BATDAU)} - {fun.formatTime(item.KHUNG_KETTHUC)}
              </span>
              <span className="text-[10px] text-slate-400">Thời gian cố định</span>
            </div>
          </div>

          {/* Trạng thái */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Đã đặt
          </span>
        </div>
      ))}
    </div>
  ) : (
    /* Giao diện trống (Empty State) tinh tế hơn */
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
        <i className="fa-regular fa-calendar-xmark text-sm"></i>
      </div>
      <p className="text-xs font-medium text-slate-500">
        Không có lịch đặt nào trong ngày hôm nay
      </p>
    </div>
  )}
</div>
          </div>
        </div>
      </div>
       <div className="flex justify-between items-end mb-4 px-1">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-0.5">Vui lòng kiểm tra lại giờ đặt</span>
                      <span className="text-sm font-bold text-slate-800">Tạm tính: {tongGio || 0} giờ</span>
                    </div>
                    <span className="text-3xl font-black text-blue-600 tracking-tight">{fun.formatCurrency(((tongGio * Number(khonggian?.DON_GIA)) || 0))}</span>
                  </div>
      {/* Nút hành động */}
      <div className="mt-5 border-t border-gray-100 pt-4">
        <button onClick={()=>{handleDatCho()}} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-indigo-100">
          Xác nhận thông tin phòng họp
        </button>
      </div>
    </div>
              )
            }
         
          </div>

          {/* LƯU Ý & LIÊN HỆ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-xs text-gray-600 space-y-1.5">
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">💡 Lưu ý sử dụng không gian</p>
              <p className="pl-2">• Vui lòng ngồi đúng vị trí ghế hoặc không gian đã chọn để tránh ảnh hưởng tới thành viên khác.</p>
              <p className="pl-2">• Giữ gìn vệ sinh chung tại khu vực OpenSpace, không đem đồ ăn nặng mùi vào phòng.</p>
              <p className="pl-2">• Khi đặt chổ thành công, vui lòng thanh toán trước khi sử dụng.</p>
               <p className="pl-2">• Sau 15 phút sau khi đặt đơn, nếu bạn chưa thanh toán. Hệ thống sẽ hủy đơn đặt chỗ của bạn!</p>
               <p className="pl-2">• Không chấp nhận mọi sự chậm chễ đến từ khách hàng!</p>

            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-lg border">🎧</div>
              <div>
                <p className="text-xs font-bold text-gray-800">Gặp sự cố về chỗ ngồi?</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Liên hệ quản lý chi nhánh hoặc gọi hotline để đổi vị trí</p>
                <p className="text-sm font-bold text-emerald-600 mt-1">📞 0374 207 259</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default ChiTietKhongGian;