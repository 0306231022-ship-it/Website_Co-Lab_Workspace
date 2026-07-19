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
            const [rowsHienTai] = await execute(`
                SELECT ld.ID_LICH_DAT
                FROM lichdat ld
                WHERE ld.ID_KHONG_GIAN = ?
                AND ld.TRANG_THAI <> 2
                AND NOW() >= KHUNG_BATDAU
                AND NOW() < ld.KHUNG_KETTHUC
                 LIMIT 1;
            `, [id]);
            const lichHienTai = (rowsHienTai && rowsHienTai.length > 0) ? rowsHienTai[0].ID_LICH_DAT : null;
            const [rowsKeTiep] = await execute(`
                SELECT ld.ID_LICH_DAT, ld.KHUNG_BATDAU, ld.KHUNG_KETTHUC
                FROM lichdat ld
                WHERE ld.ID_KHONG_GIAN = ?
                AND ld.TRANG_THAI = 0 
                AND ld.KHUNG_BATDAU > NOW()
                AND ld.THOIGIAN_VAO IS NULL
                ORDER BY ld.KHUNG_BATDAU ASC
                LIMIT 1;
            `, [id]);
            const lichKeTiep = (rowsKeTiep && rowsKeTiep.length > 0) ? rowsKeTiep[0] : null;
            return {
                KhongGian: kiemtra[0],
                lichHienTai: lichHienTai,
                lichKeTiep: lichKeTiep
            };
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
        kg.LOAI_KHONG_GIAN, -- Để check xem có đúng bằng 0 không
        bg.DON_GIA AS DON_GIA_GOC, -- Để check xem JOIN có ra giá trị không
        IF(kg.LOAI_KHONG_GIAN = 0, bg.DON_GIA, NULL) AS DON_GIA 
    FROM khonggian kg
    LEFT JOIN banggia bg ON kg.ID_GIA = bg.ID_GIA
    WHERE kg.ID_CHI_NHANH = ?
    LIMIT ? OFFSET ?
