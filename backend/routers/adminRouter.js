import { Router } from "express";
import ChiNhanhController from "../controllers/ChiNhanhController.js";
const adminRouter = Router();
import createUpload from '../middleware/upload.js';
import multer from "multer";
const upload = multer();
//==========================================
// xử lí thông tin website
//adminRouter.post('/DangKy', upload.none(), NguoiDungController.DangKy);
//adminRouter.post('/XacThucOTP', upload.none(), NguoiDungController.XacThucOTP);
adminRouter.post('/ThemChiNhanh', createUpload('ChiNhanh').any(), ChiNhanhController.Them_ChiNhanh);
adminRouter.post('/CapNhat_thongTinMem', upload.none(), ChiNhanhController.ChinhSua_Ten_DiaChi);
adminRouter.post('/ChinhSua_HinhAnh' , createUpload('ChiNhanh').any(), ChiNhanhController.ChinhSua_HinhAnh )
adminRouter.post('/CapNhat_TrangThai' , upload.none(), ChiNhanhController.ChinhSua_TrangThai_ChiNhanh);
adminRouter.get('/laydanhsach' , ChiNhanhController.DanhSach_ChiNhanh);
adminRouter.get('/laychitiet',ChiNhanhController.ChiTiet_ChiNhanh);
adminRouter.get('/TimKiem', ChiNhanhController.TimKiem_ChiNhanh);
//
//=========================================
console.log("✅ adminRouter loaded");
export default adminRouter;