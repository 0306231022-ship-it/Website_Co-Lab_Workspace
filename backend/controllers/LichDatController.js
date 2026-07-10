import { body, query, validationResult } from "express-validator";
import NguoiDungModel from "../models/NguoiDungModel.js";
import KhongGianModel from "../models/KhongGianModel.js";
import DatLichModel from "../models/LichDatModel.js";
import GheModel from "../models/gheModel.js";
import moment from "moment";
export default class LichDatController {
  static async DatLich(req, res) {
    const dulieu = req.body;
    try {
      await Promise.all([
        body("KHUNG_BATDAU")
          .notEmpty()
          .withMessage("Thời gian bắt đầu không được để trống.")
          .isISO8601()
          .withMessage("Thời gian bắt đầu không đúng định dạng ngày tháng.")
          .custom((value) => {
            if (new Date(value) < new Date())
              throw new Error(
                "Không thể đặt lịch cho thời gian trong quá khứ.",
              );
            const formats = [
              "YYYY-MM-DD HH:mm:ss",
              "YYYY-MM-DDTHH:mm:ss",
              "YYYY-MM-DD",
            ];
            const dateCheck = moment(value, formats, true);
            if (!dateCheck.isValid())
              throw new Error("thời gian bắt đầu không hợp lệ!");
            return true;
          })
          .run(req),
        body("KHUNG_KETTHUC")
          .notEmpty()
          .withMessage("Thời gian kết thúc không được để trống.")
          .isISO8601()
          .withMessage("Thời gian kết thúc không đúng định dạng ngày tháng.")
          .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.KHUNG_BATDAU))
              throw new Error(
                "Thời gian kết thúc phải lớn hơn thời gian bắt đầu.",
              );
            const formats = [
              "YYYY-MM-DD HH:mm:ss",
              "YYYY-MM-DDTHH:mm:ss",
              "YYYY-MM-DD",
            ];
            const dateCheck = moment(value, formats, true);
            if (!dateCheck.isValid())
              throw new Error("thời gian kết thúc không hợp lệ!");
            return true;
          })
          .run(req),
        body("IDND")
          .notEmpty()
          .withMessage("Mã người dùng không được để trống.")
          .isInt({ min: 1 })
          .withMessage("Mã người dùng phải là một số nguyên hợp lệ.")
          .custom(async (value, { req }) => {
            const kiemtra = await NguoiDungModel.findByid(value);
            if (!kiemtra) throw new Error("Người dùng không tồn tại!");
            return true;
          })
          .run(req),
        body()
          .custom(async (body) => {
            const { ID_KHONG_GIAN, ID_GHE } = body;
            if (!ID_KHONG_GIAN && !ID_GHE)
              throw new Error("Vui lòng chọn Phòng họp hoặc Ghế ngồi.");
            if (ID_KHONG_GIAN && ID_GHE)
              throw new Error(
                "Không thể vừa đặt Phòng họp vừa đặt Ghế ngồi cùng lúc.",
              );
            if (ID_KHONG_GIAN) {
              const kiemtra = await KhongGianModel.kiemtraid(ID_KHONG_GIAN);
              if (!kiemtra) throw new Error("Phòng họp không tồn tại!");
            }
            if (ID_GHE) {
              const kiemtra2 = await GheModel.testId(ID_GHE);
              if (!kiemtra2) throw new Error("Ghế không tồn tại!");
            }
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
      const DatLich = await DatLichModel.DatLich(dulieu);

      if (!DatLich) {
        return res.status(409).json({
          success: false,
          message: "Đặt lịch thất bại!",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Đặt lịch thành công!",
      });
    } catch (error) {
      return res.status(409).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi hệ thống!",
      });
    }
  }
  static async DanhSachDatLich(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      await Promise.all([
        query("page")
          .notEmpty()
          .withMessage("Số lượng không được bỏ trống")
          .isInt({ min: 0 })
          .withMessage("Số trang phải là số nguyên và không được âm!")
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
      const DanhSach = await DatLichModel.DanhSach(limit, offset);
      return res.status(200).json({
        success: true,
        danhsach: DanhSach.DanhSach,
        TongDanhSach: DanhSach.TongDanhSach,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lấy danh sách thất bại: " + error.message,
      });
    }
  }
  static async LichSuDat_theoID_ghe(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const IDGHE = parseInt(req.query.IDGHE);
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      await Promise.all([
        query("page")
          .notEmpty()
          .withMessage("Số lượng không được bỏ trống")
          .isInt({ min: 0 })
          .withMessage("Số trang phải là số nguyên và không được âm!")
          .run(req),
        query("IDGHE")
          .notEmpty()
          .withMessage("id ghế không được bỏ trống!")
          .isInt()
          .withMessage("ID ghế phải là số nguyên")
          .custom(async (value) => {
            const check = await GheModel.testId(value);
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
      const danhsach = await DatLichModel.DanhSach_theoIDGHE(
        limit,
        offset,
        IDGHE,
      );
      return res.status(200).json({
        success: true,
        DanhSach: danhsach.DanhSach,
        TongSo: danhsach.TongSo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lấy danh sách lịch sử đặt ghế thất bại: " + error.message,
      });
    }
  }
  static async LichDat_HoatDong(req, res) {
    try {
      const lichdat = await DatLichModel.DanhSachDang_HoatDong();
      return res.status(200).json({
        success: true,
        DanhSach: lichdat,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lấy danh sách thất bại: " + error.message,
      });
    }
  }
  static async LichSuDat_theoIDND(req, res) {
    const userId = req.user?.id || req.query?.id;
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 3;
      const offset = (page - 1) * limit;
      await Promise.all([
        query("page")
          .notEmpty()
          .withMessage("Số lượng không được bỏ trống")
          .isInt({ min: 0 })
          .withMessage("Số trang phải là số nguyên và không được âm!")
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
      const lichsu = await DatLichModel.DanhSach_theoIDND(
        limit,
        offset,
        userId,
      );
      return res.status(200).json({
        success: true,
        DanhSach: lichsu.DanhSach,
        TongSo: lichsu.TongSo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lấy danh sách lịch sử đặt thất bại: " + error.message,
      });
    }
  }
  static async ChiTiet_LichDat_theoIDDL(req, res) {
    const id = req.query.Id;
    const userId = req.user.id;
    try {
      const kiemtra = await DatLichModel.kiemtraid(id);
      if (!kiemtra) {
        return res.status(404).json({
          success: false,
          message: "Lịch đặt không tồn tại.",
        });
      }
      const kiemtra2 = await DatLichModel.kiemtraidND(id, userId);
      if (!kiemtra2) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập chi tiết lịch đặt này.",
        });
      }
      const lichDat = await DatLichModel.ChiTiet_LichDat_theoIDDL(id);
      if (!lichDat.success) {
        return res.status(404).json({
          success: false,
          message: lichDat.message,
        });
      }
      return res.status(200).json({
        success: true,
        lichDat: {
          cHITiet_NguoiDung: lichDat.ChiTiet_NguoiDung,
          ChiTiet_ThoiGian: lichDat.ChiTiet_ThoiGian,
          ChiTiet_Ghe_KhongGian: lichDat.ChiTiet_Ghe_KhongGian,
          ChiTiet_HoaDon: lichDat.ChiTiet_HoaDon,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lấy chi tiết lịch đặt thất bại: " + error.message,
      });
    }
  }
}
