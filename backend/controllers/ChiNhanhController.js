import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import ChiNhanhModel from '../models/ChiNhanhModel.js';
import { xoaFileCu } from '../function.js';
import { body, query, validationResult } from 'express-validator';

export default class ChiNhanhController{
   static async DanhSach_ChiNhanh(req, res) {

   }
    static async Them_ChiNhanh(req, res) {
        /*{
            TenCN,
            DiaChi,
            file,
        }*/
       const dulieu = req.body;
       const files = req.files;
       let pathFile = files[0].filename;
       let DuongDan = 'uploads/ChiNhanh/' + pathFile;
        if(!pathFile){
            return res.json({
                status:true,
                message:'Lỗi tải ảnh!'
            })
        };

       try {
            await Promise.all([
               body('TenCN')
                .notEmpty()
                .withMessage('Tên chi nhánh không được bỏ trống!')
                .run(req),
            body('DiaChi')
                .notEmpty()
                .withMessage('Địa chỉ chi nhánh không được bỏ trống!')
                .run(req)
            ])
             const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            const them = await ChiNhanhModel.ThemChiNhanh(dulieu.TenCN,dulieu.DiaChi, DuongDan);
            if(!them){
                return res.status(500).json({
                    success:false,
                    message:'Mở chi nhánh thất bại! Vui lòng kiểm tra lại'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Mở chi nhánh thành công!'
            })
       } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Mở chi nhánh thất bại: ' + error.message
            });
       }
    }
    static async ChinhSua_Ten_DiaChi(req, res) {
       const dulieu = req.body;
       try {
                await Promise.all([
    body('TenCN')
        .custom((value, { req }) => {
            const DiaChi = req.body.DiaChi;
           
            if (!value?.trim() && !DiaChi?.trim()) {
                throw new Error('Bạn phải nhập ít nhất tên chi nhánh hoặc địa chỉ chi nhánh!');
            }
         
            if (value && value.trim().length > 50) {
                throw new Error('Tên chi nhánh tối đa 50 ký tự!');
            }
            return true;
        })
        .run(req),

    body('DiaChi')
        .custom((value, { req }) => {
            const TenCN = req.body.TenCN;
         
            if (!value?.trim() && !TenCN?.trim()) {
                throw new Error('Bạn phải nhập ít nhất tên chi nhánh hoặc địa chỉ chi nhánh!');
            }
          
            if (value && value.trim().length > 100) {
                throw new Error('Địa chỉ chi nhánh tối đa 100 ký tự!');
            }
            return true;
        })
        .run(req),

    body('IDCN')
        .notEmpty().withMessage('ID chi nhánh là thông tin bắt buộc')
        .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
        .custom(async (value) => {
            const kiemtra = await ChiNhanhModel.kiemtraid(value);
            if (!kiemtra) throw new Error('ID chi nhánh không tồn tại!');
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
            const capnhat = await ChiNhanhModel.CapNhat_ThongTinMem(dulieu.TenCN,dulieu.DiaChi,dulieu.IDCN);
            if(!capnhat){
                return res.status(500).json({
                    success:false,
                    message:'Cập nhật thông tin thất bại!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Cập nhật thông tin thành công!'
            })
       } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Cập nhật thông tin thất bại: ' + error.message
            });
       }

    }
    static async ChinhSua_HinhAnh(req,res){
        try {
            const dulieu = req.body;
            const files = req.files;
            let pathFile = files[0].filename;
            let DuongDan = 'uploads/ChiNhanh/' + pathFile;
            if(!pathFile){
                return res.json({
                    status:true,
                    message:'Lỗi tải ảnh!'
                })
            };
            const dd_db = await ChiNhanhModel.LayChiTiet(dulieu.IDCN);
            const dd = dd_db[0].HINHANH;
            const xoa = xoaFileCu(dd);
            if(!xoa){
                return res.status(500).json({
                    success:false,
                    message:'lỗi khi thao tác hệ thống!'
                })
            }
            const update = await ChiNhanhModel.CapNhatAnh(dulieu.IDCN,DuongDan);
            if(!update){
                return res.status(500).json({
                    success:false,
                    message:'Không thể cập nhật hình ảnh chi nhánh!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Cập nhật ảnh chi nhánh thành công!'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Cập nhật hình ảnh chi nhánh thất bại: ' + error.message
            });
        }
    }
    static async ChinhSua_TrangThai_ChiNhanh(req, res) {

    }
    static async ChiTiet_ChiNhanh(req, res) {

    }
    static async TimKiem_ChiNhanh(req, res) {

    }

}