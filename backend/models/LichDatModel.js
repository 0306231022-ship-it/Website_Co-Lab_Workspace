import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';
export default class DatLichModel{
    static async DatLich(dulieu){
        try {
            
          const [result] = await execute(`
            CALL sp_CreateBooking(?, ?, ?, ?, ?, @bookingID)
            `,[dulieu.ID_KHONG_GIAN || null,dulieu.ID_GHE || null,dulieu.KHUNG_BATDAU,dulieu.KHUNG_KETTHUC, dulieu.IDND]);
            console.log('Result from stored procedure:', result);
            const [rows] = await execute(`SELECT @bookingID AS newBookingID`);
            return !!(rows && rows.length > 0 && rows[0].newBookingID > 0);
        } catch (error) {
            throw error;
        }
    }
    static async DanhSach(limit,offset){
        try {
            const [danhsach] = await execute(`
                SELECT * FROM lichdat
                 LIMIT ? OFFSET ?
                `,[limit,offset]);
             const [tong] = await execute(`
                SELECT COUNT(*) AS total FROM lichdat
            `);
            return {
                DanhSach: danhsach,
                TongDanhSach: tong
            };
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async NguoiDat_ghe_HienTai(IDGHE){
        try {
            const [layttt] = await execute(`
                SELECT 
        ld.KHUNG_BATDAU,
        ld.KHUNG_KETTHUC,
        nd.TENND,
        nd.HINH_ANH,
        nd.EMAIL
    FROM 
        lichdat AS ld
    INNER JOIN 
        nguoidung AS nd ON ld.IDND = nd.IDND
    WHERE 
        ld.ID_GHE = ? 
        AND NOW() BETWEEN ld.KHUNG_BATDAU AND ld.KHUNG_KETTHUC
    LIMIT 1
                `,[IDGHE]);
            return layttt.length> 0 ? layttt :null
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async DanhSach_theoIDGHE(limit, offset, IDGHE){
        try {
            const [DanhSach] = await execute(`
                SELECT 
        ld.KHUNG_BATDAU,
        ld.KHUNG_KETTHUC,
        nd.TENND,
        nd.HINH_ANH,
        nd.EMAIL
    FROM 
        lichdat AS ld
    INNER JOIN 
        nguoidung AS nd ON ld.IDND = nd.IDND
    WHERE 
        ld.ID_GHE = ?
    LIMIT ? OFFSET ?
                `,[IDGHE,limit,offset]);
            const [TongSo] = await execute(`
                 SELECT COUNT(*) AS total FROM lichdat
                 WHERE ID_GHE=?
                `,[IDGHE]);

            return {
                DanhSach:DanhSach,
                TongSo:TongSo[0].total
            }
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async kiemtraid(id){
        try {
            const [kiemtra] = await execute(`
                SELECT*FROM lichdat
                WHERE ID_LICH_DAT = ?
                `,[id]);
            return kiemtra.length>0? true : false;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async DanhSachDang_HoatDong(){
        try {
            const thoiGianHienTai = new Date();
            const [DanhSach] = await execute(`
                SELECT*FROM lichdat ld
                WHERE ? BETWEEN ld.KHUNG_BATDAU AND ld.KHUNG_KETTHUC;
                `,[thoiGianHienTai]);
            return DanhSach;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async DanhSach_theoIDND(limit, offset, userId){
        try {
            const [DanhSach] = await execute(`
           SELECT 
    ld.ID_LICH_DAT,
    ld.KHUNG_BATDAU,
    ld.KHUNG_KETTHUC,
    COALESCE(g.ID_KHONG_GIAN, ld.ID_KHONG_GIAN) AS ID_KHONG_GIAN,
    kg.TEN_KHONG_GIAN,
    cn.TEN_CHI_NHANH,
    ld.ID_GHE
FROM lichdat ld
LEFT JOIN ghe g ON ld.ID_GHE = g.ID_GHE
LEFT JOIN khonggian kg ON kg.ID_KHONG_GIAN = COALESCE(g.ID_KHONG_GIAN, ld.ID_KHONG_GIAN)
LEFT JOIN chinhanh cn ON kg.ID_CHI_NHANH = cn.ID_CHI_NHANH
WHERE ld.IDND = ?
ORDER BY ld.KHUNG_BATDAU DESC

LIMIT ? OFFSET ?;
                `,[userId,limit,offset]);
            const [TongSo] = await execute(`
                 SELECT COUNT(*) AS total FROM lichdat
                 WHERE IDND=?
                `,[userId]);
            return {
                DanhSach:DanhSach,
                TongSo:TongSo[0].total
            }
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
}