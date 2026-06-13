import { Router } from "express";
import adminController from "../controllers/adminController.js";
import CanhanADController from "../controllers/CaNhanADController.js";
import authMiddleware from "../middleware/auth.js";
import createUpload from '../middleware/upload.js';
import multer from "multer";
import { body, validationResult } from "express-validator";
import {validateSocialLinks} from '../validation/KiemTraLinkFaceBook.js';
import { validateIns } from '../validation/KiemTraIns.js';
import { validateEmail } from "../validation/KLiemTraEmail.js";
import { validateSoDienThoai } from "../validation/KiemTraSoDienThoai.js";
import ThuongHieuController from "../controllers/ThuongHieuController.js";
import NhaCungCapController from "../controllers/NhaCungCapController.js";
import PhieuNhapController from "../controllers/PhieuNhapController.js";
import SanPhamController from "../controllers/SanPhamController.js";
import FlashSaleController from "../controllers/flashSaleController.js";
import DonHangController from "../controllers/DonHangController.js";
import MaGiamGiaController from "../controllers/MaGiamGiaController.js";
const adminRouter = Router();
const upload = multer();
//==========================================
// xử lí thông tin website
adminRouter.post('/ThongTinWebsite', adminController.LayWebsite);
adminRouter.post('/DangNhap',upload.none(), CanhanADController.DangNhap);
adminRouter.post('/ChinhSuaTen', upload.none(), adminController.CapNhatTen);
adminRouter.post('/ChinhLoGo',createUpload('logo').array("files", 5),adminController.ChinhSuaLoGo);

  adminRouter.post('/ChinhSuaMoTa',upload.none(),[
    body('MoTa')
     .notEmpty()
     .withMessage('Vui lòng nhập đầy đủ thông tin!')
     .isLength({max:255})
     .withMessage('Vượt quá kí tự cho phép!')
  ],
(req, res, next) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
            return res.json({ Validate: true, errors: errors.array() });
    }
    next();
},adminController.CapNhatMoTa);
adminRouter.post('/ChinhSuaFacebook', upload.none(), validateSocialLinks,adminController.CapNhatLinkFaceBook);
adminRouter.post('/ChinhSuaInstagram', upload.none(), validateIns, adminController.CapNhatIns );
//adminRouter.post('/ChinhSuaDiaChi', upload.none(), validateDiaChi, adminController.CapNhatDiaChi);
adminRouter.post('/ChinhSuaEmail', upload.none(), validateEmail, adminController.CapNhatEmail);
adminRouter.post('/ChinhSuaSoDienThoai', upload.none(), validateSoDienThoai, adminController.CapNhatSoDienThoai);
adminRouter.post('/kiemtra', authMiddleware, CanhanADController.kiemtra );
adminRouter.post('/DangXuat', authMiddleware, CanhanADController.DangXuat);
//=========================================
adminRouter.post('/ChinhSuaTenUS', upload.none(),  [
    body('Ten')
    .notEmpty()
    .withMessage('Vui lòng nhập đầy đủ thông tin!')
    .isLength({max:50})
    .withMessage('Vượt quá kí tự cho phép!'),
],
(req, res, next) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
            return res.json({ Validate: true, errors: errors.array() });
    }
    next();
}, CanhanADController.CapNhatTen);
//========================================


//bên trên chưa được chỉnh sửa

// PHẦN I : ĐỊNH NGHĨA ROUTE POST
//=========================================
// Xử lí thương hiệu
adminRouter.post('/ThemThuongHieu', createUpload('thuonghieu').any(),ThuongHieuController.ThemThuongHieu);
adminRouter.post('/SuaAnhThuongHieu', createUpload('thuonghieu').any(), ThuongHieuController.SuaAnhThuongHieu);
adminRouter.post('/SuaTenThuongHieu', upload.none(), ThuongHieuController.SuaTenThuongHieu);
adminRouter.post('/SuaMoTathuongHieu', upload.none(),ThuongHieuController.SuaMoTathuongHieu );
adminRouter.post('/ChinhSuaTrangThai', upload.none(), ThuongHieuController.ChinhSuaTrangThai);

