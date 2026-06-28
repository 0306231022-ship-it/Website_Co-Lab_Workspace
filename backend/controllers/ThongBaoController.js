import thongBaoModel from "../models/thongBaoModel.js";
import nguoiDungModel from "../models/nguoiDungModel.js"; //  Nhớ tạo hoặc import đúng model người dùng của em để check id nhé
import { body, query, validationResult } from "express-validator";

export default class thongBaoController {

    // ========================================================
    // 1. [GET] /api/admin/thongbao/user (CHI TIẾT THEO IDND + PHÂN TRANG)
    // ========================================================
    static async getThongBaoByUser(req, res) {
        try {
            await Promise.all([
                query('IDND')
                    .notEmpty().withMessage('ID người dùng không được bỏ trống!')
                    .isInt({ min: 1 }).withMessage('ID người dùng phải là số nguyên dương!'),
                query('page').optional().isInt({ min: 1 }).withMessage('Số trang phải từ 1!'),
                query('limit').optional().isInt({ min: 1 }).withMessage('Số lượng bản ghi phải từ 1!')
            ]);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array().map(err => err.msg) });
            }

            const idnd = parseInt(req.query.IDND, 10);
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const offset = (page - 1) * limit;

            const result = await thongBaoModel.getByUserId(idnd, offset, limit);
            return res.status(200).json({ success: true, ...result });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // ========================================================
    // 2. [POST] /api/admin/thongbao (TẠO MỚI THÔNG BÁO)
    // ========================================================
    static async createThongBao(req, res) {
        try {
            const { TIEU_DE, NOI_DUNG, LOAI_THONGBAO, IDND } = req.body;

            await Promise.all([
                body('TIEU_DE')
                    .notEmpty().withMessage('Tiêu đề thông báo không được bỏ trống!')
                    .isLength({ max: 255 }).withMessage('Tiêu đề tối đa 255 ký tự!'),
                body('NOI_DUNG')
                    .notEmpty().withMessage('Nội dung thông báo không được bỏ trống!'),
                body('LOAI_THONGBAO')
                    .notEmpty().withMessage('Loại thông báo không được bỏ trống!')
                    .isInt().withMessage('Loại thông báo phải là mã số nguyên!'),
                body('IDND')
                    .notEmpty().withMessage('ID người dùng nhận thông báo không được bỏ trống!')
                    .isInt({ min: 1 }).withMessage('ID người dùng phải là số nguyên dương!')
            ]);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array().map(err => err.msg) });
            }

            const success = await thongBaoModel.create(TIEU_DE.trim(), NOI_DUNG.trim(), LOAI_THONGBAO, IDND);
            if (!success) {
                return res.status(500).json({ success: false, message: "Thêm thông báo thất bại!" });
            }

            return res.status(201).json({ success: true, message: "Tạo thông báo thành công!" });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // ========================================================
    // 3. [DELETE] /api/admin/thongbao (XÓA 1 THÔNG BÁO THEO ID_THONGBAO)
    // ========================================================
    static async deleteThongBao(req, res) {
        try {
            const { ID_THONGBAO } = req.body;

            await Promise.all([
                body('ID_THONGBAO')
                    .notEmpty().withMessage('ID thông báo cần xóa không được để trống!')
                    .isInt({ min: 1 }).withMessage('ID thông báo phải là số nguyên dương!')
                    .custom(async (value) => {
                        const check = await thongBaoModel.testId(value);
                        if (!check) throw new Error('ID thông báo này không tồn tại trên hệ thống!');
                        return true;
                    })
            ]);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array().map(err => err.msg) });
            }

            const success = await thongBaoModel.deleteById(ID_THONGBAO);
            if (!success) {
                return res.status(500).json({ success: false, message: "Xóa thông báo thất bại!" });
            }

            return res.status(200).json({ success: true, message: "Xóa thông báo thành công!" });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // ========================================================
    // 4. [DELETE] /api/admin/thongbao/all (XÓA TOÀN BỘ THEO IDND)
    // ========================================================
    static async deleteAllThongBaoByUserId(req, res) {
        try {
            const { IDND } = req.body;

            await Promise.all([
                body('IDND')
                    .notEmpty().withMessage('ID người dùng để dọn sạch thông báo không được bỏ trống!')
                    .isInt({ min: 1 }).withMessage('ID người dùng phải là số nguyên dương!')
            ]);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array().map(err => err.msg) });
            }

            await thongBaoModel.deleteAllByUserId(IDND);
            return res.status(200).json({ success: true, message: "Đã dọn sạch toàn bộ thông báo của người dùng này!" });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}