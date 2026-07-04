import { execute } from "../config/db.js";

export default class GheModel {
    
    // 1. Lấy TẤT CẢ ghế trong hệ thống (Không phân trang, vẫn JOIN lấy tên không gian và danh mục)
    static async getIDkhongian(idkhongigan) {
        try {
            
             const [rows] = await execute(`
            SELECT * FROM ghe 
            WHERE ID_KHONG_GIAN =?    
            `,[idkhongigan]);
            return rows; 
        } catch (error) {
            console.error(" Lỗi Database trong GheModel.getAll:", error.message);
            throw new Error("Không thể kết nối đến cơ sở dữ liệu để lấy danh sách ghế!");
        }
    }

    // 2. Lấy chi tiết một chiếc ghế theo ID
    static async getById(id) {
        try {
           const[rows]=await execute(`
            SELECT * FROM ghe WHERE ID_GHE = ?
            `,[id])
            return rows[0];
        } catch (error) {
            console.error(` Lỗi Database trong GheModel.getById (${id}):`, error.message);
            throw new Error("Không thể lấy thông tin chi tiết của ghế!");
        }
    }

    // 3. Thêm ghế mới
    static async create(data) {
        try {
            const[create]=await execute(`INSERT INTO ghe (TEN_GHE,TOA_X,TOA_Y,TRANG_THAI,ID_KHONG_GIAN,ID_DANH_MUC) 
            VALUES(?,?,?,1,?,?)`,
            [data.TEN_GHE,data.TOA_X,data.TOA_Y,data.ID_KHONG_GIAN,data.ID_DANH_MUC]
            );
            return create.affectedRows>0? true:false; 
           
        } catch (error) {
            console.error(" Lỗi Database trong GheModel.create:", error.message);
            throw new Error("Không thể thêm ghế mới vào cơ sở dữ liệu!");
        }
    }           

    // 4. Cập nhật thông tin ghế
    static async update(id, data) {
        try {
            const[update]=await execute(`
                UPDATE ghe 
                SET TEN_GHE=?, TOA_X=?, TOA_Y=?, TRANG_THAI=?, ID_KHONG_GIAN=?, ID_DANH_MUC=? WHERE ID_GHE=?`,
                [data.TEN_GHE,data.TOA_X,data.TOA_Y,data.TRANG_THAI,data.ID_KHONG_GIAN,data.ID_DANH_MUC,id]
            );
             return update.affectedRows>0 ? true : false;
        } catch (error) {
            console.error(`❌ Lỗi Database trong GheModel.update (${id}):`, error.message);
            throw new Error("Không thể cập nhật thông tin ghế!");
        }
    }
    static async khoa_ghe(idkhonggian){
        try {
            const [update] = await execute(`
                UPDATE ghe
                SET TRANG_THAI = 2
                WHERE ID_KHONG_GIAN = ? ;
                `,[idkhonggian]);
            return update.affectedRows? true : false;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    // 5. Kiểm tra xem ID_GHE có tồn tại thực tế hay không
    static async testId(id) {
       try {
             const [test] = await execute("SELECT * FROM ghe WHERE ID_GHE = ?", [id]);
             return test.length>0 ? true : false;
        } catch (error) {
             console.error(` Lỗi Database (${id}):`, error.message);
            throw new Error("Không thể truy vấn thông tin ghe!");
        }
    }
}