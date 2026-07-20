import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import ChiNhanhModel from '../models/ChiNhanhModel.js';
import KhongGianModel from '../models/KhongGianModel.js';
import { xoaFileCu } from '../function.js';
import { body, query, validationResult } from 'express-validator';
import ChiTietThietBiModel from '../models/ChiTiet_ThietBiModel.js';
import ThietBi from "../models/thietbiModel.js";

export default class ChiTietThietBiController{
   static async CapThietBi(req, res) {
    const DuLieu = req.body;
  
    
    try {
        // 1. Chuyển đổi chuỗi JSON string từ '_ID_THIET_BI' thành mảng thực tế và gán vào 'ID_THIET_BI'
        let mangThietBi = [];
        if (DuLieu._ID_THIET_BI) {
            try {
                mangThietBi = JSON.parse(DuLieu._ID_THIET_BI);
            } catch (e) {
                mangThietBi = []; // Nếu parse lỗi thì giữ mảng rỗng
            }
        }
        
        // Gán lại vào Object để các hàm xử lý phía sau (hoặc Model) dùng đúng key
        DuLieu.ID_THIET_BI = mangThietBi;

        // 2. Validate ID_KHONG_GIAN bằng express-validator
        await Promise.all([
            body('ID_KHONG_GIAN')
                .notEmpty().withMessage('ID không gian là thông tin bắt buộc')
                .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                .isInt({ min: 1 }).withMessage('ID không gian không được nhỏ hơn 1!')
                .custom(async (value) => {
                    const kiemtra = await KhongGianModel.kiemtraid(value);
                    if (!kiemtra) throw new Error('ID không gian không tồn tại!');
                    return true;
                })
                .run(req),
        ]);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                validate: true,
                message: 'Dữ liệu không hợp lệ!',
                errors: errors.array().map(err => err.msg)
            });
        }

        // 3. Kiểm tra mảng thiết bị sau khi đã parse thành công
        const loi = [];
        if (!Array.isArray(DuLieu.ID_THIET_BI) || DuLieu.ID_THIET_BI.length === 0) {
            loi.push("Danh sách thiết bị không được để trống");
        } 
        
        if (loi.length > 0) {
            return res.status(400).json({
                validate: true,
                message: "Dữ liệu không hợp lệ",
                errors: loi
            });
        }
        const CapThietBi = await ChiTietThietBiModel.CapThietBi(DuLieu);
        if (!CapThietBi) {
            return res.status(500).json({
                success: false,
                message: 'Cấp thiết bị thất bại!'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cấp thiết bị thành công!'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Cấp thiết bị thất bại: ' + error.message
        });
    }
}
    static async XoaThietBi(req,res){
        const id = req.body.ID_THIET_BI;
        try {
            await Promise.all([
                   body('ID_THIET_BI')
                    .notEmpty().withMessage('ID thiết bị là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .isInt({ min: 1 }).withMessage('ID thiết bị không được nhỏ hơn 1!')
                    .custom(async (value) => {
                        const kiemtra = await ThietBi.testid(value);
                        if(!kiemtra) throw new Error('ID thiết bị không tồn tại!');
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
            };
            const xoa = await ChiTietThietBiModel.Xoa(id);
            if(!xoa){
                return res.status(500).json({
                    success:false,
                    message:'Không thể xóa thiết bị khỏi không gian!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Xóa thiết bị thành công!'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Xóa thiết bị thất bại: ' + error.message
            });
        }
    }
    static async DanhSach_ThietBi(req,res){
         const page = parseInt(req.query.page) || 1;
         const limit = parseInt(req.query.limit) || 10;
         const offset = (page - 1) * limit;
         const IDKG = req.query.IDKG;
        try {
            await Promise.all([
                query('page')
                     .notEmpty()
                     .withMessage('Số lượng không được bỏ trống')
                     .isInt({ min: 0 })
                     .withMessage('Số trang phải là số nguyên và không được âm!')
                     .run(req),
                  query('IDKG')
                                    .notEmpty().withMessage('ID không gian là thông tin bắt buộc')
                                    .isInt({ min: 0 }).withMessage('Giá trị nhập vào phải là một số nguyên!')
                                    .custom(async (value) => {
                                         const kiemtra = await KhongGianModel.kiemtraid(value);
                                         if (!kiemtra) throw new Error('ID không gian không tồn tại!');
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
            const DanhSach = await ChiTietThietBiModel.DanhSachThietBi_Khonggian(IDKG, limit, offset);
            return res.status(200).json({
                success:true,
                ThietBi: {
                    DanhSach: DanhSach.DanhSach,
                    TongDanhSach:DanhSach.TongDanhSach
                }
            })

        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Danh sách thiết bị thất bại: ' + error.message
            });
        }
    }
    static async XoaCapThietBi(req, res) {
    const { ID_KHONG_GIAN, ID_THIET_BI } = req.body;
    try {
        if (!ID_KHONG_GIAN || !ID_THIET_BI) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin để xóa!" });
        }
        const ketqua = await ChiTietThietBiModel.XoaCapThietBi(ID_KHONG_GIAN, ID_THIET_BI);

        if (ketqua) {
            return res.status(200).json({ 
                success: true, 
                message: "Đã gỡ 1 thiết bị ra khỏi không gian thành công!" 
            });
        } else {
            return res.status(500).json({ success: false, message: "Thiết bị không tồn tại trong không gian này!" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}



}