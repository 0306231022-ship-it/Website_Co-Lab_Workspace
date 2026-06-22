import { Router } from "express";
import NguoiDungController from "../controllers/NguoiDungController.js";
import multer from "multer";
const upload = multer();
const nguoidungRouter = Router();
//==========================================
nguoidungRouter.post('/DangKy', upload.none(), NguoiDungController.DangKy);
nguoidungRouter.post('/XacThucOTP', upload.none(), NguoiDungController.XacThucOTP);
export default nguoidungRouter;