import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';

export default class NguoiDungModel {
  static async DangKy(TenND, Email, MatKhau) {
    let connection;
    try {
      connection = await beginTransaction();
      const [result] = await connection.execute(
        'INSERT INTO nguoidung(TENND, EMAIL, MAT_KHAU, LOAIND, TRANG_THAI) VALUES(?,?,?,?,?)',
        [TenND, Email, MatKhau, 0, 1]
      );
      await commitTransaction(connection);
      return result.affectedRows > 0 ? result.insertId : null;
    } catch (error) {
      if (connection) {
        await rollbackTransaction(connection);
      }
      throw new Error('Database query failed: ' + error.message);
    }
  }
static async findByEmail(Email) {
    try {
      const [rows] = await execute('SELECT * FROM nguoidung WHERE EMAIL = ? LIMIT 1', [Email]);
      return rows[0] ?? null;
    } catch (error) {
      throw new Error('Database query failed: ' + error.message);
    }
}
  static async findByid(id) {
    try {
      const [rows] = await execute('SELECT * FROM nguoidung WHERE IDND = ? LIMIT 1', [id]);
      return rows[0] ?? null;
    } catch (error) {
      throw new Error('Database query failed: ' + error.message);
    }
}
  static async CapNhatMatKhau(Email,matKhauHash){
    try {
      const [ketqua] = await execute(`
        UPDATE nguoidung
        SET MAT_KHAU=?
        WHERE EMAIL=?
        `,[matKhauHash,Email]);
      return ketqua.affectedRows>0 ? true : false;
    } catch (error) {
      throw new Error('Database query failed: ' + error.message);
      return false;
    }
  }
   static async CapNhatMatKhau_id(userId,matKhauHash){
    try {
      const [CapNhat] = await execute(`
        UPDATE nguoidung
        SET MAT_KHAU = ?
        WHERE IDND=?
        `,[matKhauHash,userId]);
      return CapNhat.affectedRows>0 ? true : false;
    } catch (error) {
      throw new Error('Database query failed: ' + error.message);
      return false;
    }
   }
   static async ChinhSua_TrangThai(IDND,TrangThai){
    try {
      const [CapNhat] = await execute(`
        UPDATE nguoidung
        SET TRANG_THAI=?
        WHERE IDND=?
        `,[TrangThai,IDND]);
      return CapNhat.affectedRows>0 ? true : false;
    } catch (error) {
       throw new Error('Database query failed: ' + error.message);
       return false;
    }
   }
   static async CapNhat_thongtin(userId,TENND){
      try {
        const [CapNhat] = await execute(`
          UPDATE nguoidung
          SET TENND = ?
          WHERE IDND =?
          `, [TENND,userId]);
        return CapNhat.affectedRows>0 ? true :false;
      } catch (error) {
        throw new Error('Database query failed: ' + error.message);
        return false;
      }
   }
   static async CapNhat_Anh(userId,DuongDan){
      try {
        const [ketqua] = await execute(`
          UPDATE nguoidung
          SET HINH_ANH = ?
          WHERE IDND = ?
          `,[DuongDan,userId]);
        return ketqua.affectedRows>0 ? true : false;
      } catch (error) {
         throw new Error('Database query failed: ' + error.message);
         return false;
      }
   }
   static async DSND(limit, offset){
      try {
        const [ketqua] = await execute(`
          SELECT*FROM nguoidung
          ORDER BY NGAY_TAO DESC 
          LIMIT ? OFFSET ?
          `,[limit,offset]);
        const [tong] = await execute(`
           SELECT COUNT(*) AS total FROM nguoidung
        `);
        return {
          DanhSach: ketqua,
          TongDanhSach: tong
        };
      } catch (error) {
         throw new Error('Database query failed: ' + error.message);
      }
   }
   static async TimKiem(DuLieu){
      try {
        const [TimKiem] = await execute(`
          SELECT*FROM nguoidung
          WHERE IDND = ?
          `,[DuLieu]);
        return TimKiem.length>0? TimKiem : null
      } catch (error) {
         throw new Error('Database query failed: ' + error.message);
      }
   }

}
 
