export interface KhongGian {
    ID_KHONG_GIAN: number;
    TEN_KHONG_GIAN: string;
    LOAI_KHONG_GIAN: number; 
    TRANG_THAI: number;      
    ID_GIA: number;
    NGAY_TAO: string;
    NGAY_CAP_NHAT: string;
    NGAY_BAO_TRI: string | null;
    NGAY_XONG: string | null;
    ID_CHI_NHANH: number;
    HINHANH: string;
    DON_GIA : number | null;
}

export interface ChiTietKhongGian {
    DanhSach: KhongGian[];
    TongDanhSach: number;
}