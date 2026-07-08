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
import ThongTin from '@/app/Modal/ThongTin_Ghe_Dat';
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
  const [ghe,setghe] = useState<Ghe[]>([])
  useEffect(()=>{
    const laydl = async()=>{
       setloading(true)
      try {
        const dulieu = await api.CallAPI(undefined,{url:`/admin/ChiTiet_KhongGian?IDKG=${idKhongGian}&IDCN=${idChiNhanh}`,PhuongThuc:2})
        if(dulieu.validate){
          setErr(dulieu.errors);
          return;
        }
        if(dulieu.success){
          setchinhanh(dulieu.DanhSach.ChiNhanh);
          setkhonggian(dulieu.DanhSach.KhongGian[0]);
          setThietBi(dulieu.DanhSach.ThietBi.DanhSach);
          setTongDanhSach(dulieu.DanhSach.ThietBi.TongDanhSach);
          setghe(dulieu.DanhSach.Ghe)
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="font-medium text-slate-500 text-sm tracking-wide">Đang tải dữ liệu không gian...</p>
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
                  📍 <span className="font-medium text-gray-800">{chinhanh?.TEN_CHI_NHANH}</span>
                </p>
                <p className="flex items-center gap-2 text-gray-500">
                  {chinhanh?.DIA_CHI}
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
                <p className="text-sm font-bold text-gray-800">{khonggian?.LOAI_KHONG_GIAN === 1 ? 'không gian chung' : 'phogf họp cá nhân'}</p>
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
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Đang chọn</span>
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

        {/* Các trường nhập liệu */}
        <div className="space-y-4">
    
          <div className="grid grid-cols-2 gap-3">
           
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Giờ bắt đầu</label>
              <input 
                type="datetime-local" 
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700"
              />
            </div>
            {/* Giờ kết thúc */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Giờ kết thúc</label>
              <input 
                type="datetime-local" 
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700"
              />
            </div>
          </div>

    
      

       <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-calendar-xmark text-slate-400"></i> Lịch kín ngày :08/07/2026
              </h4>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">

        <div  className="flex items-center justify-between border border-rose-100/60 bg-rose-50/30 px-4 py-2.5 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <i className="fa-regular fa-clock text-rose-400 text-xs"></i>
            <span className="text-xs font-extrabold text-rose-600">
              09:00 - 10 : 00
            </span>
          </div>
          <span className="text-[10px] font-bold text-rose-500 bg-white px-2 py-0.5 rounded shadow-sm border border-rose-100">
            Đã đặt
          </span>
        </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Nút hành động */}
      <div className="mt-5 border-t border-gray-100 pt-4">
        <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-indigo-100">
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
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-lg border">🎧</div>
              <div>
                <p className="text-xs font-bold text-gray-800">Gặp sự cố về chỗ ngồi?</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Liên hệ quản lý chi nhánh hoặc gọi hotline để đổi vị trí</p>
                <p className="text-sm font-bold text-emerald-600 mt-1">📞 028 7109 8888</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default ChiTietKhongGian;