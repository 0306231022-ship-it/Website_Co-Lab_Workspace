import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import ChiNhanhModel from '../models/ChiNhanhModel.js';
import KhongGianModel from '../models/KhongGianModel.js';
import { xoaFileCu } from '../function.js';
import { body, query, validationResult } from 'express-validator';
import ChiTietThietBiModel from '../models/ChiTiet_ThietBiModel.js';

export default class ChiTietThietBiController{
    static async CapThietBi(req,res){
        const DuLieu = req.body;
        try {
            await Promise.all([
                body('ID_KHONG_GIAN')
                    .notEmpty().withMessage('ID không gian là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .isInt({ min: 1 }).withMessage('ID không gian không được nhỏ hơn 1!')
                    .custom(async (value) => {
                        const kiemtra = await KhongGianModel.kiemtraid(value);
                        if(!kiemtra) throw new Error('ID không gian không tồn tại!');
                        return true;
                    })
                    .run(req),
                body('ID_THIET_BI')
                    .notEmpty().withMessage('ID thiết bị là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .isInt({ min: 1 }).withMessage('ID thiết bị không được nhỏ hơn 1!')
                    //Kiểm tra id có tồn tại không?
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
            const CapThietBi = await ChiTietThietBiModel.CapThietBi(DuLieu);
            console.log(CapThietBi)
            if(!CapThietBi){
                return res.status(500).json({
                    success:false,
                    message:'Cấp thiết bị thất bại!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Cấp thiết bị thành công!'
            })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Cấp thiết bị thất bại: ' + error.message
            });
        }
    }

}