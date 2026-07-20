"use client";

import React from 'react';
import { Stage, Layer, Group, Rect, Text } from 'react-konva';
import { Ghe } from '@/interface/ghe';

interface SoDoGheCanvasProps {
    danhSachGhe: Ghe[];
    onGheClick?: (ghe: Ghe) => void;
    onDragGhe?: (idGhe: number, newX: number, newY: number) => void;
    isReadOnly?: boolean;
    setGhe?: React.Dispatch<React.SetStateAction<Ghe[]>>;
    isAdmin?: boolean; // THÊM PROP PHÂN QUYỀN Ở ĐÂY
}

export default function SoDoGheCanvas({ 
    danhSachGhe, 
    onGheClick, 
    onDragGhe, 
    isReadOnly = false,
    isAdmin = false // Mặc định nếu không truyền vào thì coi như là khách hàng
}: SoDoGheCanvasProps) {

    const layMauGhe = (trangThaiGhe: number, dangCoNguoiDat: number) => {
        if (Number(trangThaiGhe) === 2) return '#f59e0b'; // Vàng cam (Bảo trì)
        if (Number(dangCoNguoiDat) === 1) return '#ef4444'; // Đỏ (Đang có người đặt)
        return '#10b981'; // Xanh (Trống)
    };

    if (!danhSachGhe || !Array.isArray(danhSachGhe) || danhSachGhe.length === 0) {
        return (
            <div className="text-xs text-amber-500 font-medium py-4">
                Không tìm thấy dữ liệu cấu hình vị trí ghế hoặc dữ liệu sai định dạng.
            </div>
        );
    }

    return (
        <div className="w-full overflow-auto flex justify-center bg-slate-50/50 p-2 rounded-xl">
            <Stage width={600} height={400} className="border border-slate-100 rounded-lg bg-white shadow-2xs">
                <Layer>
                    {danhSachGhe.map((item, index) => {
                        
                        const xChuan = Number(item.TOA_X) || 0;
                        const yChuan = Number(item.TOA_Y) || 0;

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

                        const laGheDaDat = Number(item.DangCoNguoiDat) === 1;
                        const laGheBaoTri = Number(item.TRANG_THAI) === 2; 

                        return (
                            <Group
                                key={item.ID_GHE || index}
                                x={xChuan}
                                y={yChuan}
                                // Admin thì vẫn có thể di chuyển vị trí ghế bảo trì (nếu !isReadOnly), khách hàng thì không.
                                draggable={!isReadOnly && !laGheDaDat && (!laGheBaoTri || isAdmin)} 
                                
                                // LOGIC PHÂN QUYỀN CLICK: 
                                // Nếu KHÔNG PHẢI ghế bảo trì -> ai cũng click được.
                                // Nếu LÀ ghế bảo trì -> chỉ có Admin (isAdmin === true) mới kích hoạt hàm onGheClick.
                                onClick={() => {
                                    if (!laGheBaoTri || isAdmin) {
                                        if (onGheClick) onGheClick(item);
                                    }
                                }}
                                onTap={() => {
                                    if (!laGheBaoTri || isAdmin) {
                                        if (onGheClick) onGheClick(item);
                                    }
                                }}
                                
                                onDragEnd={(e) => {
                                    const node = e.target; 
                                    if (onDragGhe && item.ID_GHE) {
                                        onDragGhe(item.ID_GHE, node.x(), node.y());
                                    }
                                }}
                            >
                                <Rect
                                    width={50}
                                    height={50}
                                    fill={layMauGhe(item.TRANG_THAI, item.DangCoNguoiDat)}
                                    cornerRadius={8}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    shadowColor="#0f172a"
                                    shadowBlur={3}
                                    shadowOpacity={0.1}
                                    shadowOffset={{ x: 1, y: 2 }}
                                />
                                
                                <Text
                                    text={laGheBaoTri ? "Maint" : nhanGhe}
                                    width={50}
                                    y={18}
                                    align="center"
                                    fill="#ffffff"
                                    fontSize={laGheBaoTri ? 8 : 10}
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