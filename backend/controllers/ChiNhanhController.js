import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import ChiNhanhModel from '../models/ChiNhanhModel.js';
import KhongGianModel from '../models/KhongGianModel.js';
import { xoaFileCu } from '../function.js';
import { body, query, validationResult } from 'express-validator';

export default class ChiNhanhController{
   static async DanhSach_ChiNhanh(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const DiaChi = req.query.DiaChi;
        const offset = (page - 1) * limit;
        try {
            await Promise.all([
                query('page')
                     .notEmpty()
                     .withMessage('trang không được bỏ trống')
                     .isInt({ min: 0 })
                     .withMessage('trang phải là số nguyên và không được âm!')
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
            let danhsach = DiaChi !== "" ?  
                await ChiNhanhModel.TimKiem(limit, offset, DiaChi, 1) :
                await ChiNhanhModel.LayDanhSach(limit, offset);
            
            return res.status(200).json({
                success: true,
                DanhSach: danhsach.DanhSach,
                TongDS: danhsach.TongDanhSach,
            });
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Lấy danh sách thất bại: ' + error.message
            });           
        }
   }
    static async Them_ChiNhanh(req, res) {
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
                    validate:true,
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
            const kiemtra = await ChiNhanhModel.kiemtraid(dulieu.IDCN);
            if(!kiemtra){
                return res.status(500).json({
                    success:false,
                    message:'Lỗi khi gửi ID chi nhánh lên!'
                })
            }
            const dd_db = await ChiNhanhModel.LayChiTiet(dulieu.IDCN);
            const dd = dd_db[0].HINHANH;
            /*const xoa = xoaFileCu(dd);
            if(!xoa){
                return res.status(500).json({
                    success:false,
                    message:'lỗi khi thao tác hệ thống!'
                })
            }*/
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
   
        const dulieu = req.body;
        try {
            await Promise.all([
                body('ThoiGianApDung')
                  .notEmpty()
                  .withMessage('ngày bắt đầu không được bỏ trống')
                  .custom(async (value, { req }) => {
                    //Trường hợp 1: phải lớn hơn hoặc bằng ngày hiện tại
                    const now = new Date();
                    const startDate = new Date(value);
                    if (startDate < now) {
                         throw new Error('Ngày chỉnh sửa chi nhánh phải lớn hơn hoặc bằng ngày hiện tại!');
                    }
                    return true;
                  }).run(req),
                body('IDCN')
                    .notEmpty().withMessage('ID chi nhánh là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .custom(async (value) => {
                    const kiemtra = await ChiNhanhModel.kiemtraid(value);
                         if (!kiemtra) throw new Error('ID chi nhánh không tồn tại!');
                        return true;
                    })
                    .run(req),
                body('TrangThai')
                    .notEmpty()
                    .withMessage('trạng thái không được bỏ trống')
                    .isIn([0, 1, '0', '1']).withMessage('Giá trị nhập vào chỉ được phép là số 0 hoặc 1!')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
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
        const update = await ChiNhanhModel.CapNhatTrangThai(parseInt(dulieu.IDCN),dulieu.ThoiGianApDung,parseInt(dulieu.TrangThai));
        if(!update){
            return res.status(500).json({
                success:false,
                message:'Cập nhật trạng thái chi nhánh thất bại!'
            })
        }
        return res.status(200).json({
            success:true,
            message:'Cập nhật trạng thái chi nhánh thành công!'
        })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Cập nhật hình ảnh chi nhánh thất bại: ' + error.message
            });
        }
    }
    static async ChiTiet_ChiNhanh(req, res) {
        const IDCN = req.query.IDCN;
        try {
            await Promise.all([
                query('IDCN')
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
}       const limit = 3;
        const offset = 0;
        const [chitiet1,chitiet2] = await Promise.all([
             ChiNhanhModel.LayChiTiet(IDCN),
            KhongGianModel.LayDanhSach(limit,offset, IDCN)
        ]);
        if(!chitiet1){
            return res.status(500).json({
                success:false,
                message:'Lỗi khi tải chi tiết chi nhánh!'
            })
        }
          if(!chitiet2){
            return res.status(500).json({
                success:false,
                message:'Lỗi khi tải danh sách không gian!'
            })
        }
        return res.status(200).json({
            success:true,
            chitiet1:chitiet1[0],
            chitiet2:chitiet2
        })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Lấy chi tiết chi nhánh thất bại: ' + error.message
            })
        }
    }
    static async TimKiem_ChiNhanh(req, res) {
        const DiaChi = req.query.DiaChi;
        const TrangThai = req.query.TrangThai;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const offset = (page - 1) * limit;
        try {
            const danhsach = await ChiNhanhModel.TimKiem(limit,offset,DiaChi,TrangThai);
            return res.status(200).json({
                success:true,
                danhsach:danhsach.DanhSach,
                TongDanhSach:danhsach.TongDanhSach
            })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Tìm kiếm chi nhánh thất bại: ' + error.message
            })
        }
    }


}