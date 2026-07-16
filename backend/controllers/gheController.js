
import GheModel from "../models/gheModel.js";
import KhongGianModel from '../models/KhongGianModel.js';
import dmGhe from "../models/danhmucgheModel.js";
import { body, param, query, validationResult } from "express-validator";
import ChiTietThietBiModel from "../models/ChiTiet_ThietBiModel.js";
import DatLichModel from "../models/LichDatModel.js";
import { io } from '../server.js';
export default class gheController {
    

    static async getGheById(req, res) {
        try {
            await Promise.all([
                query('ID_GHE')
                    .notEmpty().withMessage('id ghế không được bỏ trống!')
                    .isInt().withMessage('ID ghế phải là số nguyên')
                    .custom(async (value) => {
                        const check = await GheModel.testId(value);
                        if (!check) throw new Error('ID không tồn tại!');
                        return true;
                    })
                    .run(req),
            ]);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            const id  = req.query.ID_GHE;
            const [item, ds] = await Promise.all([
                 GheModel.getById(id),
                 DatLichModel.NguoiDat_ghe_HienTai(id)
            ])
            if (!item) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thông tin ghế!" });
            }
            res.status(200).json({ 
                success: true, 
                dulieu: {
                    ThongTinGhe:item,
                    NguoiDatHienTai: ds
                }
             });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // [POST] /api/admin/ghe
    static async createGhe(req, res) {
        try {
            const { TEN_GHE, TOA_X, TOA_Y, ID_KHONG_GIAN, ID_DANH_MUC } = req.body;
        
            await Promise.all([
                body('TEN_GHE')
                    .notEmpty()
                    .withMessage('tên ghế không được bỏ trống')
                    .isLength({ max: 255 }).withMessage('Tên ghế tối đa 255 ký tự')
                    .run(req),
                body('TOA_X')
                    .notEmpty().withMessage('tọa độ X không được bỏ trống')
                     .isInt().withMessage('tọa độ X phải là số số thập phân hoặc số nguyên')
                    .run(req),
                body('TOA_Y')
                    .notEmpty().withMessage('tọa độ Y không được bỏ trống')
                    .isInt().withMessage('tọa độ Y phải là số số thập phân hoặc số nguyên')
                    .run(req),
                body('ID_KHONG_GIAN')
                    .notEmpty().withMessage('id không gian không được bỏ trống')
                    .isInt().withMessage('id không gian phải là số nguyên')
                    .custom(async (value, { req }) => {
                        const testid = await KhongGianModel.kiemtraid(value);
                        if(!testid)  throw new Error('ID không tồn tại!');
                        return true;
                    })
                    .run(req),
                body('ID_DANH_MUC')
                    .notEmpty().withMessage('id danh mục không được bỏ trống')
                    .isInt().withMessage('id danh mục phải là số nguyên')
                     .custom(async (value, { req }) => {
                        const testid = await dmGhe.testid(value);
                        if(!testid)  throw new Error('ID không tồn tại!');
                        return true;
                    })
                    .run(req)
            ]);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }

            // Thực hiện thêm mới dựa theo mẫu (Loại bỏ khoảng trắng thừa bằng .trim())
            const insertId = await GheModel.create({
                TEN_GHE: TEN_GHE.trim(),
                TOA_X,
                TOA_Y,
                ID_KHONG_GIAN,
                ID_DANH_MUC
            });

            if (!insertId) {
                return res.status(500).json({
                    success: false,
                    message: 'Thêm ghế thất bại!'
                });
            }
            const Ghe = await GheModel.getIDkhongian(ID_KHONG_GIAN);
            console.log(Ghe)
            io.emit('ThemGhe', { ThongTinGhe: Ghe });
            res.status(200).json({ success: true, message: "Thêm ghế thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // [PUT] /api/admin/ghe/:id
   static async updatetenGhe(req, res) {
        try {
            await Promise.all([
                body('ID_GHE')
                    .notEmpty().withMessage('id ghế không được bỏ trống!')
                    .isInt().withMessage('ID ghế phải là số nguyên')
                    .custom(async (value) => {
                        const check = await GheModel.testId(value);
                        if (!check) throw new Error('ID không tồn tại!');
                        return true;
                    })
                    .run(req),
                body('TEN_GHE')
                    .notEmpty().withMessage('Tên ghế không được để trống!')
                    .isString().withMessage('Tên ghế phải là chuỗi ký tự')
                    .isLength({ max: 255 }).withMessage('Tên ghế không được vượt quá 255 ký tự!')
                    .run(req),
            ]);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }

            // Lấy ID_GHE từ body ra cùng các trường khác giống hệt create
            const { ID_GHE, TEN_GHE } = req.body;
           

            const updated = await GheModel.CapNhat_TenGhe(ID_GHE,TEN_GHE.trim());

            if (!updated) {
                return res.status(404).json({ success: false, message: "Ghế không tồn tại hoặc dữ liệu không có thay đổi!" });
            }
            res.status(200).json({ success: true, message: "Cập nhật thông tin ghế thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async LayDanhSach_Theo_IDKG(req,res){
        const id = req.query.id;
        try {
            if(!id || id<0){
                return res.status(401).json({
                    success:false,
                    message:'Vui lòng kiểm tra lại thông tin!'
                })
            }
            const kiemtra = await KhongGianModel.kiemtraid(id);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message:'Không tìm thấy ID không gian!'
                })
            }
            const Ghe = await GheModel.getIDkhongian(id);
            return res.status(200).json({
                success:true,
                dulieu:Ghe
            })
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async CapNhat_TaoDo_Ghe(req, res){
        try {
            const stringDanhSachGhe = req.body.danhSachGhe;
            if (!stringDanhSachGhe) {
                return res.status(400).json({
                    success: false,
                    message: "Không nhận được dữ liệu danh sách ghế."
                });
            }
            const danhSachGhe = JSON.parse(stringDanhSachGhe);
            if (!Array.isArray(danhSachGhe) || danhSachGhe.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Dữ liệu ghế không đúng định dạng mảng hoặc bị rỗng."
                });
            }
            let coLoiCapNhat = false;
            await Promise.all(
                danhSachGhe.map(async (ghe) => {
                    const { ID_GHE, TOA_X, TOA_Y } = ghe;
                    const CapNhat = await GheModel.CapNhatToaDo(TOA_X,TOA_Y,ID_GHE);
                    if (!CapNhat) {
                        coLoiCapNhat = true;
                    }
            })
        );
        if (coLoiCapNhat) {
            return res.status(400).json({
                success: false,
                message: 'Có lỗi xảy ra, một số ghế cập nhật tọa độ thất bại!'
            });
        }
        return res.status(200).json({
            success: true,
            message: "Cập nhật vị trí sơ đồ ghế thành công!"
        });

    } catch (error) {
        console.error("Lỗi xử lý tại Controller cập nhật sơ đồ ghế:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống, không thể lưu sơ đồ ghế.",
            error: error.message
        });
    }
};
    static async ThonhTin_Ghe_DatDon(req,res){
        const dulieu = req.query.ID_GHE;
        try {
            if(!dulieu){
                return res.status(401).json({
                    success:false,
                    message:'Không tìm thấy ghế cần tìm!'
                })
            }
            const kiemtra = await GheModel.testId(dulieu);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message:'Không tồn ghế!'
                })
            }
            const kq = await GheModel.laythongtin(dulieu);
            if(!kq){
                return res.status(401).json({
                    success:false,
                    message:'Không thể truy vấn ghế!'
                })
            }
            return res.status(200).json({
                success:true,
                dulieu : kq
            })

        } catch (error) {
            console.error("Lỗi xử lý tại Controller chi tiết ghế:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống, không thể lấy thông tin chi tiết của ghế.",
                error: error.message
            });
    
        }
    }
    static async CapNhatDanhMuc_ghe(req,res){
        const id = req.body.ID_GHE;
        const id_danh_muc = req.body.ID_DANH_MUC;
        try {
                if(!id || !id_danh_muc){
                    return res.status(401).json({
                        success:false,
                        message:'Không tìm thấy id cần chỉnh sửa!'
                    })
                }
                const kiemtra1 =await GheModel.testId(id);
                if(!kiemtra1){
                    return res.status(401).json({
                        success: false,
                        message:'không tìm thấy ghế cần sửa!'
                    })
                }
                const kiemtra2 = await dmGhe.testid(id_danh_muc);
                if(!kiemtra2){
                    return res.status(401).json({
                        success:false,
                        message:'Không tìm thấy danh mục cần sửa!'
                    })
                }
                const capnhat = await GheModel.CapNhatDanhMuc_ghe(id,id_danh_muc);
                if(!capnhat){
                    return res.status(401).json({
                        success: false,
                        message:'Cập nhật danh mục ghế thất bại! '
                    })
                }
                return res.status(200).json({
                    success:true,
                    message:'Cập nhật danh mục ghế thành công!'
                })
        } catch (error) {
             console.error("Lỗi xử lý tại Controller cập nhật danh mục ghế:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống, không thể cập nhật thông tin ghế.",
                error: error.message
            });
        }
    }
    static async CapNhatTrangThai_ghe(req,res){
        const id = req.body.ID_GHE;
        const trangthai = req.body.TRANG_THAI;
        try {
             const kiemtra1 =await GheModel.testId(id);
                if(!kiemtra1){
                    return res.status(401).json({
                        success: false,
                        message:'không tìm thấy ghế cần sửa!'
                    })
                }
                if(trangthai !== '1' && trangthai !=='2'){
                    return res.status(401).json({
                        success:false,
                        message: 'Không tìm thấy trạng thái cần sửa!'
                    })
                }
                const capnhat = await GheModel.CapNhatTrangThai(id,trangthai);
                if(!trangthai){
                    return res.status(401).json({
                        success:false,
                        message:'Cập nhật thông tin thất bại!'
                    })
                }
                return res.status(200).json({
                    success:true,
                    message: 'Cập nhật thông tin thành công!'
                })
        } catch (error) {
              console.error("Lỗi xử lý tại Controller cập nhật trạng thái ghế:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống, không thể cập nhật thông tin ghế.",
                error: error.message
            });
        }
    }
}