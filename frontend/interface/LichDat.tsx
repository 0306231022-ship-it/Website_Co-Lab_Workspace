export interface LichDatItems {
    ID_LICH_DAT: number;
    KHUNG_BATDAU: string;
    KHUNG_KETTHUC: string;
    ID_KHONG_GIAN: number | null;
    TEN_KHONG_GIAN: string;
    TEN_CHI_NHANH: string;
    ID_GHE: number | null;
}
export interface LichDat{
    thongTinGhe: LichDatItems
}