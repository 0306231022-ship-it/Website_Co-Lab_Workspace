import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import ThietBi from "../models/thietbiModel.js";
import { body, query, validationResult } from "express-validator";
import ChiTietThietBiModel from "../models/ChiTiet_ThietBiModel.js";

export default class thietbiController {
  static async getAllThietBi(req, res) {
    try {
      await Promise.all([
        query("page")
          .notEmpty()
          .withMessage("Trang không được bỏ trống!")
          .isInt({ min: 1 })
          .withMessage("Số trang phải là số nguyên dương lớn hơn 0")
          .run(req),
      ]);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({
            success: false,
            errors: errors.array().map((err) => err.msg),
          });
      }
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit || 10);
      const ofset = (page - 1) * limit;
      const result = await ThietBi.getAll(ofset, limit);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [GET] /api/admin/thietbi
  static async getThietBiById(req, res) {
    try {
      await Promise.all([
        query("ID_THIET_BI")
          .notEmpty()
          .withMessage("id thiết bị không được bỏ trống!")
          .isInt()
          .withMessage("ID thiết bị phải là số nguyên")
          .custom(async (value) => {
            const check = await ThietBi.testid(value);
            if (!check) throw new Error("ID không tồn tại!");
            return true;
          })
          .run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ!",
          errors: errors.array().map((err) => err.msg),
        });
      }

      const id = req.query.ID_THIET_BI;
      const [item1, item2] = await Promise.all([
        ThietBi.getById(id),
        ChiTietThietBiModel.DanhSach_thietbi_cap_khonggian(id),
      ]);
      //trả về danh sách các thiết bị đc cấp phát
      if (!item1) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy thiết bị!" });
      }
      res.status(200).json({
        success: true,
        data: {
          ChiTiet: item1,
          DanhSach: item2,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /api/admin/thietbi
  static async createThietBi(req, res) {
    try {
      const { TEN_THIET_BI, HINH_ANH } = req.body;
      await Promise.all([
        body("TEN_THIET_BI")
          .notEmpty()
          .withMessage("tên thiết bị không được bỏ trống")
          .isLength({ max: 255 })
          .withMessage("Tên thiết bị tối đa 255 lý tự")
          .run(req),
        body("HINH_ANH")
          .notEmpty()
          .withMessage("hình ảnh thiết bị không được bỏ trống")
          .run(req),
      ]);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ!",
          errors: errors.array().map((err) => err.msg),
        });
      }

      // Thực hiện thêm mới (Loại bỏ khoảng trắng thừa bằng .trim())
      const insertId = await ThietBi.create(
        TEN_THIET_BI.trim(),
        HINH_ANH ? HINH_ANH.trim() : null,
      );
      if (!insertId) {
        return res.status(500).json({
          success: false,
          message: "Thêm thiết bị thất bại!",
        });
      }
      res
        .status(200)
        .json({ success: true, message: "Thêm thiết bị thành công!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateThietBi(req, res) {
    try {
      await Promise.all([
        body("ID_THIET_BI")
          .notEmpty()
          .withMessage("id thiết bị không được bỏ trống!")
          .isInt()
          .withMessage("ID thiết bị phải là số nguyên")
          .custom(async (value) => {
            const check = await ThietBi.testid(value);
            if (!check) throw new Error("ID không tồn tại!");
            return true;
          })
          .run(req),
        body("TEN_THIET_BI")
          .notEmpty()
          .withMessage("Tên thiết bị không được để trống!")
          .isString()
          .withMessage("id thiết bi")
          .isLength({ max: 255 })
          .withMessage("Tên thiết bị không được vượt quá 255 ký tự!")
          .run(req),
        body("HINH_ANH")
          .notEmpty()
          .withMessage("Hình ảnh thiết bị không được để trống!")
          .run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ!",
          errors: errors.array().map((err) => err.msg),
        });
      }

      const { TEN_THIET_BI, HINH_ANH, ID_THIET_BI } = req.body;

      const updated = await ThietBi.update(
        ID_THIET_BI,
        TEN_THIET_BI.trim(),
        HINH_ANH ? HINH_ANH.trim() : null,
      );
      if (!updated) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Thiết bị không tồn tại hoặc dữ liệu không có thay đổi!",
          });
      }
      res
        .status(200)
        .json({ success: true, message: "Cập nhật thiết bị thành công!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
