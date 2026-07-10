// backend/models/thietBiModel.js
import {
  execute,
  beginTransaction,
  rollbackTransaction,
  commitTransaction,
} from "../config/db.js";

export default class ThietBi {
  // Mặc định nếu không truyền page thì là trang 1, không truyền limit thì lấy 10 cái
  static async getAll(offset, limit) {
    try {
      const [rows] = await execute("SELECT * FROM thietbi LIMIT ? OFFSET ?", [
        limit,
        offset,
      ]);
      const [totalRows] = await execute(
        "SELECT COUNT(*) as total FROM thietbi",
      );
      const total = totalRows[0]?.total || 0;
      return {
        data: rows,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(" Lỗi Database trong getAll ThietBi:", error.message);
      throw new Error("Không thể kết nối đến cơ sở dữ liệu để lấy danh sách!");
    }
  }

  // 2. Lấy thiết bị theo ID (Không cần LIMIT/OFFSET vì ID là duy nhất)
  static async getById(id) {
    console.log(id);
    try {
      const [rows] = await execute(
        "SELECT * FROM thietbi WHERE ID_THIET_BI = ?",
        [id],
      );
      return rows[0];
    } catch (error) {
      console.error(` Lỗi Database trong getById (${id}):`, error.message);
      throw new Error(
        "Không thể kết nối đến cơ sở dữ liệu để lấy chi tiết thiết bị!",
      );
    }
  }

  // 3. Thêm thiết bị mới
  static async create(tenThietBi, hinhAnh) {
    try {
      const [result] = await execute(
        "INSERT INTO thietbi (TEN_THIET_BI, HINH_ANH) VALUES (?, ?)",
        [tenThietBi, hinhAnh],
      );
      return result.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(" Lỗi Database trong create ThietBi:", error.message);
      throw new Error("Không thể thêm thiết bị mới vào cơ sở dữ liệu!");
    }
  }

  // 4. Cập nhật thiết bị
  static async update(id, tenThietBi, hinhAnh) {
    try {
      const [result] = await execute(
        "UPDATE thietbi SET TEN_THIET_BI = ?, HINH_ANH = ? WHERE ID_THIET_BI = ?",
        [tenThietBi, hinhAnh, id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(` Lỗi Database trong update (${id}):`, error.message);
      throw new Error("Không thể cập nhật thông tin thiết bị!");
    }
  }
  //kiểm tra id
  static async testid(id) {
    try {
      const [rows] = await execute(
        "SELECT * FROM thietbi WHERE ID_THIET_BI = ?",
        [id],
      );
      return rows.length > 0 ? true : false;
    } catch (error) {
      console.error(` Lỗi Database (${id}):`, error.message);
      throw new Error("Không thể truy vấn thông tin thiết bị!");
    }
  }
}
