import cron from 'node-cron';
import PhieuNhapModal from './models/PhieuNhapMoDel.js';
import DonHangModel from './models/DonHang.js';
import MaGiamGiaModel from './models/MaGiamGia.js';

cron.schedule('0 0 0 * * *', async () => {
    console.log('--- Bắt đầu tiến trình tự động 12h đêm ---');
    //0 0 0 * * * 12h đêm mỗi ngày'
    // 5s 1 lần : '*/5 * * * * *'
    // 15 phút 1 lần : '0 */15 * * * *'
    try {
        const XoaThungRac= await PhieuNhapModal.XoaPhieuNhap_ThungRac();
        if (XoaThungRac.ThanhCong)
            console.log('Xóa phiếu nhập trong thùng rác thành công!');
        else
            console.log('Xóa phiếu nhập trong thùng rác thất bại!');
        //==========================================================
        //Chuyển đổi TRANGTHAI mã giảm giá đã hết hạn
        const CapNhatTrangThai = await MaGiamGiaModel.ChuyenTrangThai_MaGiamGia();
        if (CapNhatTrangThai)
            console.log('Cập nhật trạng thái mã giảm giá hết hạn thành công!');
        else
            console.log('Cập nhật trạng thái mã giảm giá hết hạn thất bại!');

    } catch (error) {
        console.error('Lỗi khi thực hiện tác vụ tự động:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" 
});
cron.schedule('*/15 * * * *', async () => {
    console.log(`--- [${new Date().toLocaleTimeString()}] Đang kiểm tra đơn hàng hết hạn ---`);
    try {
        const result = await DonHangModel.XoaDonHang_Tam_HetHan();
        if (result && result.ThanhCong) {
            console.log('Kết quả: Hoàn tất kiểm tra.');
        }
    } catch (error) {
        console.error('Lỗi thực thi tác vụ 10 giây:', error.message);
    }
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" 
});

console.log('Cron Job đã được kích hoạt...');
// Chuyển trạng thái mã giảm giá đã hết hạn
// Chuyển trạng thái banner đã hết hạn
