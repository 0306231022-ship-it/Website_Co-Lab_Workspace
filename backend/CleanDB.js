import cron from 'node-cron';
import ChiNhanhModel from './models/ChiNhanhModel.js';
import KhongGianModel from './models/KhongGianModel.js';
import thongBaoModel from './models/ThongBaoModels.js';
import XacThucOTPModel from './models/XacThucOTPModel.js';

    //0 0 0 * * * 12h đêm mỗi ngày'
    // 5s 1 lần : '*/5 * * * * *'
    // 15 phút 1 lần : '0 */15 * * * *'
 
cron.schedule('*/15 * * * *', async () => {
    console.log(`--- [${new Date().toLocaleTimeString()}] Đang kiểm tra ---`);
    // Chuyển trangthai khi NGAY_CAP_NHAT = NOW()
    try {
        const CapNhat = await ChiNhanhModel.ChuyenTrangThai();
        if(CapNhat){
             const thongbao= await thongBaoModel.create('Cập nhật trạng thái chi nhánh', 'Vui lòng kiểm tra tra lại thông tin chi nhánh đã được cập nhật', 4, 1);
             if(!thongbao) console.log('Vui lòng kiểm tra lại hệ thống!')
        }
    } catch (error) {
        console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
    }
    // xóa mã OTP đã hết hạn
    try {
        const xoaOTP = await XacThucOTPModel.XoaOTP_HetHan();
        if(!xoaOTP){
            const thongbao=  thongBaoModel.create('Hệ thống xác thực OTP thất bại', 'Hệ thống không thể xóa OTP đã hết han!', 4, 1);
            if(!thongbao) console.log('Vui lòng kiểm tra lại hệ thống!')
        }
    } catch (error) {
         console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
    }
    // Đổi trạng thái không gian
    try {
        const [chi1,chitiet2] = await Promise.all([
            KhongGianModel.Mokhonggian(),
            KhongGianModel.khoa_khonggian()
        ]);
        let chiTietMo = "";
        if (chi1 && chi1.length > 0) {
            chiTietMo = `🔓 Đã mở lại (${chi1.length}): ` + chi1.map(kg => kg.TEN_KHONG_GIAN).join(', ');
        }
        let chiTietKhoa = "";
        if (chitiet2 && chitiet2.length > 0) {
            chiTietKhoa = `🔒 Đã khóa bảo trì (${chitiet2.length}): ` + chitiet2.map(kg => kg.TEN_KHONG_GIAN).join(', ');
        }
        let noiDungChiTiet = "Hệ thống đã quét và cập nhật trạng thái vận hành các không gian tự động.\n";
        if (chiTietMo) noiDungChiTiet += chiTietMo + "\n";
        if (chiTietKhoa) noiDungChiTiet += chiTietKhoa + "\n";
        if (!chiTietMo && !chiTietKhoa) {
            noiDungChiTiet += "Không có thay đổi nào về trạng thái không gian.";
        }
        const thongbao = await thongBaoModel.create('Cập nhật trạng thái chi nhánh tự động', noiDungChiTiet, 4,1);
        if (!thongbao) {
            console.log('Vui lòng kiểm tra lại hệ thống lưu thông báo!');
        }
    } catch (error) {
         console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
    }

}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" 
});

console.log('Cron Job đã được kích hoạt...');

