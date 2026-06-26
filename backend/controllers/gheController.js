
import GheModel from "../models/gheModel.js";
import KhongGianModel from '../models/KhongGianModel.js';
import dmGhe from "../models/danhmucgheModel.js";
import { body, param, query, validationResult } from "express-validator";

export default class gheController {
    

    static async getGheById(req, res) {
        try {
            // Validate ID ghế nằm trên URL params thông qua param() thay vì body() để khớp RESTful API 
            // Sử dụng custom validator gọi hàm testId của GheModel tương tự cách viết mẫu
            await Promise.all([
                query('ghe')
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
        
            const id  = req.query.ghe;

            const item = await GheModel.getById(id);
            // lấy lịch sử đặt lịch tại ghế đó
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
                    .isInt().withMessage('Tọa độ X phải là dạng số')
                    .run(req),
                body('TOA_Y')
                    .notEmpty().withMessage('Tọa độ Y không được để trống!')
                    .isInt().withMessage('Tọa độ Y phải là dạng số')
                    .run(req),
                body('TRANG_THAI')
                    .notEmpty().withMessage('Trạng thái không được để trống!')
                    .isInt().withMessage('Trạng thái phải là số nguyên')
                    .run(req),
                body('ID_KHONG_GIAN')
                    .notEmpty().withMessage('ID không gian không được để trống!')
                    .isInt().withMessage('ID không gian phải là số nguyên')
                    .custom(async (value, { req }) => {
                        const checkid = await KhongGianModel.kiemtraid(value);
                        if(!checkid) throw new Error('ID không gian không tồn tại!');
                        return true;
                    })
                    .run(req),
                body('ID_DANH_MUC')
                    .notEmpty().withMessage('ID danh mục không được để trống!')
                    .isInt().withMessage('ID danh mục phải là số nguyên')
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