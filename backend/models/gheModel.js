import { execute } from "../config/db.js";

export default class GheModel {
    
    static async getIDkhongian(idkhongigan) {
        try {
            
             const [rows] = await execute(`
           SELECT 
    g.*,
    
    CASE 
        WHEN ld.ID_LICH_DAT IS NOT NULL THEN 1  
        ELSE 0                                  
    END AS DangCoNguoiDat
FROM ghe g
LEFT JOIN 
    lichdat ld ON g.ID_GHE = ld.ID_GHE 
    AND NOW() BETWEEN ld.KHUNG_BATDAU AND ld.KHUNG_KETTHUC
    AND ld.TRANG_THAI = 1 AND ld.THOIGIAN_VAO IS NOT NULL
WHERE 
    g.ID_KHONG_GIAN = ? 
ORDER BY 
    g.TEN_GHE ASC;   
            `,[idkhongigan]);
            return rows; 
        } catch (error) {
            console.error(" Lỗi Database trong GheModel.getAll:", error.message);
            throw new Error("Không thể kết nối đến cơ sở dữ liệu để lấy danh sách ghế!");
        }
    }
    static async getById(id) {
        try {
           const[rows]=await execute(`
           SELECT 
                g.*, 
                kg.TEN_KHONG_GIAN, 
                dmg.TEN_DANHMUC,
                bg.DON_GIA
             FROM ghe g
            LEFT JOIN khonggian kg ON g.ID_KHONG_GIAN = kg.ID_KHONG_GIAN
            LEFT JOIN danhmucghe dmg ON g.ID_DANH_MUC = dmg.ID_DANHMUC
            LEFT JOIN banggia bg ON dmg.ID_DANHMUC = bg.DANHMUC_GHE
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
 static async update(idGia, tenGia, moTa, soTienMoi, idDanhMucGhe, phuongThuc) {
    // TH1: Admin chọn ghi đè bất chấp hoặc phương thức yêu cầu trực tiếp
    if (phuongThuc === 'overwrite') {
        const [result] = await execute(
            `UPDATE banggia SET TEN_GIA = ?, MOTA = ?, GIA = ? WHERE ID_GIA = ?`,
            [tenGia, moTa, soTienMoi, idGia]
        );
        return result.affectedRows > 0;
    }

    // TH2: Xử lý an toàn (history) - Tự động kiểm tra xem có dùng chung với phòng nào không
    const [dungChungPhong] = await execute(`SELECT COUNT(*) AS count FROM khonggian WHERE ID_GIA = ?`, [idGia]);
    const [dungChungDanhMucKhac] = await execute(`SELECT COUNT(*) AS count FROM danhmucghe WHERE ID_GIA = ? AND ID_DANHMUC != ?`, [idGia, idDanhMucGhe]);
    
    const isShared = (dungChungPhong[0].count + dungChungDanhMucKhac[0].count) > 0;

    if (!isShared) {
        // Không chung với ai -> Cập nhật thẳng bản ghi cũ
        const [result] = await execute(
            `UPDATE banggia SET TEN_GIA = ?, MOTA = ?, GIA = ? WHERE ID_GIA = ?`,
            [tenGia, moTa, soTienMoi, idGia]
        );
        return result.affectedRows > 0;
    } else {
        // Có chung đụng -> Sinh mã giá mới độc lập để không làm lệch giá của không gian/phòng họp
        const [insertResult] = await execute(
            `INSERT INTO banggia (TEN_GIA, GIA, MOTA) VALUES (?, ?, ?)`,
            [tenGia, soTienMoi, moTa]
        );
        const idGiaMoi = insertResult.insertId;

        // Cập nhật lại liên kết mã giá mới này cho riêng danh mục ghế hiện tại
        const [updateResult] = await execute(
            `UPDATE danhmucghe SET ID_GIA = ? WHERE ID_DANHMUC = ?`,
            [idGiaMoi, idDanhMucGhe]
        );
        return updateResult.affectedRows > 0;
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
                WHERE g.ID_GHE =?
                LIMIT 1;
                `,[dulieu]);
            return truyvan[0];
        } catch (error) {
             console.error(` Lỗi Database:`, error.message);
            throw new Error("Không thể truy vấn thông tin ghe!");
        }
    }
    static async CapNhatDanhMuc_ghe(id,iddm){
        try {
            const [capnhat] = await execute(`
                UPDATE ghe
                SET ID_DANH_MUC = ?
                WHERE ID_GHE = ?
                `,[iddm,id]);
            return capnhat.affectedRows>0
        } catch (error) {
            console.error(` Lỗi Database:`, error.message);
            throw new Error("Không thể truy vấn cập nhật danh mục ghe!");
        }
    }
    static async CapNhatTrangThai(id, trangthai){
        try {
            const [Capnhat] = await execute(`
               UPDATE ghe
               SET TRANG_THAI = ? 
               WHERE ID_GHE = ? 
                `,[trangthai,id]);
            return Capnhat.affectedRows>0
        } catch (error) {
             console.error(` Lỗi Database:`, error.message);
            throw new Error("Không thể truy vấn cập nhật trạng thái ghe!");
        }
    }
    static async CapNhat_TenGhe(id,ten){
        try {
            const [capnhat] = await execute(`
                UPDATE ghe
                SET TEN_GHE =? 
                WHERE ID_GHE = ?
                `,[ten,id]);
            return capnhat.affectedRows>0;
        } catch (error) {
              console.error(` Lỗi Database:`, error.message);
            throw new Error("Không thể truy vấn cập nhật tên ghế!");
        }
    }
}