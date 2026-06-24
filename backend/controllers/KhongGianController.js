
import ChiNhanhModel from '../models/ChiNhanhModel.js';
import KhongGianModel from '../models/KhongGianModel.js';
import { body, query, validationResult } from 'express-validator';
export default class KhongGianController{
    static async DanhSach_KhongGian(req, res) {

    }
    static async Them_KhongGian(req, res) {
       const dulieu = req.body;
       const files = req.files;
       let pathFile = files[0].filename;
       let DuongDan = 'uploads/KhongGian/' + pathFile;
        if(!pathFile){
            return res.json({
                status:true,
                message:'Lỗi tải ảnh!'
            })
        };
        try {
            await Promise.all([
                body('TenKhongGian')
                    .notEmpty()
                    .withMessage('Tên không gian không được để trống!')
                    .run(req),
                body('LoaiKG')
                    .notEmpty().withMessage('Loại không gian là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .isIn([0, 1, '0', '1']).withMessage('Giá trị nhập vào chỉ được phép là số 0 hoặc 1!')
                    .run(req),
                body('IDCN')
                     .notEmpty().withMessage('ID chi nhánh là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .custom(async (value, { req }) => {
                        const checkid = await ChiNhanhModel.kiemtraid(value);
                        if(! checkid){
                            throw new Error('ID chi nhánh không tồn tại!');
                        }
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
            const themKG = await KhongGianModel.ThemKG(dulieu,DuongDan);
            if(!themKG){
                return res.status(500).json({
                    success:false,
                    message:'Thêm không gian thất bại!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Thêm không gian thành công!'
            })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Thêm không gian thất bại: ' + error.message
            });
        }

    }
    static async ChinhSua_TenKhongGian(req, res) {
        const dulieu = req.body;
        try {
            
        } catch (error) {
            
        }
    }
    static async ChinhSua_TrangThai_KhongGian(req, res) {

    }
    static async ChiTiet_KhongGian(req, res) {

    }
    static async TimKiem_KhongGian(req, res) {

    }

}