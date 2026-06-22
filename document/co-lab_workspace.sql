-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 21, 2026 lúc 03:31 PM
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmucghe`
--

CREATE TABLE `danhmucghe` (
  `ID_DANHMUC` int(11) NOT NULL,
  `TEN_DANHMUC` varchar(255) NOT NULL,
  `TRANG_THAI` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `NGAY_XONG` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `IDND` int(11) NOT NULL,
  `TENND` varchar(50) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `MAT_KHAU` varchar(255) NOT NULL,
  `HINH_ANH` varchar(255) DEFAULT NULL,
  `NGAY_TAO` date DEFAULT curdate(),
  `LOAIND` int(11) DEFAULT 0,
  `TRANG_THAI` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thietbi`
--

CREATE TABLE `thietbi` (
  `ID_THIET_BI` int(11) NOT NULL,
  `TEN_THIET_BI` varchar(255) NOT NULL,
  `HINH_ANH` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD PRIMARY KEY (`ID_KHONG_GIAN`);

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
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `banggia`
--
ALTER TABLE `banggia`
  MODIFY `ID_GIA` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chinhanh`
--
ALTER TABLE `chinhanh`
  MODIFY `ID_CHI_NHANH` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chitiet_thietbi`
--
ALTER TABLE `chitiet_thietbi`
  MODIFY `ID_CT_TB` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhmucghe`
--
ALTER TABLE `danhmucghe`
  MODIFY `ID_DANHMUC` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `ghe`
--
ALTER TABLE `ghe`
  MODIFY `ID_GHE` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `hoadon`
--
ALTER TABLE `hoadon`
  MODIFY `ID_HOADON` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `khonggian`
--
ALTER TABLE `khonggian`
  MODIFY `ID_KHONG_GIAN` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lichdat`
--
ALTER TABLE `lichdat`
  MODIFY `ID_LICH_DAT` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `IDND` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thanhtoan`
--
ALTER TABLE `thanhtoan`
  MODIFY `ID_THANHTOAN` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thietbi`
--
ALTER TABLE `thietbi`
  MODIFY `ID_THIET_BI` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  MODIFY `ID_THONGBAO` int(11) NOT NULL AUTO_INCREMENT;

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
