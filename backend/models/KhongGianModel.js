import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';

export default class KhongGianModel {
    static async ThemKG(dulieu,hinhanh){
        try {
            const [them] = await execute(`
                 INSERT INTO khonggian(TEN_KHONG_GIAN,LOAI_KHONG_GIAN,ID_CHI_NHANH,HINHANH,TRANG_THAI)
                 VALUE(?,?,?,?,1)
                `,[dulieu.TenKhongGian,dulieu.LoaiKG,dulieu.IDCN,hinhanh]);
            return them.affectedRows>0 ? true : falsel
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
}