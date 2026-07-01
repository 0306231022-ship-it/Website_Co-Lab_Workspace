-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 26, 2026 lúc 03:57 AM
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_CreateBooking` (IN `p_PhongHopID` INT, IN `p_GheID` INT, IN `p_StartTime` DATETIME, IN `p_EndTime` DATETIME, IN `p_UserID` INT, OUT `p_BookingID` INT)   BEGIN
    -- 1. Kiểm tra tính hợp lệ của thời gian
    IF p_StartTime >= p_EndTime THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.';
    END IF;

    IF p_StartTime < NOW() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Không thể đặt lịch cho thời gian trong quá khứ.';
    END IF;

    -- 2. Kiểm tra trùng lịch dựa theo cột nào KHÁC NULL
    
    -- TRƯỜNG HỢP A: Người dùng ĐẶT PHÒNG (p_PhongHopID không NULL)
    IF p_PhongHopID IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM lichdat 
            WHERE ID_KHONG_GIAN = p_PhongHopID 
              AND TRANG_THAI <> 2
              AND p_StartTime < KHUNG_KETTHUC 
              AND p_EndTime > KHUNG_BATDAU
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Phòng họp này đã có người đặt trong khoảng thời gian trên.';
        END IF;
    END IF;

    -- TRƯỜNG HỢP B: Người dùng ĐẶT GHẾ (p_GheID không NULL)
    IF p_GheID IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM lichdat 
            WHERE ID_GHE = p_GheID 
              AND TRANG_THAI <> 2
              AND p_StartTime < KHUNG_KETTHUC 
              AND p_EndTime > KHUNG_BATDAU
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Ghế ngồi này đã có người đặt trong khoảng thời gian trên!';
        END IF;
    END IF;
    IF NOT EXISTS (
        SELECT 1 
        FROM nguoidung
        WHERE IDND = p_UserID -- p_UserID là tên tham số đầu vào của người dùng trong thủ tục
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Tài khoản người dùng không tồn tại trên hệ thống.';
    END IF;

    -- 3. Tiến hành đặt lịch nếu hợp lệ
    INSERT INTO lichdat (ID_KHONG_GIAN, ID_GHE, KHUNG_BATDAU, KHUNG_KETTHUC, IDND)
    VALUES (p_PhongHopID, p_GheID, p_StartTime, p_EndTime, p_UserID);

    -- 4. Trả về ID vừa tạo
    SET p_BookingID = LAST_INSERT_ID();

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
(1, 'Giá giờ tiêu chuẩn', 'Áp dụng cho ghế thường theo giờ', '2026-06-24 19:18:03', NULL, 15000.00, 1),
(2, 'Giá giờ công thái học', 'Áp dụng cho ghế công thái học', '2026-06-24 19:18:03', NULL, 25000.00, 2),
(3, 'Giá ngày tiêu chuẩn', 'Trọn gói 1 ngày ghế tiêu chuẩn', '2026-06-24 19:18:03', NULL, 100000.00, 1),
(4, 'Giá ngày công thái học', 'Trọn gói 1 ngày ghế công thái học', '2026-06-24 19:18:03', NULL, 180000.00, 2),
(5, 'Gói tuần Basic', 'Tiết kiệm cho 1 tuần làm việc', '2026-06-24 19:18:03', NULL, 500000.00, 1),
(6, 'Gói tuần Ergonomic', 'Ghế công thái học 1 tuần', '2026-06-24 19:18:03', NULL, 850000.00, 2),
(7, 'Gói tháng cá nhân', 'Làm việc tự do trọn tháng', '2026-06-24 19:18:03', NULL, 1800000.00, 5),
(8, 'Gói tháng cố định', 'Vị trí cố định cao cấp', '2026-06-24 19:18:03', NULL, 2500000.00, 12),
(9, 'Giá giờ Sofa Zone', 'Khu vực sofa thư giãn thoải mái', '2026-06-24 19:18:03', NULL, 30000.00, 4),
(10, 'Giá ngày Sofa Zone', 'Trọn ngày tại khu vực Sofa', '2026-06-24 19:18:03', NULL, 200000.00, 4),
(11, 'Giá giờ Gaming Zone', 'Ghế chuyên game cấu hình cao', '2026-06-24 19:18:03', NULL, 35000.00, 8),
(12, 'Giá ngày Gaming Zone', 'Trọn ngày cày cuốc thoải mái', '2026-06-24 19:18:03', NULL, 250000.00, 8),
(13, 'Giá giờ Quiet Zone', 'Khu vực tập trung cao độ yên tĩnh', '2026-06-24 19:18:03', NULL, 20000.00, 10),
(14, 'Giá ngày Quiet Zone', 'Yên tĩnh tuyệt đối trọn ngày', '2026-06-24 19:18:03', NULL, 150000.00, 10),
(15, 'Gói Coder Pro Tháng', 'Dành riêng cho lập trình viên', '2026-06-24 19:18:03', NULL, 2800000.00, 50),
(16, 'Giá giờ Pod đơn', 'Buồng kén cách âm cá nhân', '2026-06-24 19:18:03', NULL, 40000.00, 22),
(17, 'Giá ngày Pod đơn', 'Kén bảo mật trọn ngày', '2026-06-24 19:18:03', NULL, 300000.00, 22),
(18, 'Gói Giám Đốc VIP', 'Khu vực VIP ghế da', '2026-06-24 19:18:03', NULL, 5000000.00, 27),
(19, 'Giá giờ học tập nhóm', 'Ghế nhóm tiện lợi', '2026-06-24 19:18:03', NULL, 15000.00, 21),
(20, 'Giá ngày học tập nhóm', 'Học nhóm thoải mái cả ngày', '2026-06-24 19:18:03', NULL, 110000.00, 21),
(21, 'Gói Membership Đồng', 'Ưu đãi thành viên cơ bản', '2026-06-24 19:18:03', NULL, 1200000.00, 1),
(22, 'Gói Membership Bạc', 'Thành viên thân thiết', '2026-06-24 19:18:03', NULL, 2200000.00, 2),
(23, 'Gói Membership Vàng', 'Ưu đãi chỗ ngồi VIP', '2026-06-24 19:18:03', NULL, 4000000.00, 12),
(24, 'Gói Membership Kim Cương', 'Đặc quyền tối cao hệ thống', '2026-06-24 19:18:03', NULL, 7000000.00, 27),
(25, 'Giá giờ Night Owl', 'Làm việc xuyên đêm 22h - 6h', '2026-06-24 19:18:03', NULL, 45000.00, 2),
(26, 'Giá trọn đêm Night Owl', 'Trọn combo làm đêm', '2026-06-24 19:18:03', NULL, 150000.00, 29),
(27, 'Giá giờ ban công', 'Thoáng đãng view đẹp', '2026-06-24 19:18:03', NULL, 250000.00, 34),
(28, 'Giá ngày ban công', 'Sáng tạo ngoài không gian mở', '2026-06-24 19:18:03', NULL, 180000.00, 34),
(29, 'Giá giờ thư viện', 'Tập trung nghiên cứu đọc sách', '2026-06-24 19:18:03', NULL, 12000.00, 35),
(30, 'Giá ngày thư viện', 'Nghiên cứu tài liệu cả ngày', '2026-06-24 19:18:03', NULL, 90000.00, 35),
(31, 'Giá giờ phòng Lab', 'Chuyên dụng nghiên cứu máy tính', '2026-06-24 19:18:03', NULL, 30000.00, 37),
(32, 'Giá ngày phòng Lab', 'Sử dụng thiết bị lab cả ngày', '2026-06-24 19:18:03', NULL, 220000.00, 37),
(33, 'Gói Freelancer Bán Thời Gian', 'Chỉ áp dụng buổi sáng hoặc chiều', '2026-06-24 19:18:03', NULL, 900000.00, 5),
(34, 'Gói Trưởng Phòng Cao Cấp', 'Hỗ trợ không gian sang trọng', '2026-06-24 19:18:03', NULL, 3500000.00, 28),
(35, 'Giá giờ ghế xoay lưới', 'Ghế xoay mát mẻ thoáng lưng', '2026-06-24 19:18:03', NULL, 18000.00, 29),
(36, 'Giá ngày ghế xoay lưới', 'Làm việc êm ái cả ngày', '2026-06-24 19:18:03', NULL, 130000.00, 29),
(37, 'Giá giờ ghế đôi', 'Dành cho các cặp đôi làm việc', '2026-06-24 19:18:03', NULL, 35000.00, 19),
(38, 'Giá ngày ghế đôi', 'Cùng nhau chạy deadline cả ngày', '2026-06-24 19:18:03', NULL, 240000.00, 19),
(39, 'Combo Cuối Tuần Tiết Kiệm', 'Áp dụng Thứ 7 & Chủ Nhật', '2026-06-24 19:18:03', NULL, 160000.00, 1),
(40, 'Gói Creator Đặc Biệt', 'Dành cho thiết kế đồ họa, edit video', '2026-06-24 19:18:03', NULL, 3200000.00, 8),
(41, 'Giá giờ quầy bar cao', 'Phong cách năng động trẻ trung', '2026-06-24 19:18:03', NULL, 20000.00, 6),
(42, 'Giá ngày quầy bar cao', 'Đổi gió làm việc sáng tạo', '2026-06-24 19:18:03', NULL, 140000.00, 6),
(43, 'Giá giờ ngồi bệt Tatami', 'Phong cách Nhật Bản ấm cúng', '2026-06-24 19:18:03', NULL, 15000.00, 23),
(44, 'Giá ngày ngồi bệt Tatami', 'Thoải mái thư giãn cả ngày', '2026-06-24 19:18:03', NULL, 100000.00, 23),
(45, 'Giá giờ ghế mây tre', 'Mộc mạc gần gũi thiên nhiên', '2026-06-24 19:18:03', NULL, 17000.00, 26),
(46, 'Giá ngày ghế mây tre', 'Thư thái làm việc hiệu quả', '2026-06-24 19:18:03', NULL, 120000.00, 26),
(47, 'Gói Doanh Nhân Khởi Nghiệp', 'Hỗ trợ startup giai đoạn đầu', '2026-06-24 19:18:03', NULL, 2000000.00, 18),
(48, 'Giá giờ ghế nỉ êm', 'Nệm dày ngồi lâu không mỏi', '2026-06-24 19:18:03', NULL, 16000.00, 30),
(49, 'Giá ngày ghế nỉ êm', 'Làm việc bền bỉ cùng deadline', '2026-06-24 19:18:03', NULL, 125000.00, 30),
(50, 'Gói Thuê Nhanh 3 Giờ', 'Dành cho khách họp nhanh lướt web', '2026-06-24 19:18:03', NULL, 40000.00, 1);

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
  `NGAY_BAO_TRI` datetime DEFAULT NULL,
  `NGAY_XONG` datetime DEFAULT NULL,
  `HINHANH` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chinhanh`
