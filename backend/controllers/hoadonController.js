import hoadonModel from "../models/hoadonModel.js";
import DatLichModel from "../models/LichDatModel.js";
import LichDatController from "./LichDatController.js";
import { query, body, validationResult } from "express-validator";
import moment from "moment";
export default class hoadonController {
  // [POST] /api/admin/hoadon/detail (LẤY CHI TIẾT ẨN ID TRONG BODY)
  static async getHoaDonById(req, res) {
    try {
      // Validate ID_HOADON được truyền trên URL Query params (?ID_HOADON=...)
      await Promise.all([
        query("ID_LICH_DAT")
          .notEmpty()
          .withMessage("ID hóa đơn không được bỏ trống!")
          .isInt({ min: 1 })
          .withMessage("ID hóa đơn phải là số nguyên dương!")
          .custom(async (value) => {
            const check = await DatLichModel.kiemtraid(value);
            if (!check)
              throw new Error("Mã hóa đơn này không tồn tại trên hệ thống!");
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

      // 👈 Lấy dữ liệu từ req.query thay vì req.body
      const ID_LICH_DAT = req.query.ID_LICH_DAT;
      const item = await hoadonModel.getById(ID_LICH_DAT);

      if (!item) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Không tìm thấy thông tin hóa đơn!",
          });
      }

      // Trả về cục dữ liệu đã JOIN hoàn chỉnh, Frontend chỉ việc lôi ra dùng
      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /api/admin/hoadon (TẠO HÓA ĐƠN)
  static async createHoaDon(req, res) {
    try {
      const { GIA_TIEN, ID_LICHDAT } = req.body;
      await Promise.all([
        body("GIA_TIEN")
          .notEmpty()
          .withMessage("Giá tiền không được bỏ trống")
          .isFloat({ min: 0 })
          .withMessage(
            "Giá tiền phải là số thập phân hoặc số nguyên dương lớn hơn hoặc bằng 0",
          )
          .run(req),

        body("ID_LICHDAT")
          .notEmpty()
          .withMessage("id lịch đặt không được bỏ trống")
          .isInt()
          .withMessage("id lịch đặt phải là số nguyên")
          .custom(async (value, { req }) => {
            const testid = await DatLichModel.kiemtraid(value); // Hãy đảm bảo LichDatModel có hàm check id này
            if (!testid) throw new Error("ID lịch đặt không tồn tại!");
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

      // Thực hiện thêm mới dựa theo mẫu của ghế
      const insertSuccess = await hoadonModel.create(GIA_TIEN, ID_LICHDAT);

      if (!insertSuccess) {
        return res.status(500).json({
          success: false,
          message: "Thêm hóa đơn thất bại!",
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Thêm hóa đơn thành công!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
