import {execute,beginTransaction,rollbackTransaction,commitTransaction,} 
from "../config/db.js";

export default class ThietBi {
 
  static async getAll(offset, limit) {
    try {
      const [rows] = await execute("SELECT * FROM thietbi LIMIT ? OFFSET ?", [
        limit,
        offset,
      ]);
      const [totalRows] = await execute(
        "SELECT COUNT(*) as total FROM thietbi",
      );
      const [TongSuDung] = await execute(`
        SELECT COUNT(DISTINCT ID_THIET_BI) AS SoLoaiThietBiDaSuDung 
        FROM chitiet_thietbi;
        `,[])
      const total = totalRows[0]?.total || 0;
      const TongsuDung = TongSuDung[0].SoLoaiThietBiDaSuDung 
      return {
        data: rows,
        TongSuDung: TongsuDung,
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

  
  static async updateten(id, tenThietBi) {
    try {
      const [result] = await execute(
        "UPDATE thietbi SET TEN_THIET_BI = ? WHERE ID_THIET_BI = ?",
        [tenThietBi, id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(` Lỗi Database trong update (${id}):`, error.message);
      throw new Error("Không thể cập nhật thông tin thiết bị!");
    }
  }
    static async updatehinhanh(id, hinhanh) {
    try {
      const [result] = await execute(
        "UPDATE thietbi SET HINH_ANH = ? WHERE ID_THIET_BI = ?",
        [hinhanh, id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(` Lỗi Database trong update (${id}):`, error.message);
      throw new Error("Không thể cập nhật thông tin thiết bị!");
    }
  }
  
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
