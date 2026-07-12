"use client";
import * as api from '@/API/API';
import React, { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { Ghe } from '@/interface/ghe';
import SoDoGheCanvas from '@/component/Ghe';
import { useModalContext } from "@/context/QuanLiMoal";
import {socket} from '@/FUNCTION/socket';
import * as ThongBao from '@/FUNCTION/ThongBao';

function CauHinh2D() {
  const { idkhonggian } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [ghe, setGhe] = useState<Ghe[]>([]);
  const [TenKG,setTenKG] = useState<string>('');
  const { OpenMoDal } = useModalContext();

  useEffect(() => {
    const loadGhe = async () => {
      setLoading(true);
      try {
        const [response1,response2] = await Promise.all([
           api.CallAPI(undefined, {url: `/admin/danhsachghe_idkg?id=${idkhonggian}`,PhuongThuc: 2}),
            api.CallAPI(undefined,{url:`/admin/layten_khonggian?id=${idkhonggian}`, PhuongThuc:2})
        ])
        if (response1.success) {
          setGhe(response1.dulieu);
        }
        if(response2.success){
          setTenKG(response2.dulieu);
        }else{
          ThongBao.ThongBao_CanhBao(response2.message)
        }
      } catch (error) {
        console.error("Lỗi tải danh sách ghế:", error);
      } finally {
        setLoading(false);
      }
    };
    if (idkhonggian) loadGhe();
  }, [idkhonggian]);

    useEffect(() => {
      socket.on('ThemGhe', (item) => {
        setGhe(item.ThongTinGhe)
  });

  return () => {
    socket.off('ThemGhe');
  };
}, []);

    const handleGheSelect = (thongTinGhe: Ghe) => {
        OpenMoDal(thongTinGhe.ID_GHE,{TenTrang:'ThongTinGhe'})
    };
  const handleDragGhe = (idGhe: number, newX: number, newY: number) => {
  setGhe((prev) =>
    prev.map((g) =>
      g.ID_GHE === idGhe ? { ...g, TOA_X: Math.round(newX), TOA_Y: Math.round(newY) } : g
    )
  );
};

  const handleLuuSoDo = async () => {
    if (ghe.length === 0) ThongBao.ThongBao_CanhBao("Không có dữ liệu ghế để lưu!");
  setLoading(true);
  try {
    const duLieuToiGian = ghe.map(g => ({
      ID_GHE: g.ID_GHE,
      TOA_X: g.TOA_X,
      TOA_Y: g.TOA_Y
    }));
    const formData = new FormData();
    formData.append("danhSachGhe", JSON.stringify(duLieuToiGian));
    const res = await api.CallAPI(formData, {url: "/admin/CapNhat_ToaDo",PhuongThuc: 1});
    if (res.success) {
      ThongBao.ThongBao_ThanhCong(res.message);
    }
  } catch (error) {
    console.error("Lỗi lưu sơ đồ:", error);
    ThongBao.ThongBao_CanhBao("Có lỗi xảy ra khi lưu sơ đồ!");
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="fixed inset-0 w-screen h-screen bg-slate-50 z-50 flex flex-col overflow-hidden">
    {/* HEADER */}
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-3xs">
      <div className="flex items-center space-x-4">
        <button type="button" onClick={() => window.history.back()} className="flex items-center space-x-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer group">
          <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-0.5"></i>
          <span>Quay về</span>
        </button>
        <div className="h-6 w-px bg-gray-200"></div>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm">
            <i className="fa-solid fa-map-location-dot"></i>
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">Trình thiết kế Sơ đồ Ghế 2D</h1>
            <p className="text-xs text-gray-400 font-medium">Trên không gian: <span className="text-slate-900 font-bold">{TenKG}</span></p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button type="button" onClick={()=>{OpenMoDal({id:idkhonggian, toa_x:100 , toa_y:100},{TenTrang:'ThemGhe'})}} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center cursor-pointer">
          <i className="fa-solid fa-plus mr-1.5 text-[10px]"></i> Thêm ghế mới
        </button>
        <button type="button" onClick={handleLuuSoDo} disabled={loading} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center cursor-pointer disabled:opacity-50">
          <i className="fa-solid fa-floppy-disk mr-1.5 text-[10px]"></i> {loading ? "Đang lưu..." : "Lưu vị trí sơ đồ"}
        </button>
      </div>
    </header>

    {/* VIEWPORT THIẾT KẾ */}
    <main className="flex-1 flex overflow-hidden relative">
      {/* THANH BÊN CHÚ GIẢI */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Chú giải trạng thái</h3>
            <div className="space-y-2.5 text-xs font-bold text-gray-600">
              <div className="flex items-center space-x-2.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="w-4 h-4 rounded bg-[#10b981] border border-gray-300 inline-block shrink-0"></span>
                <span>Trống / Sẵn sàng</span>
              </div>
              <div className="flex items-center space-x-2.5 bg-indigo-50/40 p-2 rounded-lg border border-indigo-100/50">
                <span className="w-4 h-4 rounded bg-[#ef4444] inline-block shrink-0"></span>
                <span className="text-indigo-900">Đang có khách ngồi</span>
              </div>
     
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
            <h4 className="text-xs font-black text-gray-700 flex items-center">
              <i className="fa-solid fa-circle-info mr-1.5 text-indigo-500"></i> Hướng dẫn Admin
            </h4>
            <ul className="text-[11px] text-gray-500 space-y-1.5 list-disc pl-3.5 leading-relaxed font-medium">
              <li><b className="text-gray-700">Kéo thả:</b> Nhấn giữ chuột vào ghế và di chuyển để đổi vị trí 2D.</li>
              <li><b className="text-gray-700">Chỉnh sửa:</b> Click chuột vào ghế bất kỳ để bật cửa sổ cấu hình chi tiết.</li>
            </ul>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 text-center font-medium">Co-Lab Map Engine v2.0</div>
      </aside>

    
<div className="w-full bg-slate-100/60 p-4 md:p-8 flex flex-col items-center justify-center overflow-hidden relative select-none rounded-xl">
    
    {/* Box đệm căn giữa cố định */}
    <div className="w-full flex justify-center items-center">
        <SoDoGheCanvas 
            danhSachGhe={ghe} 
            onGheClick={handleGheSelect} 
            setGhe={setGhe} 
            isReadOnly={false}
            onDragGhe={handleDragGhe}
        />
    </div>
    
    {/* Nhãn hệ thống nhỏ góc dưới */}
    <div className="mt-4 bg-slate-900/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center space-x-2 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Chế độ xem trực quan sơ đồ không gian</span>
    </div>
</div>
    </main>

  </div>
);
}

export default CauHinh2D;