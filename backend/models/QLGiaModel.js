import {
  execute,
  beginTransaction,
  rollbackTransaction,
  commitTransaction,
} from "../config/db.js";
export default class giaModel {
  // Mặc định nếu không truyền page thì là trang 1, không truyền limit thì lấy 10 cái
  static async getAll(offset, limit) {
    try {
      const [rows] = await execute("SELECT * FROM banggia LIMIT ? OFFSET ?", [
        limit,
        offset,
      ]);
      const [totalRows] = await execute(
        "SELECT COUNT(*) as total FROM banggia",
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
      console.error(" Lỗi Database trong getAll giaModel:", error.message);
      throw new Error("Không thể kết nối đến cơ sở dữ liệu để lấy danh sách!");
    }
  }

  // 2. Lấy giá  theo ID (Không cần LIMIT/OFFSET vì ID là duy nhất)
  static async getById(id) {
    console.log(id);
    try {
      const [rows] = await execute("SELECT * FROM banggia WHERE ID_GIA = ?", [
        id,
      ]);
      return rows[0];
    } catch (error) {
      console.error(` Lỗi Database trong getById (${id}):`, error.message);
      throw new Error(
        "Không thể kết nối đến cơ sở dữ liệu để lấy chi tiết gia!",
      );
    }
  }

  // 3. Thêm thiết bị mới
  static async create(tengia, mota, dongia, danhmucghe) {
    try {
      const [result] = await execute(
        "INSERT INTO banggia (TEN_GIA, MOTA,DON_GIA,DANHMUC_GHE) VALUES (?, ?,?,?)",
        [tengia, mota, dongia, danhmucghe],
      );
      return result.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(" Lỗi Database trong create giaModel:", error.message);
      throw new Error("Không thể thêm gia mới vào cơ sở dữ liệu!");
    }
  }

  // 4. Cập nhật thiết bị
  static async update(id, tengia, mota, dongia, danhmucghe) {

    try {
      const [result] = await execute(
        "UPDATE banggia SET TEN_GIA = ?,MOTA = ?, DON_GIA = ?, DANHMUC_GHE = ?   WHERE ID_GIA = ?",
        [tengia, mota, dongia, danhmucghe, id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(` Lỗi Database trong update (${id}):`, error.message);
      throw new Error("Không thể cập nhật thông tin gia!");
    }
  }
  //kiểm tra id
  static async testid(id) {
    try {
      const [rows] = await execute("SELECT * FROM banggia WHERE ID_GIA = ?", [
        id,
      ]);
      return rows.length > 0 ? true : false;
    } catch (error) {
      console.error(` Lỗi Database (${id}):`, error.message);
      throw new Error("Không thể truy vấn thông tin GIA!");
    }
  }


    static async LayBangGia_KhongGian(){
        try {
            const [kq] = await execute(`
                SELECT ID_GIA, DON_GIA
                FROM banggia
                `,[]);
            return kq;
        } catch (error) {
            console.error(` Lỗi Database:`, error.message);
            throw new Error("Không thể truy vấn thông tin GIA!");
        }
    }

  }
