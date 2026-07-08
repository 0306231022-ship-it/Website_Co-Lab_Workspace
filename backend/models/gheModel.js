import { execute } from "../config/db.js";

export default class GheModel {
    
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
           SELECT 
                g.*, 
                kg.TEN_KHONG_GIAN, 
                dmg.TEN_DANHMUC
             FROM ghe g
            LEFT JOIN khonggian kg ON g.ID_KHONG_GIAN = kg.ID_KHONG_GIAN
            LEFT JOIN danhmucghe dmg ON g.ID_DANH_MUC = dmg.ID_DANHMUC
            WHERE g.ID_GHE = ?
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
    static async CapNhatToaDo(toax,toay,id){
        try {
            const [update] = await execute(`
                 UPDATE ghe 
                 SET TOA_X = ?, TOA_Y = ? 
                WHERE ID_GHE = ?
                `,[toax,toay,id])
            return update.affectedRows>0
        } catch (error) {
             console.error(` Lỗi Database (${id}):`, error.message);
            throw new Error("Không thể truy vấn thông tin ghe!");
        }
    }
    static async laythongtin(dulieu){
        try {
            const [truyvan] = await execute(`
                SELECT g.ID_GHE, 
                       g.TEN_GHE, 
                       kg.TEN_KHONG_GIAN, 
                       bg.DON_GIA
                FROM ghe g 
                INNER JOIN khonggian kg ON g.ID_KHONG_GIAN = kg.ID_KHONG_GIAN 
                INNER JOIN danhmucghe dmg ON g.ID_DANH_MUC = dmg.ID_DANHMUC
                INNER JOIN banggia bg ON dmg.ID_DANHMUC = bg.DANHMUC_GHE 
                WHERE g.ID_GHE =?;
                LIMIT 1
                `,[dulieu]);
            return truyvan[0];
        } catch (error) {
             console.error(` Lỗi Database:`, error.message);
            throw new Error("Không thể truy vấn thông tin ghe!");
        }
    }
}