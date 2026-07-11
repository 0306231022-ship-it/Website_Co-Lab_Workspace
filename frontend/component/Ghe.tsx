"use client";

import React from 'react';
import { Stage, Layer, Group, Rect, Text } from 'react-konva';
import { Ghe } from '@/interface/ghe';

interface SoDoGheCanvasProps {
    danhSachGhe: Ghe[];
    onGheClick?: (ghe: Ghe) => void;
    // 🟢 ĐÃ THÊM: Định nghĩa onDragGhe để tránh lỗi TypeScript compile 
    onDragGhe?: (idGhe: number, newX: number, newY: number) => void;
    isReadOnly?: boolean;
    setGhe?: React.Dispatch<React.SetStateAction<Ghe[]>>;
}

export default function SoDoGheCanvas({ 
    danhSachGhe, 
    onGheClick, 
    onDragGhe, // 🟢 Nhận prop xử lý kéo thả từ file cha
    isReadOnly = false 
}: SoDoGheCanvasProps) {

    // Hàm trả về màu sắc đại diện cho trạng thái của ghế
    const layMauGhe = (trangThai: number) => {
        if (trangThai === 1) return '#ef4444'; // Đã thuê -> Đỏ
        return '#10b981'; // Trống -> Xanh lá
    };

    // Kiểm tra an toàn dữ liệu đầu vào chuẩn Array chống crash
    if (!danhSachGhe || !Array.isArray(danhSachGhe) || danhSachGhe.length === 0) {
        return (
            <div className="text-xs text-amber-500 font-medium py-4">
                Không tìm thấy dữ liệu cấu hình vị trí ghế hoặc dữ liệu sai định dạng.
            </div>
        );
    }

    return (
        <div className="w-full overflow-auto flex justify-center bg-slate-50/50 p-2 rounded-xl">
            {/* Tạo khung Canvas đủ rộng để chứa sơ đồ */}
            <Stage width={600} height={400} className="border border-slate-100 rounded-lg bg-white shadow-2xs">
                <Layer>
                    {danhSachGhe.map((item, index) => {
                        
                        // Đảm bảo tọa độ luôn là số hợp lệ, mặc định là 0 nếu thiếu dữ liệu
                        const xChuan = Number(item.TOA_X) || 0;
                        const yChuan = Number(item.TOA_Y) || 0;

                        // Định dạng ngắn gọn tên hiển thị trên ô ghế
                        let nhanGhe = "G";
                        if (item.TEN_GHE) {
                            if (item.TEN_GHE.includes("A-")) {
                                nhanGhe = "A-" + item.TEN_GHE.split("A-")[1];
                            } else if (item.TEN_GHE.includes("E-")) {
                                nhanGhe = "E-" + item.TEN_GHE.split("E-")[1];
                            } else {
                                nhanGhe = item.TEN_GHE;
                            }
                        }

                        return (
                            <Group
                                key={item.ID_GHE || index}
                                x={xChuan}
                                y={yChuan}
                                draggable={!isReadOnly} // Khóa di chuyển nếu là chế độ xem chi tiết
                                onClick={() => onGheClick && onGheClick(item)}
                                onTap={() => onGheClick && onGheClick(item)}
                                
                                // 🟢 ĐÃ THÊM: Lắng nghe sự kiện thả chuột sau khi dịch chuyển ghế
                                onDragEnd={(e) => {
                                    const node = e.target; // Lấy phần tử Group hiện tại
                                    if (onDragGhe && item.ID_GHE) {
                                        // Gửi ID ghế kèm tọa độ thực tế X, Y vừa thả về file cha để cập nhật mảng state
                                        onDragGhe(item.ID_GHE, node.x(), node.y());
                                    }
                                }}
                            >
                                {/* Khối bo góc mô phỏng ghế ngồi */}
                                <Rect
                                    width={50}
                                    height={50}
                                    fill={layMauGhe(item.DangCoNguoiDat)}
                                    cornerRadius={8}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    shadowColor="#0f172a"
                                    shadowBlur={3}
                                    shadowOpacity={0.1}
                                    shadowOffset={{ x: 1, y: 2 }}
                                />
                                
                                {/* Nhãn tên ghế */}
                                <Text
                                    text={nhanGhe}
                                    width={50}
                                    y={18}
                                    align="center"
                                    fill="#ffffff"
                                    fontSize={10}
                                    fontStyle="bold"
                                />
                            </Group>
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
}