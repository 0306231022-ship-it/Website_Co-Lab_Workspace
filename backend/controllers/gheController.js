import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import GheModel from "../models/gheModel.js";
import { body, param, query, validationResult } from "express-validator";

export default class gheController {
    
    // [GET] /api/admin/ghe
    static async getAllGhe(req, res) {
        try {
            // Tự động validate query params (nếu có truyền) dựa theo cách viết của danh mục ghế
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

            // Tính toán offset/limit giống hệt bên danh mục ghế (nếu sau này em cần bật lại phân trang ở model)
            // Hiện tại model không phân trang thì lấy toàn bộ, nhưng logic tính toán này giữ nguyên để giống cách code mẫu
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit || 10);
            const ofset = (page - 1) * limit;
            
            const result = await GheModel.getAll(); // Gọi hàm lấy toàn bộ của Ghế Model
            
            res.status(200).json({ 
                success: true, 
                data: result
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // [GET] /api/admin/ghe/:id
    static async getGheById(req, res) {
        try {
            // Validate ID ghế nằm trên URL params thông qua param() thay vì body() để khớp RESTful API 
            // Sử dụng custom validator gọi hàm testId của GheModel tương tự cách viết mẫu
            await Promise.all([
                param('id')
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
        
            const { id } = req.params;
            const item = await GheModel.getById(id);
            
            if (!item) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thông tin ghế!" });
            }
            res.status(200).json({ success: true, data: item });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // [POST] /api/admin/ghe
    static async createGhe(req, res) {
        try {
            const { TEN_GHE, TOA_X, TOA_Y, ID_KHONG_GIAN, ID_DANH_MUC } = req.body;
            
            // Validate toàn bộ các trường của bảng ghế bằng Promise.all giống hệt mẫu
            await Promise.all([
                body('TEN_GHE')
                    .notEmpty()
                    .withMessage('tên ghế không được bỏ trống')
                    .isLength({ max: 255 }).withMessage('Tên ghế tối đa 255 ký tự')
                    .run(req),
                body('TOA_X')
                    .notEmpty().withMessage('tọa độ X không được bỏ trống')
                    .isFloat().withMessage('tọa độ X phải là số số thập phân hoặc số nguyên')
                    .run(req),
                body('TOA_Y')
                    .notEmpty().withMessage('tọa độ Y không được bỏ trống')
                    .isFloat().withMessage('tọa độ Y phải là số số thập phân hoặc số nguyên')
                    .run(req),
                body('ID_KHONG_GIAN')
                    .notEmpty().withMessage('id không gian không được bỏ trống')
                    .isInt().withMessage('id không gian phải là số nguyên')
                    .run(req),
                body('ID_DANH_MUC')
                    .notEmpty().withMessage('id danh mục không được bỏ trống')
                    .isInt().withMessage('id danh mục phải là số nguyên')
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
            res.status(200).json({ success: true, message: "Thêm ghế thành công!", id: insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // [PUT] /api/admin/ghe/:id
   static async updateGhe(req, res) {
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
                body('TOA_X')
                    .notEmpty().withMessage('Tọa độ X không được để trống!')
                    .isFloat().withMessage('Tọa độ X phải là dạng số')
                    .run(req),
                body('TOA_Y')
                    .notEmpty().withMessage('Tọa độ Y không được để trống!')
                    .isFloat().withMessage('Tọa độ Y phải là dạng số')
                    .run(req),
                body('TRANG_THAI')
                    .notEmpty().withMessage('Trạng thái không được để trống!')
                    .isInt().withMessage('Trạng thái phải là số nguyên')
                    .run(req),
                body('ID_KHONG_GIAN')
                    .notEmpty().withMessage('ID không gian không được để trống!')
                    .isInt().withMessage('ID không gian phải là số nguyên')
                    .run(req),
                body('ID_DANH_MUC')
                    .notEmpty().withMessage('ID danh mục không được để trống!')
                    .isInt().withMessage('ID danh mục phải là số nguyên')
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

            // Lấy ID_GHE từ body ra cùng các trường khác giống hệt create
            const { ID_GHE, TEN_GHE, TOA_X, TOA_Y, TRANG_THAI, ID_KHONG_GIAN, ID_DANH_MUC } = req.body;

            const updated = await GheModel.update(ID_GHE, {
                TEN_GHE: TEN_GHE.trim(),
                TOA_X,
                TOA_Y,
                TRANG_THAI,
                ID_KHONG_GIAN,
                ID_DANH_MUC
            });

            if (!updated) {
                return res.status(404).json({ success: false, message: "Ghế không tồn tại hoặc dữ liệu không có thay đổi!" });
            }
            res.status(200).json({ success: true, message: "Cập nhật thông tin ghế thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}