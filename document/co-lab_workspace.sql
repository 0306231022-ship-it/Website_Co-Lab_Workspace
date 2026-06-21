-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 17, 2026 lúc 08:59 AM
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
-- Cấu trúc bảng cho bảng `chinhanh`
--

CREATE TABLE `chinhanh` (
  `ID_CHI_NHANH` int(11) NOT NULL,
  `TEN_CHI_NHANH` varchar(255) NOT NULL,
  `DIA_CHI` varchar(255) NOT NULL,
  `NGAY_NHAP` datetime DEFAULT NULL,
  `NGAY_BAO_TRI` datetime DEFAULT NULL,
  `TRANG_THAI` int(11) DEFAULT 1,
  `NGAY_HOAN_THANH` datetime DEFAULT NULL,
  `NGAY_TAO` datetime DEFAULT current_timestamp(),
  `NGAY_CAP_NHAT` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Cấu trúc bảng cho bảng `danhmuc_ghe`
--

CREATE TABLE `danhmuc_ghe` (
  `ID_DANHMUC` int(11) NOT NULL,
  `TEN_DANHMUC` varchar(255) NOT NULL,
  `TRANG_THAI` int(11) DEFAULT NULL,
  `ID_GIA` int(11) NOT NULL
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
  `TRANG_THAI` int(11) DEFAULT NULL,
  `ID_KHONG_GIAN` int(11) NOT NULL,
  `ID_DANH_MUC` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `gia`
--

CREATE TABLE `gia` (
  `ID_GIA` int(11) NOT NULL,
  `TEN_GIA` varchar(255) NOT NULL,
  `MOTA` text DEFAULT NULL,
  `NGAY_TAO` datetime DEFAULT NULL,
  `NGAY_CAP_NHAT` datetime DEFAULT NULL,
  `DON_GIA` decimal(13,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hoadon`
--

CREATE TABLE `hoadon` (
  `ID_HOADON` int(11) NOT NULL,
  `GIA_TIEN` decimal(13,2) NOT NULL,
  `NGAY_TAO` date NOT NULL,
  `TRANG_THAI` int(11) NOT NULL DEFAULT 0,
  `ID_LICHDAT` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khonggian`
--

CREATE TABLE `khonggian` (
  `ID_KHONG_GIAN` int(11) NOT NULL,
  `TEN_KHONG_GIAN` varchar(255) NOT NULL,
  `LOAI_KHONG_GIAN` int(11) DEFAULT NULL,
  `TRANG_THAI` int(11) DEFAULT NULL,
  `ID_GIA` int(11) DEFAULT NULL,
  `NGAY_TAO` datetime NOT NULL,
  `NGAY_CAP_NHAT` datetime DEFAULT NULL,
  `NGAY_BAO_TRI` datetime DEFAULT NULL,
  `NGAY_XONG` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lich_dat`
--

CREATE TABLE `lich_dat` (
  `ID_LICH_DAT` int(11) NOT NULL,
  `KHUNG_BATDAU` datetime NOT NULL,
  `KHUNG_KETTHUC` datetime NOT NULL,
  `NGAY_TAO` datetime DEFAULT current_timestamp(),
  `TRANG_THAI` int(11) NOT NULL DEFAULT 0,
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
  `NGAY_TAO` date DEFAULT NULL,
  `LOAIND` int(11) DEFAULT NULL,
  `TRANG_THAI` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thanhtoan`
--

CREATE TABLE `thanhtoan` (
  `ID_THANHTOAN` int(11) NOT NULL,
  `MA_GIAO_DICH` varchar(100) DEFAULT NULL,
  `MA_NGAN_HANG` varchar(100) DEFAULT NULL,
  `SO_TIEN` decimal(13,2) NOT NULL,
  `NGAY_TAO` date NOT NULL,
  `NGAY_THANH_TOAN` datetime DEFAULT NULL,
  `TRANG_THAI` int(11) NOT NULL DEFAULT 0
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
  `TRANG_THAI` int(11) NOT NULL DEFAULT 0,
  `LOAI_THONGBAO` int(11) DEFAULT NULL,
  `IDND` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

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
  ADD KEY `FK_CT_THIETBI_THIET_BI` (`ID_THIET_BI`),
  ADD KEY `FK_CT_THIETBI_KHONG_GIAN` (`ID_KHONG_GIAN`);

--
-- Chỉ mục cho bảng `danhmuc_ghe`
--
ALTER TABLE `danhmuc_ghe`
  ADD PRIMARY KEY (`ID_DANHMUC`),
  ADD KEY `FK_DANHMUCGHE_GIA` (`ID_GIA`);

--
-- Chỉ mục cho bảng `ghe`
--
ALTER TABLE `ghe`
  ADD PRIMARY KEY (`ID_GHE`),
  ADD KEY `FK_GHE_KHONG_GIAN` (`ID_KHONG_GIAN`);

--
-- Chỉ mục cho bảng `gia`
--
ALTER TABLE `gia`
  ADD PRIMARY KEY (`ID_GIA`);

--
-- Chỉ mục cho bảng `hoadon`
--
ALTER TABLE `hoadon`
  ADD PRIMARY KEY (`ID_HOADON`),
  ADD KEY `FK_HOADON_LICHDAT` (`ID_LICHDAT`);

--
-- Chỉ mục cho bảng `khonggian`
--
ALTER TABLE `khonggian`
  ADD PRIMARY KEY (`ID_KHONG_GIAN`);

--
-- Chỉ mục cho bảng `lich_dat`
--
ALTER TABLE `lich_dat`
  ADD PRIMARY KEY (`ID_LICH_DAT`),
  ADD KEY `FK_LICHDAT_KHONG_GIAN` (`ID_KHONG_GIAN`),
  ADD KEY `FK_LICHDAT_GHE` (`ID_GHE`),
  ADD KEY `FK_LICHDAT_NGUOIDUNG` (`IDND`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`IDND`),
  ADD UNIQUE KEY `UQ_EMAIL` (`EMAIL`);

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
  ADD KEY `FK_THONGBAO_NGUOIDUNG` (`IDND`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

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
-- AUTO_INCREMENT cho bảng `danhmuc_ghe`
--
ALTER TABLE `danhmuc_ghe`
  MODIFY `ID_DANHMUC` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `ghe`
--
ALTER TABLE `ghe`
  MODIFY `ID_GHE` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `gia`
--
ALTER TABLE `gia`
  MODIFY `ID_GIA` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT cho bảng `lich_dat`
--
ALTER TABLE `lich_dat`
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
-- Các ràng buộc cho bảng `chitiet_thietbi`
--
ALTER TABLE `chitiet_thietbi`
  ADD CONSTRAINT `FK_CT_THIETBI_KHONG_GIAN` FOREIGN KEY (`ID_KHONG_GIAN`) REFERENCES `khonggian` (`ID_KHONG_GIAN`),
  ADD CONSTRAINT `FK_CT_THIETBI_THIET_BI` FOREIGN KEY (`ID_THIET_BI`) REFERENCES `thietbi` (`ID_THIET_BI`);

--
-- Các ràng buộc cho bảng `danhmuc_ghe`
--
ALTER TABLE `danhmuc_ghe`
  ADD CONSTRAINT `FK_DANHMUCGHE_GIA` FOREIGN KEY (`ID_GIA`) REFERENCES `gia` (`ID_GIA`);

--
-- Các ràng buộc cho bảng `ghe`
--
ALTER TABLE `ghe`
  ADD CONSTRAINT `FK_GHE_KHONG_GIAN` FOREIGN KEY (`ID_KHONG_GIAN`) REFERENCES `khonggian` (`ID_KHONG_GIAN`);

--
-- Các ràng buộc cho bảng `hoadon`
--
ALTER TABLE `hoadon`
  ADD CONSTRAINT `FK_HOADON_LICHDAT` FOREIGN KEY (`ID_LICHDAT`) REFERENCES `lich_dat` (`ID_LICH_DAT`);

--
-- Các ràng buộc cho bảng `lich_dat`
--
ALTER TABLE `lich_dat`
  ADD CONSTRAINT `FK_LICHDAT_GHE` FOREIGN KEY (`ID_GHE`) REFERENCES `ghe` (`ID_GHE`),
  ADD CONSTRAINT `FK_LICHDAT_KHONG_GIAN` FOREIGN KEY (`ID_KHONG_GIAN`) REFERENCES `khonggian` (`ID_KHONG_GIAN`),
  ADD CONSTRAINT `FK_LICHDAT_NGUOIDUNG` FOREIGN KEY (`IDND`) REFERENCES `nguoidung` (`IDND`);

--
-- Các ràng buộc cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD CONSTRAINT `FK_THONGBAO_NGUOIDUNG` FOREIGN KEY (`IDND`) REFERENCES `nguoidung` (`IDND`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
