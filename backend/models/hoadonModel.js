import { execute } from "../config/db.js";

export default class hoadonModel {
  static async getById(id) {
    try {
      const [dulieu] = await execute(
        `
                CALL GetChiTietHoaDonTheoLichDat(?)
                `,
        [id],
      );
      return dulieu;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  // Thêm hóa đơn mới
  static async create(giatien, idlichdat) {
    try {
      const [create] = await execute(
        `INSERT INTO hoadon (GIA_TIEN,TRANG_THAI,ID_LICHDAT) 
            VALUES(?,1,?)`,
        [giatien, idlichdat],
      );
      return create.affectedRows > 0;
    } catch (error) {
      console.error(" Lỗi Database trong hoadonModel.create:", error.message);
      throw new Error("Không thể thêm hóa đơn mới vào cơ sở dữ liệu!");
    }
  }
  // 5. Kiểm tra xem ID_HOADON có tồn tại thực tế hay không
  static async testId(id) {
    try {
      const [test] = await execute("SELECT * FROM hoadon WHERE ID_HOADON = ?", [
        id,
      ]);
      return test.length > 0 ? true : false;
    } catch (error) {
      console.error(` Lỗi Database (${id}):`, error.message);
      throw new Error("Không thể truy vấn thông tin hóa đơn!");
    }
  }


    static async kiemtraid_hoadon(id){
        try {
            const [truyvan] = await execute(`
                SELECT ID_HOADON
                FROM hoadon 
                WHERE ID_LICHDAT = ?
                `,[id]);
           return truyvan.length>0 
        } catch (error) {
             console.error(` Lỗi Database:`, error.message);
            throw new Error("Không thể truy vấn thông tin hóa đơn!");
        }
    }
    static async DoanhThu(){
        try {
            const [kq] = await execute(`
              SELECT COALESCE(SUM(GIA_TIEN), 0) AS DoanhThuTamTinh 
              FROM hoadon 
              WHERE MONTH(NGAY_TAO) = MONTH(CURDATE()) AND YEAR(NGAY_TAO) = YEAR(CURDATE()) AND TRANG_THAI <> 0;
              `,[]);
            return kq[0].DoanhThuTamTinh;
        } catch (error) {
           throw new Error("Không thể truy vấn thông tin doanh thu!");
        }
    }
}

