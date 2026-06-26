import { Router } from "express";
import { 
    getAllThietBi, 
    getThietBiById, 
    createThietBi, 
    updateThietBi, 
    
} from "../controllers/thietbiController.js";
import{
    createDanhMucGhe,
    updateDanhMucGhe
}
from"../controllers/danhmucgheController.js";
import ChiNhanhController from "../controllers/ChiNhanhController.js";
import KhongGianController from "../controllers/KhongGianController.js";
const adminRouter = Router();
import createUpload from '../middleware/upload.js';
import multer from "multer";
import ChiTietThietBiController from "../controllers/ChiTiet_ThietBiController.js";
import LichDatController from "../controllers/LichDatController.js";
const upload = multer();  
//==========================================
// xử lí thông tin website
//adminRouter.post('/DangKy', upload.none(), NguoiDungController.DangKy);
//adminRouter.post('/XacThucOTP', upload.none(), NguoiDungController.XacThucOTP);
//===========================================
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
adminRouter.get("/thietbi", getAllThietBi);
adminRouter.get("/layid/:id", getThietBiById);
adminRouter.get('/DanhSachThietBi_theoKhongGian', ChiTietThietBiController.DanhSach_ThietBi);
adminRouter.post("/thietbi",  upload.none(),createThietBi);
adminRouter.post("/CapNhatThietBi", upload.none(), updateThietBi);
//Danh Mục ghế
adminRouter.post("/danhmucghe",  upload.none(),createDanhMucGhe);
adminRouter.post("/capnhatdanhmucghe",upload.none(),updateDanhMucGhe);
//============================================
//QUẢN LÝ LỊCH ĐẶT
adminRouter.post('/LichDat', upload.none(), LichDatController.DatLich);
adminRouter.get('/danhsach_lichdat', LichDatController.DanhSachDatLich);
console.log("✅ adminRouter loaded");
export default adminRouter;