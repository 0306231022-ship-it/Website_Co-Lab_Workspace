-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 16, 2026 lúc 02:08 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `co-lab_workspace`
--

DELIMITER $$
--
-- Thủ tục
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetChiTietHoaDonTheoLichDat` (IN `input_ID_LICHDAT` INT)   BEGIN
    SELECT 
        -- 1. Lấy tất cả thông tin của hóa đơn
        hd.*,
        
        -- 2. Thông tin người dùng từ bảng nguoidung
        nd.TENND,
        nd.EMAIL,
        
        -- 3. Xử lý động thông tin Không gian và Chi nhánh (Hỗ trợ cả TH1 và TH2)
        -- COALESCE sẽ ưu tiên lấy ID_KHONG_GIAN trực tiếp từ lichdat, nếu null sẽ lấy từ bảng ghe
        COALESCE(ld.ID_KHONG_GIAN, g.ID_KHONG_GIAN) AS ID_KHONG_GIAN_THUCTE,
        kg.TEN_KHONG_GIAN,
        cn.TEN_CHI_NHANH,
        cn.DIA_CHI,
        
        -- 4. Thông tin Tên Ghế (Chỉ có ở TH1, TH2 sẽ tự động trả về NULL)
        g.TEN_GHE
        
    FROM hoadon hd
    -- Kết nối sang bảng lichdat để làm cầu nối
    INNER JOIN lichdat ld ON hd.ID_LICHDAT = ld.ID_LICH_DAT
    
    -- Kết nối sang bảng nguoidung lấy thông tin cá nhân
    INNER JOIN nguoidung nd ON ld.IDND = nd.IDND
    
    -- LEFT JOIN sang bảng ghe (Vì TH2 ghế có thể NULL)
    LEFT JOIN ghe g ON ld.ID_GHE = g.ID_GHE
    
    -- LEFT JOIN sang bảng khonggian
    -- Điều kiện ON linh hoạt: Nếu ld.ID_KHONG_GIAN có thì nối trực tiếp, nếu NULL thì nối qua g.ID_KHONG_GIAN
    LEFT JOIN khonggian kg ON kg.ID_KHONG_GIAN = COALESCE(ld.ID_KHONG_GIAN, g.ID_KHONG_GIAN)
    
    -- LEFT JOIN sang bảng chi nhánh từ bảng không gian vừa tìm được
    LEFT JOIN chinhanh cn ON kg.ID_CHI_NHANH = cn.ID_CHI_NHANH
    
    WHERE hd.ID_LICHDAT = input_ID_LICHDAT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_CreateBooking` (IN `p_PhongHopID` INT, IN `p_GheID` INT, IN `p_StartTime` DATETIME, IN `p_EndTime` DATETIME, IN `p_UserID` INT, OUT `p_BookingID` INT)   BEGIN
    -- Mặc định thất bại
    SET p_BookingID = 0;



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
    VALUES (p_PhongHopID, p_GheID, p_StartTime, p_EndTime, p_UserID, 0); -- Mặc định trạng thái = 1 (hoạt động)

    -- 4. Trả về ID vừa tạo
    SET p_BookingID = LAST_INSERT_ID();

END$$

--
-- Các hàm
--
CREATE DEFINER=`root`@`localhost` FUNCTION `KiemTraTrangThaiDatLich` (`p_id_lich_dat` INT) RETURNS TINYINT(1) DETERMINISTIC BEGIN
    DECLARE v_khung_batdau DATETIME;
    DECLARE v_khung_ketthuc DATETIME;
    DECLARE v_thoigian_ra DATETIME;
    DECLARE v_exists INT DEFAULT 0;

    -- 1. Lấy thông tin thời gian của lịch đặt dựa vào ID truyền vào
    SELECT KHUNG_BATDAU, KHUNG_KETTHUC, THOIGIAN_RA, 1
    INTO v_khung_batdau, v_khung_ketthuc, v_thoigian_ra, v_exists
    FROM lichdat -- Thay 'LICH_DAT' bằng tên bảng thực tế của bạn
    WHERE ID_LICH_DAT = p_id_lich_dat;

    -- Nếu không tìm thấy ID lịch đặt này, trả về TRUE (hoặc tùy bạn xử lý)
    IF v_exists = 0 THEN
        RETURN TRUE;
    END IF;

    -- 2. Kiểm tra xem thời gian hiện tại (NOW()) có nằm trong khung giờ đặt hay không
    IF NOW() BETWEEN v_khung_batdau AND v_khung_ketthuc THEN
        -- Đang trong khung giờ đặt (Có người đặt) -> Kiểm tra THOIGIAN_RA đã có dữ liệu chưa
        IF v_thoigian_ra IS NULL THEN
            RETURN FALSE; -- Chưa check-out (trả về false)
        ELSE
            RETURN TRUE;  -- Đã check-out (trả về true)
        END IF;
    ELSE
        -- Thời gian hiện tại không nằm trong khung giờ đặt (Không có người đặt)
        RETURN TRUE;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banggia`
--

CREATE TABLE `banggia` (
  `ID_GIA` int(11) NOT NULL,
  `TEN_GIA` varchar(255) NOT NULL,
  `MOTA` text DEFAULT NULL,
  `NGAY_TAO` datetime NOT NULL DEFAULT current_timestamp(),
  `NGAY_KET_THUC` datetime DEFAULT NULL,
  `DON_GIA` decimal(13,2) NOT NULL DEFAULT 0.00,
  `DANHMUC_GHE` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `banggia`
--

INSERT INTO `banggia` (`ID_GIA`, `TEN_GIA`, `MOTA`, `NGAY_TAO`, `NGAY_KET_THUC`, `DON_GIA`, `DANHMUC_GHE`) VALUES
(62, 'Giá thuê', 'Ghế Ergonomic cao cấp hỗ trợ ngồi làm việc lâu dài chống mỏi', '2026-07-12 11:50:00', NULL, 40000.00, 52),
(63, 'Giá thuê', 'DỮ LIỆU TEST', '2026-07-12 14:32:11', NULL, 50000.00, 51),
(64, 'giá loại', 'Test dữ liệu', '2026-07-12 15:11:51', NULL, 700000.00, 54),
(65, 'Giá giờ tiêu chuẩn', 'test dữ liệu', '2026-07-15 09:16:41', NULL, 100000.00, 55),
(67, 'giá Vip', 'test dữ liệu', '2026-07-15 09:17:41', NULL, 200000.00, 57);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chinhanh`
--

