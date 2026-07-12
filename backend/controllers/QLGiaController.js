import { hash, compare } from "bcrypt";
import giaModel from "../models/QLGiaModel.js";
import { body, query, validationResult } from "express-validator";
import dmGhe from "../models/danhmucgheModel.js";

export default class giaController {
  static async getAllGia(req, res) {
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
      const result = await giaModel.getAll(ofset, limit);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getGiaById(req, res) {
    try {
      // Validate ID_GIA truyền trên Query params (?ID_GIA=...)
      await Promise.all([
        query("ID_GIA")
          .notEmpty()
          .withMessage("ID bảng giá không được bỏ trống!")
          .isInt({ min: 1 })
          .withMessage("ID bảng giá phải là số nguyên dương!")
          .custom(async (value) => {
            const check = await giaModel.testid(value);
            if (!check)
              throw new Error("Mã bảng giá này không tồn tại trên hệ thống!");
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


      const { ID_GIA } = req.query;
      const item = await giaModel.getById(ID_GIA);

      if (!item) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Không tìm thấy thông tin bảng giá!",
          });
      }

      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createGia(req, res) {
    try {
      const { TEN_GIA, MOTA, DON_GIA, DANHMUC_GHE } = req.body;
      await Promise.all([
        body("TEN_GIA")
          .notEmpty()
          .withMessage("tên bảng giá không được bỏ trống")
          .isLength({ max: 255 })
          .withMessage("Tên thiết bị tối đa 255 lý tự")
          .run(req),
        body("MOTA")
          .optional({ nullable: true, checkFalsy: true })
          .isLength({ max: 1000 })
          .withMessage("Mô tả tối đa 1000 ký tự!")
          .run(req),
        body("DON_GIA")
          .notEmpty()
          .withMessage("Đơn giá không được bỏ trống!")
          .isFloat({ min: 0 })
          .withMessage("Đơn giá phải là số và không được âm!")
          .run(req),
        body("DANHMUC_GHE")
          .notEmpty()
          .withMessage("Danh mục ghế không được bỏ trống!")
          .isInt({ min: 1 })
          .withMessage("Danh mục ghế phải là số nguyên dương!")
          .custom(async (value) => {
              // Tự động kiểm tra danh mục ghế tồn tại nếu em có Model danh mục ghế
             const check = await dmGhe.testid(value);
               if (!check) throw new Error('ID danh mục ghế không tồn tại!');
              return true;
           })
          .run(req),
      ]);
    
      // Thực hiện thêm mới dựa theo Model (đã hỗ trợ trim() tên bảng giá)
      const insertSuccess = await giaModel.create(
        TEN_GIA.trim(),
        MOTA ? MOTA.trim() : null,
        DON_GIA,
        DANHMUC_GHE,
      );

      if (!insertSuccess) {
        return res.status(500).json({
          success: false,
          message: "Thêm mới bảng giá thất bại!",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Thêm mới bảng giá thành công!",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

 static async updateGia(req, res) {
  try {
    // 1. Lấy dữ liệu từ req.body (FormData đẩy lên chuỗi string nên cần ép kiểu số cho các trường ID/Giá)
    const ID_GIA = req.body.ID_GIA ? Number(req.body.ID_GIA) : undefined;
    const DON_GIA = req.body.DON_GIA ? Number(req.body.DON_GIA) : undefined;
    const DANHMUC_GHE = req.body.DANHMUC_GHE ? Number(req.body.DANHMUC_GHE) : undefined;
    
    const { TEN_GIA, MOTA, PHUONG_THUC_CAP_NHAT } = req.body;

    // Đẩy ngược lại vào req.body các giá trị đã ép kiểu số để express-validator kiểm tra chính xác
    req.body.ID_GIA = ID_GIA;
    req.body.DON_GIA = DON_GIA;
    req.body.DANHMUC_GHE = DANHMUC_GHE;

    // 2. Validate toàn bộ các trường cập nhật khớp theo Frontend
    await Promise.all([
      body("ID_GIA")
        .notEmpty()
        .withMessage("ID bảng giá cần cập nhật không được bỏ trống!")
        .isInt({ min: 1 })
        .withMessage("ID bảng giá phải là số nguyên dương!")
        .custom(async (value) => {
          const check = await giaModel.testid(value);
          if (!check) throw new Error("ID bảng giá cần cập nhật không tồn tại!");
          return true;
        })
        .run(req),
      body("TEN_GIA")
        .notEmpty()
        .withMessage("Tên bảng giá không được bỏ trống!")
        .isLength({ max: 255 })
        .withMessage("Tên bảng giá tối đa 255 ký tự!")
        .run(req),
      body("MOTA")
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage("Mô tả tối đa 1000 ký tự!")
        .run(req),
      body("DON_GIA")
        .notEmpty()
        .withMessage("Đơn giá không được bỏ trống!")
        .isFloat({ min: 1 })
        .withMessage("Đơn giá điều chỉnh phải lớn hơn 0 đ!")
        .run(req),
      body("DANHMUC_GHE")
        .notEmpty()
        .withMessage("Danh mục ghế không được bỏ trống!")
        .isInt({ min: 1 })
        .withMessage("Danh mục ghế phải là số nguyên dương!")
        .run(req),
      body("PHUONG_THUC_CAP_NHAT")
        .notEmpty()
        .withMessage("Phương thức cập nhật không được bỏ trống!")
        .isIn(["overwrite", "history"])
        .withMessage("Phương thức cập nhật không hợp lệ!")
        .run(req),
    ]);

    // Trả về lỗi nếu dữ liệu không qua được vòng kiểm tra
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        validate: true, // Đồng bộ với Frontend: if (res.validate)
        success: false,
        message: "Dữ liệu cấu hình không hợp lệ!",
        errors: errors.array().map((err) => err.msg),
      });
    }

    // 3. Gọi Tầng Model xử lý nghiệp vụ kiểm tra chung đụng với Không gian/Phòng họp
    // (Truyền thêm tham số PHUONG_THUC_CAP_NHAT vào hàm xử lý giá)
    const updateSuccess = await giaModel.update(
      ID_GIA,
      TEN_GIA.trim(),
      MOTA ? MOTA.trim() : null,
      DON_GIA,
      DANHMUC_GHE,
      PHUONG_THUC_CAP_NHAT
    );

    if (!updateSuccess) {
      return res.status(200).json({
        success: false,
        message: "Cập nhật bảng giá thất bại hoặc không có thay đổi mới nào được ghi nhận!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật bảng giá hệ thống thành công!",
    });
    
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi xử lý máy chủ: " + error.message 
    });
  }
}


         
    static async LayBangGia_KhongGian(req,res){
        try {
            const giatri = await giaModel.LayBangGia_KhongGian();
            return res.status(200).json({
                success:true,
                dulieu:giatri
            })
        } catch (error) {
             return res.status(500).json({ success: false, message: error.message });
        }
    }
  }

