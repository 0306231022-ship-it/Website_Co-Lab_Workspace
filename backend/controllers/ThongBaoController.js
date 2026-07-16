import thongBaoModel from "../models/ThongBaoModels.js";
import NguoiDungController from "./NguoiDungController.js";
import { body, query, validationResult } from "express-validator";

export default class thongBaoController {

    // ========================================================
    // 1. [GET] /api/admin/thongbao/user (CHI TIẾT THEO IDND + PHÂN TRANG)
    // ========================================================
    static async getThongBaoByUser(req, res) {
        const userId = req.user.id;

        try {
    
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const offset = (page - 1) * limit;

            const result = await thongBaoModel.getByUserId(userId, offset, limit);
            return res.status(200).json({ success: true, ...result });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

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
             const userId = req.user.id;
            const kq = await thongBaoModel.deleteAllByUserId(userId);
            if(!kq){
                return res.status(500).json({
                    success:false,
                    message:'Không thể xóa tất cả thông báo!'
                })
            }
            return res.status(200).json({ success: true, message: "Đã dọn sạch toàn bộ thông báo của người dùng này!" });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}