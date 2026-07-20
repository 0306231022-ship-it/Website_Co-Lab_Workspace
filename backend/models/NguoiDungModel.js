import {
  execute,
  beginTransaction,
  rollbackTransaction,
  commitTransaction,
} from "../config/db.js";

export default class NguoiDungModel {
  static async DangKy(TenND, Email, MatKhau) {
    let connection;
    try {
      connection = await beginTransaction();
      const [result] = await connection.execute(
        "INSERT INTO nguoidung(TENND, EMAIL, MAT_KHAU, LOAIND, TRANG_THAI) VALUES(?,?,?,?,?)",
        [TenND, Email, MatKhau, 0, 1],
      );
      await commitTransaction(connection);
      return result.affectedRows > 0 ? result.insertId : null;
    } catch (error) {
      if (connection) {
        await rollbackTransaction(connection);
      }
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async findByEmail(Email) {
    try {
      const [rows] = await execute(
        "SELECT * FROM nguoidung WHERE EMAIL = ? LIMIT 1",
        [Email],
      );
      return rows[0] ?? null;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async findByid(id) {
    try {
      const [rows] = await execute(
        "SELECT * FROM nguoidung WHERE IDND = ? LIMIT 1",
        [id],
      );
      return rows[0] ?? null;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async CapNhatMatKhau(Email, matKhauHash) {
    try {
      const [ketqua] = await execute(
        `
        UPDATE nguoidung
        SET MAT_KHAU=?
        WHERE EMAIL=?
        `,
        [matKhauHash, Email],
      );
      return ketqua.affectedRows > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
      return false;
    }
  }
  static async CapNhatMatKhau_id(userId, matKhauHash) {
    try {
      const [CapNhat] = await execute(
        `
        UPDATE nguoidung
        SET MAT_KHAU = ?
        WHERE IDND=?
        `,
        [matKhauHash, userId],
      );
      return CapNhat.affectedRows > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
      return false;
    }
  }
  static async ChinhSua_TrangThai(IDND, TrangThai) {
    try {
      const [CapNhat] = await execute(
        `
        UPDATE nguoidung
        SET TRANG_THAI=?
        WHERE IDND=?
        `,
        [TrangThai, IDND],
      );
      return CapNhat.affectedRows > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
      return false;
    }
  }
  static async CapNhat_thongtin(userId, TENND) {
    try {
      const [CapNhat] = await execute(
        `
          UPDATE nguoidung
          SET TENND = ?
          WHERE IDND =?
          `,
        [TENND, userId],
      );
      return CapNhat.affectedRows > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
      return false;
    }
  }
  static async CapNhat_Anh(userId, DuongDan) {
    try {
      const [ketqua] = await execute(
        `
          UPDATE nguoidung
          SET HINH_ANH = ?
          WHERE IDND = ?
          `,
        [DuongDan, userId],
      );
      return ketqua.affectedRows > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
      return false;
    }
  }
  static async DSND(limit, offset) {
    try {
      const [ketqua] = await execute(
        `
          SELECT*FROM nguoidung
          WHERE LOAIND=0
          ORDER BY NGAY_TAO DESC 
          LIMIT ? OFFSET ?
          `,
        [limit, offset],
      );
      const [tong] = await execute(`
           SELECT COUNT(*) AS total FROM nguoidung
           WHERE LOAIND=0
        `);
      return {
        DanhSach: ketqua,
        TongDanhSach: tong,
      };
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async TimKiem(DuLieu) {
    try {
      const tuKhoaTimKiem = `%${DuLieu}%`;
      const [DanhSachKetQua] = await execute(
        `
          SELECT *, COUNT(*) OVER() as TongDanhSach 
          FROM nguoidung
          WHERE TENND LIKE ?
        `,
        [tuKhoaTimKiem],
      );
      return {
        DanhSach: DanhSachKetQua,
        TongDanhSach: DanhSachKetQua[0]?.TongDanhSach ?? 0,
      };
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async ThongKeNguoiDung() {
    try {
      const [TongDS] = await execute(
        `
        SELECT COUNT(IDND) AS TongSoNguoiDung 
        FROM NguoiDung
        WHERE LOAIND=0
        `,
        [],
      );
      const [TongDS_ht] = await execute(
        `
        SELECT COUNT(IDND) AS TongSoNguoiDung_ht
        FROM NguoiDung
        WHERE TRANG_THAI=1 AND LOAIND=0
        `,
        [],
      );
      const [ds_thang] = await execute(`
        SELECT COUNT(IDND) AS TongNguoiDungTrongThang
            FROM NguoiDung
            WHERE MONTH(NGAY_TAO) = MONTH(NOW()) 
            AND YEAR(NGAY_TAO) = YEAR(NOW());
      `);
      return {
        TongDanhSach: TongDS[0].TongSoNguoiDung,
        DanhSachHoatDong: TongDS_ht[0].TongSoNguoiDung_ht,
        DanhSach_Thang: ds_thang[0].TongNguoiDungTrongThang,
      };
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }

   
   static async thongke(id){
      try {
        const [thongkeThongBao] = await execute(`
          SELECT COUNT(IDND) as ThongBao
          FROM thongbao
          WHERE IDND = ?
          `,[id]);
        const [thongkeDonHang] = await execute(`
          SELECT COUNT(IDND) as DonHang
          FROM  lichdat 
          WHERE IDND = ?
          `,[id]);
        return {
          ThongBao : thongkeThongBao[0].ThongBao,
          DonHang: thongkeDonHang[0].DonHang
        }
      } catch (error) {
        throw new Error('Database query failed: ' + error.message);
      }
   }
    static async TongKhach(){
      try {
        const [kq] = await execute(`
          SELECT COUNT(IDND) AS TongKhachHangMoi
FROM nguoidung
WHERE MONTH(NGAY_TAO) = MONTH(CURDATE()) 
  AND YEAR(NGAY_TAO) = YEAR(CURDATE()) AND LOAIND=0;
          `,[])
      } catch (error) {
        throw new Error('Database query failed: ' + error.message);
      }
    }
  }
