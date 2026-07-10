import {
  execute,
  beginTransaction,
  rollbackTransaction,
  commitTransaction,
} from "../config/db.js";
export default class XacThucOTPModel {
  static async ThemOTP(Email, MaOTP) {
    let connection;
    try {
      connection = await beginTransaction();
      const [result] = await connection.execute(
        "INSERT INTO xacthucotp(EMAIL, MA_OTP, NGAY_HET_HAN) VALUES(?,?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))",
        [Email, MaOTP],
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
        "SELECT * FROM xacthucotp WHERE EMAIL = ? LIMIT 1",
        [Email],
      );
      return rows[0] ?? null;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async TangSoLanSai(Email) {
    let connection;
    try {
      connection = await beginTransaction();
      const [result] = await connection.execute(
        "UPDATE xacthucotp SET SO_LAN_SAI = SO_LAN_SAI + 1 WHERE EMAIL = ?",
        [Email],
      );
      await commitTransaction(connection);
      return result.affectedRows > 0;
    } catch (error) {
      if (connection) {
        await rollbackTransaction(connection);
      }
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async XoaOTP(email) {
    let connection;
    try {
      connection = await beginTransaction();
      const [ketqua] = await connection.execute(
        `
                DELETE FROM xacthucotp WHERE EMAIL = ?
                `,
        [email],
      );
      await commitTransaction(connection);
      return ketqua.affectedRows > 0 ? true : false;
    } catch (error) {
      if (connection) {
        await rollbackTransaction(connection);
      }
      throw new Error("Database query failed: " + error.message);
    }
  }
  static async XoaOTP_HetHan() {
    try {
      const [otp] = await execute(
        `
                DELETE FROM xacthucotp 
                WHERE NGAY_HET_HAN < NOW();
                `,
        [],
      );
      return otp.affectedRows > 0;
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }
}
