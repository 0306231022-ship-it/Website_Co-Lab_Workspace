import { execute,beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';
import moment from 'moment'
export default class ThanhToanModal{
    static async Them(maGiaoDich,maNganHang,soTienVnPay,trangThaiThanhToan,them){
        try {
            const formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            const [them] = await execute(`
                 INSERT INTO THANH_TOAN (MA_GIAO_DICH, MA_NGAN_HANG, SO_TIEN, NGAY_THANH_TOAN, TRANG_THAI, ID_HOA_DON) 
                 VALUES (?, ?, ?, CURDATE(), ?, ?, ?)
                `[maGiaoDich, maNganHang, soTienVnPay, formattedDateTime, trangThaiThanhToan, them]);
            return them.affectedRows>0;
        } catch (error) {
                throw new Error('Database query failed: ' + error.message);
        }
    }
}