// // import { hash, compare } from "bcrypt";
// // import khonggianModel from'../models/khonggianModel';
// // export default class khonggiancontroller{
// //     //Hàm lấy dánh sách không gian
// //     static async laydskhonggian(req,res){
// //         const
// //     }
// // }
// import { hash, compare } from "bcrypt";
// import khonggianModel from "../models/khonggianModel.js";
// import { body, validationResult } from "express-validator";
// export default class khonggiancontroller {
//   // 1. Hàm lấy danh sách không gian (Có hỗ trợ lọc theo trạng thái hoặc loại)
//   static async getAllSpaces(req, res) {
//     try {
//       const { status, type } = req.query;
//       let conditions = {};

//       // Nếu người dùng truyền param lọc trên URL (?status=Trong)
//       if (status) conditions.TRANG_THAI = status;
//       if (type) conditions.LOAI_KHONG_GIAN = type;

//       // Gọi Model để lấy dữ liệu từ Database
//       const spaces = await khonggianModel.findAll({ where: conditions });

//       return res.status(200).json({
//         success: true,
//         message: "Lấy danh sách không gian thành công!",
//         data: spaces,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Lỗi khi lấy danh sách không gian.",
//         error: error.message,
//       });
//     }
//   }

//   // 2. Hàm lấy chi tiết một không gian theo ID
//   static async getSpaceById(req, res) {
//     try {
//       const { id } = req.params;
//       const space = await khonggianModel.findByPk(id);

//       if (!space) {
//         return res.status(404).json({
//           success: false,
//           message: "Không tìm thấy không gian yêu cầu.",
//         });
//       }

//       return res.status(200).json({ success: true, data: space });
//     } catch (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//   }

//   // Ví dụ xử lý trong khonggiancontroller.js khi gọi hàm tạo mới:
//   static async createSpace(req, res) {
//     try {
//       const { TEN_KHONG_GIAN, LOAI_KHONG_GIAN, ID_GIA } = req.body;

//       await Promise.all([
//         body("TEN_KHONG_GIAN")
//           .notEmpty("Tên không gian không được bỏ trống")
//           .run(req),
//         body("LOAI_KHONG_GIAN")
//           .notEmpty("Loại không gian không được bỏ trống")
//           .run(req),
//         body("ID_GIA")
//           .custom(async (value) => {
//             if (LOAI_KHONG_GIAN == 0 && ID_GIA === "") {
//               throw new Error("ID giá không được để trống");
//             }
//             return true;
//           })
//           .run(req),
//       ]);

//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           message: "Dữ liệu không hợp lệ!",
//           errors: errors.array().map((err) => err.msg),
//         });
//       }

//       // Gọi hàm create từ Model SQL thuần
//       const insertId = await khonggianModel.create({
//         TEN_KHONG_GIAN,
//         LOAI_KHONG_GIAN,
//         ID_GIA,
//       });

//       if (!insertId) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Thêm thất bại" });
//       }

//       return res.status(201).json({
//         success: true,
//         message: "Tạo không gian thành công!",
//         data: { id: insertId },
//       });
//     } catch (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//   }

//   // 4. Hàm cập nhật thông tin không gian (Cập nhật NGAY_CAP_NHAT tự động)
//   static async updateSpace(req, res) {
//     try {
//       const { id } = req.params;
//       const updateData = req.body;

//       const space = await khonggianModel.findByPk(id);
//       if (!space) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Không tìm thấy không gian." });
//       }

//       // Gán thêm ngày cập nhật hiện tại trước khi lưu
//       updateData.NGAY_CAP_NHAT = new Date();

//       await space.update(updateData);

//       return res.status(200).json({
//         success: true,
//         message: "Cập nhật thông tin không gian thành công!",
//         data: space,
//       });
//     } catch (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//   }

//   // 5. Hàm cập nhật lịch bảo trì (Đặc thù cho NGAY_BAO_TRI, NGAY_XONG)
//   static async updateMaintenance(req, res) {
//     try {
//       const { id } = req.params;
//       const { NGAY_BAO_TRI, NGAY_XONG, TRANG_THAI } = req.body;

//       const space = await khonggianModel.findByPk(id);
//       if (!space) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Không tìm thấy không gian." });
//       }

//       await space.update({
//         TRANG_THAI: TRANG_THAI || "Bao_Tri",
//         NGAY_BAO_TRI: NGAY_BAO_TRI || new Date(),
//         NGAY_XONG: NGAY_XONG || null,
//         NGAY_CAP_NHAT: new Date(),
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Cập nhật trạng thái bảo trì thành công!",
//         data: space,
//       });
//     } catch (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//   }
// }
