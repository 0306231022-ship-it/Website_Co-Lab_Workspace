// Viết thủ tục đặt lịch, kiểm tra trùng lịch
/**
-- BƯỚC CẦN THIẾT: Xóa thủ tục cũ để nạp code mới
DROP PROCEDURE IF EXISTS sp_CreateBooking;

DELIMITER //

CREATE PROCEDURE sp_CreateBooking(
    IN p_PhongHopID INT,
    IN p_GheID INT,
    IN p_StartTime DATETIME,
    IN p_EndTime DATETIME,
    IN p_UserID INT,
    OUT p_BookingID INT
)
BEGIN
    -- Mặc định thất bại
    SET p_BookingID = 0;

    -- Tự động hủy nếu có lỗi hệ thống phát sinh
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_BookingID = 0;
        RESIGNAL;
    END;

    -- 1. Kiểm tra tính hợp lệ của thời gian
    IF p_StartTime >= p_EndTime THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.';
    END IF;

    IF p_StartTime < NOW() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Không thể đặt lịch cho thời gian trong quá khứ.';
    END IF;

    -- 1.5 Kiểm tra người dùng
    IF NOT EXISTS (
        SELECT 1 FROM nguoidung WHERE IDND = p_UserID
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Tài khoản người dùng không tồn tại trên hệ thống.';
    END IF;

    -- 2. Kiểm tra trùng lịch độc lập
    
    -- TRƯỜNG HỢP A: Người dùng ĐẶT PHÒNG
    IF p_PhongHopID IS NOT NULL AND p_PhongHopID > 0 THEN
        IF EXISTS (
            SELECT 1 FROM lichdat 
            WHERE ID_KHONG_GIAN = p_PhongHopID 
              AND ID_KHONG_GIAN IS NOT NULL -- Ép buộc chỉ xét các dòng đặt phòng
              AND IFNULL(TRANG_THAI, 0) <> 2
              AND p_StartTime < KHUNG_KETTHUC 
              AND p_EndTime > KHUNG_BATDAU
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Phòng họp này đã có người đặt trong khoảng thời gian trên.';
        END IF;
    END IF;

    -- TRƯỜNG HỢP B: Người dùng ĐẶT GHẾ
    IF p_GheID IS NOT NULL AND p_GheID > 0 THEN
        IF EXISTS (
            SELECT 1 FROM lichdat 
            WHERE ID_GHE = p_GheID 
              AND ID_GHE IS NOT NULL -- Ép buộc chỉ xét các dòng đặt ghế
              AND IFNULL(TRANG_THAI, 0) <> 2
              AND p_StartTime < KHUNG_KETTHUC 
              AND p_EndTime > KHUNG_BATDAU
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Ghế ngồi này đã có người đặt trong khoảng thời gian trên!';
        END IF;
    END IF;

    -- 3. Tiến hành đặt lịch nếu tất cả bộ lọc trên hợp lệ
    INSERT INTO lichdat (ID_KHONG_GIAN, ID_GHE, KHUNG_BATDAU, KHUNG_KETTHUC, IDND, TRANG_THAI)
    VALUES (p_PhongHopID, p_GheID, p_StartTime, p_EndTime, p_UserID, 1); -- Mặc định trạng thái = 1 (hoạt động)

    -- 4. Trả về ID vừa tạo
    SET p_BookingID = LAST_INSERT_ID();

END //

DELIMITER ;

// TẠO TRIGGER KHÓA LỖI

DELIMITER //

CREATE TRIGGER tg_KiemTraTrungLichBeforeInsert
BEFORE INSERT ON lichdat -- Chạy TRƯỚC KHI lệnh INSERT có hiệu lực
FOR EACH ROW -- Áp dụng trên từng dòng dữ liệu được chèn vào
BEGIN
    
    -- LỚP CHẶN 1: Nếu đặt PHÒNG HỌP mà bị trùng lịch
    IF NEW.ID_KHONG_GIAN IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM lichdat 
            WHERE ID_KHONG_GIAN = NEW.ID_KHONG_GIAN
              AND TRANG_THAI <> 2 
              AND NEW.KHUNG_BATDAU < KHUNG_KETTHUC
              AND NEW.KHUNG_KETTHUC > KHUNG_BATDAU
        ) THEN
            -- ĐÂY CHÍNH LÀ CÁCH TẠO LỖI TRIGGER
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Lỗi Trigger: Phòng họp này đã có người đặt trong khoảng thời gian trên.';
        END IF;
    END IF;

    -- LỚP CHẶN 2: Nếu đặt GHẾ NGỒI mà bị trùng lịch
    IF NEW.ID_GHE IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM lichdat 
            WHERE ID_GHE = NEW.ID_GHE
              AND Status <> 2 
              AND NEW.KHUNG_BATDAU < KHUNG_KETTHUC
              AND NEW.KHUNG_KETTHUC > KHUNG_KETTHUC
        ) THEN
            -- ĐÂY CHÍNH LÀ CÁCH TẠO LỖI TRIGGER
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Lỗi Trigger: Ghế ngồi này đã có người đặt trong khoảng thời gian trên.';
        END IF;
    END IF;

END //

DELIMITER ;
 * 
 */
