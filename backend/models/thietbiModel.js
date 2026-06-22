import { execute } from '../config/db.js';

const ThietBi = {
    // Lấy tất cả thiết bị
    getAll: async () => {
        const [rows] = await execute("SELECT * FROM thietbi");
        return rows;
    },

    // Lấy thiết bị theo ID
    getById: async (id) => {
        const [rows] = await execute("SELECT * FROM thietbi WHERE ID_THIET_BI = ?", [id]);
        return rows[0];
    },

    // Thêm thiết bị mới
    create: async (tenThietBi, hinhAnh) => {
        const [result] = await execute(
            "INSERT INTO thietbi (TEN_THIET_BI, HINH_ANH) VALUES (?, ?)",
            [tenThietBi, hinhAnh]
        );
        return result.insertId; // Trả về ID_THIET_BI vừa sinh ra
    },

    // Cập nhật thiết bị
    update: async (id, tenThietBi, hinhAnh) => {
        const [result] = await execute(
            "UPDATE thietbi SET TEN_THIET_BI = ?, HINH_ANH = ? WHERE ID_THIET_BI = ?",
            [tenThietBi, hinhAnh, id]
        );
        return result.affectedRows > 0;
    },

    // Xóa thiết bị
    delete: async (id) => {
        const [result] = await execute("DELETE FROM thietbi WHERE ID_THIET_BI = ?", [id]);
        return result.affectedRows > 0;
    }
};

export default ThietBi;