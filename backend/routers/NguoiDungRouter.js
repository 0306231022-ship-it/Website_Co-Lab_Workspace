import { Router } from "express";
import NguoiDungController from "../controllers/NguoiDungController.js";
import { verifyToken } from "../middleware/CheckToken.js";
import multer from "multer";
const upload = multer();
const nguoidungRouter = Router();
//==========================================
nguoidungRouter.post('/DangKy', upload.none(), NguoiDungController.DangKy);
nguoidungRouter.post('/XacThucOTP', upload.none(), NguoiDungController.XacThucOTP);
nguoidungRouter.post('/DangNhap' , upload.none(), NguoiDungController.DangNhap);
nguoidungRouter.post('/QuenMatKhau' , upload.none(), NguoiDungController.QuenMatKhau);
nguoidungRouter.post('/DoiMatKhau' , upload.none(), verifyToken, NguoiDungController.DoiMatKhau);
export default nguoidungRouter;