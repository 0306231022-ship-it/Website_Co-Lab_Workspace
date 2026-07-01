import cron from 'node-cron';
import ChiNhanhModel from './models/ChiNhanhModel';
import KhongGianModel from './models/KhongGianModel';

    //0 0 0 * * * 12h đêm mỗi ngày'
    // 5s 1 lần : '*/5 * * * * *'
    // 15 phút 1 lần : '0 */15 * * * *'
 
cron.schedule('*/15 * * * *', async () => {
    console.log(`--- [${new Date().toLocaleTimeString()}] Đang kiểm tra ---`);
    // Khóa chi nhánh để bảo trì
    try {
        const [result1,result2] = await Promise.all([
            ChiNhanhModel.Khoa_chinhanh(),
            KhongGianModel.khoa_khonggian()
        ]) 
        if(result){
            //khóa đặt phòng/ghế thuộc chi nhánh, không gian
        }
    } catch (error) {
        console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
    }
    // Mở chi nhánh hoạt động
    try {
        const [mo1,mo2] = await Promise.all([
            ChiNhanhModel.MoChiNhanh(),
            KhongGianModel.Mokhonggian(),
        ]);
        

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
