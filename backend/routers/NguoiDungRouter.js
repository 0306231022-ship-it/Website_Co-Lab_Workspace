import { Router } from "express";
import NguoiDungController from "../controllers/NguoiDungController.js";
import { verifyToken } from "../middleware/CheckToken.js";
import {authorize} from "../middleware/PhanQuyen.js";
import createUpload from '../middleware/upload.js';
import LichDatController from "../controllers/LichDatController.js";
import multer from "multer";
const upload = multer();
const nguoidungRouter = Router();
//==========================================
//adminRouter.post('/ThemThuongHieu', createUpload('thuonghieu').any(),ThuongHieuController.ThemThuongHieu);
nguoidungRouter.post('/DangKy', upload.none(), NguoiDungController.DangKy);
nguoidungRouter.post('/XacThucOTP', upload.none(), NguoiDungController.XacThucOTP);
nguoidungRouter.post('/DangNhap' , upload.none(), NguoiDungController.DangNhap);
nguoidungRouter.post('/QuenMatKhau' , upload.none(), NguoiDungController.QuenMatKhau);
nguoidungRouter.post('/DoiMatKhau' , upload.none(), verifyToken, authorize(0,1), NguoiDungController.DoiMatKhau);
nguoidungRouter.post('/CapNhat_TrangThai', upload.none(), NguoiDungController.ChinhSua_TrangThai_NguoiDung);
nguoidungRouter.post('/ChinhSua_thongTin' , upload.none(), verifyToken , authorize(0,1) , NguoiDungController.ChinhSua_NguoiDung);
nguoidungRouter.post('/ChinhSua_Anh', createUpload('DaiDien').any(),verifyToken, NguoiDungController.CapNhat_anhDaiDien);
nguoidungRouter.post('/kiemtra_dangnhap' , upload.none(), verifyToken , NguoiDungController.ThongTin_NguoiDung);
nguoidungRouter.post('/dangxuat' ,  upload.none(), verifyToken, NguoiDungController.DangXuat);
//=========================================
nguoidungRouter.post('/LichDat', upload.none(), LichDatController.DatLich);
nguoidungRouter.get('/LayDanhSach', NguoiDungController.DanhSach_NguoiDung);
nguoidungRouter.get('/TimKiem', NguoiDungController.TimKiem_Ten);
nguoidungRouter.get('/lichsu_datlich', verifyToken, LichDatController.LichSuDat_theoIDND);
//thoong bao
export default nguoidungRouter;