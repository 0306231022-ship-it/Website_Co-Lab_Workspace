import cron from 'node-cron';
import ChiNhanhModel from './models/ChiNhanhModel.js';
import KhongGianModel from './models/KhongGianModel.js';
import thongBaoModel from './models/ThongBaoModels.js';


    //0 0 0 * * * 12h đêm mỗi ngày'
    // 5s 1 lần : '*/5 * * * * *'
    // 15 phút 1 lần : '0 */15 * * * *'
 
cron.schedule('*/15 * * * *', async () => {
    console.log(`--- [${new Date().toLocaleTimeString()}] Đang kiểm tra ---`);
    // Chuyển trangthai khi NGAY_CAP_NHAT = NOW()
    try {
        const CapNhat = await ChiNhanhModel.ChuyenTrangThai();
        if(CapNhat){
             const thongbao=  thongBaoModel.create('Cập nhật trạng thái chi nhánh', 'Vui lòng kiểm tra tra lại thông tin chi nhánh đã được cập nhật', 4, 1);
             if(!thongbao) console.log('Vui lòng kiểm tra lại hệ thống!')
        }
    } catch (error) {
        console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
    }
    
    

}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" 
});

console.log('Cron Job đã được kích hoạt...');
// Chuyển trạng thái mã giảm giá đã hết hạn
// Chuyển trạng thái banner đã hết hạn