CREATE TABLE `chinhanh` (
  `ID_CHI_NHANH` int(11) NOT NULL,
  `TEN_CHI_NHANH` varchar(255) NOT NULL,
  `DIA_CHI` varchar(255) NOT NULL,
  `NGAY_NHAP` datetime DEFAULT current_timestamp(),
  `NGAY_CAP_NHAT` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `TRANG_THAI` int(11) DEFAULT NULL,
  `HINHANH` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chinhanh`
--

INSERT INTO `chinhanh` (`ID_CHI_NHANH`, `TEN_CHI_NHANH`, `DIA_CHI`, `NGAY_NHAP`, `NGAY_CAP_NHAT`, `TRANG_THAI`, `HINHANH`) VALUES
(52, 'Co-Lab Quận 1', '123 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh', '2026-07-12 11:12:45', NULL, 1, 'uploads/ChiNhanh/1783829565688-403268608.jpg'),
(53, 'Co-Lab Bình Thạnh', '456 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh', '2026-07-12 11:13:20', NULL, 1, 'uploads/ChiNhanh/1783829600775-82054256.jpg'),
(54, 'Co-Lab Thủ Đức', '789 Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP. Hồ Chí Minh', '2026-07-12 11:13:55', NULL, 1, 'uploads/ChiNhanh/1783829635384-836275058.jfif'),
(55, 'Co-lab Gò Vấp', '124/45A Phạm Văn Đồng Gò vấp', '2026-07-12 11:21:21', NULL, 0, 'uploads/ChiNhanh/1783830081001-865400719.png');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitiet_thietbi`
--

CREATE TABLE `chitiet_thietbi` (
  `ID_CT_TB` int(11) NOT NULL,
  `ID_THIET_BI` int(11) NOT NULL,
  `ID_KHONG_GIAN` int(11) NOT NULL,
  `TRANG_THAI` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chitiet_thietbi`
--

INSERT INTO `chitiet_thietbi` (`ID_CT_TB`, `ID_THIET_BI`, `ID_KHONG_GIAN`, `TRANG_THAI`) VALUES
(61, 51, 53, 1),
(62, 52, 53, 1),
(63, 53, 53, 1),
(64, 54, 54, 1),
(65, 55, 54, 1),
(66, 56, 54, 1),
(67, 60, 55, 1),
(68, 59, 55, 1),
(69, 58, 55, 1),
(70, 59, 56, 1),
(71, 58, 56, 1),
(72, 57, 56, 1),
(73, 56, 56, 1),
(74, 52, 55, 1),
(75, 53, 59, 1),
(76, 54, 59, 1),
(77, 55, 59, 1),
(78, 56, 59, 1),
(79, 68, 59, 1),
(80, 69, 59, 1),
(81, 53, 59, 1),
(82, 54, 59, 1),
(83, 55, 59, 1),
(84, 56, 59, 1),
(85, 68, 59, 1),
(86, 69, 59, 1),
(87, 52, 57, 1),
(88, 51, 57, 1),
(89, 56, 57, 1),
(90, 57, 57, 1),
(91, 58, 57, 1),
(92, 64, 57, 1),
(93, 65, 57, 1),
(94, 68, 57, 1),
(95, 52, 60, 1),
(96, 51, 60, 1),
(97, 53, 60, 1),
(98, 57, 60, 1),
(99, 58, 60, 1),
(100, 60, 60, 1),
(101, 65, 60, 1),
(102, 64, 60, 1),
(103, 62, 60, 1),
(104, 61, 60, 1),
(105, 68, 60, 1),
(106, 67, 60, 1),
(107, 70, 60, 1),
(108, 52, 58, 1),
(109, 51, 58, 1),
(110, 53, 58, 1),
(111, 54, 58, 1),
(112, 55, 58, 1),
(113, 57, 61, 1),
(114, 56, 61, 1),
(115, 58, 61, 1),
(116, 59, 61, 1),
(117, 60, 61, 1),
(118, 52, 62, 1),
(119, 51, 62, 1),
(120, 53, 62, 1),
(121, 57, 62, 1),
(122, 55, 62, 1),
(123, 56, 62, 1),
(124, 51, 63, 1),
(125, 52, 63, 1),
(126, 57, 63, 1),
(127, 56, 63, 1),
(128, 58, 63, 1),
(129, 53, 64, 1),
(130, 52, 64, 1),
(132, 59, 64, 1),
(133, 60, 64, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmucghe`
--

CREATE TABLE `danhmucghe` (
  `ID_DANHMUC` int(11) NOT NULL,
  `TEN_DANHMUC` varchar(255) NOT NULL,
  `TRANG_THAI` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmucghe`
--

INSERT INTO `danhmucghe` (`ID_DANHMUC`, `TEN_DANHMUC`, `TRANG_THAI`) VALUES
(51, 'Ghế công thái học (Ergonomic)', 1),
(52, 'Ghế xoay văn phòng tiêu chuẩn', 1),
(53, 'Ghế chân quỳ phòng họp', 1),
(54, 'Ghế sofa đơn (Armchair)', 1),
(55, 'Ghế sofa băng dài', 1),
(56, 'Ghế quầy bar (Chân cao)', 1),
(57, 'Ghế đôn (Stool) di động', 1),
(58, 'Ghế lười hạt đậu (Beanbag)', 1),
(59, 'Ghế xếp thông minh (Gấp gọn)', 1),
(60, 'Ghế Eames tựa lưng nhựa', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ghe`
--

CREATE TABLE `ghe` (
  `ID_GHE` int(11) NOT NULL,
  `TEN_GHE` varchar(255) NOT NULL,
  `TOA_X` int(11) NOT NULL,
  `TOA_Y` int(11) NOT NULL,
  `TRANG_THAI` int(11) DEFAULT 1,
  `ID_KHONG_GIAN` int(11) NOT NULL,
  `ID_DANH_MUC` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `ghe`
--

INSERT INTO `ghe` (`ID_GHE`, `TEN_GHE`, `TOA_X`, `TOA_Y`, `TRANG_THAI`, `ID_KHONG_GIAN`, `ID_DANH_MUC`) VALUES
(96, 'A-01', 188, 74, 1, 53, 52),
(97, 'A-02', 188, 147, 1, 53, 52),
(98, 'A-03', 256, 145, 1, 53, 51),
(99, 'A-04', 254, 77, 1, 53, 52),
(100, 'A-05', 323, 75, 1, 53, 51),
(101, 'A-06', 322, 146, 1, 53, 51),
(102, 'A-01', 359, 140, 1, 54, 54),
(103, 'A-02', 285, 141, 1, 54, 52),
(104, 'A-03', 213, 141, 1, 54, 52),
(105, 'A-04', 215, 77, 1, 54, 52),
(106, 'A-05', 286, 77, 1, 54, 52),
(107, 'A-06', 359, 76, 1, 54, 54),
(108, 'A-012', 429, 76, 1, 54, 52),
(109, 'vip-02', 429, 139, 1, 54, 52),
(110, '123', 143, 76, 1, 54, 52),
(111, 'A-56', 143, 140, 1, 54, 54),
(112, 'Z-01', 138, 228, 1, 54, 52),
(113, 'Z-02', 139, 294, 1, 54, 52),
(114, 'Z-03', 210, 230, 1, 54, 52),
(115, 'Z-04', 208, 292, 1, 54, 52),
(116, 'Z-07', 362, 226, 1, 54, 54),
(117, 'Z-08', 361, 293, 1, 54, 52),
(118, 'Z-10', 427, 224, 1, 54, 52),
(119, 'Z-09', 426, 293, 1, 54, 51),
(120, 'A-07', 392, 146, 1, 53, 52),
(121, 'A-09', 462, 74, 1, 53, 52),
(122, 'A-10', 462, 143, 1, 53, 54),
(123, 'A-08', 391, 75, 1, 53, 52),
(124, 'B-01', 188, 241, 1, 53, 52),
(125, 'B-02', 186, 310, 1, 53, 52),
(126, 'B-03', 254, 240, 1, 53, 54),
(127, 'B-04', 254, 305, 1, 53, 51),
(128, 'B-05', 386, 244, 1, 53, 52),
(129, 'B-06', 387, 311, 1, 53, 52),
(130, 'B-07', 460, 308, 1, 53, 54),
(131, 'B-08', 461, 243, 1, 53, 54),
(132, 'A-01', 158, 86, 1, 57, 54),
(133, 'A-02', 159, 154, 1, 57, 51),
(134, 'A-03', 222, 154, 1, 57, 51),
(135, 'A-04', 221, 89, 1, 57, 55),
(136, 'A-05', 287, 89, 1, 57, 51),
(137, 'A-06', 287, 154, 1, 57, 52),
(138, 'A-07', 349, 92, 1, 57, 57),
(139, 'A-09', 347, 155, 1, 57, 51),
(140, 'A-08', 412, 91, 1, 57, 51),
(141, 'A-10', 411, 156, 1, 57, 55),
(142, 'B-01', 164, 295, 1, 57, 51),
(143, 'B-02', 160, 232, 1, 57, 52),
(144, 'B-03', 226, 230, 1, 57, 54),
(145, 'B-04', 224, 292, 1, 57, 54),
(146, 'B-05', 344, 296, 1, 57, 57),
(147, 'B-06', 344, 233, 1, 57, 51),
(148, 'B-07', 412, 232, 1, 57, 55),
(149, 'B-08', 413, 292, 1, 57, 52),
(150, 'A-01', 329, 36, 1, 58, 51),
(151, 'A-02', 329, 100, 1, 58, 52),
(152, 'A-03', 143, 220, 1, 58, 54),
(153, 'A-04', 338, 288, 1, 58, 55),
(154, 'A-5', 333, 218, 1, 58, 52),
(155, 'A-06', 138, 34, 1, 58, 55),
(156, 'B-01', 400, 35, 1, 58, 54),
(157, 'A-07', 135, 100, 1, 58, 52),
(158, 'A-08', 76, 98, 1, 58, 54),
(159, 'A-09', 83, 221, 1, 58, 54),
(160, 'A-10', 143, 285, 1, 58, 54),
(161, 'B-02', 463, 36, 1, 58, 52),
(162, 'B-03', 400, 100, 1, 58, 51),
(163, 'B-04', 465, 103, 1, 58, 54),
(164, 'B-05', 400, 165, 1, 58, 52),
(165, 'B-06', 465, 165, 1, 58, 52),
(166, 'B-07', 464, 228, 1, 58, 51),
(167, 'B-08', 466, 286, 1, 58, 52),
(168, 'B-09', 400, 228, 1, 58, 52),
(169, 'B-10', 400, 285, 1, 58, 52),
(170, 'C-01', 204, 36, 1, 58, 52),
(171, 'C-02', 265, 37, 1, 58, 54),
(172, 'C-03', 268, 99, 1, 58, 52),
(173, 'C-04', 202, 101, 1, 58, 52),
(174, 'C-05', 206, 281, 1, 58, 52),
(175, 'C-06', 271, 284, 1, 58, 51),
(176, 'C-07', 207, 217, 1, 58, 52),
(177, 'C-08', 269, 218, 1, 58, 54),
(178, 'A-02', 413, 119, 1, 61, 51),
(179, 'a-01', 485, 118, 1, 61, 54),
(180, 'a-03', 344, 117, 1, 61, 54),
(181, 'A-04', 276, 116, 1, 61, 52),
(182, 'A-05', 211, 113, 1, 61, 51),
(183, 'A-06', 213, 54, 1, 61, 52),
(184, 'A-07', 278, 51, 1, 61, 52),
(185, 'A-08', 346, 49, 1, 61, 54),
(186, 'A-09', 412, 51, 1, 61, 52),
(187, 'A-10', 483, 52, 1, 61, 57),
(188, 'B-01', 274, 196, 1, 61, 52),
(189, 'B-02', 271, 263, 1, 61, 54),
(190, 'B-03', 343, 193, 1, 61, 55),
(191, 'B-04', 341, 262, 1, 61, 51),
(192, 'B-07', 410, 194, 1, 61, 54),
(193, 'B-08', 410, 261, 1, 61, 54);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hoadon`
--

CREATE TABLE `hoadon` (
  `ID_HOADON` int(11) NOT NULL,
  `GIA_TIEN` decimal(13,2) NOT NULL DEFAULT 0.00,
  `NGAY_TAO` date NOT NULL DEFAULT curdate(),
  `TRANG_THAI` int(11) DEFAULT NULL,
  `ID_LICHDAT` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `hoadon`
--

INSERT INTO `hoadon` (`ID_HOADON`, `GIA_TIEN`, `NGAY_TAO`, `TRANG_THAI`, `ID_LICHDAT`) VALUES
(52, 25000.00, '2026-07-06', 1, 118),
(55, 40666.00, '2026-07-14', 1, 126),
(56, 40666.00, '2026-07-14', 1, 126),
(57, 40666.00, '2026-07-14', 1, 126),
(58, 40666.00, '2026-07-14', 1, 126),
(59, 40666.00, '2026-07-14', 1, 126),
(60, 40666.00, '2026-07-14', 1, 126),
(61, 40000.00, '2026-07-15', 1, 127),
(62, 40000.00, '2026-07-15', 1, 127),
(63, 50000.00, '2026-07-15', 1, 128),
(64, 50000.00, '2026-07-15', 1, 128);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khonggian`
--

CREATE TABLE `khonggian` (
  `ID_KHONG_GIAN` int(11) NOT NULL,
  `TEN_KHONG_GIAN` varchar(255) NOT NULL,
  `LOAI_KHONG_GIAN` int(11) NOT NULL,
  `TRANG_THAI` int(11) NOT NULL,
  `ID_GIA` int(11) DEFAULT NULL,
  `NGAY_TAO` datetime NOT NULL DEFAULT current_timestamp(),
  `NGAY_CAP_NHAT` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `NGAY_BAO_TRI` datetime DEFAULT NULL,
  `NGAY_XONG` datetime DEFAULT NULL,
  `ID_CHI_NHANH` int(11) DEFAULT NULL,
  `HINHANH` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khonggian`
--

INSERT INTO `khonggian` (`ID_KHONG_GIAN`, `TEN_KHONG_GIAN`, `LOAI_KHONG_GIAN`, `TRANG_THAI`, `ID_GIA`, `NGAY_TAO`, `NGAY_CAP_NHAT`, `NGAY_BAO_TRI`, `NGAY_XONG`, `ID_CHI_NHANH`, `HINHANH`) VALUES
(53, 'Không gian chung A', 1, 1, NULL, '2026-07-12 12:07:26', '2026-07-12 12:07:26', NULL, NULL, 52, 'uploads/KhongGian/1783832846019-67079681.jpg'),
(54, 'Không gian chung B', 1, 1, NULL, '2026-07-12 12:08:00', '2026-07-12 12:08:00', NULL, NULL, 52, 'uploads/KhongGian/1783832880410-585407951.jpg'),
(55, 'Phòng họp A', 0, 1, 67, '2026-07-12 12:08:39', '2026-07-15 14:49:34', NULL, NULL, 52, 'uploads/KhongGian/1783832919170-693543578.jpg'),
(56, 'Phòng họp B', 0, 1, 62, '2026-07-12 12:09:11', '2026-07-12 12:09:11', NULL, NULL, 52, 'uploads/KhongGian/1783832951770-180100327.jpg'),
(57, 'Không gian tầng 1 A', 1, 1, NULL, '2026-07-12 12:09:54', '2026-07-12 12:09:54', NULL, NULL, 53, 'uploads/KhongGian/1783832994904-414674873.jpg'),
(58, 'Không gian tầng 1 B', 1, 1, NULL, '2026-07-12 12:10:20', '2026-07-12 12:10:20', NULL, NULL, 53, 'uploads/KhongGian/1783833020272-989391413.jpg'),
(59, 'Không gian tầng 2A', 0, 1, 62, '2026-07-12 12:10:44', '2026-07-12 12:10:44', NULL, NULL, 53, 'uploads/KhongGian/1783833044837-715931431.jpg'),
(60, 'Không gian tầng 2B', 0, 1, 62, '2026-07-12 12:11:11', '2026-07-12 12:11:11', NULL, NULL, 53, 'uploads/KhongGian/1783833071646-225779349.jpg'),
(61, 'Không gian chung 1A', 1, 1, NULL, '2026-07-12 12:13:13', '2026-07-12 12:13:13', NULL, NULL, 54, 'uploads/KhongGian/1783833193425-934958384.jpg'),
(62, 'Không gian chung 1B', 1, 1, NULL, '2026-07-12 12:13:35', '2026-07-12 12:13:35', NULL, NULL, 54, 'uploads/KhongGian/1783833215366-860986476.jpg'),
(63, 'Không gian HỌP 2A', 0, 1, 67, '2026-07-12 12:14:15', '2026-07-15 14:52:34', NULL, NULL, 54, 'uploads/KhongGian/1783833255175-371963432.jpg'),
(64, 'Không gian phòng họp 2B', 0, 1, 65, '2026-07-12 12:14:36', '2026-07-15 14:52:58', NULL, NULL, 54, 'uploads/KhongGian/1783833276929-943580681.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichdat`
--

CREATE TABLE `lichdat` (
  `ID_LICH_DAT` int(11) NOT NULL,
  `KHUNG_BATDAU` datetime NOT NULL,
  `KHUNG_KETTHUC` datetime NOT NULL,
  `NGAY_TAO` datetime NOT NULL DEFAULT current_timestamp(),
  `TRANG_THAI` int(11) DEFAULT NULL,
  `THOIGIAN_VAO` datetime DEFAULT NULL,
  `THOIGIAN_RA` datetime DEFAULT NULL,
  `ID_GHE` int(11) DEFAULT NULL,
  `ID_KHONG_GIAN` int(11) DEFAULT NULL,
  `IDND` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lichdat`
--

INSERT INTO `lichdat` (`ID_LICH_DAT`, `KHUNG_BATDAU`, `KHUNG_KETTHUC`, `NGAY_TAO`, `TRANG_THAI`, `THOIGIAN_VAO`, `THOIGIAN_RA`, `ID_GHE`, `ID_KHONG_GIAN`, `IDND`) VALUES
(118, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-07-12 15:18:45', 1, '2026-07-14 00:16:49', '2026-07-14 08:16:30', 96, NULL, 51),
(125, '2026-07-14 15:25:00', '2026-07-14 17:26:00', '2026-07-14 15:20:29', 1, '2026-07-14 15:21:27', '2026-07-14 16:08:16', 97, NULL, 51),
(126, '2026-07-14 17:58:00', '2026-07-14 18:59:00', '2026-07-14 17:53:35', 1, '2026-07-14 17:54:17', '2026-07-14 18:21:39', 105, NULL, 51),
(127, '2026-07-15 17:53:00', '2026-07-15 18:53:00', '2026-07-15 16:52:08', 2, NULL, NULL, 96, NULL, 51),
(128, '2026-07-15 18:06:00', '2026-07-15 19:06:00', '2026-07-15 17:07:04', 1, '2026-07-15 17:09:20', '2026-07-15 17:09:55', 136, NULL, 51),
(129, '2026-07-15 17:53:00', '2026-07-15 18:53:00', '2026-07-15 16:52:08', 2, NULL, NULL, 96, NULL, 51);

--
-- Bẫy `lichdat`
--
DELIMITER $$
CREATE TRIGGER `tg_KiemTraTrungLichBeforeInsert` BEFORE INSERT ON `lichdat` FOR EACH ROW BEGIN
    
    -- LỚP CHẶN 1: Nếu đặt PHÒNG HỌP mà bị trùng lịch
    IF NEW.ID_KHONG_GIAN IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM lichdat 
            WHERE ID_KHONG_GIAN = NEW.ID_KHONG_GIAN
              AND IFNULL(TRANG_THAI, 0) <> 2
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
              AND IFNULL(TRANG_THAI, 0) <> 2 
              AND NEW.KHUNG_BATDAU < KHUNG_KETTHUC
              AND NEW.KHUNG_KETTHUC > KHUNG_KETTHUC
        ) THEN
            -- ĐÂY CHÍNH LÀ CÁCH TẠO LỖI TRIGGER
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Lỗi Trigger: Ghế ngồi này đã có người đặt trong khoảng thời gian trên.';
        END IF;
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `IDND` int(11) NOT NULL,
  `TENND` varchar(50) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `MAT_KHAU` varchar(255) NOT NULL,
  `HINH_ANH` text DEFAULT NULL,
  `NGAY_TAO` date DEFAULT curdate(),
  `LOAIND` int(11) DEFAULT 0,
  `TRANG_THAI` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoidung`
--

INSERT INTO `nguoidung` (`IDND`, `TENND`, `EMAIL`, `MAT_KHAU`, `HINH_ANH`, `NGAY_TAO`, `LOAIND`, `TRANG_THAI`) VALUES
(1, 'Nguyễn Ngọc Hiếu', 'dc01.nnh.2048ae@gmail.com', '$2b$10$fe304sbrFS5YLBCGVGHOQuW5VZFYfBKlNLdGW8K1yEByvu/./g/m2', 'uploads/DaiDien/1783829247983-554754571.jpg', '2026-06-22', 1, 1),
(51, 'Nguyễn Ngọc Hiếu', '0306231022@caothang.edu.vn', '$2b$10$IMhODeGBug0dEf.3l4VZhOlz/OcnXVOXfOWeD/krcrRFTQj2mn6n6', 'uploads/DaiDien/1784041706292-52128788.jpg', '2026-07-03', 0, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thanhtoan`
--

CREATE TABLE `thanhtoan` (
  `ID_THANHTOAN` int(11) NOT NULL,
  `MA_GIAO_DICH` varchar(100) NOT NULL,
  `MA_NGAN_HANG` varchar(50) DEFAULT NULL,
  `SO_TIEN` decimal(13,2) NOT NULL DEFAULT 0.00,
  `NGAY_TAO` date NOT NULL DEFAULT curdate(),
  `NGAY_THANH_TOAN` datetime DEFAULT NULL,
  `TRANG_THAI` int(11) DEFAULT NULL,
  `ID_HOA_DON` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `thanhtoan`
--

INSERT INTO `thanhtoan` (`ID_THANHTOAN`, `MA_GIAO_DICH`, `MA_NGAN_HANG`, `SO_TIEN`, `NGAY_TAO`, `NGAY_THANH_TOAN`, `TRANG_THAI`, `ID_HOA_DON`) VALUES
(51, '15620933', 'NCB', 40666.00, '2026-07-14', '2026-07-14 00:00:00', 1, 58),
(52, '15620933', 'NCB', 40666.00, '2026-07-14', '2026-07-14 00:00:00', 1, 59),
(53, '15620933', 'NCB', 40666.00, '2026-07-14', '2026-07-14 00:00:00', 1, 60),
(54, '15622458', 'NCB', 40000.00, '2026-07-15', '2026-07-15 00:00:00', 1, 61),
(55, '15622458', 'NCB', 40000.00, '2026-07-15', '2026-07-15 00:00:00', 1, 62),
(56, '15622481', 'NCB', 50000.00, '2026-07-15', '2026-07-15 00:00:00', 1, 63),
(57, '15622481', 'NCB', 50000.00, '2026-07-15', '2026-07-15 00:00:00', 1, 64);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thietbi`
--

CREATE TABLE `thietbi` (
  `ID_THIET_BI` int(11) NOT NULL,
  `TEN_THIET_BI` varchar(255) NOT NULL,
  `HINH_ANH` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `thietbi`
--

INSERT INTO `thietbi` (`ID_THIET_BI`, `TEN_THIET_BI`, `HINH_ANH`) VALUES
(51, 'Màn hình Dell UltraSharp 27 Inch', 'fa-solid fa-tv'),
(52, 'Máy chiếu Epson Full HD', 'fa-solid fa-video'),
(53, 'Loa hội nghị Bluetooth Jabra', 'fa-solid fa-volume-high'),
(54, 'Camera họp trực tuyến Logitech 4K', 'fa-solid fa-camera-web'),
(55, 'Bảng trắng viết bút dạ (Cường lực)', 'fa-solid fa-chalkboard'),
(56, 'Micro không dây cài áo', 'fa-solid fa-microphone-lines'),
(57, 'Bộ cổng chuyển đổi đa năng Type-C', 'fa-solid fa-network-wired'),
(58, 'Đèn LED Ring hỗ trợ Livestream/Call', 'fa-solid fa-circle-dot'),
(59, 'Máy in/Photoshop laser đa chức năng', 'fa-solid fa-print'),
(60, 'Máy hủy tài liệu văn phòng', 'fa-solid fa-file-shredder'),
(61, 'Bộ phát Wi-Fi Chuẩn 6 (Router Chuyên dụng)', 'fa-solid fa-wifi'),
(62, 'Máy pha cà phê tự động Breville', 'fa-solid fa-mug-saucer'),
(63, 'Tủ lạnh mini súp/nước ngọt', 'fa-solid fa-refrigerator'),
(64, 'Lò vi sóng Sharp 25L', 'fa-solid fa-box-open'),
(65, 'Cây nước nóng lạnh công suất lớn', 'fa-solid fa-droplet'),
(66, 'Ghế công thái học Ergonomic Sihoo', 'fa-solid fa-chair'),
(67, 'Ổ cắm điện âm bàn thông minh', 'fa-solid fa-plug'),
(68, 'Máy lọc không khí Xiaomi Pro H', 'fa-solid fa-wind'),
(69, 'Máy điều hòa âm trần Daikin', 'fa-solid fa-snowflake'),
(70, 'Máy quét mã vạch (Check-in lịch đặt)', 'fa-solid fa-barcode'),
(71, 'Máy chấm công khuôn mặt / Vân tay', 'fa-solid fa-fingerprint'),
(72, 'Khóa cửa thông minh nhận diện thẻ từ', 'fa-solid fa-key'),
(73, 'Két sắt mini bảo mật (Đồ cá nhân)', 'fa-solid fa-vault'),
(74, 'Máy tính bảng iPad Gen 10 (Đặt lịch cửa)', 'fa-solid fa-tablet-screen-button'),
(75, 'Bộ lưu điện UPS phòng hờ mất điện', 'fa-solid fa-battery-three-quarters');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thongbao`
--

CREATE TABLE `thongbao` (
  `ID_THONGBAO` int(11) NOT NULL,
  `TIEU_DE` varchar(255) NOT NULL,
  `NOI_DUNG` text NOT NULL,
  `TRANG_THAI` int(11) DEFAULT NULL,
  `LOAI_THONGBAO` int(11) DEFAULT NULL,
  `IDND` int(11) NOT NULL,
  `NGAY_TAO` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `thongbao`
--

INSERT INTO `thongbao` (`ID_THONGBAO`, `TIEU_DE`, `NOI_DUNG`, `TRANG_THAI`, `LOAI_THONGBAO`, `IDND`, `NGAY_TAO`) VALUES
(395, 'HỆ THỐNG: Lịch đặt #127 đã bị hủy', 'Lịch đặt của khách hàng đã bị hủy tự động vì quá giờ mà không check-in!', 0, 5, 1, '2026-07-15 20:38:00'),
(396, 'Lịch đặt của bạn đã bị hủy', 'Lịch đặt đã bị hệ thống hủy tự động do bạn không check-in đúng giờ.', 0, 5, 51, '2026-07-15 20:38:00'),
(397, 'HỆ THỐNG: Lịch đặt #129 đã bị hủy', 'Lịch đặt của khách hàng đã bị hủy tự động vì quá giờ mà không check-in!', 0, 5, 1, '2026-07-15 20:38:00'),
(398, 'Lịch đặt của bạn đã bị hủy', 'Lịch đặt đã bị hệ thống hủy tự động do bạn không check-in đúng giờ.', 0, 5, 51, '2026-07-15 20:38:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `xacthucotp`
--

CREATE TABLE `xacthucotp` (
  `ID_OTP` int(11) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `MA_OTP` varchar(6) NOT NULL,
  `NGAY_TAO` datetime NOT NULL DEFAULT current_timestamp(),
  `NGAY_HET_HAN` datetime NOT NULL,
  `SO_LAN_SAI` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `banggia`
--
ALTER TABLE `banggia`
  ADD PRIMARY KEY (`ID_GIA`),
  ADD KEY `FK_BangGia_DanhMucGhe` (`DANHMUC_GHE`);

--
-- Chỉ mục cho bảng `chinhanh`
--
ALTER TABLE `chinhanh`
  ADD PRIMARY KEY (`ID_CHI_NHANH`);

--
-- Chỉ mục cho bảng `chitiet_thietbi`
--
ALTER TABLE `chitiet_thietbi`
  ADD PRIMARY KEY (`ID_CT_TB`),
  ADD KEY `FK_CTTB_ThietBi` (`ID_THIET_BI`),
  ADD KEY `FK_CTTB_KhongGian` (`ID_KHONG_GIAN`);

--
-- Chỉ mục cho bảng `danhmucghe`
--
ALTER TABLE `danhmucghe`
  ADD PRIMARY KEY (`ID_DANHMUC`);

--
-- Chỉ mục cho bảng `ghe`
--
ALTER TABLE `ghe`
  ADD PRIMARY KEY (`ID_GHE`),
  ADD KEY `FK_Ghe_KhongGian` (`ID_KHONG_GIAN`),
  ADD KEY `FK_Ghe_DanhMuc` (`ID_DANH_MUC`);

--
-- Chỉ mục cho bảng `hoadon`
--
ALTER TABLE `hoadon`
  ADD PRIMARY KEY (`ID_HOADON`),
  ADD KEY `FK_HoaDon_LichDat` (`ID_LICHDAT`);

--
-- Chỉ mục cho bảng `khonggian`
--
ALTER TABLE `khonggian`
  ADD PRIMARY KEY (`ID_KHONG_GIAN`),
  ADD KEY `fk_khongian_chinhanh` (`ID_CHI_NHANH`),
  ADD KEY `FK_khonggian_banggia` (`ID_GIA`);

--
-- Chỉ mục cho bảng `lichdat`
--
ALTER TABLE `lichdat`
  ADD PRIMARY KEY (`ID_LICH_DAT`),
  ADD KEY `FK_LichDat_Ghe` (`ID_GHE`),
  ADD KEY `FK_LichDat_KhongGian` (`ID_KHONG_GIAN`),
  ADD KEY `FK_LichDat_NguoiDung` (`IDND`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`IDND`),
  ADD UNIQUE KEY `UQ_Email` (`EMAIL`);

--
-- Chỉ mục cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD PRIMARY KEY (`ID_THANHTOAN`),
  ADD KEY `FK_THANHTOAN_HOADON` (`ID_HOA_DON`);

--
-- Chỉ mục cho bảng `thietbi`
--
ALTER TABLE `thietbi`
  ADD PRIMARY KEY (`ID_THIET_BI`);

--
-- Chỉ mục cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD PRIMARY KEY (`ID_THONGBAO`),
  ADD KEY `FK_ThongBao_NguoiDung` (`IDND`);

--
-- Chỉ mục cho bảng `xacthucotp`
--
ALTER TABLE `xacthucotp`
  ADD PRIMARY KEY (`ID_OTP`),
  ADD UNIQUE KEY `EMAIL` (`EMAIL`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `banggia`
--
ALTER TABLE `banggia`
  MODIFY `ID_GIA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT cho bảng `chinhanh`
--
ALTER TABLE `chinhanh`
  MODIFY `ID_CHI_NHANH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT cho bảng `chitiet_thietbi`
--
ALTER TABLE `chitiet_thietbi`
  MODIFY `ID_CT_TB` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT cho bảng `danhmucghe`
--
ALTER TABLE `danhmucghe`
  MODIFY `ID_DANHMUC` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT cho bảng `ghe`
--
ALTER TABLE `ghe`
  MODIFY `ID_GHE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=194;

--
-- AUTO_INCREMENT cho bảng `hoadon`
--
ALTER TABLE `hoadon`
  MODIFY `ID_HOADON` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT cho bảng `khonggian`
--
ALTER TABLE `khonggian`
  MODIFY `ID_KHONG_GIAN` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT cho bảng `lichdat`
--
ALTER TABLE `lichdat`
  MODIFY `ID_LICH_DAT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `IDND` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  MODIFY `ID_THANHTOAN` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT cho bảng `thietbi`
--
ALTER TABLE `thietbi`
  MODIFY `ID_THIET_BI` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  MODIFY `ID_THONGBAO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=399;

--
-- AUTO_INCREMENT cho bảng `xacthucotp`
--
ALTER TABLE `xacthucotp`
  MODIFY `ID_OTP` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `banggia`
--
ALTER TABLE `banggia`
  ADD CONSTRAINT `FK_BangGia_DanhMucGhe` FOREIGN KEY (`DANHMUC_GHE`) REFERENCES `danhmucghe` (`ID_DANHMUC`);

--
-- Các ràng buộc cho bảng `chitiet_thietbi`
--
ALTER TABLE `chitiet_thietbi`
  ADD CONSTRAINT `FK_CTTB_KhongGian` FOREIGN KEY (`ID_KHONG_GIAN`) REFERENCES `khonggian` (`ID_KHONG_GIAN`),
  ADD CONSTRAINT `FK_CTTB_ThietBi` FOREIGN KEY (`ID_THIET_BI`) REFERENCES `thietbi` (`ID_THIET_BI`);

--
-- Các ràng buộc cho bảng `ghe`
--
ALTER TABLE `ghe`
  ADD CONSTRAINT `FK_Ghe_DanhMuc` FOREIGN KEY (`ID_DANH_MUC`) REFERENCES `danhmucghe` (`ID_DANHMUC`),
  ADD CONSTRAINT `FK_Ghe_KhongGian` FOREIGN KEY (`ID_KHONG_GIAN`) REFERENCES `khonggian` (`ID_KHONG_GIAN`);

--
-- Các ràng buộc cho bảng `hoadon`
--
ALTER TABLE `hoadon`
  ADD CONSTRAINT `FK_HoaDon_LichDat` FOREIGN KEY (`ID_LICHDAT`) REFERENCES `lichdat` (`ID_LICH_DAT`);

--
-- Các ràng buộc cho bảng `khonggian`
--
ALTER TABLE `khonggian`
  ADD CONSTRAINT `FK_khonggian_banggia` FOREIGN KEY (`ID_GIA`) REFERENCES `banggia` (`ID_GIA`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_khongian_chinhanh` FOREIGN KEY (`ID_CHI_NHANH`) REFERENCES `chinhanh` (`ID_CHI_NHANH`);

--
-- Các ràng buộc cho bảng `lichdat`
--
ALTER TABLE `lichdat`
  ADD CONSTRAINT `FK_LichDat_Ghe` FOREIGN KEY (`ID_GHE`) REFERENCES `ghe` (`ID_GHE`),
  ADD CONSTRAINT `FK_LichDat_KhongGian` FOREIGN KEY (`ID_KHONG_GIAN`) REFERENCES `khonggian` (`ID_KHONG_GIAN`),
  ADD CONSTRAINT `FK_LichDat_NguoiDung` FOREIGN KEY (`IDND`) REFERENCES `nguoidung` (`IDND`);

--
-- Các ràng buộc cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD CONSTRAINT `FK_THANHTOAN_HOADON` FOREIGN KEY (`ID_HOA_DON`) REFERENCES `hoadon` (`ID_HOADON`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD CONSTRAINT `FK_ThongBao_NguoiDung` FOREIGN KEY (`IDND`) REFERENCES `nguoidung` (`IDND`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
