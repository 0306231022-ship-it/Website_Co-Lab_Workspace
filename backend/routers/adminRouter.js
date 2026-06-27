import { Router } from "express";
import thietbiController from "../controllers/thietbiController.js"; 
import danhmucgheController from "../controllers/danhmucgheController.js";
import gheController from "../controllers/gheController.js";
import ChiNhanhController from "../controllers/ChiNhanhController.js";
import KhongGianController from "../controllers/KhongGianController.js";
const adminRouter = Router();
import createUpload from '../middleware/upload.js';
import multer from "multer";
import ChiTietThietBiController from "../controllers/ChiTiet_ThietBiController.js";
import LichDatController from "../controllers/LichDatController.js";
import DatLichModel from "../models/LichDatModel.js";
import hoadonController from "../controllers/hoadonController.js";
const upload = multer();  
//==========================================
//QUẢN LÝ CHI NHÁNH
adminRouter.post('/ThemChiNhanh', createUpload('ChiNhanh').any(), ChiNhanhController.Them_ChiNhanh);
adminRouter.post('/CapNhat_thongTinMem', upload.none(), ChiNhanhController.ChinhSua_Ten_DiaChi);
adminRouter.post('/ChinhSua_HinhAnh' , createUpload('ChiNhanh').any(), ChiNhanhController.ChinhSua_HinhAnh )
adminRouter.post('/CapNhat_TrangThai' , upload.none(), ChiNhanhController.ChinhSua_TrangThai_ChiNhanh);
adminRouter.get('/laydanhsach' , ChiNhanhController.DanhSach_ChiNhanh);
adminRouter.get('/laychitiet',ChiNhanhController.ChiTiet_ChiNhanh);
adminRouter.get('/TimKiem', ChiNhanhController.TimKiem_ChiNhanh);
//==========================================
//QUẢN LÝ KHÔNG GIAN
adminRouter.post('/ThemKhongGian' , createUpload('KhongGian').any(), KhongGianController.Them_KhongGian);
adminRouter.post('/ChinhSuaTen_kg', upload.none() , KhongGianController.ChinhSua_TenKhongGian );
adminRouter.post('/ChinhSuaAnh', createUpload('KhongGian').any(), KhongGianController.ChinhAnh);
adminRouter.post('/ChinhSua_TrangThai_KhongGian' , upload.none(), KhongGianController.ChinhSua_TrangThai_KhongGian);
adminRouter.get('/DanhSach_khonggian' , KhongGianController.DanhSach_KhongGian);
adminRouter.get('/TimKiem_khonggian', KhongGianController.TimKiem_KhongGian);
adminRouter.get('/ChiTiet_KhongGian', KhongGianController.ChiTiet_KhongGian);
// =========================================
// QUẢN LÝ THIẾT BỊ
adminRouter.post('/CapThietBi' , upload.none(), ChiTietThietBiController.CapThietBi);
adminRouter.get("/thietbi", thietbiController.getAllThietBi);
adminRouter.get("/layid", thietbiController.getThietBiById);
adminRouter.get('/DanhSachThietBi_theoKhongGian', ChiTietThietBiController.DanhSach_ThietBi);
adminRouter.post("/thietbi",  upload.none(),thietbiController.createThietBi);
adminRouter.post("/CapNhatThietBi", upload.none(), thietbiController.updateThietBi);
//==========================================
//QUẢN LÝ DANH MỤC GHẾ
adminRouter.post("/danhmucghe",  upload.none(),danhmucgheController.createDanhMucGhe);
adminRouter.post("/capnhatdanhmucghe",upload.none(),danhmucgheController.updateDanhMucGhe);
//============================================
//QUẢN LÝ LỊCH ĐẶT
adminRouter.get('/danhsach_lichdat', LichDatController.DanhSachDatLich);
adminRouter.get('/lichsu_ghe', LichDatController.LichSuDat_theoID_ghe);
//==========================================
//QUẢN LÝ GHẾ
adminRouter.post("/themghe",upload.none(),gheController.createGhe);
adminRouter.get('/ChiTiet_ghe', gheController.getGheById);
adminRouter.post("/capnhatghe",upload.none(),gheController.updateGhe);

//Hóa đơn
adminRouter.post("/themhoadon",upload.none(),hoadonController.createHoaDon);
adminRouter.get("/chitiethoadon",hoadonController.getHoaDonById);
console.log("✅ adminRouter loaded");
export default adminRouter;