import { Router } from "express";
import NguoiDungController from "../controllers/NguoiDungController.js";
const adminRouter = Router();
const upload = multer();
//==========================================
// xử lí thông tin website
//adminRouter.post('/DangKy', upload.none(), NguoiDungController.DangKy);
//adminRouter.post('/XacThucOTP', upload.none(), NguoiDungController.XacThucOTP);




//
//=========================================
console.log("✅ adminRouter loaded");
export default adminRouter;0.