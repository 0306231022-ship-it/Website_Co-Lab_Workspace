import { execute,beginTransaction, rollbackTransaction, commitTransaction } from "../config/db.js";
 export default class dmGhe{
    static async getAll(offset , limit)  {
        try {
            const [rows] = await execute(
           `SELECT d.ID_DANHMUC, d.TEN_DANHMUC, d.TRANG_THAI, g.DON_GIA 
                FROM danhmucghe d
                LEFT JOIN banggia g ON d.ID_DANHMUC = g.DANHMUC_GHE
                LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            const [totalRows] = await execute("SELECT COUNT(*) as total FROM danhmucghe");
            const total = totalRows[0]?.total || 0;
            return {
                data: rows,
                pagination: {
                    
                    totalItems: total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error(" Lỗi Database trong getAll ghế:", error.message);
            throw new Error("Không thể kết nối đến cơ sở dữ liệu để lấy danh sách!");
        }
    }

    static async create(tenDanhMuc) {
        try {
            const [result] = await execute(
                "INSERT INTO danhmucghe (TEN_DANHMUC,TRANG_THAI) VALUES (?, ?)",
                [tenDanhMuc, 1]
            );
            return result.affectedRows>0? true:false; 
        } catch (error) {
            console.error(" Lỗi Database trong create trangthai:", error.message);
            throw new Error("Không thể thêm danh mục ghế mới vào cơ sở dữ liệu!");
        }
    }
// 4. Cập nhật thiết bị 
    static async update(id, tenDanhMuc){
        try {
            const [result] = await execute(
                "UPDATE danhmucghe SET TEN_DANHMUC = ? WHERE ID_DANHMUC = ?",
                [tenDanhMuc, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(` Lỗi Database trong update (${id}):`, error.message);
            throw new Error("Không thể cập nhật thông tin danh mục ghế!");
        }
    }
    //kiểm tra id 
    static async testid(id) {
        try {
             const [rows] = await execute("SELECT * FROM danhmucghe WHERE ID_DANHMUC = ?", [id]);
             return rows.length>0 ? true : false;
        } catch (error) {
             console.error(` Lỗi Database (${id}):`, error.message);
            throw new Error("Không thể truy vấn thông tin danh mục ghế!");
        }
    }



};

     