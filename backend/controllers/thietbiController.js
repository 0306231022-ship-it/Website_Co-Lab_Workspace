import ThietBi from "../models/thietbiModel.js";
import { body, query, validationResult } from 'express-validator';

// ========================================================
// MIDDLEWARE KIỂM TRA VÀ TRẢ VỀ LỖI VALIDATION
// ========================================================
const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ!',
            errors: errors.array().map(err => err.msg)
        });
    }
    next();
};
// [GET] /api/admin/thietbi
export const getAllThietBi = async (req, res) => {
    try {
        // Tự động validate query params (nếu có truyền)
        await Promise.all([
            query('page').optional().isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương lớn hơn 0').run(req),
            query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Số lượng hiển thị phải từ 1 đến 100').run(req)
        ]);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array().map(err => err.msg) });
        }

        const { page, limit } = req.query;
        const result = await ThietBi.getAll(page, limit);
        
        res.status(200).json({ 
            success: true, 
            data: result.data,
            pagination: result.pagination 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/admin/thietbi/:id
export const getThietBiById = async (req, res) => {
    try {
        // Tự động kiểm tra ID bằng param()
        await Promise.all([
            body('ID_THIET_BI')
                .notEmpty().withMessage('id thiết bị không được bỏ trống!')
              .isInt().withMessage('ID thiết bị phải là số nguyên')
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
        const item = await ThietBi.getById(id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thiết bị!" });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/admin/thietbi
export const createThietBi = async (req, res) => {
    try {
        const { TEN_THIET_BI, HINH_ANH } = req.body;
        await Promise.all([
            body('TEN_THIET_BI')
                .notEmpty()
                .withMessage('tên thiết bị không được bỏ trống')
                .isLength({max:255}).withMessage('Tên thiết bị tối đa 255 lý tự')
                .run(req),
                body('HINH_ANH')
                .notEmpty()
                .withMessage('hình ảnh thiết bị không được bỏ trống')
                .run(req)
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
        const insertId = await ThietBi.create(TEN_THIET_BI.trim(), HINH_ANH ? HINH_ANH.trim() : null);
        if(!insertId){
            return res.status(500).json({
                success:false,
                message:'Thêm thiết bị thất bại!'
            })
        }
        res.status(200).json({ success: true, message: "Thêm thiết bị thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PUT] /api/admin/thietbi/:id
export const updateThietBi = async (req, res) => {
    try {
        await Promise.all([
            body('ID_THIET_BI')
                .notEmpty().withMessage('id thiết bị không được bỏ trống!')
              .isInt().withMessage('ID thiết bị phải là số nguyên')
              .custom(async (value)=>{
                const check = await ThietBi.testid(value);
                if(!check) throw new Error('ID không tồn tại!')
                return true;
              })
            .run(req),
            body('TEN_THIET_BI')
                .notEmpty().withMessage('Tên thiết bị không được để trống!')
                .isString().withMessage('id thiết bi')
                .isLength({ max: 255 }).withMessage('Tên thiết bị không được vượt quá 255 ký tự!')
                .run(req),
            body('HINH_ANH')
                .notEmpty().withMessage('Hình ảnh thiết bị không được để trống!')
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

        const { TEN_THIET_BI, HINH_ANH , ID_THIET_BI } = req.body;

        const updated = await ThietBi.update(ID_THIET_BI, TEN_THIET_BI.trim(), HINH_ANH ? HINH_ANH.trim() : null);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Thiết bị không tồn tại hoặc dữ liệu không có thay đổi!" });
        }
        res.status(200).json({ success: true, message: "Cập nhật thiết bị thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};