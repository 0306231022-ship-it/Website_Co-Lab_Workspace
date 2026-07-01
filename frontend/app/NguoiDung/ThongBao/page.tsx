"use client";
import * as api from '@/API/API';
import * as Thongbao from '@/FUNCTION/ThongBao';
import { useEffect, useState } from 'react';

interface thongbao{
  ID_THONGBAO: number;
  NOI_DUNG: string;
  TIEU_DE: string;
  TRANG_THAI: Number;
  NGAY_TAO:Date
}
interface trang {
 totalPages:number
}
function ThongBao(){
    const [thongbao,setthongbao] =  useState<thongbao[]>([]);
  
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [loading, setLoading] = useState(false);
const[totalitems,setTotalItems]=useState<trang | null>(null);
    useEffect(()=>{

        

        const laydl= async()=>{
            try {
                const dulieu= await api.CallAPI(undefined,{url:`/admin/laythongbao?page=${page}`, PhuongThuc:2})
                alert(JSON.stringify(dulieu))
                if(dulieu.success){
                    setthongbao(dulieu.data);
                    setTotalItems(dulieu.pagination);
                }
            } catch (error) {
                console.error("Lỗi xảy ra:", error);
            }
        }
        laydl()
    },[])
    
    const xoaThongBao = async (id: string | number) => {
        const XacNhan = await Thongbao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn xóa thông báo này?');
        if(!XacNhan) return;


  try {
     const formdata = new FormData();
    formdata.append('ID_THONGBAO', String(id));
    const ketqua = await api.CallAPI(formdata, { 
      url: `/admin/deletebyid`, 
      PhuongThuc: 1 
    });

    if (ketqua.success) {
        Thongbao.ThongBao_ThanhCong(ketqua.message)
      setthongbao((prevThongBao) => prevThongBao.filter((item) => item.ID_THONGBAO !== id));
    } else {
     Thongbao.ThongBao_Loi("Xóa thất bại: " + (ketqua.message || "Lỗi từ server"));
    }
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
   Thongbao.ThongBao_Loi("Có lỗi xảy ra trong quá trình xóa!");
  }
};

const xoaTatCaThongBao = async () => {
  // 1. Thay đổi câu hỏi xác nhận cho phù hợp
  const XacNhan = await Thongbao.ThongBao_XacNhanTT('Bạn có chắc chắn muốn xóa TẤT CẢ thông báo không? Hành động này không thể hoàn tác.');
  if (!XacNhan) return;

  try {
    const ketqua = await api.CallAPI(undefined, { 
      url: `/admin/xoatatca`, 
      PhuongThuc: 1 
    });

    if (ketqua.success) {
      Thongbao.ThongBao_ThanhCong(ketqua.message || "Đã xóa tất cả thông báo");
      setthongbao([]); 
    } else {
      Thongbao.ThongBao_Loi(ketqua.message);
    }
  } catch (error) {
    console.error("Lỗi khi xóa tất cả thông báo:", error);
    Thongbao.ThongBao_Loi("Có lỗi xảy ra trong quá trình xóa!");
  }
};


    return(
        <>
         <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-3">
            <a href="#" className="hover:text-brand-600 transition">Cá nhân</a>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
            <span className="text-slate-800 font-bold">Thông báo</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thông báo của bạn</h1>
          <p className="text-sm text-slate-500 mt-1">Cập nhật những thông tin mới nhất về lịch đặt và hệ thống.</p>
        </div>
        
        {/* VÙNG CHỨA CÁC NÚT THAO TÁC */}
        <div className="flex items-center gap-3">
          <button className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-lg border border-brand-100">
            <i className="fa-solid fa-check-double"></i> Đánh dấu tất cả đã đọc
          </button>
          
          {/* NÚT XÓA TẤT CẢ THÔNG BÁO MỚI THÊM */}
          <button 
  onClick={xoaTatCaThongBao} 
  className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100"
>
  <i className="fa-solid fa-trash-can"></i> Xóa tất cả
</button>
        </div>
      </div>

    

      <div className="space-y-3">

        <div className="p-5 bg-brand-50 border border-brand-100 rounded-2xl flex gap-4 items-start relative hover:shadow-md transition-shadow cursor-pointer group">
          <div className="absolute top-6 right-14 w-2 h-2 bg-brand-500 rounded-full hidden sm:block"></div>
          
          

          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm shrink-0 text-xl border border-amber-100">
            <i className="fa-regular fa-clock"></i>
          </div>
          
          <div className="flex-1 pr-10">
           {
  thongbao && thongbao.length > 0 ? (
    thongbao.map((item, index) => (
        
      // Cần có thuộc tính key ở phần tử cha bao ngoài cùng
      <div key={item.ID_THONGBAO || index} className="mb-4 p-4 border rounded-xl bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {String(item.NGAY_TAO) || "Lịch sắp tới"}
          </span>
        </div>
        
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {item.TIEU_DE || "Sắp đến giờ sử dụng không gian!"}
          {item.TIEU_DE && (
            <span className="w-2 h-2 bg-brand-500 rounded-full sm:hidden"></span>
          )}
        </h3>
        <button 
        onClick={(e) => {
          e.stopPropagation(); // Ngăn chặn sự kiện click lan ra thẻ div bọc ngoài nếu có
          xoaThongBao(item.ID_THONGBAO); // <- TRUYỀN ID CỦA THÔNG BÁO VÀO ĐÂY
        }}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100" 
        title="Xóa thông báo này"
      >
        <i className="fa-regular fa-trash-can text-sm"></i>
      </button>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          {/* Render nội dung động từ API */}
          {item.NOI_DUNG || (
            <>
              Lịch đặt <strong>#CL-88921</strong> của bạn tại Khu làm việc mở (Zone A) sẽ bắt đầu sau <span className="text-rose-500 font-semibold">30 phút nữa</span>. Nhớ chuẩn bị sẵn mã QR để Check-in nhé!
            </>
          )}
        </p>
      </div>
    ))
  ) : (
    // Component giao diện trống bạn đã thiết kế ở bước trước
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border-2 border-slate-200 border-dashed rounded-3xl">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-inner border border-slate-100">
        <i className="fa-regular fa-bell-slash text-4xl"></i>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Không có thông báo nào!</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        Bạn đã xem hết tất cả các thông báo. Những cập nhật mới nhất về lịch đặt chỗ, giao dịch và hệ thống sẽ xuất hiện tại đây.
      </p>
    </div>
  )
}
           
           
          </div>
        </div>


      </div>

      {/* GIAO DIỆN PHÂN TRANG (PAGINATION) MỚI */}
      <div className="pt-6 flex items-center justify-center gap-2">

        <button  onClick={()=>{setPage(p=>p-1)}} disabled={page===1} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-colors shadow-sm disabled:opacity-50">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        
        
        <span className="px-2 text-slate-400 font-bold">{page}</span>
        
        

        <button  onClick={()=>{setPage(p=>p+1)}} disabled={page===totalitems?.totalPages} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-colors shadow-sm">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

    </div>
        </>
    )
};

export default ThongBao;