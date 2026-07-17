import { execute } from "../config/db.js";

export default class thongBaoModel {

  
    static async getAll(offset, limit) {
        try {
           
            const [rows] = await execute(
                `SELECT tb.*, nd.TENND, nd.EMAIL 
                 FROM thongbao tb
                 LEFT JOIN nguoidung nd ON tb.IDND = nd.IDND
                 ORDER BY tb.NGAY_TAO DESC
                 LIMIT ? OFFSET ?`,
                [offset, limit]
            );

            const [totalRows] = await execute("SELECT COUNT(*) as total FROM thongbao");
            const total = totalRows[0]?.total || 0;

            return {
                data: rows,
                pagination: {
                    totalItems: total,
                    totalPages: Math.ceil(total / parsedLimit)
                }
            };
        } catch (error) {
            console.error(" Lỗi Database trong thongBaoModel.getAll:", error.message);
            throw new Error("Không thể lấy danh sách thông báo từ cơ sở dữ liệu!");
        }
    }

    
    static async getByUserId(idnd, offset, limit) {
        try {
            

            const [rows] = await execute(
                `SELECT * FROM thongbao 
                 WHERE IDND = ? 
                 ORDER BY NGAY_TAO DESC 
                 LIMIT ? OFFSET ?`,
                [idnd, limit,offset]
            );
            const [totalRows] = await execute("SELECT COUNT(*) as total FROM thongbao WHERE IDND = ?", [idnd]);
            const total = totalRows[0]?.total || 0;

            return {
                data: rows,
                pagination: {
                    totalItems: total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error(` Lỗi Database trong thongBaoModel.getByUserId (${idnd}):`, error.message);
            throw new Error("Không thể lấy thông tin thông báo của người dùng này!");
        }
    }

    static async create(tieuDe, noiDung, loaiThongBao, idnd) {
        try {
            const [result] = await execute(
                `INSERT INTO thongbao (TIEU_DE, NOI_DUNG, TRANG_THAI, LOAI_THONGBAO, IDND, NGAY_TAO) 
                 VALUES (?, ?, 0, ?, ?, NOW())`,
                [tieuDe, noiDung, loaiThongBao, idnd]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(" Lỗi Database trong thongBaoModel.create:", error.message);
            throw new Error("Không thể thêm thông báo mới!");
        }
    }

    
    static async deleteById(idThongBao) {
        try {
            const [result] = await execute("DELETE FROM thongbao WHERE ID_THONGBAO = ?", [idThongBao]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`❌ Lỗi Database trong thongBaoModel.deleteById (${idThongBao}):`, error.message);
            throw new Error("Không thể xóa thông báo này!");
        }
    }

    
    static async deleteAllByUserId(idnd) {
        try {
            const [result] = await execute("DELETE FROM thongbao WHERE IDND = ?", [idnd]);
            return result.affectedRows>0;
        } catch (error) {
            console.error(` Lỗi Database trong thongBaoModel.deleteAllByUserId (${idnd}):`, error.message);
            throw new Error("Không thể xóa toàn bộ thông báo của người dùng này!");
        }
    }

 
    static async testId(idThongBao) {
        try {
            const [rows] = await execute("SELECT ID_THONGBAO FROM thongbao WHERE ID_THONGBAO = ?", [idThongBao]);
            return rows.length > 0;
        } catch (error) {
            return false;
        }
    }
}