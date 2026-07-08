 import {ChiTietKhongGian} from '@/interface/KhongGian'
 export interface objChiNhanh {
  ID_CHI_NHANH: number;
  TEN_CHI_NHANH: string;
  DIA_CHI: string;
  NGAY_NHAP: Date;
  NGAY_CAP_NHAT: Date;
  TRANG_THAI: number;
  HINHANH: string;
  TongLoai1:number;
  TongLoai2: number;
  DiaChi:string;
}
export interface Chinhanh{
    DuLieu:objChiNhanh
}
export interface ChiTietChiNhanhResponse {
    chitiet1: Chinhanh[];
    chitiet2: ChiTietKhongGian;
}