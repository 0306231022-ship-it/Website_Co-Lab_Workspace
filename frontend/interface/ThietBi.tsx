export interface ThietBi {
    ID_THIET_BI: number;
    TEN_THIET_BI: string;
    HINH_ANH: string;
    SO_LUONG: number;
}

export interface DanhSachThietBi {
    DanhSach: ThietBi[];
    TongDanhSach: number;
}