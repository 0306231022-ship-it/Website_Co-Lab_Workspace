export interface Ghe {
    ID_GHE: number;
    TEN_GHE: string;
    TOA_X: number;
    TOA_Y: number;
    TRANG_THAI: number;
    ID_KHONG_GIAN: number;
    ID_DANH_MUC: number;
}
export interface DanhSachThietBi {
    DanhSach: Ghe[];
}