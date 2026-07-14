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
  static async updatePriceForDanhMucGhe(idDanhMuc, soTienMoi) {
    try {
        // 1. Lấy thông tin ID_GIA hiện tại của Danh mục ghế này
        const [danhMuc] = await execute(
            `SELECT ID_GIA FROM danhmucghe WHERE ID_DANHMUC = ?`, 
            [idDanhMuc]
        );
        
        if (!danhMuc || danhMuc.length === 0) return false;
        const idGiaHienTai = danhMuc[0].ID_GIA;

        // 2. Kiểm tra xem mã giá này có đang bị bên bảng 'khonggian' hoặc danh mục khác dùng chung không
        const [dungChungPhong] = await execute(
            `SELECT COUNT(*) AS count FROM khonggian WHERE ID_GIA = ?`, 
            [idGiaHienTai]
        );
        const [dungChungDanhMucKhac] = await execute(
            `SELECT COUNT(*) AS count FROM danhmucghe WHERE ID_GIA = ? AND ID_DANHMUC != ?`, 
            [idGiaHienTai, idDanhMuc]
        );

        const totalShared = dungChungPhong[0].count + dungChungDanhMucKhac[0].count;

        if (totalShared === 0) {
            // TRƯỜNG HỢP 1: Không chung đụng với ai -> Sửa trực tiếp (Đúng Cách 1)
            await execute(
                `UPDATE banggia SET GIA = ? WHERE ID_GIA = ?`, 
                [soTienMoi, idGiaHienTai]
            );
            console.log("Sửa trực tiếp giá cũ vì không có phòng/danh mục nào dùng chung.");
        } else {
            // TRƯỜNG HỢP 2: Có phòng hoặc danh mục khác dùng chung -> Phải tách giá ra để bảo vệ bảng không gian
            // Tạo bản ghi giá mới tinh
            const [newPriceResult] = await execute(
                `INSERT INTO banggia (TEN_GIA, GIA) VALUES (?, ?)`, 
                [`Giá tách tự động cho DM ${idDanhMuc}`, soTienMoi]
            );
            const idGiaMoi = newPriceResult.insertId;

            // Cập nhật lại ID_GIA mới này riêng cho danh mục ghế hiện tại
            await execute(
                `UPDATE danhmucghe SET ID_GIA = ? WHERE ID_DANHMUC = ?`, 
                [idGiaMoi, idDanhMuc]
            );
            console.log("Đã tự động tách sang mã giá mới để tránh ảnh hưởng đến bảng không gian.");
        }

        return true;
    } catch (error) {
        console.error("Lỗi xử lý giá an toàn:", error);
        throw error;
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
