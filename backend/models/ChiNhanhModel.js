import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';

export default class ChiNhanhModel{
    static async ThemChiNhanh(ten,diachi ,hinh){
        try {
            const [them] = await execute(`
                INSERT INTO chinhanh(TEN_CHI_NHANH,DIA_CHI,TRANG_THAI,HINHANH)
                VALUES(?,?,1,?)
                `,[ten,diachi,hinh]);
            return them.affectedRows>0 ? true : false;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async kiemtraid(id){
        try {
            const [kiemtra] = await execute(`
                SELECT*FROM chinhanh
                WHERE ID_CHI_NHANH =?
                `,[id]);
            return kiemtra.length>0 ? true : false;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async CapNhat_ThongTinMem(TenCN,DiaChi, id){
        try {
            let MangThem = [];     
            let MangGiaTri = [];    
            if (TenCN && TenCN.trim() !== '') {
                MangThem.push('TEN_CHI_NHANH = ?');
                MangGiaTri.push(TenCN);
            }
            if (DiaChi && DiaChi.trim() !== '') {
                MangThem.push('DIA_CHI = ?');
                MangGiaTri.push(DiaChi);
            }
            if (MangThem.length === 0)  return false;
            const bieuThucSQL = `
                UPDATE chinhanh
                SET ${MangThem.join(', ')}
                WHERE ID_CHI_NHANH = ${id}
            `;
            const [update] = await execute(bieuThucSQL, MangGiaTri);
            return update.affectedRows>0 ? true : false;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async LayChiTiet(id){
        try {
           const [kiemtra] = await execute(`
                SELECT*FROM chinhanh
                WHERE ID_CHI_NHANH =?
                LIMIT 1
                `,[id]);
            return kiemtra.length>0 ? kiemtra : null
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async CapNhatAnh(IDCN,DuongDan){
        try {
           const [update] = await execute(`
            UPDATE chiNhanh
            SET HINHANH=?
            WHERE ID_CHI_NHANH=?
            `,[DuongDan,IDCN]);
            return update.affectedRows>0 ? true :false;
        } catch (error) {
           throw new Error('Database query failed: ' + error.message);
        }
    }
}