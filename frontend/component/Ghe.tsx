"use client";

import React from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";
import { Ghe } from "@/interface/ghe";

interface SoDoGheCanvasProps {
  danhSachGhe: Ghe[];
  // 💡 ĐỔI THÀNH: Nhận vào object ghế thay vì chỉ nhận idGhe
  onGheClick: (ghe: Ghe) => void; 
}

export default function SoDoGheCanvas({ danhSachGhe, onGheClick }: SoDoGheCanvasProps) {
  
  const layMauGhe = (trangThai: number) => {
    switch (trangThai) {
      case 2: return "#ef4444"; // Đã có người
      case 1: return "#f59e0b"; 
      case 0:
      default:
        return "#10b981"; // Trống
    }
  };

  return (
    <div className="w-full bg-gray-50 rounded-xl border border-gray-200 flex justify-center items-center p-4">
      <Stage width={500} height={300}>
        <Layer>
          <Rect x={100} y={10} width={300} height={6} fill="#cbd5e1" cornerRadius={3} />
          <Text x={210} y={22} text="HƯỚNG PHÒNG / MÀN HÌNH" fontSize={10} fill="#94a3b8" fontStyle="bold" />

          {danhSachGhe.map((item) => (
            <Group
              key={item.ID_GHE}
              x={item.TOA_X}
              y={item.TOA_Y}
              // 💡 ĐỔI THÀNH: Truyền toàn bộ object 'item' (ghế hiện tại) ra ngoài
              onClick={() => item.TRANG_THAI !== 2 && onGheClick(item)}
              onTouchEnd={() => item.TRANG_THAI !== 2 && onGheClick(item)}
              className={item.TRANG_THAI === 2 ? "cursor-not-allowed" : "cursor-pointer"}
            >
              <Rect
                width={40}
                height={40}
                fill={layMauGhe(item.TRANG_THAI)}
                cornerRadius={6}
                stroke={item.TRANG_THAI === 1 ? "#ffffff" : "transparent"}
                strokeWidth={2}
              />
              <Text
                text={item.TEN_GHE}
                width={40}
                y={14}
                align="center"
                fontSize={11}
                fontStyle="bold"
                fill="white"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}