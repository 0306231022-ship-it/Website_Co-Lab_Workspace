import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';

export default class ChiTietThietBiModel {
  static async CapThietBi(DuLieu) {
    try {
        // Kiểm tra phòng hờ nếu ID_THIET_BI không tồn tại hoặc không phải mảng
        if (!DuLieu.ID_THIET_BI || !Array.isArray(DuLieu.ID_THIET_BI)) {
            throw new Error('Danh sách ID thiết bị không hợp lệ');
        }

        // Tạo mảng các cặp giá trị: Do id_thiet_bi lúc này là số (ví dụ: 10) chứ không phải Object
        const values = DuLieu.ID_THIET_BI.map(id_thiet_bi => [
            id_thiet_bi,            // ID_THIET_BI lấy trực tiếp từ phần tử của mảng
            DuLieu.ID_KHONG_GIAN,   // ID_KHONG_GIAN của không gian được cấp
            1                       // TRANG_THAI mặc định (ví dụ: 1 là Đang hoạt động / Sẵn sàng)
        ]);

        // Tạo chuỗi placeholders dạng (?,?,?), (?,?,?) tùy theo số lượng thiết bị được chọn
        const placeholders = values
            .map(() => "(?,?,?)")
            .join(",");

        // Trải phẳng mảng 2 chiều thành mảng 1 chiều để truyền vào câu lệnh sql execute
        const params = values.flat();

        // Thực thi câu lệnh Insert Bulk (Thêm nhiều dòng cùng lúc) vào Database
        const [Cap] = await execute(`
            INSERT INTO chitiet_thietbi
            (
                ID_THIET_BI,
                ID_KHONG_GIAN,
                TRANG_THAI
            )
            VALUES ${placeholders}
        `, params);

        // Trả về true nếu số dòng bị ảnh hưởng (được insert) lớn hơn 0
        return Cap.affectedRows > 0;

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
    static async XoaCapThietBi(idKhongGian, idThietBi) {
    try {
        const [Result] = await execute(`
            DELETE FROM chitiet_thietbi 
            WHERE ID_KHONG_GIAN = ? AND ID_THIET_BI = ?
            LIMIT 1
        `, [idKhongGian, idThietBi]);

        return Result.affectedRows > 0;
    } catch (error) {
        throw new Error('Database delete failed: ' + error.message);
    }
}
    
}