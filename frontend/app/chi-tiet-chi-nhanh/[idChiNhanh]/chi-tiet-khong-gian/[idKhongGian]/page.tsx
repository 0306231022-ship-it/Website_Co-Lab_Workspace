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
import GheNgoi from '@/component/ThongTinGhe';
import { useRouter } from 'next/navigation';
import {socket} from '@/FUNCTION/socket';
import DatPhong from '@/component/DatPhong';
function ChiTietKhongGian() {

  const { idChiNhanh , idKhongGian } = useParams();
  const [loading,setloading] = useState<boolean>(false);
  const [err, setErr] = useState<string[]>([]);
  const [chinhanh,setchinhanh] = useState< objChiNhanh | null>(null);
  const [khonggian, setkhonggian]  = useState< KhongGian | null>(null);
  const [ThietBi,setThietBi] =  useState<ThietBi[]>([]); 
  const [page,setpage] = useState<number>(1);
  const [TongDanhSach,setTongDanhSach] = useState<number>(1);
    const [ghe,setghe] = useState<Ghe[]>([]);

  const router = useRouter();
    
   const laydl = async()=>{
       setloading(true)
      try {
        const dulieu1 = await api.CallAPI(undefined,{url:`/admin/ChiTiet_KhongGian?IDKG=${idKhongGian}&IDCN=${idChiNhanh}`,PhuongThuc:2});
       
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
      } catch (error) {
         console.error("Lỗi khi tải thông tin không gian:", error);
         ThongBao.ThongBao_CanhBao('Lỗi khi tải thông tin không gian');
      } finally {
        setloading(false)
      }
    }
    useEffect(()=>{
      const haha = async()=>{
        await laydl()
      }
      haha();
       // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
  useEffect(() => {
          socket.on("update_schedule", async(data) => {
            if (data.success) {
              await laydl();
            }
               
          });
          return () => {
            socket.off("update_schedule");
          };
           // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);


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
                <GheNgoi DuLieu={ghe} />

              ) : (
                <DatPhong DuLieu={String(khonggian?.DON_GIA)} />
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