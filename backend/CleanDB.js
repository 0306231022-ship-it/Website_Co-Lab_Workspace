import cron from 'node-cron';
import ChiNhanhModel from './models/ChiNhanhModel';

    //0 0 0 * * * 12h đêm mỗi ngày'
    // 5s 1 lần : '*/5 * * * * *'
    // 15 phút 1 lần : '0 */15 * * * *'
 
cron.schedule('*/15 * * * *', async () => {
    console.log(`--- [${new Date().toLocaleTimeString()}] Đang kiểm tra ---`);
    // Khóa chi nhánh để bảo trì
    try {
        const result = await ChiNhanhModel.Khoa_chinhanh();
        if(result){
            //khóa đặt phòng/ghế thuộc chi nhánh 
        }
    } catch (error) {
        console.error('Lỗi thực thi tác vụ 10 giây:', error.message);
    }
    // Mở chi nhánh hoạt động
    try {
        const mo = await ChiNhanhModel.MoChiNhanh();
        

    } catch (error) {
        
    }
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" 
});

console.log('Cron Job đã được kích hoạt...');
// Chuyển trạng thái mã giảm giá đã hết hạn
// Chuyển trạng thái banner đã hết hạn
