import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';
import { formatDateTime } from '../function.js';
export default class DatLichModel{
    static async DatLich(dulieu){
        try {
           await execute(`
            CALL sp_CreateBooking(?, ?, ?, ?, ?, @bookingID)
            `,[dulieu.ID_KHONG_GIAN || null,dulieu.ID_GHE || null,formatDateTime(dulieu.KHUNG_BATDAU),formatDateTime(dulieu.KHUNG_KETTHUC), dulieu.IDND]);
            const [rows] = await execute(`SELECT @bookingID AS newBookingID`);
            return !!(rows && rows.length > 0 && rows[0].newBookingID > 0);
        } catch (error) {
            throw error;
        }
    }
}