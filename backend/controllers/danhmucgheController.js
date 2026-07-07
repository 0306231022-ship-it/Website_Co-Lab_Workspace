import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import dmGhe from "../models/danhmucgheModel.js";
import { body, query, validationResult } from "express-validator";

export default class danhmucgheController{
static async getAllDanhMucGhe(req, res) {
    try {
        await Promise.all([
            query('page')
                .notEmpty()
                .withMessage('Trang không được bỏ trống!')
                .isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương lớn hơn 0')
                .run(req),
        ]);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array().map(err => err.msg) });
        }

       const page= parseInt(req.query.page);
       const limit = parseInt(req.query.limit|| 10);
       const ofset = (page-1) * limit;
       const result = await dmGhe.getAll(ofset, limit);
        
        res.status(200).json({ 
            success: true, 
            data: result.data,
            pagination: result.pagination 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// [GET] /api/admin/danh mục ghế/:id
static async getDanhMucGheById (req, res) {
    try {
        await Promise.all([
            body('ID_DANHMUC')
              .notEmpty().withMessage('id danh mục ghế không được bỏ trống!')
              .isInt().withMessage('ID danh mục ghế phải là số nguyên')
              .custom(async (value)=>{
                const check = await ThietBi.testid(value);
                if(!check) throw new Error('ID không tồn tại!')
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
    
        const { id } = req.params;
        const item = await dmGhe.getById(id);
        //trả về danh sách các danh mục ghế đc cấp phát
        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục ghế!" });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/admin/danh mục ghế
static async createDanhMucGhe (req, res){
    try {
        const { TEN_DANHMUC } = req.body;
        await Promise.all([
            body('TEN_DANHMUC')
                .notEmpty()
                .withMessage('tên danh mục ghế không được bỏ trống')
                .isLength({max:255}).withMessage('Tên danh mục ghế tối đa 255 lý tự')
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

        // Thực hiện thêm mới (Loại bỏ khoảng trắng thừa bằng .trim())
        const insertId = await dmGhe.create(TEN_DANHMUC.trim());
        if(!insertId){
            return res.status(500).json({
                success:false,
                message:'Thêm danh mục ghế thất bại!'
            })
        }
        res.status(200).json({ success: true, message: "Thêm danh mục ghế thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


static async updateDanhMucGhe (req, res)  {
    try {
        await Promise.all([
            body('ID_DANHMUC')
                .notEmpty().withMessage('id danh mục ghế không được bỏ trống!')
              .isInt().withMessage('ID danh mục ghế phải là số nguyên')
              .custom(async (value)=>{
                const check = await dmGhe.testid(value);
                if(!check) throw new Error('ID không tồn tại!')
                return true;
              })
            .run(req),
            body('TEN_DANHMUC')
                .notEmpty().withMessage('Tên danh mục ghế không được để trống!')
                .isString().withMessage('id danh mục ghế')
                .isLength({ max: 255 }).withMessage('Tên danh mục ghế không được vượt quá 255 ký tự!')
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

        const { TEN_DANHMUC, ID_DANHMUC } = req.body;

        const updated = await dmGhe.update(ID_DANHMUC, TEN_DANHMUC.trim());
        if (!updated) {
            return res.status(404).json({ success: false, message: "danh mục không tồn tại hoặc dữ liệu không có thay đổi!" });
        }
        res.status(200).json({ success: true, message: "Cập nhật danh muc ghế thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
    static async LayDL_DnhMuc(req,res){
        try {
            const ketqua = await dmGhe.LayDL_DnhMuc();
            return res.status(200).json({
                success:true,
                dulieu:ketqua
            })
        } catch (error) {
             res.status(500).json({ success: false, message: error.message });
        }
    }
}