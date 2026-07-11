import cron from 'node-cron';
import ChiNhanhModel from './models/ChiNhanhModel.js';
import KhongGianModel from './models/KhongGianModel.js';
import thongBaoModel from './models/ThongBaoModels.js';
import XacThucOTPModel from './models/XacThucOTPModel.js';
import DatLichModel from './models/LichDatModel.js';

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
        await XacThucOTPModel.XoaOTP_HetHan();
    } catch (error) {
         console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
    }
    // Đổi trạng thái không gian
  try {
    const [chi1, chitiet2] = await Promise.all([
        KhongGianModel.Mokhonggian(),
        KhongGianModel.khoa_khonggian()
    ]);

    // Kiểm tra xem thực sự có sự thay đổi nào không
    const coThayDoiMo = chi1 && chi1.length > 0;
    const coThayDoiKhoa = chitiet2 && chitiet2.length > 0;

    // NẾU CÓ THAY ĐỔI THÌ MỚI XỬ LÝ VÀ GỬI THÔNG BÁO
    if (coThayDoiMo || coThayDoiKhoa) {
        let chiTietMo = "";
        if (coThayDoiMo) {
            chiTietMo = `🔓 Đã mở lại (${chi1.length}): ` + chi1.map(kg => kg.TEN_KHONGGIAN || kg.TEN_KHONG_GIAN).join(', ');
        }

        let chiTietKhoa = "";
        if (coThayDoiKhoa) {
            chiTietKhoa = `🔒 Đã khóa bảo trì (${chitiet2.length}): ` + chitiet2.map(kg => kg.TEN_KHONGGIAN || kg.TEN_KHONG_GIAN).join(', ');
        }

        let noiDungChiTiet = "Hệ thống đã quét và cập nhật trạng thái vận hành các không gian tự động.\n";
        if (chiTietMo) noiDungChiTiet += chiTietMo + "\n";
        if (chiTietKhoa) noiDungChiTiet += chiTietKhoa + "\n";

        // Thực hiện lưu thông báo vào database
        const thongbao = await thongBaoModel.create('Cập nhật trạng thái chi nhánh tự động', noiDungChiTiet, 4, 1);
        
        if (!thongbao) {
            console.log('Vui lòng kiểm tra lại hệ thống lưu thông báo!');
        } else {
            console.log('Đã gửi thông báo cập nhật trạng thái không gian thành công.');
        }
    } else {
        // Nếu không có thay đổi thì chỉ in log ra màn hình console để biết hệ thống vẫn đang chạy ngầm tốt
        console.log('--- [Cron Job] Quét không gian hoàn tất: Không có thay đổi nào về trạng thái. ---');
    }

} catch (error) {
     console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
}
    //Thông báo thời gian 
try {
    // 1. Phải có await để đợi database trả về mảng các IDND
    const dsUserIDs = await DatLichModel.getUpcomingUserIDs(); 
    
    // 2. Kiểm tra nếu có phần tử trong mảng
    if (dsUserIDs && dsUserIDs.length > 0) {
        
        // Tạo nội dung thông báo động hoặc cố định tùy bạn
        const noiDungChiTiet = "Bạn có lịch đặt chỗ sắp diễn ra trong 15 phút tới. Vui lòng chuẩn bị thời gian!";
        
        // 3. Đổi tên biến kết quả trả về thành kếtQua để tránh trùng với dsUserIDs
        const ketQua = await thongBaoModel.create(
            'Nhắc nhở lịch đặt sắp diễn ra', 
            noiDungChiTiet, 
            4, 
            dsUserIDs // Truyền mảng [1, 2, 3...] vào đây
        );
        
        console.log("Đã gửi thông báo tự động thành công:", ketQua);
    }
     
} catch (error) {
    console.error("Lỗi trong quá trình quét và tạo thông báo tự động:", error);
}

}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" 
});

console.log('Cron Job đã được kích hoạt...');

