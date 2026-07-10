import { execute, beginTransaction, rollbackTransaction, commitTransaction } from '../config/db.js';
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
    static async DanhSach(limit,offset){
        try {
            const [danhsach] = await execute(`
    SELECT 
        ld.ID_LICH_DAT,
        ld.TRANG_THAI,
        ld.KHUNG_BATDAU,
        ld.KHUNG_KETTHUC,
        nd.TENND,
        nd.EMAIL,
        hd.GIA_TIEN,
        CASE 
            WHEN ld.ID_GHE IS NOT NULL THEN g.TEN_GHE
            ELSE kg.TEN_KHONG_GIAN
        END AS TEN_DOI_TUONG,
        CASE 
            WHEN ld.ID_GHE IS NOT NULL THEN 'GHE'
            ELSE 'KHONG_GIAN'
        END AS LOAI_DAT,
        CASE 
            WHEN ld.ID_GHE IS NOT NULL THEN cn_ghe.TEN_CHI_NHANH
            ELSE cn_kg.TEN_CHI_NHANH
        END AS TEN_CHI_NHANH

    FROM lichdat ld
    INNER JOIN nguoidung nd ON ld.IDND = nd.IDND
    LEFT JOIN hoadon hd ON ld.ID_LICH_DAT = hd.ID_LICHDAT

    LEFT JOIN ghe g ON ld.ID_GHE = g.ID_GHE
    LEFT JOIN khonggian kg_ghe ON g.ID_KHONG_GIAN = kg_ghe.ID_KHONG_GIAN
    LEFT JOIN chinhanh cn_ghe ON kg_ghe.ID_CHI_NHANH = cn_ghe.ID_CHI_NHANH

    LEFT JOIN khonggian kg ON ld.ID_KHONG_GIAN = kg.ID_KHONG_GIAN
    LEFT JOIN chinhanh cn_kg ON kg.ID_CHI_NHANH = cn_kg.ID_CHI_NHANH

    LIMIT ? OFFSET ?
`, [limit, offset]);
             const [tong] = await execute(`
                SELECT COUNT(*) AS total FROM lichdat
            `);
            return {
                DanhSach: danhsach,
                TongDanhSach: tong
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
                WHERE ? BETWEEN ld.KHUNG_BATDAU AND ld.KHUNG_KETTHUC;
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
                SELECT KHUNG_BATDAU, KHUNG_KETTHUC
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
    COALESCE(CN1.TEN_CHI_NHANH, CN2.TEN_CHI_NHANH) AS TEN_CHI_NHANH
FROM lichdat LD
LEFT JOIN ghe G
    ON LD.ID_GHE = G.ID_GHE
LEFT JOIN khonggian KG1
    ON LD.ID_KHONG_GIAN = KG1.ID_KHONG_GIAN
LEFT JOIN khonggian KG2
    ON G.ID_KHONG_GIAN = KG2.ID_KHONG_GIAN
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
            // lấy thông tin hóa đơn dựa vào id
            const [ChiTiet_HoaDon] = await connection.query(`
                SELECT HD.ID_HOADON, HD.GIA_TIEN, HD.NGAY_TAO , HD.TRANG_THAI
                FROM hoadon HD
                WHERE HD.ID_LICHDAT = ?
                `,[id]);
            if (!ChiTiet_HoaDon || ChiTiet_HoaDon.length === 0) {
                await rollbackTransaction(connection);
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin hóa đơn cho ID_LICH_DAT đã cho.'
                };
            }
            // Nếu tất cả các truy vấn đều thành công, commit transaction
            await commitTransaction(connection);
            return {
                success: true,
                ChiTiet_NguoiDung: ChiTiet_NguoiDung[0],
                ChiTiet_ThoiGian: ChiTiet_ThoiGian[0],
                ChiTiet_Ghe_KhongGian: ChiTiet_Ghe_KhongGian[0],
                ChiTiet_HoaDon: ChiTiet_HoaDon[0]
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
                WHERE ID_GHE = ? AND DATE(KHUNG_BATDAU) = CURDATE() AND KHUNG_KETTHUC > NOW()
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
                WHERE ID_KHONG_GIAN = ? AND DATE(KHUNG_BATDAU) = CURDATE() AND KHUNG_KETTHUC > NOW()
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
                WHERE ? BETWEEN KHUNG_BATDAU AND KHUNG_KETTHUC;
                `,[thoigian]);
            const [DoanhThuThang] = await execute(`
                SELECT SUM(GIA_TIEN) AS DOANHTHU
                FROM hoadon
                WHERE DATE_FORMAT(NGAY_TAO, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m');
                `,[])
            return {
                TONG : TongLichDat[0].TONG,
                HOATDONG: DangHoatDong[0].HOATDONG,
                DOANHTHU: DoanhThuThang[0].DOANHTHU
            }
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
}