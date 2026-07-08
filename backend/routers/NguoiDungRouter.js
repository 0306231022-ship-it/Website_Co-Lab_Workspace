import { Router } from "express";
import NguoiDungController from "../controllers/NguoiDungController.js";
import { verifyToken } from "../middleware/CheckToken.js";
import {authorize} from "../middleware/PhanQuyen.js";
import createUpload from '../middleware/upload.js';
import LichDatController from "../controllers/LichDatController.js";
import thongBaoController from "../controllers/ThongBaoController.js";
import multer from "multer";
import hoadonController from "../controllers/hoadonController.js";
const upload = multer();
const nguoidungRouter = Router();
//==========================================
nguoidungRouter.post('/DangKy', upload.none(), NguoiDungController.DangKy);
nguoidungRouter.post('/XacThucOTP', upload.none(), NguoiDungController.XacThucOTP);
nguoidungRouter.post('/DangNhap' , upload.none(), NguoiDungController.DangNhap);
nguoidungRouter.post('/QuenMatKhau' , upload.none(), NguoiDungController.QuenMatKhau);
nguoidungRouter.post('/DoiMatKhau' , upload.none(), verifyToken, authorize(0,1), NguoiDungController.DoiMatKhau);
nguoidungRouter.post('/CapNhat_TrangThai', upload.none(), NguoiDungController.ChinhSua_TrangThai_NguoiDung);
nguoidungRouter.post('/ChinhSua_thongTin' , upload.none(), verifyToken, NguoiDungController.ChinhSua_NguoiDung);
nguoidungRouter.post('/ChinhSua_Anh', createUpload('DaiDien').any(),verifyToken, NguoiDungController.CapNhat_anhDaiDien);
nguoidungRouter.post('/kiemtra_dangnhap' , upload.none(), verifyToken , NguoiDungController.ThongTin_NguoiDung);
nguoidungRouter.post('/dangxuat' ,  upload.none(), verifyToken, NguoiDungController.DangXuat);
//=========================================
nguoidungRouter.post('/LichDat', upload.none(), verifyToken, LichDatController.DatLich);
nguoidungRouter.get('/LayDanhSach', NguoiDungController.DanhSach_NguoiDung);
nguoidungRouter.get('/TimKiem', NguoiDungController.TimKiem_Ten);
nguoidungRouter.get('/lichsu_datlich', verifyToken, LichDatController.LichSuDat_theoIDND);
nguoidungRouter.get('/lichsu_datlich_nguoidung', LichDatController.LichSuDat_theoIDND);
nguoidungRouter.get('/lich-dat', verifyToken, LichDatController.ChiTiet_LichDat_theoIDDL);
nguoidungRouter.get('/ThongTin' , NguoiDungController.ThongTin);
//thoong bao
nguoidungRouter.get('/layDS_thongbao', verifyToken , thongBaoController.getThongBaoByUser);
nguoidungRouter.post('/XoaTheoid' , upload.none(), thongBaoController.deleteThongBao);
nguoidungRouter.post('/XoaTatCa' , upload.none() , verifyToken , thongBaoController.deleteAllThongBaoByUserId);
// hóa đơn
nguoidungRouter.get('/chitiethoadon',hoadonController.getHoaDonById);
export default nguoidungRouter;