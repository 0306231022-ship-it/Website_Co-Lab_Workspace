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
    
}