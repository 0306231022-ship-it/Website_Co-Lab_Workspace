import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';

export default class ChiTietThietBiModel {
    static async CapThietBi(DuLieu){
        try {
            const [Cap] = await execute(`
                INSERT INTO chitiet_thietbi(ID_THIET_BI,ID_KHONG_GIAN,TRANG_THAI)
                VALUES(?,?,1)
                `,[DuLieu.ID_THIET_BI,DuLieu.ID_KHONG_GIAN]);
            return Cap.affectedRows>0 ? true : false;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async DanhSachThietBi_Khonggian(IDKG, limit, offset){
        try {
            const [DanhSach, TongDanhSach] = await Promise.all([
                execute(`
                SELECT 
                    cttb.ID_THIET_BI,
                    tb.TEN_THIET_BI,
                    tb.HINH_ANH,
                    COUNT(*) AS SO_LUONG
                FROM 
                    chitiet_thietbi cttb
                INNER JOIN 
                    thietbi tb ON cttb.ID_THIET_BI = tb.ID_THIET_BI
                WHERE 
                    cttb.ID_KHONG_GIAN = ?
                GROUP BY 
                    cttb.ID_THIET_BI, 
                    tb.TEN_THIET_BI, 
                    tb.HINH_ANH
                LIMIT ? OFFSET ?
                `,[IDKG,limit,offset]),
                execute(`
                SELECT COUNT(DISTINCT ID_THIET_BI) AS total 
                FROM chitiet_thietbi
                WHERE ID_KHONG_GIAN = ?
            `, [IDKG])
                ]);
            return {
                DanhSach: DanhSach[0],
                TongDanhSach: TongDanhSach[0][0].total
            };
            
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async DanhSach_thietbi_cap_khonggian(IDTB){
        try {
            const [truyvan] = await execute(`
               SELECT
    chitiet_thietbi.ID_CT_TB,
    chitiet_thietbi.ID_KHONG_GIAN,
    chitiet_thietbi.TRANG_THAI,
    khonggian.TEN_KHONG_GIAN,
    chinhanh.TEN_CHI_NHANH
FROM 
    chitiet_thietbi
INNER JOIN 
    khonggian ON chitiet_thietbi.ID_KHONG_GIAN = khonggian.ID_KHONG_GIAN
INNER JOIN 
    chinhanh ON khonggian.ID_CHI_NHANH = chinhanh.ID_CHI_NHANH
WHERE 
    chitiet_thietbi.ID_THIET_BI = ?;
                `,[IDTB]);
                return truyvan;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    
}