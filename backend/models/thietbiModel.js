// backend/models/thietBiModel.js
import { execute } from '../config/db.js';

const ThietBi = {
    
    // Mặc định nếu không truyền page thì là trang 1, không truyền limit thì lấy 10 cái
    getAll: async (page = 1, limit = 10) => {
        try {
            // Ép kiểu về số nguyên để tránh lỗi cú pháp SQL
            const p = parseInt(page) || 1;
            const l = parseInt(limit) || 10;
            const offset = (p - 1) * l;

            // Truy vấn lấy dữ liệu phân trang
            const [rows] = await execute(
                "SELECT * FROM thietbi LIMIT ? OFFSET ?", 
                [l, offset]
            );

            // Tính tổng số bản ghi để Frontend biết đường chia trang (Rất quan trọng cho đồ án)
            const [totalRows] = await execute("SELECT COUNT(*) as total FROM thietbi");
            const total = totalRows[0]?.total || 0;

            return {
                data: rows,
                pagination: {
                    currentPage: p,
                    limit: l,
                    totalItems: total,
                    totalPages: Math.ceil(total / l)
                }
            };
        } catch (error) {
            console.error(" Lỗi Database trong getAll ThietBi:", error.message);
            throw new Error("Không thể kết nối đến cơ sở dữ liệu để lấy danh sách!");
        }
    },

    // 2. Lấy thiết bị theo ID (Không cần LIMIT/OFFSET vì ID là duy nhất)
    getById: async (id) => {
        try {
            const [rows] = await execute("SELECT * FROM thietbi WHERE ID_THIET_BI = ?", [id]);
            return rows[0];
        } catch (error) {
            console.error(` Lỗi Database trong getById (${id}):`, error.message);
            throw new Error("Không thể kết nối đến cơ sở dữ liệu để lấy chi tiết thiết bị!");
        }
    },

    // 3. Thêm thiết bị mới
    create: async (tenThietBi, hinhAnh) => {
        try {
            const [result] = await execute(
                "INSERT INTO thietbi (TEN_THIET_BI, HINH_ANH) VALUES (?, ?)",
                [tenThietBi, hinhAnh]
            );
            return result.insertId; 
        } catch (error) {
            console.error(" Lỗi Database trong create ThietBi:", error.message);
            throw new Error("Không thể thêm thiết bị mới vào cơ sở dữ liệu!");
        }
    },

    // 4. Cập nhật thiết bị 
    update: async (id, tenThietBi, hinhAnh) => {
        try {
            const [result] = await execute(
                "UPDATE thietbi SET TEN_THIET_BI = ?, HINH_ANH = ? WHERE ID_THIET_BI = ?",
                [tenThietBi, hinhAnh, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(` Lỗi Database trong update (${id}):`, error.message);
            throw new Error("Không thể cập nhật thông tin thiết bị!");
        }
    },

    
};

export default ThietBi;