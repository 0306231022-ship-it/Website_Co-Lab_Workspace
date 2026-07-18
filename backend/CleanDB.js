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
    // Tác vụ 1: Thay đổi trạng thái chi nhánh(nếu có)
    try {
        const CapNhat = await ChiNhanhModel.ChuyenTrangThai();
        if(CapNhat){
             const thongbao= await thongBaoModel.create('Cập nhật trạng thái chi nhánh', 'Vui lòng kiểm tra tra lại thông tin chi nhánh đã được cập nhật', 4, 1);
             if(!thongbao) console.log('Vui lòng kiểm tra lại hệ thống!')
        }
    } catch (error) {
        console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
    }
    // Tác vụ 2: xóa mã OTP đã hết hạn
    try {
        await XacThucOTPModel.XoaOTP_HetHan();
    } catch (error) {
         console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
    }
    // Tác vụ 3: Thay đổi trạng thái không gian
  try {
    const [chi1, chitiet2] = await Promise.all([
        KhongGianModel.Mokhonggian(),
        KhongGianModel.khoa_khonggian()
    ]);
    const coThayDoiMo = chi1 && chi1.length > 0;
    const coThayDoiKhoa = chitiet2 && chitiet2.length > 0;
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
        const thongbao = await thongBaoModel.create('Cập nhật trạng thái chi nhánh tự động', noiDungChiTiet, 4, 1);
        if (!thongbao) {
            console.log('Vui lòng kiểm tra lại hệ thống lưu thông báo!');
        } 
    } else {
        console.log('--- [Cron Job] Quét không gian hoàn tất: Không có thay đổi nào về trạng thái. ---');
    }

} catch (error) {
     console.error('Lỗi thực thi tác vụ 15 phút:', error.message);
}

}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" 
});
//Quét 1 phút 1 lần
cron.schedule('* * * * *', async () => {
     const ID_ADMIN = 1;
      // Tác vụ 1: Thông báo lịch đặt trước 15p
    try {
        const kiemtra = await DatLichModel.lichDatTruoc15p();
        if (kiemtra && kiemtra.length > 0) {
            const noiDungChiTiet = "Bạn có lịch đặt chỗ sắp diễn ra trong 15 phút tới. Vui lòng chuẩn bị thời gian!";
            const danhSachIdLoi = [];
            await Promise.all(kiemtra.map(async (id_nd) => {
                if (id_nd === null || id_nd === undefined) return;
                 const kq = await thongBaoModel.create('Nhắc nhở lịch đặt sắp diễn ra', noiDungChiTiet, 4, id_nd);
                if (!kq) {
                    danhSachIdLoi.push(id_nd);
                }
            }));
            if (danhSachIdLoi.length > 0) {
                const noiDungBaoAdmin = `Hệ thống gặp lỗi khi gửi thông báo nhắc lịch 15 phút cho các khách hàng có ID: ${danhSachIdLoi.join(', ')}. Vui lòng kiểm tra lại hệ thống!`;
                const kq = await thongBaoModel.create('HỆ THỐNG LỖI: Không thể gửi thông báo khách hàng', noiDungBaoAdmin, 5, ID_ADMIN || null);
                if (!kq) {
                    console.log('Vui lòng kiểm tra hệ thống gửi thông báo!');
                }
            } 
        }
    } catch (error) {
        console.error("Lỗi trong quá trình quét và tạo thông báo tự động (Tác vụ 1):", error);
    }
    // Tác vụ 2: Thông báo lịch đặt kết thúc trước 15p
    try {
        const kiemtra = await DatLichModel.lichDatKetThucTruoc15p();
        if (kiemtra && kiemtra.length > 0) {
            const noiDungChiTiet = "Bạn có lịch đặt chỗ sắp kết thúc trong 15 phút tới. Vui lòng chuẩn bị thời gian!";
            const danhSachIdLoi = [];
            await Promise.all(kiemtra.map(async (id_nd) => {
                if (id_nd === null || id_nd === undefined) return;
                const kq = await thongBaoModel.create('Nhắc nhở lịch đặt sắp kết thúc!', noiDungChiTiet, 4, id_nd);
                if (!kq) {
                    danhSachIdLoi.push(id_nd);
                }
            }));
            if (danhSachIdLoi.length > 0) {
                const noiDungBaoAdmin = `Hệ thống gặp lỗi khi gửi thông báo nhắc lịch kết thúc 15 phút cho các khách hàng có ID: ${danhSachIdLoi.join(', ')}. Vui lòng kiểm tra lại hệ thống!`;
                const kq = await thongBaoModel.create('HỆ THỐNG LỖI: Không thể gửi thông báo khách hàng', noiDungBaoAdmin, 5, ID_ADMIN || null);
                if (!kq) {
                    console.log('Vui lòng kiểm tra hệ thống gửi thông báo!');
                }
            } 
        }
    } catch (error) {
        console.error("Lỗi trong quá trình quét và tạo thông báo tự động (Tác vụ 2):", error);
    }
    // tác vụ 3: Hủy đơn nếu không check-in trước 5p
    try {
        const danhSachLichQuaHan = await DatLichModel.LayDanhSachLichChuaCheckinQuaHan();
        if (danhSachLichQuaHan && danhSachLichQuaHan.length > 0) {
            for (const lich of danhSachLichQuaHan) {
                const thanhCong = await DatLichModel.HuyLichTheoId(lich.ID_LICH_DAT);
                if (thanhCong) {
                    await thongBaoModel.create(`HỆ THỐNG: Lịch đặt #${lich.ID_LICH_DAT} đã bị hủy`, `Lịch đặt của khách hàng đã bị hủy tự động vì quá giờ mà không check-in!`,5, ID_ADMIN || null);
                    await thongBaoModel.create('Lịch đặt của bạn đã bị hủy','Lịch đặt đã bị hệ thống hủy tự động do bạn không check-in đúng giờ.', 5,lich.IDND);
                }
            }
        }
    } catch (error) {
        console.error("Lỗi trong quá trình tìm lịch chưa check-in và tạo thông báo tự động:", error);
    }
    // Tác vụ 4: Hủy đơn nếu quá 15 không thanh toán 
    try {
        const danhsach = await DatLichModel.LichDat_ChuaThanhToan_sau15p();
        const mangID_LichDat = rows.map(item => item.ID_LICH_DAT);
        const danhSachIdLoi = [];
        await Promise.all(mangID_LichDat.map(async (id_nd) => {
            if (id_nd === null || id_nd === undefined) return;
            const HuyDon = await DatLichModel.HuyDon(id_nd);
            if(!HuyDon){
                danhSachIdLoi.push(id_nd);
            }
        }))
        if (danhSachIdLoi.length > 0) {
            const noiDungBaoAdmin = `Hệ thống gặp lỗi khi hủy đơn ID: ${danhSachIdLoi.join(', ')}. Vui lòng kiểm tra lại hệ thống!`;
            const kq = await thongBaoModel.create('HỆ THỐNG LỖI: Không thể hủy đơn do chưa thanh toán', noiDungBaoAdmin, 5, ID_ADMIN || null);
            if (!kq) console.log('Vui lòng kiểm tra hệ thống gửi thông báo!');
        }
        const mangID_nd = rows.map(item => item.IDND);
        await Promise.all(mangID_nd.map(async (id_nd) => {
            const noiDungBaoAdmin = `Hệ thống đã hủy đơn của bạn do bạn chưa thanh toán!`;
            const kq = await thongBaoModel.create('Thống báo về đơn hàng cúa bạn', noiDungBaoAdmin, 5, id_nd || null);
             if (!kq) console.log('Vui lòng kiểm tra hệ thống gửi thông báo!');
        }))
    } catch (error) {
        console.error("Lỗi trong quá trình hủy đơn do chưa thanh toán quá thời gian quy định:", error);
    }
},{
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" 
})


console.log('Cron Job đã được kích hoạt...');

