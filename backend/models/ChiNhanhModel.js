import {
  execute,
  beginTransaction,
  rollbackTransaction,
  commitTransaction,
} from "../config/db.js";
export default class ChiNhanhModel {
  static async ThemChiNhanh(ten, diachi, hinh) {
    try {
      const [them] = await execute(
        `
               INSERT INTO chinhanh(TEN_CHI_NHANH, DIA_CHI, HINHANH, TRANG_THAI)
                VALUES(?, ?, ?, ?)
                `,
        [ten, diachi, hinh,1],
      );
      return them.affectedRows > 0;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async kiemtraid(id) {
    try {
      const [kiemtra] = await execute(
        `
                SELECT*FROM chinhanh
                WHERE ID_CHI_NHANH =?
                `,
        [id],
      );
      return kiemtra.length > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async CapNhat_ThongTinMem(TenCN, DiaChi, id) {
    try {
      let MangThem = [];
      let MangGiaTri = [];
      if (TenCN && TenCN.trim() !== "") {
        MangThem.push("TEN_CHI_NHANH = ?");
        MangGiaTri.push(TenCN);
      }
      if (DiaChi && DiaChi.trim() !== "") {
        MangThem.push("DIA_CHI = ?");
        MangGiaTri.push(DiaChi);
      }
      if (MangThem.length === 0) return false;
      const bieuThucSQL = `
                UPDATE chinhanh
                SET ${MangThem.join(", ")}
                WHERE ID_CHI_NHANH = ${id}
            `;
      const [update] = await execute(bieuThucSQL, MangGiaTri);
      return update.affectedRows > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async LayChiTiet(id) {
    try {
      const [kiemtra] = await execute(
        `
                SELECT*FROM chinhanh
                WHERE ID_CHI_NHANH =?
                LIMIT 1
                `,
        [id],
      );
      return kiemtra.length > 0 ? kiemtra : null;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async CapNhatAnh(IDCN, DuongDan) {
    try {
      const [update] = await execute(
        `
            UPDATE chiNhanh
            SET HINHANH=?
            WHERE ID_CHI_NHANH=?
            `,
        [DuongDan, IDCN],
      );
      return update.affectedRows > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async CapNhatTrangThai(IDCN, ThoiGianApDung, TrangThai) {
    try {
      const [update] = await execute(
        `
                UPDATE chinhanh
                SET NGAY_CAP_NHAT = ? 
                WHERE ID_CHI_NHANH = ?
                `,
        [ThoiGianApDung, IDCN],
      );
      return update.affectedRows > 0 ? true : false;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async LayDanhSach(limit, offset) {
    try {
      const [DanhSach] = await execute(
        `
                SELECT c.*,
              SUM(CASE WHEN k.LOAI_KHONG_GIAN = 1 THEN 1 ELSE 0 END) AS TongLoai1,
              SUM(CASE WHEN k.LOAI_KHONG_GIAN = 2 THEN 1 ELSE 0 END) AS TongLoai2
       FROM chinhanh c
       LEFT JOIN khonggian k ON c.ID_CHI_NHANH = k.ID_CHI_NHANH
       GROUP BY c.ID_CHI_NHANH
       LIMIT ? OFFSET ?
                `,
        [limit, offset],
      );
      const [TongSo] = await execute(`
                 SELECT COUNT(*) AS total FROM chinhanh
                `);
      return {
        DanhSach: DanhSach,
        TongDanhSach: TongSo[0].total,
      };
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async TimKiem(limit, offset, DiaChi, TrangThai) {
    try {
      const [DanhSach] = await execute(
        `SELECT c.*,
       SUM(CASE WHEN k.LOAI_KHONG_GIAN = 1 THEN 1 ELSE 0 END) AS TongLoai1,
       SUM(CASE WHEN k.LOAI_KHONG_GIAN = 2 THEN 1 ELSE 0 END) AS TongLoai2
FROM chinhanh c
LEFT JOIN khonggian k ON c.ID_CHI_NHANH = k.ID_CHI_NHANH
WHERE c.TRANG_THAI = ? AND c.DIA_CHI LIKE ?
GROUP BY c.ID_CHI_NHANH
LIMIT ? OFFSET ?;`,
        [TrangThai, `%${DiaChi}%`, limit, offset],
      );
      const [TongSo] = await execute(
        `SELECT COUNT(*) AS TongDanhSach
       FROM chinhanh
       WHERE TRANG_THAI = ? AND DIA_CHI LIKE ?`,
        [TrangThai, `%${DiaChi}%`],
      );
      return {
        DanhSach,
        TongDanhSach: TongSo[0].TongDanhSach,
      };
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async ChuyenTrangThai() {
    try {
      const [update] = await execute(
        `
                UPDATE ChiNhanh
                SET TRANG_THAI = IF(TRANG_THAI = 1, 0, 1),  NGAY_CAP_NHAT = NULL
                WHERE NGAY_CAP_NHAT <= NOW() AND TRANG_THAI IN (0, 1);
                `,
        [],
      );
      return update.affectedRows > 0;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  // [GET] THỐNG KÊ HIỆU SUẤT CHI NHÁNH
  static async ThongKeHieuSuat(kyThongKe) {
    try {
      // JOIN các bảng: chinhanh -> khonggian -> lichdat -> hoadon
      const sql = `
        SELECT 
            c.ID_CHI_NHANH, 
            c.TEN_CHI_NHANH, 
            'Chưa cập nhật' as NGUOI_QUAN_LY,
            SUM(h.GIA_TIEN) as TONG_DOANH_THU
        FROM chinhanh c
        LEFT JOIN khonggian kg ON c.ID_CHI_NHANH = kg.ID_CHI_NHANH
        LEFT JOIN lichdat ld ON kg.ID_KHONG_GIAN = ld.ID_KHONG_GIAN
        LEFT JOIN hoadon h ON ld.ID_LICH_DAT = h.ID_LICHDAT AND h.TRANG_THAI = 1
        GROUP BY c.ID_CHI_NHANH, c.TEN_CHI_NHANH
      `;
      
      const [rows] = await execute(sql, []);

      // Mức doanh thu mục tiêu (Ví dụ: 1 Tỷ / chi nhánh)
      const mucTieu = 1000000000; 

      return rows.map(row => {
        let doanhThu = row.TONG_DOANH_THU || 0;
        let tienDo = Math.round((doanhThu / mucTieu) * 100);
        
        return {
          ID_CHI_NHANH: row.ID_CHI_NHANH,
          TEN_CHI_NHANH: row.TEN_CHI_NHANH,
          NGUOI_QUAN_LY: row.NGUOI_QUAN_LY,
          TONG_DOANH_THU: doanhThu,
          // Đảm bảo tiến độ hiển thị tối đa là 100% trên giao diện UI
          TIEN_DO: tienDo > 100 ? 100 : tienDo 
        };
      });

    } catch (error) {
      console.error("Lỗi Database trong ChiNhanhModel.ThongKeHieuSuat:", error.message);
      throw new Error("Không thể lấy thống kê hiệu suất chi nhánh từ cơ sở dữ liệu!");
    }
  }
}
