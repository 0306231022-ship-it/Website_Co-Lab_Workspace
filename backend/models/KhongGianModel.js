import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';

export default class KhongGianModel {
    static async ThemKG(dulieu,hinhanh){
        try {
            const [them] = await execute(`
                 INSERT INTO khonggian(TEN_KHONG_GIAN,LOAI_KHONG_GIAN,ID_CHI_NHANH,HINHANH,TRANG_THAI, ID_GIA)
                 VALUE(?,?,?,?,1,?)
                `,[dulieu.TenKhongGian,dulieu.LoaiKG,dulieu.IDCN,hinhanh, dulieu.IDBangGia || null]);
            return them.affectedRows>0
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async kiemtraid(id){
        try {
            const [kiemtra] = await execute(`
                SELECT*FROM khonggian
                WHERE ID_KHONG_GIAN = ?
                `,[id]);
            return kiemtra.length>0? true : false;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async CapNhatTen(TenKG,IDKG){
        try {
            const [update] = await execute(`
                UPDATE khonggian
                SET TEN_KHONG_GIAN =?
                WHERE ID_KHONG_GIAN = ?
                LIMIT 1
                `,[TenKG,IDKG]);
            return update.affectedRows>0 ? true : false;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async LayChiTiet(id){
        try {
           const [kiemtra] = await execute(`
               SELECT kg.*, bg.DON_GIA
            FROM khonggian kg
            LEFT JOIN banggia bg ON kg.ID_GIA = bg.ID_GIA
            WHERE kg.ID_KHONG_GIAN = ?
            LIMIT 1;
                `,[id]);
            return kiemtra.length>0 ? kiemtra : null
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async CapNhatAnh(IDKG,DuongDan){
        try {
           const [update] = await execute(`
            UPDATE khonggian
            SET HINHANH=?
            WHERE ID_KHONG_GIAN=?
            `,[DuongDan,IDKG]);
            return update.affectedRows>0 ? true :false;
        } catch (error) {
           throw new Error('Database query failed: ' + error.message);
        }
    }
     static async CapNhatTrangThai(IDKG,NgayBatDau,NgayHoanThanh){
        try {
            const [update] = await execute(`
                UPDATE khonggian
                SET NGAY_CAP_NHAT = NOW() , NGAY_BAO_TRI=?, NGAY_XONG=? 
                WHERE ID_KHONG_GIAN = ?
                `,[NgayBatDau,NgayHoanThanh,IDKG]);
            return update.affectedRows>0?true:false;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async LayDanhSach(limit,offset,ID){
        try {
            const [DanhSach] = await execute(`
               SELECT 
        kg.*,
        IF(kg.LOAI_KHONG_GIAN = 0, bg.DON_GIA, NULL) AS DON_GIA 
    FROM khonggian kg
    LEFT JOIN banggia bg ON kg.ID_GIA = bg.ID_GIA
    WHERE kg.ID_CHI_NHANH = ?
    LIMIT ? OFFSET ?
                `,[ID,limit,offset]);
            const [TongSo] = await execute(`
                 SELECT COUNT(*) AS total FROM khonggian
                WHERE ID_CHI_NHANH = ?
                `,[ID]);
            return {
                DanhSach: DanhSach,
                TongDanhSach: TongSo[0].total
            };
            
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async khoa_khonggian(){
        try {
            const [danhSachSapKhoa] = await execute(`
                SELECT ID_KHONG_GIAN, TEN_KHONG_GIAN, TRANG_THAI 
                FROM khonggian
                WHERE TRANG_THAI = 1 AND NGAY_BAO_TRI <= NOW();
            `,[]);
            if (danhSachSapKhoa.length === 0) {
                return [];
            }
            const listIds = danhSachSapKhoa.map(item => item.ID_KHONG_GIAN);
            await execute(`
                UPDATE khonggian
                SET TRANG_THAI = 2
                WHERE ID_KHONG_GIAN IN (${listIds.join(',')});
            `,[]);
            return danhSachSapKhoa;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async Mokhonggian(){
        try {
            const [danhSachSapMo] = await execute(`
                SELECT ID_KHONG_GIAN, TEN_KHONG_GIAN, TRANG_THAI 
                FROM khonggian
                WHERE TRANG_THAI = 2 AND NGAY_XONG <= NOW();
            `,[]);
            if (danhSachSapMo.length === 0) {
                return [];
            }
            const listIds = danhSachSapMo.map(item => item.ID_KHONG_GIAN);
            await execute(`
                UPDATE khonggian
                SET TRANG_THAI = 1, NGAY_BAO_TRI = NULL, NGAY_XONG = NULL
                WHERE ID_KHONG_GIAN IN (${listIds.join(',')});
            `,[]);
            return danhSachSapMo;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
   static async TimKiem_KhongGian(ten, trangthai, idcn, limit, offset) {
    try {
        // 1. Tạo điều kiện WHERE động (Không dùng alias kg. ở đây để câu lệnh COUNT không lỗi)
        let whereClause = ` WHERE ID_CHI_NHANH = ?`;
        let params = [idcn];

        if (ten && ten.trim() !== "") {
            whereClause += ` AND TEN_KHONG_GIAN LIKE ?`;
            params.push(`%${ten.trim()}%`);
        }

        if (trangthai !== 'all' && trangthai !== undefined && trangthai !== null) {
            whereClause += ` AND TRANG_THAI = ?`;
            params.push(Number(trangthai));
        }

        // 2. Câu lệnh COUNT thuần túy trên bảng khonggian (Đảm bảo có dấu cách trước WHERE)
        const sqlCount = `SELECT COUNT(*) AS Tong FROM khonggian` + whereClause;
        const [kqCount] = await execute(sqlCount, params);
        const tongDanhSach = kqCount[0]?.Tong || 0;

        // 3. Khi JOIN dữ liệu, ta chủ động thêm alias 'kg.' vào trước các điều kiện WHERE
        // Thay thế " WHERE " thành " WHERE kg." để ép chạy đúng trên bảng đã JOIN
        let whereClauseForData = whereClause.replace(/WHERE /g, "WHERE kg.");
        whereClauseForData = whereClauseForData.replace(/AND /g, "AND kg.");

        const sqlData = `
            SELECT 
                kg.*,
                bg.DON_GIA 
            FROM khonggian kg
            LEFT JOIN banggia bg 
                ON kg.ID_GIA = bg.ID_GIA AND kg.LOAI_KHONG_GIAN = 2
        ` + whereClauseForData + ` LIMIT ? OFFSET ?`;

        const dataParams = [...params, Number(limit), Number(offset)];
        const [danhsach] = await execute(sqlData, dataParams);

        return {
            DanhSach: danhsach,
            TongDanhSach: tongDanhSach
        };

    } catch (error) {
        throw new Error('Database query failed: ' + error.message);
    }
}
    static async TruyVan_ChiNhanh(IDKG){
        try {
            const [danhsach] = await execute(`
                SELECT 
                kg.ID_KHONG_GIAN,
                cn.ID_CHI_NHANH,
                cn.TEN_CHI_NHANH,
                cn.DIA_CHI,
                cn.TRANG_THAI
            FROM 
                khonggian kg
            INNER JOIN 
                chinhanh cn ON kg.ID_CHI_NHANH = cn.ID_CHI_NHANH
            WHERE 
                kg.ID_KHONG_GIAN = ?
            LIMIT 1
                `,[IDKG]);
            return danhsach.length > 0 ? danhsach[0] : null;
        } catch (error) {
              throw new Error('Database query failed: ' + error.message);
        }
    }
    static async kiemtra(value,IDKG){
        try {
            const [kt] = await execute(`
                SELECT*FROM khonggian
                WHERE ID_KHONG_GIAN = ? AND ID_CHI_NHANH = ?
                `,[IDKG,value]);
            return kt.length>0 ? true : false;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
   static async ThongKe(id) {
    try {
        // 1. Gộp tất cả các chỉ số thống kê vào 1 câu query duy nhất nhằm tăng tốc độ xử lý và tối ưu database
        const [rows] = await execute(`
            SELECT 
                kg.ID_KHONG_GIAN,
                kg.LOAI_KHONG_GIAN,
                COALESCE(bg.DON_GIA, 0) AS DONGIA,
                CASE 
                    WHEN kg.LOAI_KHONG_GIAN = 2 THEN
                        CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM lichdat ld 
                                WHERE ld.ID_KHONG_GIAN = kg.ID_KHONG_GIAN 
                                  AND NOW() BETWEEN ld.KHUNG_BATDAU AND ld.KHUNG_KETTHUC
                            ) THEN 100 ELSE 0
                        END
                    WHEN kg.LOAI_KHONG_GIAN = 1 THEN
                        COALESCE(
                            (SELECT COUNT(DISTINCT ld.ID_GHE) FROM lichdat ld 
                             WHERE ld.ID_KHONG_GIAN = kg.ID_KHONG_GIAN 
                               AND NOW() BETWEEN ld.KHUNG_BATDAU AND ld.KHUNG_KETTHUC 
                               AND ld.ID_GHE IS NOT NULL
                            ) * 100.0 / NULLIF((SELECT COUNT(*) FROM ghe g WHERE g.ID_KHONG_GIAN = kg.ID_KHONG_GIAN), 0), 
                            0
                        )
                    ELSE 0
                END AS TI_LE_LAP_DAY,
                COALESCE((
                    SELECT SUM(TIMESTAMPDIFF(HOUR, ld_gio.KHUNG_BATDAU, ld_gio.KHUNG_KETTHUC))
                    FROM lichdat ld_gio
                    WHERE ld_gio.ID_KHONG_GIAN = kg.ID_KHONG_GIAN AND ld_gio.TRANG_THAI = 1
                ), 0) AS TONG_SO_GIO_THUE,
                CASE 
                    WHEN kg.LOAI_KHONG_GIAN = 1 THEN
                        (SELECT COUNT(*) FROM ghe g WHERE g.ID_KHONG_GIAN = kg.ID_KHONG_GIAN)
                    ELSE 0
                END AS TONG_SO_GHE

            FROM khonggian kg
            LEFT JOIN banggia bg ON kg.ID_GIA = bg.ID_GIA
            WHERE kg.ID_KHONG_GIAN = ?;
        `, [id]);
        const data = Array.isArray(rows) ? rows[0] : rows;

        if (!data) {
            // Trả về dữ liệu mặc định an toàn nếu ID không gian không tồn tại trên hệ thống
            return {
                Tile_LapDay: 0,
                DonGia: 0,
                TongGioThue: 0,
                TongSoGhe: 0
            };
        }

        // 3. Trả kết quả chuẩn chỉnh ra ngoài controller phục vụ API
        return {
            Tile_LapDay: Number(data.TI_LE_LAP_DAY || 0),
            DonGia: Number(data.DONGIA || 0),
            TongGioThue: Number(data.TONG_SO_GIO_THUE || 0),
            TongSoGhe: Number(data.TONG_SO_GHE || 0)
        };

    } catch (error) {
        console.error("Lỗi ThongKe model:", error);
        throw new Error('Database query failed: ' + error.message);
    }
}
    static async ChinhSua_Gia(IDKG,IDBangGia){
        try {
            const [update] = await execute(`
                UPDATE khonggian
                SET ID_GIA = ?
                WHERE ID_KHONG_GIAN = ?
                `,[IDBangGia,IDKG]);
            return update.affectedRows > 0
        } catch (error) {
             console.error("Lỗi chỉnh sửa giá:", error);
        throw new Error('Database query failed: ' + error.message);
        }
    }
    static async layten_khonggian(id){
        try {
            const [truyvan] = await execute(`
                SELECT TEN_KHONG_GIAN
                FROM khonggian
                WHERE ID_KHONG_GIAN = ?
                LIMIT 1
                `,[id]);
            return truyvan.length>0 ? truyvan[0].TEN_KHONG_GIAN : false;
        } catch (error) {
             console.error("Lỗi:", error);
        throw new Error('Database query failed: ' + error.message);
        }
    }
    


}