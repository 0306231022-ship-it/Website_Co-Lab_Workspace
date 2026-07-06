"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import SignUpForm from "@/app/Modal/page";
import DangKy from "@/app/Modal/DangKy";
import DangNhap from "@/app/Modal/DangNhap";
import QuenMatKhau from "@/app/Modal/QuenMatKhau";
import ThemGiaMoi from "@/app/Modal/ThemGia";
import ThemChiNhanh from "@/app/Modal/ThemChiNhanh";
import ThemKhongGian from "@/app/Modal/ThemKhongGian";
import ChinhSuaChiNhanh from "@/app/Modal/ChinhSuaChiNhanh";
import ChinhSuaKhongGian from "@/app/Modal/ChinhSuaKhongGian";
import CapTrangThietBi from "@/app/Modal/CapTrangThietBi";
const MODAL_REGISTRY = {
    'DangKy' : SignUpForm,
    'formDangKy' : DangKy,
    'DangNhap' : DangNhap,
    'QuenMatKhau' : QuenMatKhau,
    'ThenGia' : ThemGiaMoi,
    'ThemChiNhanh' : ThemChiNhanh,
    'ThemKhongGian' : ThemKhongGian,
    'ChinhSuaChiNhanh' : ChinhSuaChiNhanh,
    'ChinhSuaKhongGian' : ChinhSuaKhongGian,
    'CapThietBi' : CapTrangThietBi
};

// Khai báo kiểu dữ liệu cho các key (Tên trang) hợp lệ trong hệ thống
type ModalKey = keyof typeof MODAL_REGISTRY;

// Định dạng dữ liệu của các Component con sẽ nhận qua Props để tránh lỗi any
interface ChildComponentProps {
    DuLieu: unknown;
    url: string | null;
    onClose: () => void;
}

// Cấu trúc một bản ghi Modal nằm trong ngăn xếp (Stack)
interface ModalItem {
    id: number;
    TenTrang: ModalKey;
    DuLieu: unknown; // Thay vì 'any', 'unknown' giúp kiểm soát dữ liệu an toàn hơn
    url: string | null;
    icon: string | null;
    TieuDe: string | null;
}

// Cấu trúc tham số cấu hình của yêu cầu khi gọi hàm mở Modal
interface OpenModalRequest {
    TenTrang: ModalKey;
    url?: string | null;
    icon?: string | null;
    TieuDe?: string | null;
}

// Interface đại diện cho dữ liệu và các hàm mà Context xuất ra ngoài
interface MoDalContextType {
    OpenMoDal: (dulieu: unknown, yeucau: OpenModalRequest) => void;
    CloseMoDal: () => void;
    CloseAllModals: () => void;
    modalStack: ModalItem[];
}

// Khởi tạo Context
const MoDalContext = createContext<MoDalContextType | undefined>(undefined);

// --- COMPONENT PROVIDER CHÍNH ---
export function AppMDProvider({ children }: { children: ReactNode }) {
    const [modalStack, setModalStack] = useState<ModalItem[]>([]);

    const OpenMoDal = (dulieu: unknown, yeucau: OpenModalRequest) => {
        setModalStack((prev) => [
            ...prev,
            {
                id: Date.now(),
                TenTrang: yeucau.TenTrang,
                DuLieu: dulieu ?? null,
                url: yeucau.url ?? null,
                icon: yeucau.icon ?? null,
                TieuDe: yeucau.TieuDe ?? null
            }
        ]);
    };

    const CloseMoDal = () => {
        setModalStack((prev) => {
            if (prev.length === 0) return [];
            return prev.slice(0, -1);
        });
    };

    const CloseAllModals = () => {
        setModalStack([]);
    };

    const renderModal = () => {
        if (!modalStack || modalStack.length === 0) return null;
        
        const item = modalStack[modalStack.length - 1];
        
        // Ép kiểu động an toàn cho component đích từ Registry theo cấu trúc props tiêu chuẩn
        const TargetComponent = MODAL_REGISTRY[item.TenTrang] as React.ComponentType<ChildComponentProps>;

        if (!TargetComponent) return null;

        return (
            <div className="fixed inset-0 z-[1000] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn">
                <div
                    className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100
                               w-auto md:min-w-[400px] max-w-[95vw] max-h-[90vh]"
                    style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                >
                    {/* --- HEADER --- */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 sticky top-0 z-10 gap-8">
                        <div className="flex items-center gap-4">
                            {modalStack.length > 1 && (
                                <button
                                    type="button"
                                    onClick={CloseMoDal} 
                                    className="group w-9 h-9 rounded-full bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-all duration-200 shrink-0"
                                    title="Quay lại trang trước"
                                >
                                    <i className="fa-solid fa-arrow-left text-sm group-hover:-translate-x-0.5 transition-transform"></i>
                                </button>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                                    <i className={`${item.icon || 'fa-solid fa-layer-group'}`}></i>
                                </div>
                                <div className="whitespace-nowrap">
                                    <h3 className="text-lg font-bold text-gray-800 leading-tight">
                                        {item.TieuDe || 'Thông tin'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={CloseAllModals} 
                            className="w-9 h-9 rounded-full bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 hover:rotate-90 flex items-center justify-center transition-all duration-300 focus:outline-none shrink-0"
                            title="Đóng cửa sổ"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>

                    {/* --- DIỆN TÍCH HIỂN THỊ NỘI DUNG MODAL --- */}
                    <div key={item.id} className="flex-1 overflow-y-auto custom-scrollbar bg-white p-6 relative animate-fadeIn">
                        <TargetComponent
                            DuLieu={item.DuLieu}
                            url={item.url}
                            onClose={CloseMoDal} 
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <MoDalContext.Provider value={{ OpenMoDal, CloseMoDal, CloseAllModals, modalStack }}>
            {children}
            {renderModal()}
        </MoDalContext.Provider>
    );
}

// --- CUSTOM HOOK ---
export function useModalContext() {
    const context = useContext(MoDalContext);
    if (!context) {
        throw new Error("useModalContext phải được gọi bên trong AppMDProvider");
    }
    return context;
}