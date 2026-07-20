import { execute,beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';
import moment from 'moment'
export default class ThanhToanModal{
    static async Them(maGiaoDich,maNganHang,soTienVnPay,trangThaiThanhToan,them1){
        try {
            const formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            const [them] = await execute(`
                 INSERT INTO thanhtoan (MA_GIAO_DICH, MA_NGAN_HANG, SO_TIEN, NGAY_THANH_TOAN, TRANG_THAI, ID_HOA_DON) 
                 VALUES (?, ?, ?, CURDATE(), ?, ?)
                `,[maGiaoDich, maNganHang, soTienVnPay, trangThaiThanhToan, them1]);
            return them.affectedRows>0;
        } catch (error) {
                throw new Error('Database query failed: ' + error.message);
        }
    }
    static async laygiatien_thanhtoan(id_hd){
        try {
            const [truyvan] = await execute(`
                SELECT MA_GIAO_DICH,NGAY_TAO,SO_TIEN
                FROM thanhtoan
                WHERE ID_HOA_DON = ?
                `,[id_hd]);
            return truyvan[0];
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    
}