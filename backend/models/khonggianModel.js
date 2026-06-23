// import { execute } from "../config/db.js";

// export default class khonggianModel {
//   // 1. Lấy danh sách không gian (Có lọc theo trạng thái nếu cần)
//   static async all(status = null) {
//     try {
//       let query = "SELECT * FROM khonggian";
//       let params = [];

//       if (status) {
//         query += " WHERE TRANG_THAI = ?";
//         params.push(status);
//       }

//       const [rows] = await execute(query, params);
//       return rows ?? [];
//     } catch (error) {
//       throw new Error("Database query failed: " + error.message);
//     }
//   }

//   // 2. Tìm không gian theo ID
//   static async findId(id) {
//     try {
//       const [rows] = await execute(
//         "SELECT * FROM khonggian WHERE ID_KHONG_GIAN = ? LIMIT 1",
//         [id],
//       );
//       return rows[0] ?? null;
//     } catch (error) {
//       throw new Error("Database query failed: " + error.message);
//     }
//   }

//   // 3. Thêm mới một không gian
//   static async create({ TEN_KHONG_GIAN, LOAI_KHONG_GIAN, ID_GIA = null }) {
//     try {
//       const now = new Date();
//       const [result] = await execute(
//         "INSERT INTO khonggian (TEN_KHONG_GIAN, LOAI_KHONG_GIAN, TRANG_THAI, ID_GIA, NGAY_TAO, NGAY_CAP_NHAT) VALUES (?, ?, ?, ?, ?, ?)",
//         [TEN_KHONG_GIAN, LOAI_KHONG_GIAN, "Trong", ID_GIA, now, now],
//       );
//       return result.affectedRows > 0 ? result.insertId : null;
//     } catch (error) {
//       throw new Error("Database query failed: " + error.message);
//     }
//   }

//   // 4. Cập nhật thông tin cơ bản không gian
//   static async update(id, { TEN_KHONG_GIAN, LOAI_KHONG_GIAN, ID_GIA }) {
//     try {
//       const now = new Date();
//       const [result] = await execute(
//         "UPDATE khonggian SET TEN_KHONG_GIAN = ?, LOAI_KHONG_GIAN = ?, ID_GIA = ?, NGAY_CAP_NHAT = ? WHERE ID_KHONG_GIAN = ?",
//         [TEN_KHONG_GIAN, LOAI_KHONG_GIAN, ID_GIA, now, id],
//       );
//       return result.affectedRows > 0;
//     } catch (error) {
//       throw new Error("Database query failed: " + error.message);
//     }
//   }

//   // 5. Cập nhật trạng thái bảo trì hoặc trạng thái đặt chỗ (Phục vụ Real-time)
//   static async updateStatus(
//     id,
//     { TRANG_THAI, NGAY_BAO_TRI = null, NGAY_XONG = null },
//   ) {
//     try {
//       const now = new Date();
//       const [result] = await execute(
//         "UPDATE khonggian SET TRANG_THAI = ?, NGAY_BAO_TRI = ?, NGAY_XONG = ?, NGAY_CAP_NHAT = ? WHERE ID_KHONG_GIAN = ?",
//         [TRANG_THAI, NGAY_BAO_TRI, NGAY_XONG, now, id],
//       );
//       return result.affectedRows > 0;
//     } catch (error) {
//       throw new Error("Database query failed: " + error.message);
//     }
//   }
// }
