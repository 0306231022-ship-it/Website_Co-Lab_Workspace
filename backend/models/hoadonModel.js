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
    // [GET] THỐNG KÊ TỔNG QUAN
  static async ThongKeTongQuan(kyThongKe) {
    try {
      // 1. Lấy tổng doanh thu và tổng đơn hàng (Chỉ tính hóa đơn đã thanh toán - Giả sử TRANG_THAI = 1)
      const [doanhThu] = await execute(
        `SELECT 
            SUM(GIA_TIEN) as DoanhThuThang,
            COUNT(ID_HOADON) as TongDonHang
         FROM hoadon 
         WHERE TRANG_THAI = 1`, 
         [] // Bạn có thể thêm biến kyThongKe vào đây để lọc ngày tháng (WHERE NGAY_TAO...)
      );

      // 2. Lấy tổng số lượng chi nhánh
      const [chiNhanh] = await execute(
        `SELECT COUNT(*) as TongChiNhanh FROM chinhanh`, 
        []
      );

      // 3. Lấy tổng số khách hàng (Giả sử dựa vào bảng nguoidung, bạn điều chỉnh WHERE LOAIND cho khớp)
      const [khachHang] = await execute(
        `SELECT COUNT(*) as KhachHangMoi FROM nguoidung`, 
        []
      );

      return {
        TongChiNhanh: chiNhanh[0]?.TongChiNhanh || 0,
        ChiNhanhMoi: 0, 
        DoanhThuThang: doanhThu[0]?.DoanhThuThang || 0,
        PhanTramDoanhThu: 0, 
        TongDonHang: doanhThu[0]?.TongDonHang || 0,
        PhanTramDonHang: 0,
        KhachHangMoi: khachHang[0]?.KhachHangMoi || 0,
        PhanTramKhachHang: 0
      };
    } catch (error) {
      console.error("Lỗi Database trong hoadonModel.ThongKeTongQuan:", error.message);
      throw new Error("Không thể lấy dữ liệu thống kê tổng quan từ cơ sở dữ liệu!");
    }
  }
}

