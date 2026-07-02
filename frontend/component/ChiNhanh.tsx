import React from "react";
import Image from "next/image";
import Link from "next/link";
interface objChiNhanh{
    ID_CHI_NHANH: number;
    TEN_CHI_NHANH : string;
    DIA_CHI:string;
    NGAY_NHAP: Date;
    NGAY_CAP_NHAT:Date;
    TRANG_THAI:number;
    NGAY_BAO_TRI:Date;
    NGAY_XONG:Date;
    HINHANH:string;
    TongLoai1:number;
    TongLoai2: number;
}
interface ChiNhanh{
    DuLieu:objChiNhanh
}
export default function ChiNhanh({DuLieu} : ChiNhanh){

    return(
        <>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group cursor-pointer">
        <div className="relative">
                  <Image 
                     src={`http://localhost:3001/${DuLieu.HINHANH}`} 
                     width={500}
                     height={192} 
                     alt={`${DuLieu.TEN_CHI_NHANH}`} unoptimized className="w-full h-48 object-cover" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] uppercase font-extrabold px-3 py-1.5 rounded-full shadow-sm">
                    {
                        DuLieu.TRANG_THAI === 1 ? 'Đang họat động' :'Ngưng hoạt động hoặc đang bảo trì'
                    }
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{DuLieu.TEN_CHI_NHANH}</h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      <i className="fa-solid fa-map-location-dot mr-1.5 text-slate-400"></i>
                     {DuLieu.DIA_CHI}
                    </p>
                  </div>
                  <div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1.5" title="Bàn làm việc tự do"><i className="fa-solid fa-desktop text-blue-500"></i> <span>{DuLieu.TongLoai1} không gian làm việc chung</span></div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="flex items-center gap-1.5" title="Phòng họp"><i className="fa-solid fa-people-roof text-emerald-500"></i> <span>{DuLieu.TongLoai2} phòng họp</span></div>
                      </div>
                    </div>
                    <Link href={`/chi-tiet-chi-nhanh/${DuLieu.ID_CHI_NHANH}`}  className="w-full mt-5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-100 font-bold py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2">
                      <span>Xem chi tiết không gian</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </Link>
                  </div>
                </div>
                   </div>
                   
        </>
    )
};