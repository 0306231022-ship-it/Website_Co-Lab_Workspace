import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';

export default class KhongGianModel {
    static async ThemKG(dulieu,hinhanh){
        try {
            const [them] = await execute(`
                 INSERT INTO khonggian(TEN_KHONG_GIAN,LOAI_KHONG_GIAN,ID_CHI_NHANH,HINHANH,TRANG_THAI)
                 VALUE(?,?,?,?,1)
                `,[dulieu.TenKhongGian,dulieu.LoaiKG,dulieu.IDCN,hinhanh]);
            return them.affectedRows>0 ? true : false
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
                SELECT*FROM khonggian
                WHERE ID_KHONG_GIAN =?
                LIMIT 1
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
    static async LayDanhSach(limit,offset, ID){
        try {
            const [DanhSach] = await execute(`
                SELECT*FROM khonggian
                WHERE ID_CHI_NHANH = ?
                 LIMIT ? OFFSET ?
                `,[ID,limit,offset]);
            const [TongSo] = await execute(`
                 SELECT COUNT(*) AS total FROM khonggian
                `);
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
            const [update] = await execute(`
                UPDATE khonggian
                SET TRANG_THAI = 2
                WHERE TRANG_THAI = 1 AND NGAY_BAO_TRI <= NOW();
                `);
            return update.affectedRows? true : false;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async Mokhonggian(){
        try {
            const [update] = await execute(`
                UPDATE khonggian
                SET TRANG_THAI = 1, NGAY_BAO_TRI = NULL, NGAY_XONG = NULL
                WHERE TRANG_THAI = 2 AND NGAY_XONG <= NOW();
                `);
            return update.affectedRows>0 ? true : false;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async TimKiem_KhongGian(ten,trangthai){
        try {
               const [danhsach] = await execute(`
                SELECT*FROM khonggian
                WHERE TRANG_THAI=? AND TEN_KHONG_GIAN LIKE ?
                `,[trangthai,`%${ten}%`]);
            return danhsach;
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
}