//=========================================
// Xử lí nhà cung cấp 
adminRouter.post('/Themcc', authMiddleware , upload.none(), NhaCungCapController.ThemCungCap );
adminRouter.post('/ChinhSuaSDT', authMiddleware , upload.none(), NhaCungCapController.CapNhatSDT);
adminRouter.post('/ChinhSuaEmailNCC', authMiddleware , upload.none(), NhaCungCapController.CapNhatEmail);
adminRouter.post('/ChinhSuaTenNhaCungCap' , authMiddleware , upload.none(),NhaCungCapController.CapNhatTen);
adminRouter.post('/ChinhSuaMDDNhaCungCap', authMiddleware ,upload.none(),NhaCungCapController.CapNhatMaDinhDanh );
adminRouter.post('/ChinhSuaDiaChiNhaCungCap', authMiddleware , upload.none(), NhaCungCapController.CapNhatDiaChi);
adminRouter.post('/ChinhSuaMoTaNhaCungCap', authMiddleware , upload.none(),NhaCungCapController.CapNhatMoTa );
adminRouter.post('/ChinhSuaTenNganHang' , authMiddleware , upload.none(), NhaCungCapController.CapNhatTenNganHang);
adminRouter.post('/ChinhSuaSoTaiKhoan', authMiddleware , upload.none(), NhaCungCapController.CapNhatSoTaiKhoan);
adminRouter.post('/ChinhSuaNguoiDaiDienNhaCungCap', authMiddleware , upload.none(), NhaCungCapController.CapNhatNguoiDaiDien);
adminRouter.post('/CapNhat_TrangThai', authMiddleware , upload.none(), NhaCungCapController.CapNhatTrangThai);
//=========================================
// Xử lý Phiếu Nhập
adminRouter.post('/ThemPhieuNhap',createUpload('sanpham').any(), authMiddleware,PhieuNhapController.ThemPhieuNhap);
adminRouter.post('/khoiphuc_phieunhap' , authMiddleware , PhieuNhapController.khoiphuc_phieunhap);
adminRouter.post('/xoa_phieunhap_theoid' , upload.none(), authMiddleware , PhieuNhapController.xoa_phieunhap_theoid);
adminRouter.post('/xoa_tatca_phieunhap' , upload.none(), authMiddleware, PhieuNhapController.xoa_tatca_phieunhap );
//========================================= );
// xử lí sản phẩm 
adminRouter.post('/khoiphuc_sanpham' , authMiddleware , SanPhamController.khoiphuc_sanpham);
adminRouter.post('/xoa_tatca_sanpham' , authMiddleware , SanPhamController.xoa_tatca_sanpham);
//=========================================
//xử lí flashsale
adminRouter.post('/them_flashsale',upload.none(), authMiddleware, FlashSaleController.ThemFlashSale);
//=========================================
//xử lí đơn hàng
adminRouter.post('/huy_donhang', upload.none(), authMiddleware, DonHangController.Huy_DonHang);
//xử lí mã giảm giá
adminRouter.post('/themmagg', upload.none(), authMiddleware, MaGiamGiaController.ThemMaGiamGia);
//PHẦN II : ĐỊNH NGHĨA ROUTE GET
//===========================================
// xử lí sản phẩm
adminRouter.get('/lay_ds_sanpham' , authMiddleware , SanPhamController.lay_ds_sanpham);
adminRouter.get('/timkiem_sanpham', authMiddleware, SanPhamController.timkiem_sanpham);
adminRouter.get('/CapNhat_TT_TT_SP' ,authMiddleware , SanPhamController.CapNhat_TT_TT_SP);
adminRouter.get('/sanpham_daxoa', authMiddleware,SanPhamController.sanpham_daxoa);
adminRouter.get('/TimKiem_sanpham_flash', authMiddleware, SanPhamController.TimKiem_sanpham_flash);
//===========================================
// xử lí thương hiệu
adminRouter.get('/thuonghieu', authMiddleware, ThuongHieuController.LayDanhSachThuongHieu);
adminRouter.get('/ChiTietThuongHieu', authMiddleware, ThuongHieuController.LayChiTietThuongHieu);
adminRouter.get('/laythuonghieu' , authMiddleware , ThuongHieuController.layth );
adminRouter.get('/laysp_thuonghieu',authMiddleware,ThuongHieuController.laysp_thuonghieu);
adminRouter.get('/lay_ds_thuonghieu', authMiddleware, ThuongHieuController.lay_ds_thuonghieu);
//============================================
//xử lí nhà cung cấp
adminRouter.get('/layTTnhacungcap', authMiddleware, NhaCungCapController.LayDanhSachNhaCungCap);
adminRouter.get('/ChiTietNhaCungCap' ,authMiddleware , NhaCungCapController.layChiTiet);
adminRouter.get('/laydspn_idncc' ,authMiddleware, PhieuNhapController.LayPhieuNhap_theo_id_trang);
adminRouter.get('/lay_sp_theo_id_ncc' ,authMiddleware,NhaCungCapController.lay_sp_theo_id_ncc);
adminRouter.get('/getTT_users', authMiddleware, PhieuNhapController.GetTTusers);
adminRouter.get('/timkiem_sp_theo_idncc' , authMiddleware , NhaCungCapController.timkiem_sp_theo_idncc);
//=========================================
//xử lí phiếu nhập
adminRouter.get('/timkiem_phieunhap_idncc' , authMiddleware , PhieuNhapController.timkiem_phieunhap_idncc);
adminRouter.get('/layTTnhacchoatdong' , authMiddleware , PhieuNhapController.LayDS_NCC);
adminRouter.get('/timkiem_phieunhap' , authMiddleware , PhieuNhapController.timkiem_phieunhap);
adminRouter.get('/DuyetPhieuNhap', authMiddleware, PhieuNhapController.DuyetPhieuNhap);
//=========================================
// xử lí flashsale
adminRouter.get('/danhsach_flashsale', authMiddleware, FlashSaleController.DanhSachFlashSale);
//=========================================
//XỬ LÍ ĐƠN HÀNG
adminRouter.get('/danhsachdonhang', authMiddleware, DonHangController.DanhSachDonHang);
adminRouter.get('/timkiem_donhang', authMiddleware, DonHangController.TimKiem_DonHang);
adminRouter.get('/chitiet_donhang', authMiddleware, DonHangController.ChiTiet_DonHang);
adminRouter.get('/duyet_donhang', authMiddleware, DonHangController.Duyet_DonHang);
//=========================================
//xử lí mã giảm giá
adminRouter.get('/lay_ds_ma_giam_gia', authMiddleware, MaGiamGiaController.DanhSachMaGiamGia);
//Bên dưới chưa được chỉnh sửa
adminRouter.get('/getTT', authMiddleware, CanhanADController.GetTTusers );




adminRouter.get('/laynhacchoatdong' , authMiddleware , NhaCungCapController.LayDShd);

adminRouter.get('/getPhieu', authMiddleware,PhieuNhapController.layDL);
adminRouter.get('/ChiTietPhieuNhap' ,authMiddleware, PhieuNhapController.layChiTietPN);


adminRouter.get('/kiemtra_id_ncc' ,authMiddleware , NhaCungCapController.kiemtraid);

adminRouter.get('/HuyPhieuNhap', authMiddleware, PhieuNhapController.HuyPhieuNhap);
adminRouter.get('/lay_phieunhap_daxoa', authMiddleware, PhieuNhapController.LayDanhSachPhieuNhap);
adminRouter.get('/laythongke_phieunhap' , authMiddleware , PhieuNhapController.laythongke_phieunhap);
adminRouter.get('/dulieu_hoadon_nhapkho' , authMiddleware , PhieuNhapController.dulieu_hoadon_nhapkho);

adminRouter.get('/layChiTietSP_theoid' , authMiddleware , SanPhamController.layChiTietSP_theoid);



//
//=========================================
console.log("✅ adminRouter loaded");
export default adminRouter;