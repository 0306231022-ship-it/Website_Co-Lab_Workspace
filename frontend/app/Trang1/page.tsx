// BẮT BUỘC: Dòng này biến file này thành Client Component để dùng được onClick và useState
'use client'; 

import { useState } from 'react';
import Link from 'next/link';

export default function TrangMot() {
  // Bạn có thể dùng State của React như bình thường
  const [count, setCount] = useState<number>(0);

  // 1. Hàm xử lý cho nút bấm thứ nhất (Hiển thị thông báo)
  const handleAlert = () => {
    alert('Bạn vừa bấm vào nút thông báo!');
  };

  // 2. Hàm xử lý cho nút bấm thứ hai (Tăng số đếm)
  const handleIncrement = () => {
    setCount(count + 1);
  };

  return (
    <div className="p-10 max-w-xl mx-auto mt-10 border rounded-xl shadow-lg bg-white">
      <h1 className="text-3xl font-bold text-emerald-600 mb-6">
        Xử lý sự kiện nút bấm
      </h1>

      <div className="space-y-4">
        {/* Nút bấm 1: Gọi hàm hiện Alert */}
        <button 
          onClick={handleAlert}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          Bấm để hiện Alert
        </button>

        {/* Nút bấm 2: Gọi hàm tăng số đếm */}
        <button 
          onClick={handleIncrement}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          Số lần đã bấm: {count}
        </button>
      </div>
      
      <div className="mt-8 pt-4 border-t text-center">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← Quay về Trang chủ
        </Link>
      </div>
    </div>
  );
}