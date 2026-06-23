import { Router } from "express";
import NguoiDungController from "../controllers/NguoiDungController.js";
import { verifyToken } from "../middleware/CheckToken.js";
import createUpload from '../middleware/upload.js';
import multer from "multer";
const upload = multer();
const nguoidungRouter = Router();
//==========================================
//adminRouter.post('/ThemThuongHieu', createUpload('thuonghieu').any(),ThuongHieuController.ThemThuongHieu);
nguoidungRouter.post('/DangKy', upload.none(), NguoiDungController.DangKy);
nguoidungRouter.post('/XacThucOTP', upload.none(), NguoiDungController.XacThucOTP);
nguoidungRouter.post('/DangNhap' , upload.none(), NguoiDungController.DangNhap);
nguoidungRouter.post('/QuenMatKhau' , upload.none(), NguoiDungController.QuenMatKhau);
nguoidungRouter.post('/DoiMatKhau' , upload.none(), verifyToken, NguoiDungController.DoiMatKhau);
nguoidungRouter.post('/CapNhat_TrangThai', upload.none(), NguoiDungController.ChinhSua_TrangThai_NguoiDung);
nguoidungRouter.post('/ChinhSua_thongTin' , upload.none(), verifyToken , NguoiDungController.ChinhSua_NguoiDung);
nguoidungRouter.post('/ChinhSua_Anh', createUpload('DaiDien').any(),verifyToken, NguoiDungController.CapNhat_anhDaiDien);

export default nguoidungRouter;