`, [ID, limit, offset]);
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
        let whereClause = ` WHERE ID_CHI_NHANH = ?`;
        let params = [idcn];

        if (ten && ten.trim() !== "") {
            whereClause += ` AND TEN_KHONG_GIAN LIKE ?`;
            params.push(`%${ten.trim()}%`);
        }

        if (trangthai !== 'all' && trangthai !== undefined && trangthai !== null) {
            whereClause += ` AND LOAI_KHONG_GIAN = ?`;
            params.push(Number(trangthai));
        }
        const sqlCount = `SELECT COUNT(*) AS Tong FROM khonggian` + whereClause;
        const [kqCount] = await execute(sqlCount, params);
        const tongDanhSach = kqCount[0]?.Tong || 0;
        let whereClauseForData = whereClause.replace(/WHERE /g, "WHERE kg.");
        whereClauseForData = whereClauseForData.replace(/AND /g, "AND kg.");

        const sqlData = `
            SELECT 
                kg.*,
                bg.DON_GIA 
            FROM khonggian kg
            LEFT JOIN banggia bg 
                ON kg.ID_GIA = bg.ID_GIA AND kg.LOAI_KHONG_GIAN = 0
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
        // 1. Lấy thông tin cơ bản và đơn giá của không gian
        const [rowsKg] = await execute(`
            SELECT kg.ID_KHONG_GIAN, kg.LOAI_KHONG_GIAN, COALESCE(bg.DON_GIA, 0) AS DONGIA
            FROM khonggian kg
            LEFT JOIN banggia bg ON kg.ID_GIA = bg.ID_GIA
            WHERE kg.ID_KHONG_GIAN = ?;
        `, [id]);
       
        const dataKg = Array.isArray(rowsKg) ? rowsKg[0] : rowsKg;
        if (!dataKg) {
            return { Tile_LapDay: 0, DonGia: 0, TongGioThue: 0, TongSoGhe: 0 };
        }

        const loaiKhongGian = dataKg.LOAI_KHONG_GIAN;
        const donGia = Number(dataKg.DONGIA || 0);

        let tiLeLapDay = 0;
        let tongGioThue = 0;

        // 2. Xử lý theo từng loại Không Gian
        if (loaiKhongGian === 0) { 
            // KHÔNG GIAN ĐÓNG (Phòng riêng)
            const [rowsLd] = await execute(`
                SELECT COUNT(*) AS DangDung 
                FROM lichdat 
                WHERE ID_KHONG_GIAN = ? 
                  AND TRANG_THAI <> 2 
                  AND THOIGIAN_RA IS NULL
                  AND (THOIGIAN_VAO IS NOT NULL OR NOW() BETWEEN KHUNG_BATDAU AND KHUNG_KETTHUC);
            `, [id]);
            const resLd = Array.isArray(rowsLd) ? rowsLd[0] : rowsLd;
            tiLeLapDay = (resLd?.DangDung || 0) > 0 ? 100 : 0;

            // Tính tổng số giờ thuê trực tiếp từ bảng lichdat bằng ID_KHONG_GIAN (Không cần JOIN bảng ghe)
            const [rowsGioKg] = await execute(`
                SELECT SUM(
                    CASE 
                        WHEN THOIGIAN_VAO IS NOT NULL AND THOIGIAN_RA IS NOT NULL THEN TIMESTAMPDIFF(HOUR, THOIGIAN_VAO, THOIGIAN_RA)
                        WHEN THOIGIAN_VAO IS NOT NULL AND THOIGIAN_RA IS NULL THEN TIMESTAMPDIFF(HOUR, THOIGIAN_VAO, NOW())
                        ELSE TIMESTAMPDIFF(HOUR, KHUNG_BATDAU, KHUNG_KETTHUC)
                    END
                ) AS TongGio
                FROM lichdat
                WHERE ID_KHONG_GIAN = ? AND TRANG_THAI <> 2;
            `, [id]);
            const resGioKg = Array.isArray(rowsGioKg) ? rowsGioKg[0] : rowsGioKg;
            tongGioThue = Number(resGioKg?.TongGio || 0);

        } else if (loaiKhongGian === 1) { 
            // CHỖ NGỒI CHUNG (Ghế lẻ)
            const [rowsGheDangDung] = await execute(`
                SELECT COUNT(DISTINCT ld.ID_GHE) AS GheBan
                FROM lichdat ld
                INNER JOIN ghe g ON ld.ID_GHE = g.ID_GHE
                WHERE g.ID_KHONG_GIAN = ?
                  AND ld.TRANG_THAI <> 2 
                  AND ld.THOIGIAN_RA IS NULL
                  AND ld.ID_GHE IS NOT NULL
                  AND (ld.THOIGIAN_VAO IS NOT NULL OR NOW() BETWEEN ld.KHUNG_BATDAU AND ld.KHUNG_KETTHUC);
            `, [id]);
          
            const [rowsTongGhe] = await execute(`
                SELECT COUNT(*) AS TongGhe FROM ghe WHERE ID_KHONG_GIAN = ?;
            `, [id]);

            const resGheBan = Array.isArray(rowsGheDangDung) ? rowsGheDangDung[0] : rowsGheDangDung;
            const resTongGhe = Array.isArray(rowsTongGhe) ? rowsTongGhe[0] : rowsTongGhe;

            const gheBan = resGheBan?.GheBan || 0;
            const tongGhe = resTongGhe?.TongGhe || 0;
            tiLeLapDay = tongGhe > 0 ? Math.round((gheBan / tongGhe) * 100) : 0;

            // Tính tổng số giờ thuê của toàn bộ ghế thuộc không gian này
            const [rowsGioGhe] = await execute(`
                SELECT SUM(
                    CASE 
                        WHEN ld.THOIGIAN_VAO IS NOT NULL AND ld.THOIGIAN_RA IS NOT NULL THEN TIMESTAMPDIFF(HOUR, ld.THOIGIAN_VAO, ld.THOIGIAN_RA)
                        WHEN ld.THOIGIAN_VAO IS NOT NULL AND ld.THOIGIAN_RA IS NULL THEN TIMESTAMPDIFF(HOUR, ld.THOIGIAN_VAO, NOW())
                        ELSE TIMESTAMPDIFF(HOUR, ld.KHUNG_BATDAU, ld.KHUNG_KETTHUC)
                    END
                ) AS TongGio
                FROM lichdat ld
                INNER JOIN ghe g ON ld.ID_GHE = g.ID_GHE
                WHERE g.ID_KHONG_GIAN = ? AND ld.TRANG_THAI <> 2;
            `, [id]);
            const resGioGhe = Array.isArray(rowsGioGhe) ? rowsGioGhe[0] : rowsGioGhe;
            tongGioThue = Number(resGioGhe?.TongGio || 0);
        }

        // 4. Lấy tổng số ghế của không gian để hiển thị
        const [rowsCountGhe] = await execute(`
            SELECT COUNT(*) AS TongGhe FROM ghe WHERE ID_KHONG_GIAN = ?;
        `, [id]);
        const resCountGhe = Array.isArray(rowsCountGhe) ? rowsCountGhe[0] : rowsCountGhe;
        const tongSoGhe = loaiKhongGian === 1 ? Number(resCountGhe?.TongGhe || 0) : 0;

        // 5. Trả kết quả an toàn (Không sợ crash vì biến đã được khởi tạo sẵn)
        return {
            Tile_LapDay: tiLeLapDay,
            DonGia: donGia,
            TongGioThue: tongGioThue,
            TongSoGhe: tongSoGhe
        };

    } catch (error) {
        console.error("Lỗi ThongKe tại Model:", error);
        throw error;
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
    static async LayLoai_KG(id){
        try {
            const [ketqua] = await execute(`
                SELECT LOAI_KHONG_GIAN
                FROM khonggian
                WHERE ID_KHONG_GIAN = ?
                `,[id]);
            return ketqua.length>0 ? ketqua[0].LOAI_KHONG_GIAN : null
        } catch (error) {
              console.error("Lỗi khi lấy loại không gian:", error);
        throw new Error('Database query failed: ' + error.message);
        }
    }
    static async TongKhongGian(){
        try {
              const [TongKhongGian] = await execute(`
                SELECT COUNT(ID_KHONG_GIAN) AS Tong_So_KhongGian
                FROM khonggian;
                `,[]);
        return TongKhongGian[0].Tong_So_KhongGian;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    


}