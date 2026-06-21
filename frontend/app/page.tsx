// src/app/page.tsx
"use client";
import React from "react";
import* as api from "@/API/API";
import* as ThongBao from "@/FUNCTION/ThongBao";
export default function HomePage() {
const fetchData = async () => {
    try {
      const ketqua= await api.CallAPI(undefined,{PhuongThuc:1,url:'/NguoiDung/hello'});
      ThongBao.ThongBao_ThanhCong(ketqua.message );
    }catch (error) {
      ThongBao.ThongBao_Loi("Lỗi khi gọi API: " + error);
    }
};
  return (
    <main className="p-10 text-center">
      <h1 className="text-4xl font-bold text-blue-600">
        Chào mừng tới trang web Next.js của tôi!
      </h1>
      <p className="mt-4 text-gray-600">
        Hệ thống giao diện kết nối với Backend Express.js
      </p>
      <button 
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={fetchData}
      >
        Bắt đầu
      </button>
    </main>
    
  );
}