--

INSERT INTO `chinhanh` (`ID_CHI_NHANH`, `TEN_CHI_NHANH`, `DIA_CHI`, `NGAY_NHAP`, `NGAY_CAP_NHAT`, `TRANG_THAI`, `NGAY_BAO_TRI`, `NGAY_XONG`, `HINHANH`) VALUES
(1, 'Co-lab Ngọc Hếu Gò Vấp', '124/45A Phạm Văn Đồng, Gò Vấp, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/gv_default.jpg'),
(2, 'Co-lab Bình Thạnh', '45 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn2.jpg'),
(3, 'Co-lab Quận 1 Central', '88 Lê Lợi, Bến Nghé, Quận 1, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn3.jpg'),
(4, 'Co-lab Quận 3 Vista', '210 Nguyễn Đình Chiểu, Quận 3, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn4.jpg'),
(5, 'Co-lab Thủ Đức Campus', '12 Đường số 8, Linh Trung, Thủ Đức, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn5.jpg'),
(6, 'Co-lab Quận 7 Sunview', '456 Nguyễn Thị Thập, Tân Phong, Quận 7, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn6.jpg'),
(7, 'Co-lab Tân Bình Airport', '10 Thăng Long, Phường 4, Tân Bình, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn7.jpg'),
(8, 'Co-lab Phú Nhuận Hub', '180 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn8.jpg'),
(9, 'Co-lab Quận 10 Green', '299 Ba Tháng Hai, Phường 14, Quận 10, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn9.jpg'),
(10, 'Co-lab Quận 5 Chinatown', '83 An Dương Vương, Phường 8, Quận 5, TP.HCM', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn10.jpg'),
(11, 'Co-lab Cầu Giấy Hà Nội', '15 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn11.jpg'),
(12, 'Co-lab Đống Đa Hà Nội', '97 Nguyễn Chí Thanh, Láng Hạ, Đống Đa, Hà Nội', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn12.jpg'),
(13, 'Co-lab Hoàn Kiếm Old Quarter', '22 Lý Thái Tổ, Tràng Tiền, Hoàn Kiếm, Hà Nội', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn13.jpg'),
(14, 'Co-lab Hai Bà Trưng', '340 Bà Triệu, Lê Đại Hành, Hai Bà Trưng, Hà Nội', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn14.jpg'),
(15, 'Co-lab Thanh Xuân Innovation', '102 Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn15.jpg'),
(16, 'Co-lab Hải Châu Đà Nẵng', '52 Duy Tân, Hòa Thuận Nam, Hải Châu, Đà Nẵng', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn16.jpg'),
(17, 'Co-lab Thanh Khê Đà Nẵng', '120 Điện Biên Phủ, Chính Gián, Thanh Khê, Đà Nẵng', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn17.jpg'),
(18, 'Co-lab Ngũ Hành Sơn Beach', '15 Võ Nguyên Giáp, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn18.jpg'),
(19, 'Co-lab Cần Thơ Ninh Kiều', '88 Đường 30 Tháng 4, An Phú, Ninh Kiều, Cần Thơ', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn19.jpg'),
(20, 'Co-lab Hải Phòng City', '12 Lê Hồng Phong, Đông Khê, Ngô Quyền, Hải Phòng', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn20.jpg'),
(21, 'Co-lab Biên Hòa Đồng Nai', '1024 Nguyễn Ái Quốc, Tân Tiến, Biên Hòa, Đồng Nai', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn21.jpg'),
(22, 'Co-lab Bình Dương VSIP', '28 Đại lộ Hữu Nghị, Thuận An, Bình Dương', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn22.jpg'),
(23, 'Co-lab Vũng Tàu Front Beach', '4 Hạ Long, Phường 2, Vũng Tàu, Bà Rịa - Vũng Tàu', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn23.jpg'),
(24, 'Co-lab Nha Trang Trần Phú', '60 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn24.jpg'),
(25, 'Co-lab Đà Lạt Sương Mù', '12 Trần Phú, Phường 3, Đà Lạt, Lâm Đồng', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn25.jpg'),
(26, 'Co-lab Buôn Ma Thuột', '45 Lê Duẩn, Tự An, Buôn Ma Thuột, Đắk Lắk', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn26.jpg'),
(27, 'Co-lab Quy Nhơn Center', '200 An Dương Vương, Nguyễn Văn Cừ, Quy Nhơn, Bình Định', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn27.jpg'),
(28, 'Co-lab Huế Heritage', '33 Lê Lợi, Phú Hội, Huế, Thừa Thiên Huế', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn28.jpg'),
(29, 'Co-lab Vinh Nghệ An', '88 Nguyễn Văn Cừ, Hưng Bình, Vinh, Nghệ An', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn29.jpg'),
(30, 'Co-lab Quảng Ninh Hạ Long', '15 Đường 25 Tháng 4, Hồng Gai, Hạ Long, Quảng Ninh', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn30.jpg'),
(31, 'Co-lab Bắc Ninh Quế Võ', '12 Lý Thái Tổ, Đại Phúc, Bắc Ninh', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn31.jpg'),
(32, 'Co-lab Thái Nguyên Campus', '99 Hoàng Văn Thụ, Phan Đình Phùng, Thái Nguyên', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn32.jpg'),
(33, 'Co-lab Nam Định City', '45 Trần Hưng Đạo, Bà Triệu, Nam Định', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn33.jpg'),
(34, 'Co-lab Thanh Hóa Center', '12 Lê Lợi, Lam Sơn, Thanh Hóa', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn34.jpg'),
(35, 'Co-lab Pleiku Gia Lai', '02 Hoàng Văn Thụ, Diên Hồng, Pleiku, Gia Lai', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn35.jpg'),
(36, 'Co-lab Kon Tum Town', '150 Trần Hưng Đạo, Quyết Thắng, Kon Tum', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn36.jpg'),
(37, 'Co-lab Phan Thiết Beach', '88 Tôn Đức Thắng, Xuân An, Phan Thiết, Bình Thuận', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn37.jpg'),
(38, 'Co-lab Long Xuyên An Giang', '12 Trần Hưng Đạo, Mỹ Bình, Long Xuyên, An Giang', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn38.jpg'),
(39, 'Co-lab Mỹ Tho Tiền Giang', '45 Ấp Bắc, Phường 5, Mỹ Tho, Tiền Giang', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn39.jpg'),
(40, 'Co-lab Rạch Giá Kiên Giang', '102 Nguyễn Trung Trực, Vĩnh Bảo, Rạch Giá, Kiên Giang', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn40.jpg'),
(41, 'Co-lab Cà Mau Mũi Tàu', '88 Hùng Vương, Phường 7, Cà Mau', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn41.jpg'),
(42, 'Co-lab Bạc Liêu Công Tử', '15 Trần Phú, Phường 3, Bạc Liêu', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn42.jpg'),
(43, 'Co-lab Sóc Trăng Center', '33 Hùng Vương, Phường 1, Sóc Trăng', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn43.jpg'),
(44, 'Co-lab Trà Vinh Green', '45 Nguyễn Thị Minh Khai, Phường 2, Trà Vinh', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn44.jpg'),
(45, 'Co-lab Vĩnh Long Riverside', '12 Tô Thị Huỳnh, Phường 1, Vĩnh Long', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn45.jpg'),
(46, 'Co-lab Bến Tre Xứ Dừa', '88 Đại Lộ Đồng Khởi, Phú Khương, Bến Tre', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn46.jpg'),
(47, 'Co-lab Tân An Long An', '15 Hùng Vương, Phường 2, Tân An, Long An', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn47.jpg'),
(48, 'Co-lab Tây Ninh núi Bà', '45 Cách Mạng Tháng Tám, Phường 3, Tây Ninh', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn48.jpg'),
(49, 'Co-lab Đồng Xoài Bình Phước', '88 Hùng Vương, Tân Bình, Đồng Xoài, Bình Phước', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn49.jpg'),
(50, 'Co-lab Cao Lãnh Đồng Tháp', '12 Nguyễn Huệ, Phường 1, Cao Lãnh, Đồng Tháp', '2026-06-24 19:18:03', '2026-06-24 19:18:03', 1, NULL, NULL, 'uploads/ChiNhanh/cn50.jpg');

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
(1, 1, 1, 1),
(2, 2, 1, 1),
(3, 6, 1, 1),
(4, 8, 1, 1),
(5, 11, 1, 1),
(6, 3, 2, 1),
(7, 4, 2, 1),
(8, 5, 2, 1),
(9, 11, 2, 1),
(10, 8, 2, 1),
(11, 9, 3, 1),
(12, 11, 3, 1),
(13, 6, 4, 1),
(14, 12, 4, 1),
(15, 3, 5, 1),
(16, 4, 5, 1),
(17, 5, 5, 1),
(18, 13, 6, 1),
(19, 27, 6, 1),
(20, 2, 7, 1),
(21, 15, 7, 1),
(22, 19, 7, 1),
(23, 16, 8, 1),
(24, 9, 8, 1),
(25, 20, 9, 1),
(26, 21, 9, 1),
(27, 41, 9, 1),
(28, 22, 10, 1),
(29, 23, 10, 1),
(30, 5, 10, 1),
(31, 48, 11, 1),
(32, 25, 11, 1),
(33, 40, 12, 1),
(34, 12, 12, 1),
(35, 2, 13, 1),
(36, 28, 13, 1),
(37, 34, 13, 1),
(38, 8, 14, 1),
(39, 9, 14, 1),
(40, 13, 15, 1),
(41, 39, 15, 1),
(42, 25, 16, 1),
(43, 9, 16, 1),
(44, 25, 17, 1),
(45, 6, 18, 1),
(46, 1, 18, 1),
(47, 3, 19, 1),
(48, 4, 19, 1),
(49, 13, 20, 1),
(50, 22, 20, 1),
(51, 3, 2, 1),
(52, 3, 2, 1),
(53, 3, 2, 1);

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
(1, 'Ghế tiêu chuẩn', 1),
(2, 'Ghế công thái học', 1),
(3, 'Ghế băng dài', 1),
(4, 'Ghế đệm sofa', 1),
(5, 'Ghế xoay văn phòng', 1),
(6, 'Ghế quầy bar', 1),
(7, 'Ghế xếp gọn', 1),
(8, 'Ghế gaming', 1),
(9, 'Ghế lười hạt đậu', 1),
(10, 'Ghế chân quỳ', 1),
(11, 'Ghế gỗ tự nhiên', 1),
(12, 'Ghế bọc da cao cấp', 1),
(13, 'Ghế thư giãn chân duỗi', 1),
(14, 'Ghế nhựa đúc', 1),
(15, 'Ghế sắt nghệ thuật', 1),
(16, 'Ghế tựa lưng thấp', 1),
(17, 'Ghế tựa lưng cao', 1),
(18, 'Ghế họp chân tĩnh', 1),
(19, 'Ghế đôi tình nhân', 1),
(20, 'Ghế massage cao cấp', 1),
(21, 'Ghế làm việc nhóm', 1),
(22, 'Ghế pod cách âm', 1),
(23, 'Ghế ngồi bệt kiểu Nhật', 1),
(24, 'Ghế nhựa chân gỗ', 1),
(25, 'Ghế chân sắt mặt gỗ', 1),
(26, 'Ghế dựa mây tre', 1),
(27, 'Ghế giám đốc', 1),
(28, 'Ghế trưởng phòng', 1),
(29, 'Ghế lưới thoáng khí', 1),
(30, 'Ghế nỉ cao cấp', 1),
(31, 'Ghế nệm tròn', 1),
(32, 'Ghế quầy lễ tân', 1),
(33, 'Ghế băng chờ sảnh', 1),
(34, 'Ghế đọc sách ban công', 1),
(35, 'Ghế thư viện cách âm', 1),
(36, 'Ghế học viên', 1),
(37, 'Ghế phòng lab', 1),
(38, 'Ghế hội thảo xếp liền bàn', 1),
(39, 'Ghế đôn sofa nhỏ', 1),
(40, 'Ghế quầy cà phê', 1),
(41, 'Ghế dài phòng họp', 1),
(42, 'Ghế làm việc ngoài trời', 1),
(43, 'Ghế cao chân sắt', 1),
(44, 'Ghế lót nệm nhung', 1),
(45, 'Ghế gấp văn phòng', 1),
(46, 'Ghế băng chờ inox', 1),
(47, 'Ghế tròn inox', 1),
(48, 'Ghế quầy bar chân nâng hạ', 1),
(49, 'Ghế tựa lưới cao cấp', 1),
(50, 'Ghế chuyên dụng coder', 1);

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
(1, 'Ghế Tiêu Chuẩn A-01', 10, 20, 1, 1, 1),
(2, 'Ghế Tiêu Chuẩn A-02', 10, 40, 1, 1, 1),
(3, 'Ghế Công Thái Học E-01', 30, 20, 1, 1, 2),
(4, 'Ghế Công Thái Học E-02', 30, 40, 1, 1, 2),
(5, 'Ghế Họp Nhóm M-01', 100, 100, 1, 2, 18),
(6, 'Ghế Họp Nhóm M-02', 100, 130, 1, 2, 18),
(7, 'Ghế Xoay Lưới L-01', 50, 50, 1, 3, 29),
(8, 'Ghế Xoay Lưới L-02', 50, 80, 1, 3, 29),
(9, 'Ghế Sofa Thư Giãn S-01', 150, 200, 1, 6, 4),
(10, 'Ghế Sofa Thư Giãn S-02', 150, 230, 1, 6, 4),
(11, 'Ghế Kén Pod P-01', 200, 10, 1, 8, 22),
(12, 'Ghế Kén Pod P-02', 220, 10, 1, 8, 22),
(13, 'Ghế Chuyên Game G-01', 80, 80, 1, 9, 8),
(14, 'Ghế Chuyên Game G-02', 80, 110, 1, 9, 8),
(15, 'Ghế VIP Giám Đốc V-01', 300, 300, 1, 10, 27),
(16, 'Ghế Đọc Sách Thư Viện L-01', 15, 15, 1, 12, 35),
(17, 'Ghế Đọc Sách Thư Viện L-02', 15, 35, 1, 12, 35),
(18, 'Ghế Phòng Lab LB-01', 40, 40, 1, 13, 37),
(19, 'Ghế Bàn Đôi CP-01', 70, 70, 1, 14, 19),
(20, 'Ghế Quầy Bar B-01', 90, 10, 1, 15, 6),
(21, 'Ghế Bệt Nhật Bản T-01', 5, 5, 1, 16, 23),
(22, 'Ghế Mây Sinh Thái EC-01', 12, 12, 1, 17, 26),
(23, 'Ghế Coder Chuyên Sâu T-01', 60, 60, 1, 7, 50),
(24, 'Ghế Tiêu Chuẩn Cầu Giấy CG-01', 20, 20, 1, 18, 1),
(25, 'Ghế Tiêu Chuẩn Cầu Giấy CG-02', 20, 40, 1, 18, 1),
(26, 'Ghế Trưởng Phòng Đống Đa DD-01', 45, 45, 1, 21, 28),
(27, 'Ghế Sảnh Chờ LN-01', 11, 11, 1, 23, 33),
(28, 'Ghế Studio Thiết Kế ST-01', 85, 85, 1, 24, 8),
(29, 'Ghế Họp Đà Nẵng DN-01', 55, 55, 1, 25, 18),
(30, 'Ghế Ngoài Trời View Biển VB-01', 5, 15, 1, 26, 42),
(31, 'Ghế Tiêu Chuẩn Cần Thơ CT-01', 25, 25, 1, 27, 1),
(32, 'Ghế Trưởng Phòng Hải Phòng HP-01', 65, 65, 1, 28, 28),
(33, 'Ghế Startup Biên Hòa BH-01', 35, 35, 1, 29, 18),
(34, 'Ghế Workshop Bình Dương BD-01', 105, 105, 1, 30, 38),
(35, 'Ghế Thư Giãn Vũng Tàu VT-01', 15, 25, 1, 31, 13),
(36, 'Ghế Cày Deadline Nha Trang NT-01', 50, 20, 1, 32, 2),
(37, 'Ghế Gỗ Thông Đà Lạt DL-01', 30, 30, 1, 33, 11),
(38, 'Ghế Sofa BMT CF-01', 40, 50, 1, 34, 4),
(39, 'Ghế Thư Viện Quy Nhơn QN-01', 20, 10, 1, 35, 35),
(40, 'Ghế Sáng Tạo Huế HU-01', 15, 45, 1, 36, 1),
(41, 'Ghế Coder Pro Vinh VI-01', 75, 75, 1, 37, 50),
(42, 'Ghế VIP View Vịnh HL-01', 120, 120, 1, 38, 27),
(43, 'Ghế Công Nghệ Bắc Ninh BN-01', 65, 85, 1, 39, 50),
(44, 'Ghế Lab Thái Nguyên TN-01', 45, 65, 1, 40, 37),
(45, 'Ghế Tiêu Chuẩn Nam Định ND-01', 30, 50, 1, 41, 1),
(46, 'Ghế Hội Thảo Thanh Hóa TH-01', 110, 110, 1, 42, 38),
(47, 'Ghế Ban Công Pleiku GL-01', 10, 90, 1, 43, 34),
(48, 'Ghế Họp Nhỏ Kon Tum KT-01', 50, 60, 1, 44, 18),
(49, 'Ghế Sofa Thư Giãn PT-01', 130, 140, 1, 45, 4),
(50, 'Ghế Tiêu Chuẩn Long Xuyên LX-01', 40, 80, 1, 46, 1);

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
(1, 60000.00, '2026-06-24', 1, 1),
(2, 30000.00, '2026-06-24', 1, 2),
(3, 100000.00, '2026-06-24', 1, 3),
(4, 100000.00, '2026-06-24', 1, 4),
(5, 60000.00, '2026-06-24', 1, 5),
(6, 120000.00, '2026-06-24', 1, 6),
(7, 105000.00, '2026-06-24', 1, 7),
(8, 1000000.00, '2026-06-24', 1, 8),
(9, 36000.00, '2026-06-24', 1, 9),
(10, 60000.00, '2026-06-24', 1, 10),
(11, 45000.00, '2026-06-24', 1, 11),
(12, 40000.00, '2026-06-24', 1, 12),
(13, 30000.00, '2026-06-24', 1, 13),
(14, 2800000.00, '2026-06-24', 1, 14),
(15, 36000.00, '2026-06-24', 1, 15),
(16, 36000.00, '2026-06-24', 1, 16),
(17, 160000.00, '2026-06-24', 1, 17),
(18, 80000.00, '2026-06-24', 1, 18),
(19, 30000.00, '2026-06-24', 1, 19),
(20, 330000.00, '2026-06-24', 1, 20),
(21, 100000.00, '2026-06-24', 1, 21),
(22, 36000.00, '2026-06-24', 1, 22),
(23, 45000.00, '2026-06-24', 1, 23),
(24, 220000.00, '2026-06-24', 1, 24),
(25, 360000.00, '2026-06-24', 1, 25),
(26, 60000.00, '2026-06-24', 1, 26),
(27, 680000.00, '2026-06-24', 1, 27),
(28, 60000.00, '2026-06-24', 1, 28),
(29, 32000.00, '2026-06-24', 1, 29),
(30, 24000.00, '2026-06-24', 1, 30),
(31, 2560000.00, '2026-06-24', 1, 31),
(32, 1050000.00, '2026-06-24', 1, 32),
(33, 130000.00, '2026-06-24', 1, 33),
(34, 440000.00, '2026-06-24', 1, 34),
(35, 60000.00, '2026-06-24', 1, 35),
(36, 680000.00, '2026-06-24', 1, 36),
(37, 265000.00, '2026-06-24', 1, 37),
(38, 38000.00, '2026-06-24', 1, 38),
(39, 32000.00, '2026-06-24', 1, 39),
(40, 100000.00, '2026-06-24', 1, 40),
(41, 30000.00, '2026-06-24', 1, 41),
(42, 30000.00, '2026-06-24', 1, 42),
(43, 50000.00, '2026-06-24', 1, 43),
(44, 60000.00, '2026-06-24', 1, 44),
(45, 60000.00, '2026-06-24', 1, 45),
(46, 30000.00, '2026-06-24', 1, 46),
(47, 200000.00, '2026-06-24', 1, 47),
(48, 40000.00, '2026-06-24', 1, 48),
(49, 270000.00, '2026-06-24', 1, 49),
(50, 45000.00, '2026-06-24', 1, 50);

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
  `ID_CHI_NHANH` int(11) NOT NULL,
  `HINHANH` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khonggian`
--

INSERT INTO `khonggian` (`ID_KHONG_GIAN`, `TEN_KHONG_GIAN`, `LOAI_KHONG_GIAN`, `TRANG_THAI`, `ID_GIA`, `NGAY_TAO`, `NGAY_CAP_NHAT`, `NGAY_BAO_TRI`, `NGAY_XONG`, `ID_CHI_NHANH`, `HINHANH`) VALUES
(1, 'Khu Vực Tập Trung OpenSpace A', 1, 1, 1, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 1, 'uploads/KhongGian/os_a.jpg'),
(2, 'Phòng Họp Nhóm Creative 1', 2, 1, 19, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 1, 'uploads/KhongGian/meet_1.jpg'),
(3, 'Bàn thị Phương Linh', 1, 1, 3, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 1, 'uploads/KhongGian/ban_pl.jpg'),
(4, 'Khu Yên Tĩnh Silent Zone B', 1, 1, 13, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 2, 'uploads/KhongGian/silent_b.jpg'),
(5, 'Phòng Hội Thảo Lớn Hall 101', 2, 1, 20, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 3, 'uploads/KhongGian/hall_101.jpg'),
(6, 'Khu Vực Sofa Chill Out', 1, 1, 9, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 3, 'uploads/KhongGian/sofa.jpg'),
(7, 'Phòng Coder Chuyên Sâu TechHub', 1, 1, 15, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 4, 'uploads/KhongGian/tech.jpg'),
(8, 'Khu Pod Cách Âm Cá Nhân', 1, 1, 16, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 5, 'uploads/KhongGian/pod.jpg'),
(9, 'Khu Gaming & Streamer Room', 1, 1, 11, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 6, 'uploads/KhongGian/game.jpg'),
(10, 'Phòng Họp VIP Boardroom', 2, 1, 18, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 1, 'uploads/KhongGian/vip.jpg'),
(11, 'Khu Vực Sân Thượng Ban Công Open', 1, 1, 27, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 7, 'uploads/KhongGian/rooftop.jpg'),
(12, 'Thư Viện Sách Nghiên Cứu', 1, 1, 29, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 8, 'uploads/KhongGian/library.jpg'),
(13, 'Phòng Lab Thử Nghiệm Công Nghệ', 2, 1, 31, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 9, 'uploads/KhongGian/lab.jpg'),
(14, 'Khu Bàn Đôi Cặp Đôi Couple', 1, 1, 37, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 10, 'uploads/KhongGian/couple.jpg'),
(15, 'Khu Quầy Bar Năng Động', 1, 1, 41, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 11, 'uploads/KhongGian/bar.jpg'),
(16, 'Phòng Nhật Bản Bàn Bệt Tatami', 1, 1, 43, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 12, 'uploads/KhongGian/tatami.jpg'),
(17, 'Khu Vực Ghế Mây Sinh Thái Eco', 1, 1, 45, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 13, 'uploads/KhongGian/eco.jpg'),
(18, 'Khu OpenSpace B1 - Cầu Giấy', 1, 1, 1, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 11, 'uploads/KhongGian/cg_b1.jpg'),
(19, 'Phòng Biểu Diễn Ý Tưởng Pitching', 2, 1, 47, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 14, 'uploads/KhongGian/pitch.jpg'),
(20, 'Khu Vực Hội Viên Vàng Gold Lounge', 1, 1, 23, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 2, 'uploads/KhongGian/gold.jpg'),
(21, 'Khu Làm Việc Nhóm Đống Đa', 1, 1, 19, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 12, 'uploads/KhongGian/dd_team.jpg'),
(22, 'Phòng Kén Bảo Mật Cao Pod 2', 1, 1, 16, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 13, 'uploads/KhongGian/pod2.jpg'),
(23, 'Sảnh Tiếp Khách & Chờ Lounge C', 1, 1, 50, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 15, 'uploads/KhongGian/lounge_c.jpg'),
(24, 'Khu Vực Thiết Kế Đồ Họa Studio', 1, 1, 40, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 16, 'uploads/KhongGian/studio.jpg'),
(25, 'Phòng Họp Nhỏ H01 - Đà Nẵng', 2, 1, 19, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 16, 'uploads/KhongGian/dn_h01.jpg'),
(26, 'Khu View Biển Mỹ Khê Outdoor', 1, 1, 27, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 18, 'uploads/KhongGian/beach.jpg'),
(27, 'Khu OpenSpace Cần Thơ Riverside', 1, 1, 1, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 19, 'uploads/KhongGian/ct_os.jpg'),
(28, 'Phòng Chuyên Gia Hải Phòng Space', 2, 1, 34, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 20, 'uploads/KhongGian/hp_pro.jpg'),
(29, 'Khu Tập Trung Startup Biên Hòa', 1, 1, 47, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 21, 'uploads/KhongGian/bh_st.jpg'),
(30, 'Phòng Workshop Bình Dương 1', 2, 1, 20, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 22, 'uploads/KhongGian/bd_ws.jpg'),
(31, 'Khu View Biển Vũng Tàu Chill', 1, 1, 27, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 23, 'uploads/KhongGian/vt_chill.jpg'),
(32, 'Phòng Chạy Deadline Nha Trang', 1, 1, 2, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 24, 'uploads/KhongGian/nt_dl.jpg'),
(33, 'Phòng Gỗ Thông Đà Lạt Ấm Áp', 1, 1, 1, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 25, 'uploads/KhongGian/dl_wood.jpg'),
(34, 'Khu Cao Nguyên BMT Coffee Workspace', 1, 1, 9, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 26, 'uploads/KhongGian/bmt_cf.jpg'),
(35, 'Phòng Đọc Sách Quy Nhơn Yên Tĩnh', 1, 1, 29, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 27, 'uploads/KhongGian/qn_lib.jpg'),
(36, 'Phòng Cố Đô Huế Sáng Tạo', 1, 1, 1, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 28, 'uploads/KhongGian/hue_cr.jpg'),
(37, 'Khu Làm Việc Năng Suất Cao Vinh', 1, 1, 15, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 29, 'uploads/KhongGian/vinh_hp.jpg'),
(38, 'Phòng Họp Hạ Long View Vịnh', 2, 1, 18, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 30, 'uploads/KhongGian/hl_view.jpg'),
(39, 'Khu Công Nghiệp Bắc Ninh Tech', 1, 1, 15, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 31, 'uploads/KhongGian/bn_tech.jpg'),
(40, 'Phòng Lab Sinh Viên Thái Nguyên', 2, 1, 31, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 32, 'uploads/KhongGian/tn_lab.jpg'),
(41, 'Khu Tập Trung Nam Định Thành Nam', 1, 1, 1, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 33, 'uploads/KhongGian/nd_os.jpg'),
(42, 'Phòng Đào Tạo Workshop Thanh Hóa', 2, 1, 20, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 34, 'uploads/KhongGian/th_ws.jpg'),
(43, 'Khu Cao Nguyên Pleiku Thoáng Mát', 1, 1, 27, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 35, 'uploads/KhongGian/gl_open.jpg'),
(44, 'Phòng Họp K02 - Kon Tum Town', 2, 1, 19, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 36, 'uploads/KhongGian/kt_h02.jpg'),
(45, 'Khu Nghỉ Ngơi Kết Hợp Làm Việc PT', 1, 1, 9, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 37, 'uploads/KhongGian/pt_relax.jpg'),
(46, 'Khu OpenSpace Long Xuyên Miền Tây', 1, 1, 1, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 38, 'uploads/KhongGian/ag_os.jpg'),
(47, 'Phòng Thảo Luận Mỹ Tho Sông Tiền', 2, 1, 19, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 39, 'uploads/KhongGian/tg_meet.jpg'),
(48, 'Khu View Biển Rạch Giá Kiên Giang', 1, 1, 27, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 40, 'uploads/KhongGian/kg_view.jpg'),
(49, 'Phòng Đọc Đất Mũi Cà Mau', 1, 1, 29, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 41, 'uploads/KhongGian/cm_lib.jpg'),
(50, 'Khu VIP Lounge Bạc Liêu Hạng Sang', 1, 1, 24, '2026-06-24 19:18:03', '2026-06-24 19:18:03', NULL, NULL, 42, 'uploads/KhongGian/bl_vip.jpg');

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
  `ID_KHONG_GIAN` int(11) NOT NULL,
  `IDND` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lichdat`
--

INSERT INTO `lichdat` (`ID_LICH_DAT`, `KHUNG_BATDAU`, `KHUNG_KETTHUC`, `NGAY_TAO`, `TRANG_THAI`, `THOIGIAN_VAO`, `THOIGIAN_RA`, `ID_GHE`, `ID_KHONG_GIAN`, `IDND`) VALUES
(1, '2026-06-25 08:00:00', '2026-06-25 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 1, 1, 2),
(2, '2026-06-25 09:00:00', '2026-06-25 11:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 5, 2, 3),
(3, '2026-06-25 13:00:00', '2026-06-25 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 3, 1, 4),
(4, '2026-06-25 08:00:00', '2026-06-25 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 7, 3, 5),
(5, '2026-06-26 14:00:00', '2026-06-26 16:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 9, 6, 6),
(6, '2026-06-26 09:00:00', '2026-06-26 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 11, 8, 7),
(7, '2026-06-26 18:00:00', '2026-06-26 21:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 13, 9, 8),
(8, '2026-06-27 10:00:00', '2026-06-27 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 15, 10, 9),
(9, '2026-06-27 08:00:00', '2026-06-27 11:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 16, 12, 10),
(10, '2026-06-27 13:00:00', '2026-06-27 15:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 18, 13, 11),
(11, '2026-06-28 09:00:00', '2026-06-28 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 19, 14, 12),
(12, '2026-06-28 15:00:00', '2026-06-28 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 20, 15, 13),
(13, '2026-06-28 08:00:00', '2026-06-28 10:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 21, 16, 14),
(14, '2026-06-29 09:00:00', '2026-06-29 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 23, 7, 15),
(15, '2026-06-29 14:00:00', '2026-06-29 16:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 24, 18, 16),
(16, '2026-06-29 10:00:00', '2026-06-29 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 26, 21, 17),
(17, '2026-06-30 08:00:00', '2026-06-30 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 27, 23, 18),
(18, '2026-06-30 13:00:00', '2026-06-30 15:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 28, 24, 19),
(19, '2026-06-30 09:00:00', '2026-06-30 11:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 29, 25, 20),
(20, '2026-07-01 14:00:00', '2026-07-01 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 30, 26, 21),
(21, '2026-07-01 08:00:00', '2026-07-01 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 31, 27, 22),
(22, '2026-07-01 10:00:00', '2026-07-01 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 32, 28, 23),
(23, '2026-07-02 09:00:00', '2026-07-02 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 33, 29, 24),
(24, '2026-07-02 13:00:00', '2026-07-02 15:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 34, 30, 25),
(25, '2026-07-02 15:00:00', '2026-07-02 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 35, 31, 26),
(26, '2026-07-03 08:00:00', '2026-07-03 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 36, 32, 27),
(27, '2026-07-03 13:00:00', '2026-07-03 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 37, 33, 28),
(28, '2026-07-03 09:00:00', '2026-07-03 11:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 38, 34, 29),
(29, '2026-07-04 14:00:00', '2026-07-04 16:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 39, 35, 30),
(30, '2026-07-04 10:00:00', '2026-07-04 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 40, 36, 31),
(31, '2026-07-04 08:00:00', '2026-07-04 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 41, 37, 32),
(32, '2026-07-05 09:00:00', '2026-07-05 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 42, 38, 33),
(33, '2026-07-05 13:00:00', '2026-07-05 15:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 43, 39, 34),
(34, '2026-07-05 15:00:00', '2026-07-05 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 44, 40, 35),
(35, '2026-07-06 08:00:00', '2026-07-06 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 45, 41, 36),
(36, '2026-07-06 13:00:00', '2026-07-06 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 46, 42, 37),
(37, '2026-07-06 10:00:00', '2026-07-06 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 47, 43, 38),
(38, '2026-07-07 14:00:00', '2026-07-07 16:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 48, 44, 39),
(39, '2026-07-07 09:00:00', '2026-07-07 11:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 49, 45, 40),
(40, '2026-07-07 08:00:00', '2026-07-07 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 50, 46, 41),
(41, '2026-07-08 10:00:00', '2026-07-08 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 1, 1, 42),
(42, '2026-07-08 13:00:00', '2026-07-08 15:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 2, 1, 43),
(43, '2026-07-08 15:00:00', '2026-07-08 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 3, 1, 44),
(44, '2026-07-09 08:00:00', '2026-07-09 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 4, 1, 45),
(45, '2026-07-09 13:00:00', '2026-07-09 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 5, 2, 46),
(46, '2026-07-09 09:00:00', '2026-07-09 11:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 6, 2, 47),
(47, '2026-07-10 14:00:00', '2026-07-10 16:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 7, 3, 48),
(48, '2026-07-10 10:00:00', '2026-07-10 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 8, 3, 49),
(49, '2026-07-10 08:00:00', '2026-07-10 17:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 9, 6, 50),
(50, '2026-07-11 09:00:00', '2026-07-11 12:00:00', '2026-06-24 19:18:04', 1, NULL, NULL, 10, 6, 2),
(52, '2026-06-30 10:00:00', '2026-06-30 12:00:00', '2026-06-25 21:39:52', NULL, NULL, NULL, NULL, 5, 2),
(53, '2026-06-30 08:00:00', '2026-06-30 12:00:00', '2026-06-25 21:41:20', NULL, NULL, NULL, NULL, 5, 2),
(54, '2026-06-30 08:00:00', '2026-06-30 13:00:00', '2026-06-25 21:41:46', NULL, NULL, NULL, NULL, 5, 3),
(55, '2026-06-30 08:00:00', '2026-06-30 13:00:00', '2026-06-25 21:50:15', NULL, NULL, NULL, NULL, 5, 3),
(56, '2026-06-30 08:00:00', '2026-06-30 13:00:00', '2026-06-25 21:51:49', NULL, NULL, NULL, NULL, 5, 3),
(57, '2026-06-30 08:00:00', '2026-06-30 13:00:00', '2026-06-25 22:01:52', NULL, NULL, NULL, NULL, 5, 3),
(58, '2026-06-30 08:00:00', '2026-06-30 13:00:00', '2026-06-25 22:04:16', NULL, NULL, NULL, NULL, 5, 3),
(59, '2026-06-30 08:00:00', '2026-06-30 13:00:00', '2026-06-25 22:08:30', NULL, NULL, NULL, NULL, 5, 3);

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
              AND TRANG_THAI <> 2 
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
(1, 'Nguyễn Ngọc Hiếu', 'dc01.nnh.2048ae@gmail.com', '$2b$10$OEtdzRwox5tD4WyLZz66M.5hGrPQMbsxYqV8eBtB9A.wcQETNFt1i', 'uploads/DaiDien/hieu.jpg', '2026-06-22', 1, 1),
(2, 'Trần Thanh Sơn', 'son.tran@gmail.com', '$2b$10$OEtdzRwox5tD4WyLZz66M.5hGrPQMbsxYqV8eBtB9A', 'uploads/DaiDien/user2.jpg', '2026-06-23', 0, 1),
(3, 'Lê Thị Hồng Nhung', 'nhung.le@gmail.com', 'password_hash_here', 'uploads/DaiDien/user3.jpg', '2026-06-23', 0, 1),
(4, 'Phạm Minh Quân', 'quan.pham@gmail.com', 'password_hash_here', 'uploads/DaiDien/user4.jpg', '2026-06-24', 0, 1),
(5, 'Hoàng Đình Tiến', 'tien.hoang@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(6, 'Vũ Hải Yến', 'yen.vu@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(7, 'Đặng Hoàng Long', 'long.dang@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(8, 'Bùi Minh Triết', 'triet.bui@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(9, 'Đỗ Thúy Hằng', 'hang.do@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(10, 'Ngô Quốc Bảo', 'bao.ngo@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(11, 'Võ Minh Thư', 'thu.vo@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(12, 'Nguyễn Văn Hùng', 'hung.nguyen@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(13, 'Dương Chí Kiên', 'kien.duong@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(14, 'Lý Thiên Hương', 'huong.ly@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(15, 'Đào Văn Nam', 'nam.dao@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(16, 'Trịnh Công Sơn', 'son.trinh@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(17, 'Phùng Ngọc Huy', 'huy.phung@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(18, 'Mai Phương Thảo', 'thao.mai@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(19, 'Hà Quốc Trung', 'trung.ha@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(20, 'Đinh Hoài Nam', 'nam.dinh@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(21, 'Lâm Thùy Chi', 'chi.lam@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(22, 'Phan Văn Đức', 'duc.phan@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(23, 'Cao Minh Đạt', 'dat.cao@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(24, 'Châu Gia Bảo', 'bao.chau@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(25, 'Diệp Lâm Anh', 'anh.diep@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(26, 'Tạ Quang Bửu', 'buu.ta@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(27, 'Viên Minh Trí', 'tri.vien@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(28, 'Quách Ngọc Ngoan', 'ngoan.quach@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(29, 'Thiều Bảo Trâm', 'tram.thieu@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(30, 'Lưu Hương Giang', 'giang.luu@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(31, 'Hồ Ngọc Hà', 'ha.ho@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(32, 'Đoàn Nguyên Đức', 'duc.doan@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(33, 'Trần Đình Long', 'long.tran.hp@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(34, 'Phạm Nhật Vượng', 'vuong.pham@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(35, 'Nguyễn Thị Phương Thảo', 'thao.nguyen.vj@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(36, 'Trần Bá Dương', 'duong.tran.tha@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(37, 'Hồ Hùng Anh', 'anh.ho.tc@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(38, 'Nguyễn Đăng Quang', 'quang.nguyen.ms@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(39, 'Bùi Thành Nhơn', 'nhon.bui.nv@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(40, 'Trương Gia Bình', 'binh.truong.fpt@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(41, 'Nguyễn Đức Tài', 'tai.nguyen.mwg@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(42, 'Lê Phước Vũ', 'vu.le.hsg@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(43, 'Đặng Lê Nguyên Vũ', 'vu.dang.tn@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(44, 'Trần Quí Thanh', 'thanh.tran.thp@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(45, 'Nguyễn Bảo Hoàng', 'hoang.nguyen.idg@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(46, 'Don Lam', 'don.lam.vc@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(47, 'Louis Nguyễn', 'louis.nguyen@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(48, 'Phillip Nguyễn', 'phillip.nguyen@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(49, 'Tiên Nguyễn', 'tien.nguyen@gmail.com', 'password_hash_here', NULL, '2026-06-24', 0, 1),
(50, 'Cường Đô La', 'cuong.quoc.nguyen@gmail.com', 'password_hash_here', NULL, '2026-06-24', 1, 1);

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
  `TRANG_THAI` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `thanhtoan`
--

INSERT INTO `thanhtoan` (`ID_THANHTOAN`, `MA_GIAO_DICH`, `MA_NGAN_HANG`, `SO_TIEN`, `NGAY_TAO`, `NGAY_THANH_TOAN`, `TRANG_THAI`) VALUES
(1, 'TX624001', 'VCB', 60000.00, '2026-06-24', '2026-06-25 08:05:00', 1),
(2, 'TX624002', 'MBBANK', 30000.00, '2026-06-24', '2026-06-25 09:02:00', 1),
(3, 'TX624003', 'TECH', 100000.00, '2026-06-24', '2026-06-25 13:01:00', 1),
(4, 'TX624004', 'MOMO', 100000.00, '2026-06-24', '2026-06-25 08:00:00', 1),
(5, 'TX624005', 'VNPAY', 60000.00, '2026-06-24', '2026-06-26 14:03:00', 1),
(6, 'TX624006', 'VCB', 120000.00, '2026-06-24', '2026-06-26 09:05:00', 1),
(7, 'TX624007', 'ACB', 105000.00, '2026-06-24', '2026-06-26 18:01:00', 1),
(8, 'TX624008', 'BIDV', 1000000.00, '2026-06-24', '2026-06-27 10:00:00', 1),
(9, 'TX624009', 'MOMO', 36000.00, '2026-06-24', '2026-06-27 08:02:00', 1),
(10, 'TX624010', 'TECH', 60000.00, '2026-06-24', '2026-06-27 13:05:00', 1),
(11, 'TX624011', 'MBBANK', 45000.00, '2026-06-24', '2026-06-28 09:01:00', 1),
(12, 'TX624012', 'VCB', 40000.00, '2026-06-24', '2026-06-28 15:03:00', 1),
(13, 'TX624013', 'VNPAY', 30000.00, '2026-06-24', '2026-06-28 08:00:00', 1),
(14, 'TX624014', 'BIDV', 2800000.00, '2026-06-24', '2026-06-29 09:00:00', 1),
(15, 'TX624015', 'MOMO', 36000.00, '2026-06-24', '2026-06-29 14:01:00', 1),
(16, 'TX624016', 'TECH', 36000.00, '2026-06-24', '2026-06-29 10:02:00', 1),
(17, 'TX624017', 'ACB', 160000.00, '2026-06-24', '2026-06-30 08:05:00', 1),
(18, 'TX624018', 'VCB', 80000.00, '2026-06-24', '2026-06-30 13:00:00', 1),
(19, 'TX624019', 'MBBANK', 30000.00, '2026-06-24', '2026-06-30 09:01:00', 1),
(20, 'TX624020', 'VNPAY', 330000.00, '2026-06-24', '2026-07-01 14:02:00', 1),
(21, 'TX624021', 'BIDV', 100000.00, '2026-06-24', '2026-07-01 08:00:00', 1),
(22, 'TX624022', 'MOMO', 36000.00, '2026-06-24', '2026-07-01 10:01:00', 1),
(23, 'TX624023', 'TECH', 45000.00, '2026-06-24', '2026-07-02 09:05:00', 1),
(24, 'TX624024', 'VCB', 220000.00, '2026-06-24', '2026-07-02 13:00:00', 1),
(25, 'TX624025', 'ACB', 360000.00, '2026-06-24', '2026-07-02 15:02:00', 1),
(26, 'TX624026', 'MBBANK', 60000.00, '2026-06-24', '2026-07-03 08:04:00', 1),
(27, 'TX624027', 'VNPAY', 680000.00, '2026-06-24', '2026-07-03 13:01:00', 1),
(28, 'TX624028', 'BIDV', 60000.00, '2026-06-24', '2026-07-03 09:00:00', 1),
(29, 'TX624029', 'MOMO', 32000.00, '2026-06-24', '2026-07-04 14:05:00', 1),
(30, 'TX624030', 'TECH', 24000.00, '2026-06-24', '2026-07-04 10:02:00', 1),
(31, 'TX624031', 'VCB', 2560000.00, '2026-06-24', '2026-07-04 08:00:00', 1),
(32, 'TX624032', 'ACB', 1050000.00, '2026-06-24', '2026-07-05 09:01:00', 1),
(33, 'TX624033', 'MBBANK', 130000.00, '2026-06-24', '2026-07-05 13:03:00', 1),
(34, 'TX624034', 'VNPAY', 440000.00, '2026-06-24', '2026-07-05 15:00:00', 1),
(35, 'TX624035', 'BIDV', 60000.00, '2026-06-24', '2026-07-06 08:05:00', 1),
(36, 'TX624036', 'MOMO', 680000.00, '2026-06-24', '2026-07-06 13:01:00', 1),
(37, 'TX624037', 'TECH', 265000.00, '2026-06-24', '2026-07-06 10:02:00', 1),
(38, 'TX624038', 'VCB', 38000.00, '2026-06-24', '2026-07-07 14:04:00', 1),
(39, 'TX624039', 'ACB', 32000.00, '2026-06-24', '2026-07-07 09:01:00', 1),
(40, 'TX624040', 'MBBANK', 100000.00, '2026-06-24', '2026-07-07 08:00:00', 1),
(41, 'TX624041', 'VNPAY', 30000.00, '2026-06-24', '2026-07-08 10:05:00', 1),
(42, 'TX624042', 'BIDV', 30000.00, '2026-06-24', '2026-07-08 13:00:00', 1),
(43, 'TX624043', 'MOMO', 50000.00, '2026-06-24', '2026-07-08 15:02:00', 1),
(44, 'TX624044', 'TECH', 60000.00, '2026-06-24', '2026-07-09 08:04:00', 1),
(45, 'TX624045', 'VCB', 60000.00, '2026-06-24', '2026-07-09 13:01:00', 1),
(46, 'TX624046', 'ACB', 30000.00, '2026-06-24', '2026-07-09 09:00:00', 1),
(47, 'TX624047', 'MBBANK', 200000.00, '2026-06-24', '2026-07-10 14:05:00', 1),
(48, 'TX624048', 'VNPAY', 40000.00, '2026-06-24', '2026-07-10 10:02:00', 1),
(49, 'TX624049', 'BIDV', 270000.00, '2026-06-24', '2026-07-10 08:00:00', 1),
(50, 'TX624050', 'MOMO', 45000.00, '2026-06-24', '2026-07-11 09:01:00', 1);

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
(1, 'Máy in laser đa năng HP', 'uploads/ThietBi/hp_printer.jpg'),
(2, 'Màn hình Dell UltraSharp 27 inch', 'uploads/ThietBi/dell_27.jpg'),
(3, 'Máy chiếu full HD Sony', 'uploads/ThietBi/sony_projector.jpg'),
(4, 'Bảng trắng từ tính kèm bút', 'uploads/ThietBi/whiteboard.jpg'),
(5, 'Hệ thống loa hội nghị Jabra', 'uploads/ThietBi/jabra_speaker.jpg'),
(6, 'Bộ phát Wifi 6 Aruba tốc độ cao', 'uploads/ThietBi/aruba_wifi.jpg'),
(7, 'Máy scan tài liệu tốc độ cao Canon', 'uploads/ThietBi/canon_scan.jpg'),
(8, 'Ổ cắm điện đa năng âm bàn', 'uploads/ThietBi/power_hub.jpg'),
(9, 'Đèn bàn bảo vệ mắt Xiaomi', 'uploads/ThietBi/xiaomi_lamp.jpg'),
(10, 'Tủ tài liệu cá nhân có khóa', 'uploads/ThietBi/locker.jpg'),
(11, 'Điều hòa Daikin Inverter 2HP', 'uploads/ThietBi/daikin_ac.jpg'),
(12, 'Máy lọc không khí Sharp lọc bụi mịn', 'uploads/ThietBi/sharp_air.jpg'),
(13, 'Máy pha cà phê tự động Delonghi', 'uploads/ThietBi/coffee_maker.jpg'),
(14, 'Cáp chuyển đổi đa năng Baseus Hub', 'uploads/ThietBi/baseus_hub.jpg'),
(15, 'Giá đỡ Laptop công thái học', 'uploads/ThietBi/laptop_stand.jpg'),
(16, 'Tai nghe chống ồn Sony WH-1000XM4', 'uploads/ThietBi/sony_headphone.jpg'),
(17, 'Bột sạc pin dự phòng nhanh Anker', 'uploads/ThietBi/anker_powerbank.jpg'),
(18, 'Chuột không dây Logitech Pebble', 'uploads/ThietBi/logi_mouse.jpg'),
(19, 'Bàn phím cơ Logitech MX Keys', 'uploads/ThietBi/logi_kb.jpg'),
(20, 'Micro thu âm Podcast Rode NT-USB', 'uploads/ThietBi/rode_mic.jpg'),
(21, 'Webcam Logitech Brio 4K hội họp', 'uploads/ThietBi/logi_webcam.jpg'),
(22, 'Tivi thông minh Samsung 65 inch', 'uploads/ThietBi/samsung_tv.jpg'),
(23, 'Bút trình chiếu Logitech Spotlight', 'uploads/ThietBi/presenter_pen.jpg'),
(24, 'Bảng ghim nỉ thông báo lớn', 'uploads/ThietBi/pin_board.jpg'),
(25, 'Quạt cây thông minh thông gió', 'uploads/ThietBi/smart_fan.jpg'),
(26, 'Thùng rác thông minh cảm ứng', 'uploads/ThietBi/smart_bin.jpg'),
(27, 'Cây nước nóng lạnh Kangaroo', 'uploads/ThietBi/water_dispenser.jpg'),
(28, 'Bộ chia mạng Switch Cisco 24 Ports', 'uploads/ThietBi/cisco_switch.jpg'),
(29, 'Ổ cứng di động sao lưu dữ liệu 2TB', 'uploads/ThietBi/seagate_hdd.jpg'),
(30, 'Kính thực tế ảo Oculus Quest 2', 'uploads/ThietBi/oculus.jpg'),
(31, 'Bàn vẽ điện tử Wacom Intuos', 'uploads/ThietBi/wacom.jpg'),
(32, 'Máy hủy tài liệu bảo mật văn phòng', 'uploads/ThietBi/shredder.jpg'),
(33, 'Đèn sưởi mùa đông ấm áp', 'uploads/ThietBi/heater.jpg'),
(34, 'Router chịu tải cân bằng Mikrotik', 'uploads/ThietBi/mikrotik.jpg'),
(35, 'Máy ép nhựa plastic tài liệu', 'uploads/ThietBi/laminator.jpg'),
(36, 'Đồng hồ LED treo tường lớn', 'uploads/ThietBi/led_clock.jpg'),
(37, 'Loa Bluetooth kéo di động công suất lớn', 'uploads/ThietBi/portable_speaker.jpg'),
(38, 'Bộ kích sóng Wifi chuyên dụng TP-Link', 'uploads/ThietBi/tplink_ext.jpg'),
(39, 'Tủ lạnh mini Funiki chứa nước giải khát', 'uploads/ThietBi/mini_fridge.jpg'),
(40, 'Kệ để sách và tài liệu nghiên cứu', 'uploads/ThietBi/bookshelf.jpg'),
(41, 'Đèn livestream ring light lớn', 'uploads/ThietBi/ring_light.jpg'),
(42, 'Phông nền xanh lá Key hình Studio', 'uploads/ThietBi/green_screen.jpg'),
(43, 'Chân đế máy ảnh Tripod Benro', 'uploads/ThietBi/tripod.jpg'),
(44, 'Máy hút bụi cầm tay dọn bàn ghế', 'uploads/ThietBi/hand_vacuum.jpg'),
(45, 'Bộ dập ghim đục lỗ văn phòng', 'uploads/ThietBi/stationery_kit.jpg'),
(46, 'Kẹp tài liệu trình ký da sang trọng', 'uploads/ThietBi/leather_folder.jpg'),
(47, 'Máy sấy tay cảm ứng phòng vệ sinh', 'uploads/ThietBi/hand_dryer.jpg'),
(48, 'Hệ thống phun sương làm mát ban công', 'uploads/ThietBi/misting_system.jpg'),
(49, 'Thiết bị chấm công vân tay khuôn mặt', 'uploads/ThietBi/biometric_time.jpg'),
(50, 'Bộ sơ cứu y tế cơ bản khẩn cấp', 'uploads/ThietBi/first_aid.jpg');

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
(1, 'Đăng ký thành công', 'Chào mừng bạn gia nhập hệ thống Co-lab Workspace.', 0, 1, 2, '2026-06-24 19:18:05'),
(2, 'Đặt chỗ thành công', 'Lịch đặt mã số #1 tại OpenSpace A đã được xác nhận.', 0, 2, 2, '2026-06-24 19:18:05'),
(3, 'Thanh toán hoàn tất', 'Hóa đơn mã số #1 đã được thanh toán thành công qua VCB.', 0, 3, 2, '2026-06-24 19:18:05'),
(4, 'Nhắc nhở lịch đặt', 'Bạn có lịch làm việc sắp diễn ra tại phòng họp Creative 1 sau 15 phút.', 0, 2, 3, '2026-06-24 19:18:05'),
(5, 'Ưu đãi tháng mới', 'Giảm ngay 10% khi gia hạn gói Membership Vàng trong tuần này.', 0, 4, 4, '2026-06-24 19:18:05'),
(6, 'Bảo trì hệ thống', 'Hệ thống website sẽ bảo trì định kỳ từ 1h đến 3h sáng ngày mai.', 0, 5, 5, '2026-06-24 19:18:05'),
(7, 'Xác thực tài khoản', 'Vui lòng xác thực email để kích hoạt toàn bộ tính năng.', 0, 1, 6, '2026-06-24 19:18:05'),
(8, 'Đặt chỗ thành công', 'Lịch đặt mã số #6 tại Pod Cách Âm đã được duyệt.', 0, 2, 7, '2026-06-24 19:18:05'),
(9, 'Nhắc nhở trả phòng', 'Thời gian sử dụng kén Pod P-01 của bạn đã hết, vui lòng dọn dẹp vị trí.', 0, 2, 7, '2026-06-24 19:18:05'),
(10, 'Cảnh báo đăng nhập', 'Tài khoản của bạn vừa được đăng nhập tại thiết bị lạ.', 0, 5, 8, '2026-06-24 19:18:05'),
(11, 'Đặt chỗ thành công', 'Xác nhận đặt chỗ tại phòng VIP Boardroom thành công.', 0, 2, 9, '2026-06-24 19:18:05'),
(12, 'Khuyến mãi thành viên mới', 'Tặng 1 ly Americano miễn phí cho lần đặt đầu tiên.', 0, 4, 10, '2026-06-24 19:18:05'),
(13, 'Cập nhật điều khoản', 'Co-lab Workspace vừa cập nhật chính sách hủy lịch mới.', 0, 5, 11, '2026-06-24 19:18:05'),
(14, 'Đặt chỗ thành công', 'Lịch đặt mã số #12 tại quầy Bar đã được ghi nhận.', 0, 2, 13, '2026-06-24 19:18:05'),
(15, 'Thanh toán hoàn tất', 'Giao dịch TX624014 trị giá 2.800.000đ thành công.', 0, 3, 15, '2026-06-24 19:18:05'),
(16, 'Chúc mừng sinh nhật', 'Co-lab tặng bạn voucher giảm 50% trọn ngày làm việc dịp sinh nhật!', 0, 4, 16, '2026-06-24 19:18:05'),
(17, 'Thông báo sự kiện', 'Tham gia Tech-Talk tối nay tại Hall 101 để kết nối startup.', 0, 4, 17, '2026-06-24 19:18:05'),
(18, 'Đăng ký thành công', 'Chào mừng bạn gia nhập hệ thống Co-lab Workspace.', 0, 1, 18, '2026-06-24 19:18:05'),
(19, 'Đặt chỗ thành công', 'Lịch đặt phòng Studio đã được phê duyệt.', 0, 2, 19, '2026-06-24 19:18:05'),
(20, 'Nhắc nhở lịch đặt', 'Lịch đặt tại phòng họp Đà Nẵng bắt đầu lúc 9h00.', 0, 2, 20, '2026-06-24 19:18:05'),
(21, 'Cập nhật Avatar thành công', 'Ảnh đại diện của bạn đã được thay đổi trên hệ thống.', 0, 1, 1, '2026-06-24 19:18:05'),
(22, 'Đặt chỗ thành công', 'Xác nhận lịch đặt ghế view biển tại Đà Nẵng.', 0, 2, 21, '2026-06-24 19:18:05'),
(23, 'Đặt chỗ thành công', 'Xác nhận lịch đặt ghế tại OpenSpace Cần Thơ.', 0, 2, 22, '2026-06-24 19:18:05'),
(24, 'Thanh toán hoàn tất', 'Hóa đơn mã số #23 đã được thanh toán qua TECH.', 0, 3, 23, '2026-06-24 19:18:05'),
(25, 'Đăng ký gói thành công', 'Bạn đã là thành viên chính thức gói Coder Pro Tháng.', 0, 1, 24, '2026-06-24 19:18:05'),
(26, 'Đặt chỗ thành công', 'Lịch đặt phòng hội thảo Bình Dương được duyệt.', 0, 2, 25, '2026-06-24 19:18:05'),
(27, 'Nhắc nhở lịch đặt', 'Lịch đặt ghế tại Vũng Tàu sắp bắt đầu.', 0, 2, 26, '2026-06-24 19:18:05'),
(28, 'Đặt chỗ thành công', 'Xác nhận đặt chỗ tại phòng deadlines Nha Trang.', 0, 2, 27, '2026-06-24 19:18:05'),
(29, 'Đăng ký thành công', 'Tài khoản đăng ký mới thành công.', 0, 1, 28, '2026-06-24 19:18:05'),
(30, 'Đặt chỗ thành công', 'Xác nhận đặt ghế gỗ thông Đà Lạt.', 0, 2, 29, '2026-06-24 19:18:05'),
(31, 'Thanh toán hoàn tất', 'Giao dịch số TX624030 thành công.', 0, 3, 30, '2026-06-24 19:18:05'),
(32, 'Đặt chỗ thành công', 'Xác nhận lịch đặt tại thư viện Quy Nhơn.', 0, 2, 31, '2026-06-24 19:18:05'),
(33, 'Đặt chỗ thành công', 'Xác nhận lịch đặt phòng sáng tạo Huế.', 0, 2, 32, '2026-06-24 19:18:05'),
(34, 'Ưu đãi cuối tuần', 'Giảm giá 20% cho tất cả các chỗ ngồi đơn vào Thứ 7.', 0, 4, 33, '2026-06-24 19:18:05'),
(35, 'Đặt chỗ thành công', 'Xác nhận đặt ghế Coder Pro Vinh.', 0, 2, 34, '2026-06-24 19:18:05'),
(36, 'Thanh toán hoàn tất', 'Hóa đơn mã số #35 thành công.', 0, 3, 35, '2026-06-24 19:18:05'),
(37, 'Đặt chỗ thành công', 'Xác nhận lịch đặt phòng VIP Hạ Long.', 0, 2, 36, '2026-06-24 19:18:05'),
(38, 'Cảnh báo hệ thống', 'Vui lòng không mang thức ăn nặng mùi vào phòng lab.', 0, 5, 37, '2026-06-24 19:18:05'),
(39, 'Đặt chỗ thành công', 'Xác nhận lịch đặt tại Bắc Ninh Tech.', 0, 2, 38, '2026-06-24 19:18:05'),
(40, 'Đặt chỗ thành công', 'Xác nhận lịch đặt phòng lab Thái Nguyên.', 0, 2, 39, '2026-06-24 19:18:05'),
(41, 'Đăng ký thành công', 'Chào mừng thành viên mới hệ thống.', 0, 1, 40, '2026-06-24 19:18:05'),
(42, 'Đặt chỗ thành công', 'Xác nhận lịch đặt OpenSpace Nam Định.', 0, 2, 41, '2026-06-24 19:18:05'),
(43, 'Thanh toán hoàn tất', 'Giao dịch số TX624041 thành công.', 0, 3, 42, '2026-06-24 19:18:05'),
(44, 'Đặt chỗ thành công', 'Xác nhận lịch đặt phòng hội thảo Thanh Hóa.', 0, 2, 43, '2026-06-24 19:18:05'),
(45, 'Đặt chỗ thành công', 'Xác nhận lịch đặt ban công Pleiku.', 0, 2, 44, '2026-06-24 19:18:05'),
(46, 'Đặt chỗ thành công', 'Xác nhận lịch đặt phòng họp Kon Tum.', 0, 2, 45, '2026-06-24 19:18:05'),
(47, 'Nhắc nhở trả chỗ', 'Thời gian sử dụng ghế tại Phan Thiết sắp hết.', 0, 2, 46, '2026-06-24 19:18:05'),
(48, 'Đặt chỗ thành công', 'Xác nhận đặt ghế OpenSpace Long Xuyên.', 0, 2, 47, '2026-06-24 19:18:05'),
(49, 'Thanh toán hoàn tất', 'Giao dịch số TX624049 thành công.', 0, 3, 49, '2026-06-24 19:18:05'),
(50, 'Đặt chỗ thành công', 'Xác nhận lịch đặt phòng họp VIP Bạc Liêu.', 0, 2, 50, '2026-06-24 19:18:05');

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
-- Đang đổ dữ liệu cho bảng `xacthucotp`
--

INSERT INTO `xacthucotp` (`ID_OTP`, `EMAIL`, `MA_OTP`, `NGAY_TAO`, `NGAY_HET_HAN`, `SO_LAN_SAI`) VALUES
(1, 'dc01.nnh.2048ae@gmail.com', '123456', '2026-06-24 19:18:05', '2026-06-24 23:59:59', 0),
(2, 'son.tran@gmail.com', '456123', '2026-06-24 19:18:05', '2026-06-25 00:05:00', 0),
(3, 'nhung.le@gmail.com', '789456', '2026-06-24 19:18:05', '2026-06-25 00:10:00', 0),
(4, 'quan.pham@gmail.com', '112233', '2026-06-24 19:18:05', '2026-06-25 01:15:00', 0),
(5, 'tien.hoang@gmail.com', '445566', '2026-06-24 19:18:05', '2026-06-25 02:20:00', 0),
(6, 'yen.vu@gmail.com', '778899', '2026-06-24 19:18:05', '2026-06-25 03:00:00', 0),
(7, 'long.dang@gmail.com', '147258', '2026-06-24 19:18:05', '2026-06-25 04:00:00', 0),
(8, 'triet.bui@gmail.com', '369258', '2026-06-24 19:18:05', '2026-06-25 05:00:00', 0),
(9, 'hang.do@gmail.com', '951753', '2026-06-24 19:18:05', '2026-06-25 06:00:00', 0),
(10, 'bao.ngo@gmail.com', '159357', '2026-06-24 19:18:05', '2026-06-25 07:00:00', 0),
(11, 'thu.vo@gmail.com', '852963', '2026-06-24 19:18:05', '2026-06-25 08:00:00', 0),
(12, 'hung.nguyen@gmail.com', '123789', '2026-06-24 19:18:05', '2026-06-25 09:00:00', 0),
(13, 'kien.duong@gmail.com', '987123', '2026-06-24 19:18:05', '2026-06-25 10:00:00', 0),
(14, 'huong.ly@gmail.com', '654321', '2026-06-24 19:18:05', '2026-06-25 11:00:00', 0),
(15, 'nam.dao@gmail.com', '321654', '2026-06-24 19:18:05', '2026-06-25 12:00:00', 0),
(16, 'son.trinh@gmail.com', '789123', '2026-06-24 19:18:05', '2026-06-25 13:00:00', 0),
(17, 'huy.phung@gmail.com', '456789', '2026-06-24 19:18:05', '2026-06-25 14:00:00', 0),
(18, 'thao.mai@gmail.com', '159263', '2026-06-24 19:18:05', '2026-06-25 15:00:00', 0),
(19, 'trung.ha@gmail.com', '357159', '2026-06-24 19:18:05', '2026-06-25 16:00:00', 0),
(20, 'nam.dinh@gmail.com', '456321', '2026-06-24 19:18:05', '2026-06-25 17:00:00', 0),
(21, 'chi.lam@gmail.com', '123123', '2026-06-24 19:18:05', '2026-06-25 18:00:00', 0),
(22, 'duc.phan@gmail.com', '456456', '2026-06-24 19:18:05', '2026-06-25 19:00:00', 0),
(23, 'dat.cao@gmail.com', '789789', '2026-06-24 19:18:05', '2026-06-25 20:00:00', 0),
(24, 'bao.chau@gmail.com', '111222', '2026-06-24 19:18:05', '2026-06-25 21:00:00', 0),
(25, 'anh.diep@gmail.com', '333444', '2026-06-24 19:18:05', '2026-06-25 22:00:00', 0),
(26, 'buu.ta@gmail.com', '555666', '2026-06-24 19:18:05', '2026-06-25 23:00:00', 0),
(27, 'tri.vien@gmail.com', '777888', '2026-06-24 19:18:05', '2026-06-26 00:00:00', 0),
(28, 'ngoan.quach@gmail.com', '999000', '2026-06-24 19:18:05', '2026-06-26 01:00:00', 0),
(29, 'tram.thieu@gmail.com', '121212', '2026-06-24 19:18:05', '2026-06-26 02:00:00', 0),
(30, 'giang.luu@gmail.com', '343434', '2026-06-24 19:18:05', '2026-06-26 03:00:00', 0),
(31, 'ha.ho@gmail.com', '565656', '2026-06-24 19:18:05', '2026-06-26 04:00:00', 0),
(32, 'duc.doan@gmail.com', '787878', '2026-06-24 19:18:05', '2026-06-26 05:00:00', 0),
(33, 'long.tran.hp@gmail.com', '909090', '2026-06-24 19:18:05', '2026-06-26 06:00:00', 0),
(34, 'vuong.pham@gmail.com', '123412', '2026-06-24 19:18:05', '2026-06-26 07:00:00', 0),
(35, 'thao.nguyen.vj@gmail.com', '567856', '2026-06-24 19:18:05', '2026-06-26 08:00:00', 0),
(36, 'duong.tran.tha@gmail.com', '901290', '2026-06-24 19:18:05', '2026-06-26 09:00:00', 0),
(37, 'anh.ho.tc@gmail.com', '345634', '2026-06-24 19:18:05', '2026-06-26 10:00:00', 0),
(38, 'quang.nguyen.ms@gmail.com', '789078', '2026-06-24 19:18:05', '2026-06-26 11:00:00', 0),
(39, 'nhon.bui.nv@gmail.com', '234523', '2026-06-24 19:18:05', '2026-06-26 12:00:00', 0),
(40, 'binh.truong.fpt@gmail.com', '678967', '2026-06-24 19:18:05', '2026-06-26 13:00:00', 0),
(41, 'tai.nguyen.mwg@gmail.com', '012301', '2026-06-24 19:18:05', '2026-06-26 14:00:00', 0),
(42, 'vu.le.hsg@gmail.com', '456745', '2026-06-24 19:18:05', '2026-06-26 15:00:00', 0),
(43, 'vu.dang.tn@gmail.com', '890189', '2026-06-24 19:18:05', '2026-06-26 16:00:00', 0),
(44, 'thanh.tran.thp@gmail.com', '234567', '2026-06-24 19:18:05', '2026-06-26 17:00:00', 0),
(45, 'hoang.nguyen.idg@gmail.com', '345678', '2026-06-24 19:18:05', '2026-06-26 18:00:00', 0),
(46, 'don.lam.vc@gmail.com', '456789', '2026-06-24 19:18:05', '2026-06-26 19:00:00', 0),
(47, 'louis.nguyen@gmail.com', '567890', '2026-06-24 19:18:05', '2026-06-26 20:00:00', 0),
(48, 'phillip.nguyen@gmail.com', '678901', '2026-06-24 19:18:05', '2026-06-26 21:00:00', 0),
(49, 'tien.nguyen@gmail.com', '789012', '2026-06-24 19:18:05', '2026-06-26 22:00:00', 0),
(50, 'cuong.quoc.nguyen@gmail.com', '890123', '2026-06-24 19:18:05', '2026-06-26 23:00:00', 0);

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
  ADD KEY `fk_khongian_chinhanh` (`ID_CHI_NHANH`);

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
  ADD PRIMARY KEY (`ID_THANHTOAN`);

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
  MODIFY `ID_GIA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `chinhanh`
--
ALTER TABLE `chinhanh`
  MODIFY `ID_CHI_NHANH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `chitiet_thietbi`
--
ALTER TABLE `chitiet_thietbi`
  MODIFY `ID_CT_TB` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT cho bảng `danhmucghe`
--
ALTER TABLE `danhmucghe`
  MODIFY `ID_DANHMUC` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `ghe`
--
ALTER TABLE `ghe`
  MODIFY `ID_GHE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `hoadon`
--
ALTER TABLE `hoadon`
  MODIFY `ID_HOADON` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `khonggian`
--
ALTER TABLE `khonggian`
  MODIFY `ID_KHONG_GIAN` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `lichdat`
--
ALTER TABLE `lichdat`
  MODIFY `ID_LICH_DAT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `IDND` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  MODIFY `ID_THANHTOAN` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `thietbi`
--
ALTER TABLE `thietbi`
  MODIFY `ID_THIET_BI` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  MODIFY `ID_THONGBAO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT cho bảng `xacthucotp`
--
ALTER TABLE `xacthucotp`
  MODIFY `ID_OTP` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

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
  ADD CONSTRAINT `fk_khongian_chinhanh` FOREIGN KEY (`ID_CHI_NHANH`) REFERENCES `chinhanh` (`ID_CHI_NHANH`);

--
-- Các ràng buộc cho bảng `lichdat`
--
ALTER TABLE `lichdat`
  ADD CONSTRAINT `FK_LichDat_Ghe` FOREIGN KEY (`ID_GHE`) REFERENCES `ghe` (`ID_GHE`),
  ADD CONSTRAINT `FK_LichDat_KhongGian` FOREIGN KEY (`ID_KHONG_GIAN`) REFERENCES `khonggian` (`ID_KHONG_GIAN`),
  ADD CONSTRAINT `FK_LichDat_NguoiDung` FOREIGN KEY (`IDND`) REFERENCES `nguoidung` (`IDND`);

--
-- Các ràng buộc cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD CONSTRAINT `FK_ThongBao_NguoiDung` FOREIGN KEY (`IDND`) REFERENCES `nguoidung` (`IDND`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
