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
                INSERT INTO chinhanh(TEN_CHI_NHANH,DIA_CHI,TRANG_THAI,HINHANH)
                VALUES(?,?,1,?)
                `,
        [ten, diachi, hinh],
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
}
