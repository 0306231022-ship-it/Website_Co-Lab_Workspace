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


//
//=========================================
console.log("✅ adminRouter loaded");
export default adminRouter;