import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';
import moment from 'moment'
export default class DatLichModel{
    static async DatLich(dulieu, id){
        try {
            
          const [result] = await execute(`
            CALL sp_CreateBooking(?, ?, ?, ?, ?, @bookingID)
            `,[dulieu.ID_KHONG_GIAN || null,dulieu.ID_GHE || null,dulieu.KHUNG_BATDAU,dulieu.KHUNG_KETTHUC, id]);
            const [rows] = await execute(`SELECT @bookingID AS newBookingID`);
            if (rows && rows.length > 0 && rows[0].newBookingID > 0) {
                return rows[0].newBookingID; 
            }
        } catch (error) {
            throw error;
        }
    }
   static async DanhSach(limit, offset, trangthai, search) {
    try {
        let querySql = `
            SELECT 
                ld.ID_LICH_DAT, ld.TRANG_THAI, ld.KHUNG_BATDAU, ld.KHUNG_KETTHUC,
                nd.TENND, nd.EMAIL, MAX(hd.GIA_TIEN) AS GIA_TIEN, 
                CASE WHEN ld.ID_GHE IS NOT NULL THEN g.TEN_GHE ELSE kg.TEN_KHONG_GIAN END AS TEN_DOI_TUONG,
                CASE WHEN ld.ID_GHE IS NOT NULL THEN 'GHE' ELSE 'KHONG_GIAN' END AS LOAI_DAT,
                CASE WHEN ld.ID_GHE IS NOT NULL THEN cn_ghe.TEN_CHI_NHANH ELSE cn_kg.TEN_CHI_NHANH END AS TEN_CHI_NHANH
            FROM lichdat ld
            INNER JOIN nguoidung nd ON ld.IDND = nd.IDND
            LEFT JOIN hoadon hd ON ld.ID_LICH_DAT = hd.ID_LICHDAT
            LEFT JOIN ghe g ON ld.ID_GHE = g.ID_GHE
            LEFT JOIN khonggian kg_ghe ON g.ID_KHONG_GIAN = kg_ghe.ID_KHONG_GIAN
            LEFT JOIN chinhanh cn_ghe ON kg_ghe.ID_CHI_NHANH = cn_ghe.ID_CHI_NHANH
            LEFT JOIN khonggian kg ON ld.ID_KHONG_GIAN = kg.ID_KHONG_GIAN
            LEFT JOIN chinhanh cn_kg ON kg.ID_CHI_NHANH = cn_kg.ID_CHI_NHANH
        `;

        let countSql = `SELECT COUNT(*) AS total FROM lichdat ld`;
        
        // Mảng chứa các điều kiện WHERE
        let whereClauses = [];
        let queryParams = [];
        let countParams = [];

        // 1. Lọc theo trạng thái
        if (trangthai && trangthai !== 'TatCa') {
            let trangThaiSo = trangthai === 'DangSuDung' ? 0 : trangthai === 'DaHoanThanh' ? 1 : 2;
            whereClauses.push(`ld.TRANG_THAI = ?`);
            queryParams.push(trangThaiSo);
            countParams.push(trangThaiSo);
        }

        // 2. Lọc theo Tìm kiếm ID lịch đặt
        if (search && search.trim() !== "") {
            // Xử lý trường hợp người dùng nhập cả chữ dạng "#CLB-12" hoặc chỉ nhập số "12"
            let idTimKiem = search.replace(/[^0-9]/g, ""); // Chỉ giữ lại các chữ số
            
            if (idTimKiem) {
                whereClauses.push(`ld.ID_LICH_DAT = ?`);
                queryParams.push(Number(idTimKiem));
                countParams.push(Number(idTimKiem));
            }
        }

        // Gộp các điều kiện WHERE nếu có
        if (whereClauses.length > 0) {
            const clauseStr = " WHERE " + whereClauses.join(" AND ");
            querySql += clauseStr;
            countSql += clauseStr;
        }

        // Thêm các cú pháp phân trang và sắp xếp
        querySql += `
            GROUP BY ld.ID_LICH_DAT
            ORDER BY ld.ID_LICH_DAT DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(Number(limit), Number(offset));

        // Thực thi DB
        const [danhsach] = await execute(querySql, queryParams);
        const [tongRows] = await execute(countSql, countParams);
        
        return {
            DanhSach: danhsach,
            TongDanhSach: tongRows[0]?.total || 0
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
                WHERE ? BETWEEN ld.KHUNG_BATDAU AND ld.KHUNG_KETTHUC 
                    AND ld.THOIGIAN_RA IS NULL
                    AND ld.THOIGIAN_VAO IS NOT NULL;
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
    static async ChiTiet_LichDat_theoIDDL(id){
    
        let connection = await beginTransaction();
        try {
            // dỰA VÀO  id lấy thông tin người dùng
            const [ChiTiet_NguoiDung] = await connection.query(`
                SELECT ND.TENND,  ND.EMAIL
                FROM lichdat LD
                INNER JOIN nguoidung ND ON LD.IDND = ND.IDND
                WHERE LD.ID_LICH_DAT = ?
                `,[id]);
            if (!ChiTiet_NguoiDung || ChiTiet_NguoiDung.length === 0) {
                await rollbackTransaction(connection);
               return {
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng cho ID_LICH_DAT đã cho.'
                };
            }
            //dựa vào id lấy thông tin thời gian
            const [ChiTiet_ThoiGian] =await connection.query(`
                SELECT KHUNG_BATDAU, KHUNG_KETTHUC, TRANG_THAI, THOIGIAN_VAO, THOIGIAN_RA
                FROM lichdat
                WHERE ID_LICH_DAT = ?
                `,[id]);
            if (!ChiTiet_ThoiGian || ChiTiet_ThoiGian.length === 0) {
                await rollbackTransaction(connection);
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin thời gian cho ID_LICH_DAT đã cho.'
                };
            }
            //dựa vào id lấy thông tin ghế, hoặc không gian 1 TRONG 2 TRƯỜNG SẼ NULL trường nào con thì lấy trường đó
            const [ChiTiet_Ghe_KhongGian] = await connection.query(`
                    SELECT
        LD.ID_GHE,
        LD.ID_KHONG_GIAN,
        G.TEN_GHE,
        COALESCE(KG1.TEN_KHONG_GIAN, KG2.TEN_KHONG_GIAN) AS TEN_KHONG_GIAN,
        COALESCE(CN1.TEN_CHI_NHANH, CN2.TEN_CHI_NHANH) AS TEN_CHI_NHANH,
        COALESCE(BG_GHE.DON_GIA, BG_KG.DON_GIA) AS DON_GIA
    FROM lichdat LD
    LEFT JOIN ghe G 
        ON LD.ID_GHE = G.ID_GHE
    LEFT JOIN banggia BG_GHE 
        ON G.ID_DANH_MUC = BG_GHE.DANHMUC_GHE
    LEFT JOIN khonggian KG1 
        ON LD.ID_KHONG_GIAN = KG1.ID_KHONG_GIAN
    LEFT JOIN khonggian KG2 
        ON G.ID_KHONG_GIAN = KG2.ID_KHONG_GIAN
    LEFT JOIN banggia BG_KG 
        ON COALESCE(KG1.ID_GIA, KG2.ID_GIA) = BG_KG.ID_GIA
    LEFT JOIN chinhanh CN1 
        ON KG1.ID_CHI_NHANH = CN1.ID_CHI_NHANH
    LEFT JOIN chinhanh CN2 
        ON KG2.ID_CHI_NHANH = CN2.ID_CHI_NHANH
    WHERE LD.ID_LICH_DAT = ?;
                `,[id]);
            if (!ChiTiet_Ghe_KhongGian || ChiTiet_Ghe_KhongGian.length === 0) {
                await rollbackTransaction(connection);
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin ghế hoặc không gian cho ID_LICH_DAT đã cho.'
                };
            }
            await commitTransaction(connection);
            return {
                success: true,
                ChiTiet_NguoiDung: ChiTiet_NguoiDung[0],
                ChiTiet_ThoiGian: ChiTiet_ThoiGian[0],
                ChiTiet_Ghe_KhongGian: ChiTiet_Ghe_KhongGian[0],
            };
        }catch (error) {
                await rollbackTransaction(connection);
                throw new Error('Database query failed: ' + error.message);
        }
    }
    static async kiemtraidND(id, userId){
        try {
            const [kiemtra] = await execute(`
                SELECT*FROM lichdat
                WHERE ID_LICH_DAT = ? AND IDND = ?
                `,[id,userId]);
            return kiemtra.length>0? true : false;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async LichDatCuoi_IDPHONG(id){
        /* -- Sắp xếp thời gian giảm dần ;*/
        try {
            const [rows] = await execute(`
        SELECT LOAI_KHONG_GIAN
        FROM khonggian
        WHERE ID_KHONG_GIAN = ?
    `, [id]);

    // Kiểm tra nếu không tìm thấy phòng với ID yêu cầu
    if (rows.length === 0) {
        return null; 
    }

    const soLoaiPhong = Number(rows[0].LOAI_KHONG_GIAN);
    let danhSachKetQua = [];

    // 2. Phân nhánh xử lý theo loại phòng bằng if-else (dễ đọc và an toàn hơn toán tử 3 ngôi)
    if (soLoaiPhong === 1) {
        // Loại phòng 1: Lấy theo ID_KHONG_GIAN trực tiếp từ lịch đặt
        [danhSachKetQua] = await execute(`
            SELECT * FROM lichdat
            WHERE ID_KHONG_GIAN = ?
            ORDER BY KHUNG_KETTHUC DESC 
            LIMIT 1;
        `, [id]);
    } else {
        // Các loại phòng khác: JOIN qua bảng ghế và truyền dynamic tham số [id] vào dấu ?
        [danhSachKetQua] = await execute(`
            SELECT ld.* FROM lichdat ld 
            INNER JOIN ghe g ON ld.ID_GHE = g.ID_GHE 
            WHERE g.ID_KHONG_GIAN = ? 
            ORDER BY ld.KHUNG_BATDAU DESC
            LIMIT 1;
        `, [id]);
    }

    // Trả về bản ghi đầu tiên tìm được, hoặc null nếu không gian đó chưa có ai đặt
    return danhSachKetQua.length > 0 ? danhSachKetQua[0] : null;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
   
    static async ChiTiet_LichDat_TheoID_phong(idkg , limit , offset){
        try {
            const [truyvanResult, tongResult] = await Promise.all([
                execute(
                    `
                        SELECT * FROM lichdat
                        WHERE ID_KHONG_GIAN = ?
                        ORDER BY NGAY_TAO DESC
                        LIMIT ? OFFSET ?
                `, [idkg, limit, offset]),
                execute(
                    `
                        SELECT COUNT(*) AS tong_so_luong 
                        FROM lichdat 
                        WHERE ID_KHONG_GIAN = ?
                `, [idkg])
                
            ]);
            const truyvan = truyvanResult[0]; 
            const tongDanhSach = tongResult[0][0].tong_so_luong;
            return {
                DanhSach : truyvan,
                TongDanhSach : tongDanhSach
            }
            
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async DanhSach_IDGHE_Ngay_HienTai(id){
        try {
            const [kq] = await execute(`
                SELECT KHUNG_BATDAU, KHUNG_KETTHUC 
                FROM lichdat
                WHERE ID_GHE = ? 
                AND DATE(KHUNG_BATDAU) = CURDATE() 
                AND KHUNG_KETTHUC > NOW() 
                AND TRANG_THAI <> 2
                ORDER BY KHUNG_BATDAU ASC;
                `,[id]);
            return kq;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async LichDatGhe_TheoNgay(ID_GHE,THOIGIAN){
        try {
            const [kq] = await execute(`
                 SELECT KHUNG_BATDAU, KHUNG_KETTHUC 
                FROM lichdat
                WHERE ID_GHE = ? 
                AND DATE(KHUNG_BATDAU) = ?
                AND KHUNG_KETTHUC > NOW()
                AND TRANG_THAI <> 2
                ORDER BY KHUNG_BATDAU ASC;
                `,[ID_GHE,THOIGIAN]);
            return kq;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async LichDatKhongGian_HienTai(dulieu){
        try {
             const [kq] = await execute(`
                SELECT KHUNG_BATDAU, KHUNG_KETTHUC 
                FROM lichdat
                WHERE ID_KHONG_GIAN = ? 
                    AND DATE(KHUNG_BATDAU) = CURDATE() 
                    AND KHUNG_KETTHUC > NOW()
                    AND TRANG_THAI <> 2
                ORDER BY KHUNG_BATDAU ASC;
                `,[dulieu]);
            return kq;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
     static async LichDatKhongGian_TheoNgay(IDkg,THOIGIAN){
        try {
            const [kq] = await execute(`
                 SELECT KHUNG_BATDAU, KHUNG_KETTHUC 
                FROM lichdat
                WHERE ID_KHONG_GIAN = ? 
                AND DATE(KHUNG_BATDAU) = ?
                AND KHUNG_KETTHUC > NOW()
                AND TRANG_THAI <> 2
                ORDER BY KHUNG_BATDAU ASC;
                `,[IDkg,THOIGIAN]);
            return kq;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async thongke_lichdat(){
        try {
            const [TongLichDat] = await execute(`
                SELECT COUNT(ID_LICH_DAT) as TONG
                FROM lichdat
                `,[]);
            const thoigian = new Date();
            const [DangHoatDong] = await execute(`
                SELECT COUNT(ID_LICH_DAT) as HOATDONG
                FROM lichdat
                WHERE ? BETWEEN KHUNG_BATDAU AND KHUNG_KETTHUC AND TRANG_THAI = 1
                `,[thoigian]);
            const [DoanhThuThang] = await execute(`
                SELECT SUM(GIA_TIEN) AS DOANHTHU
                FROM hoadon
                WHERE DATE_FORMAT(NGAY_TAO, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m');
                `,[])
            const [TongHuy] = await execute(`
                  SELECT COUNT(ID_LICH_DAT) as HUYDON
                  FROM lichdat
                  WHERE TRANG_THAI = 2
                `)
            return {
                TONG : TongLichDat[0].TONG,
                HOATDONG: DangHoatDong[0].HOATDONG,
                DOANHTHU: DoanhThuThang[0].DOANHTHU,
                HUYDON: TongHuy[0].HUYDON
            }
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async DanhSachHomnay(){
        try {
            const [ketqua] = await execute(`
                SELECT 
    ld.ID_LICH_DAT,
    nd.TENND AS TenKhachHang,
    ld.KHUNG_BATDAU,
    ld.KHUNG_KETTHUC,
    ld.TRANG_THAI
FROM lichdat ld
JOIN nguoidung nd ON ld.IDND = nd.IDND
WHERE DATE(ld.NGAY_TAO) = CURDATE()
ORDER BY ld.NGAY_TAO DESC;  
                `,[]);
            return ketqua;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
    static async TongLich(){
        try {
            const [ketqua] = await execute(`
                SELECT COUNT(ID_LICH_DAT) AS TongLichHomNay
FROM lichdat
WHERE DATE(KHUNG_BATDAU) = CURDATE() 
  AND TRANG_THAI <> 2;
                
                `,[]);
            return ketqua[0].TongLichHomNay
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
  static async PhanTram_ghe() {
    try {
        // 1. Lấy số lượng ghế đang được sử dụng tại thời điểm hiện tại
        const [tong_hoatdong] = await execute(`
            SELECT COUNT(DISTINCT ID_GHE) AS TongGheDangSuDung
            FROM lichdat
            WHERE NOW() BETWEEN KHUNG_BATDAU AND KHUNG_KETTHUC
              AND ID_GHE IS NOT NULL
              AND TRANG_THAI = 1;
        `, []);

        // 2. Lấy tổng số lượng ghế có trong hệ thống (Đã xóa dấu ; thừa)
        const [tong] = await execute(`
            SELECT COUNT(ID_GHE) as TONG
            FROM ghe;
        `, []);

        const gheDangDung = tong_hoatdong[0]?.TongGheDangSuDung || 0;
        const tongSoGhe = tong[0]?.TONG || 0;

        // Xử lý bảo vệ: Nếu hệ thống chưa có ghế nào thì trả về 0% để tránh lỗi chia cho 0 (NaN/Infinity)
        if (tongSoGhe === 0) return 0;

        // Tính phần trăm và làm tròn (ví dụ: 78% thay vì 78.333333%)
        const phanTram = (gheDangDung / tongSoGhe) * 100;
        return Math.round(phanTram); 

    } catch (error) {
        console.error("Lỗi khi tính phần trăm ghế:", error);
        return 0; // Trả về 0 nếu có lỗi xảy ra để giao diện không bị crash
    }
}
    static async PhanTram_phong(){
    try {
        // 1. Lấy số lượng không gian (phòng) đang được sử dụng tại thời điểm hiện tại
        const [tong_hoatdong] = await execute(`
            SELECT COUNT(DISTINCT ID_KHONG_GIAN) AS TongKhongGianDangSuDung
            FROM lichdat
            WHERE NOW() BETWEEN KHUNG_BATDAU AND KHUNG_KETTHUC
              AND ID_KHONG_GIAN IS NOT NULL
              AND TRANG_THAI = 1;
        `, []);

        // 2. Lấy tổng số lượng không gian (phòng) đang quản lý trong hệ thống
        const [tong] = await execute(`
            SELECT COUNT(ID_KHONG_GIAN) as TONG
            FROM khonggian;
        `, []);

        const kgDangDung = tong_hoatdong[0]?.TongKhongGianDangSuDung || 0;
        const tongSoKg = tong[0]?.TONG || 0;

        // Xử lý bảo vệ: Tránh lỗi chia cho 0 nếu hệ thống chưa cấu hình phòng nào
        if (tongSoKg === 0) return 0;

        // Tính phần trăm lấp đầy phòng và làm tròn thành số nguyên
        const phanTram = (kgDangDung / tongSoKg) * 100;
        return Math.round(phanTram); 

    } catch (error) {
        console.error("Lỗi khi tính phần trăm không gian:", error);
        return 0; // Trả về 0 nếu có lỗi xảy ra
    }
}
    static async lichDatTruoc15p(){
        try {
            const [rows] = await execute(`
                SELECT DISTINCT IDND, ID_LICH_DAT
                FROM lichdat
                WHERE KHUNG_BATDAU BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 15 MINUTE)
                    AND TRANG_THAI <> 2
                    AND THONGBAO_TRUOC = 0;
            `, []);
            if (!rows || rows.length === 0) {
                return [];
            }
           const mangID_LichDat = rows.map(item => item.ID_LICH_DAT);
           await execute(`
                UPDATE lichdat 
                SET THONGBAO_TRUOC = 1 
                WHERE ID_LICH_DAT IN (?);
        `, [[mangID_LichDat]]);
            const mangIDND = rows.map(item => item.IDND);
            return mangIDND;
        } catch (error) {
              console.error("Lỗi khi kiểm tra thông báo trước 15p:", error);
        }
    }
    static async lichDatKetThucTruoc15p(){
        try {
            const [rows] = await execute(`
                SELECT DISTINCT IDND, ID_LICH_DAT 
                FROM lichdat
                WHERE KHUNG_KETTHUC BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 15 MINUTE)
              AND TRANG_THAI = 0
              AND THOIGIAN_RA IS NULL
              AND THONGBAO_SAU = 0;
                `,[])
            if (!rows || rows.length === 0) {
                return [];
            }
            const mangID_LichDat = rows.map(item => item.ID_LICH_DAT);
            await execute(`
                UPDATE lichdat 
                SET THONGBAO_SAU = 1 
                WHERE ID_LICH_DAT IN (?);
            `, [mangID_LichDat]);
             const mangIDND = ketqua.map(item => item.IDND);
             return mangIDND;
        } catch (error) {
             console.error("Lỗi khi kiểm tra thông báo trước 15p:", error);
        }
    }
    static async HuyLichChua_checkin(){
        try {
            const [ketqua] = await execute(`
                UPDATE lichdat
                SET TRANG_THAI = 2
                WHERE NOW() >= KHUNG_BATDAU
              AND THOIGIAN_VAO IS NULL
              AND TRANG_THAI = 0;
                `,[]);
            return ketqua.affectedRows>0;
        } catch (error) {
            console.error("Lỗi hủy lịch khi người dùng không check-in!", error);
        }
    }
    static async ThongTin(id){
        try {
            const [ketqua] = await execute(`
                SELECT * FROM lichdat
                WHERE ID_LICH_DAT = ?
                `,[id]);
                return ketqua[0];
        } catch (error) {
            console.error("không thể lấy thông tin lịch đặt!", error);
        }
    }
    static async checkin(id){
        const thoiGianDB = moment().format('YYYY-MM-DD HH:mm:ss');
        try {
            const [update] = await execute(`
                UPDATE lichdat 
                SET THOIGIAN_VAO = ?
                WHERE ID_LICH_DAT = ?
                `,[thoiGianDB,id]);
            return update.affectedRows>0
        } catch (error) {
             console.error("không thể ckeck-in thông tin lịch đặt!", error);
        }
    }
        static async checkout(id){
        const thoiGianDB = moment().format('YYYY-MM-DD HH:mm:ss');
        try {
            const [update] = await execute(`
                UPDATE lichdat 
                SET THOIGIAN_RA = ?
                WHERE ID_LICH_DAT = ?
                `,[thoiGianDB,id]);
            return update.affectedRows>0
        } catch (error) {
             console.error("không thể ckeck-in thông tin lịch đặt!", error);
        }
    }
    static async DonGia_idlichdat(id){
        try {
          const [truyvan] = await execute(`
    SELECT
        LD.KHUNG_BATDAU,
        LD.KHUNG_KETTHUC,
        LD.THOIGIAN_RA,
        COALESCE(BG_GHE.DON_GIA, BG_KG.DON_GIA) AS DON_GIA
    FROM lichdat LD
    LEFT JOIN ghe G 
        ON LD.ID_GHE = G.ID_GHE
    LEFT JOIN banggia BG_GHE 
        ON G.ID_DANH_MUC = BG_GHE.DANHMUC_GHE
    LEFT JOIN khonggian KG1 
        ON LD.ID_KHONG_GIAN = KG1.ID_KHONG_GIAN
    LEFT JOIN khonggian KG2 
        ON G.ID_KHONG_GIAN = KG2.ID_KHONG_GIAN
    LEFT JOIN banggia BG_KG 
        ON COALESCE(KG1.ID_GIA, KG2.ID_GIA) = BG_KG.ID_GIA
    WHERE LD.ID_LICH_DAT = ?;
`, [id]);

if (!truyvan || truyvan.length === 0) return 0;

const data = truyvan[0];
const donGia = data.DON_GIA || 0;
const isValidDate = (dateStr) => {
    if (dateStr instanceof Date) {
        return !isNaN(dateStr.getTime()); 
    }
    if (typeof dateStr !== 'string') {
        return false; 
    }
    return dateStr && dateStr !== 'NULL' && !dateStr.startsWith('0000-00-00');
};

let thoiGianBatDau = new Date(data.KHUNG_BATDAU);
let thoiGianKetThuc;
if (isValidDate(data.THOIGIAN_RA)) {
    thoiGianKetThuc = new Date(data.THOIGIAN_RA);
    if (!isValidDate(data.KHUNG_BATDAU) && isValidDate(data.THOIGIAN_VAO)) {
        thoiGianBatDau = new Date(data.THOIGIAN_VAO);
    }
} else {

    thoiGianKetThuc = new Date(data.KHUNG_KETTHUC);
}

const diffMs = thoiGianKetThuc - thoiGianBatDau; 
const soGio = diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
const tongTien = soGio.toFixed(2) * donGia;


return tongTien;
        } catch (error) {
             console.error("không thể lấy thông tin giá theo lịch đặt!", error);
        }
    }
     static async kiemtra_trangthai_lichdat(id){
        try {
            const [truyvan] = await execute(`SELECT KiemTraTrangThaiDatLich(?) AS trang_thai`, [id])
            if (truyvan && truyvan.length > 0) return Boolean(truyvan[0].trang_thai);
            return true;
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái lịch đặt:", error);
            throw error;
        }
    }
    static async LayDanhSachLichChuaCheckinQuaHan() {
    try {
        const [rows] = await execute(`
            SELECT ID_LICH_DAT, IDND
            FROM lichdat
            WHERE NOW() >= KHUNG_BATDAU
              AND THOIGIAN_VAO IS NULL
        `, []);
        return rows;
    } catch (error) {
        console.error("Lỗi lấy danh sách lịch chưa check-in:", error);
        return [];
    }
}
    static async HuyLichTheoId(idLich) {
    try {
        const [ketqua] = await execute(`
            UPDATE lichdat SET TRANG_THAI = 2 WHERE ID_LICH_DAT = ?
        `, [idLich]);
        return ketqua.affectedRows > 0;
    } catch (error) {
        console.error(`Lỗi hủy lịch ${idLich}:`, error);
        return false;
    }
}
    static async thongtin_khachhang(id){
        try {
            const [truyvan] = await execute(`
                SELECT IDND
                FROM lichdat
                WHERE ID_LICH_DAT = ?
                `,[id]);
           return truyvan.length>0 ? truyvan[0].IDND : null;
        } catch (error) {
             throw new Error("Database query failed: " + error.message);
        }
    }
    static async thongtin_hoatdong(id){
        try {
            const [truycvan] = await execute(`
                SELECT 
    ld.ID_LICH_DAT,
    ld.TRANG_THAI AS MA_TRANG_THAI,
    CASE 
        WHEN ld.TRANG_THAI = 1 AND ld.THOIGIAN_VAO IS NOT NULL AND ld.THOIGIAN_RA IS NULL THEN N'Đang sử dụng'
        WHEN ld.TRANG_THAI = 2 THEN N'Đã hủy'
        WHEN ld.THOIGIAN_RA IS NOT NULL THEN N'Đã trả phòng'
        ELSE N'Chờ sử dụng'
    END AS TEN_TRANG_THAI,
    IFNULL(hd.GIA_TIEN, 0) AS TONG_GIA_TRI_DON,
    ld.NGAY_TAO AS MOC_DAT_DON_THANH_CONG,
    tt.NGAY_THANH_TOAN AS MOC_DA_THANH_TOAN_ONLINE,
    ld.THOIGIAN_VAO AS MOC_DA_NHAN_PHONG,
    ld.THOIGIAN_RA AS MOC_TRA_PHONG
FROM lichdat ld
LEFT JOIN hoadon hd ON ld.ID_LICH_DAT = hd.ID_LICHDAT
LEFT JOIN thanhtoan tt ON hd.ID_HOADON = tt.ID_HOA_DON AND tt.TRANG_THAI = 1
WHERE ld.ID_LICH_DAT = ?
LIMIT 1;
                
                `,[id]);
            return truycvan[0]
        } catch (error) {
             throw new Error("Database query failed: " + error.message);
        }
    }
    static async LichDat_ChuaThanhToan_sau15p(){
        try {
          const [kq] = await execute(`
            SELECT ld.IDND, ld.ID_LICH_DAT
            FROM lichdat ld
            LEFT JOIN hoadon hd ON ld.ID_LICH_DAT = hd.ID_LICHDAT
            WHERE ld.NGAY_TAO < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
            AND ld.TRANG_THAI = 0
            AND hd.ID_LICHDAT IS NULL; 
        `, []);
            return kq;
        } catch (error) {
             throw new Error("Database query failed: " + error.message);
        }
    }
    static async CapNhat_TrangThai(id,trangthai){
        try {
            const [update] = await execute(`
                UPDATE lichdat
                SET TRANG_THAI = ?
                WHERE ID_LICH_DAT = ?
                `,[trangthai,id]);
            return update.affectedRows>0 
        } catch (error) {
            throw new Error("Database query failed: " + error.message);
        }
    }
  
    



                   
}