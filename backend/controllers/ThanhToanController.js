import { body, query, validationResult } from 'express-validator';
import DatLichModel from '../models/LichDatModel.js';
import hoadonModel from '../models/hoadonModel.js';
import 'dotenv/config.js';
import moment from 'moment'
import crypto from 'crypto';
import { sortObject } from '../function.js';

export default class ThanhToanController {
  static async ThanhToan(req, res) {
    const id = req.query.id;
    const tongtien = req.query.TongTien;

    try {
        // 1. Kiểm tra đầu vào hợp lệ
        if (!id || !tongtien) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu tham số lịch đặt hoặc số tiền!'
            });
        }

        // 2. Kiểm tra lịch đặt sống/chết từ Model
        const kiemtra_lichdat = await DatLichModel.kiemtraid(id);
        if (!kiemtra_lichdat) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch đặt!'
            });
        }

        // 3. Kiểm tra xem lịch đặt này đã thanh toán chưa
        const kiemtra_hoadon = await hoadonModel.kiemtraid_hoadon(id);
        if (kiemtra_hoadon) {
            return res.status(400).json({
                success: false,
                message: 'Lịch đặt này đã hoàn tất thanh toán trước đó!'
            });
        }

        // 4. Khởi tạo mốc thời gian và IP của Client
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');
        let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // 5. Đóng gói bộ tham số truyền đi
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = process.env.VNP_TMNCODE.trim(); 
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = String(id); 
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan lich dat ID ' + id; // Dùng dấu cách bình thường
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.floor(Number(tongtien) * 100); 
        vnp_Params['vnp_ReturnUrl'] = process.env.VNP_RETURNURL.trim(); 
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;

        // Sắp xếp các key tham số tăng dần từ A-Z
        vnp_Params = sortObject(vnp_Params);

        // 6. XÂY DỰNG CHUỖI BĂM ĐỒNG BỘ THEO TIÊU CHUẨN VNPAY 2.1.0 (Bỏ qua thư viện qs)
        let signData = "";
        let queryUrl = "";
        let isFirst = true;

        for (let key in vnp_Params) {
            if (vnp_Params.hasOwnProperty(key)) {
                let value = vnp_Params[key];
                
                if (isFirst) {
                    // Cả 2 chuỗi đều phải encodeURIComponent theo đúng chuẩn mã hóa URL
                    signData += encodeURIComponent(key) + "=" + encodeURIComponent(value);
                    queryUrl += encodeURIComponent(key) + "=" + encodeURIComponent(value);
                    isFirst = false;
                } else {
                    signData += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(value);
                    queryUrl += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(value);
                }
            }
        }

        // Thay đổi các ký tự encode đặc biệt để khớp hoàn toàn với bộ máy mã hóa của VNPAY (.NET/Java)
        signData = signData.replace(/%20/g, "+");
        queryUrl = queryUrl.replace(/%20/g, "+");

        // 7. Thực hiện tạo chuỗi băm bảo mật SHA512
        let hmac = crypto.createHmac("sha512", process.env.VNP_HASHSECRET.trim()); 
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        // 8. Đóng gói URL cuối cùng gửi về Frontend
        const finalPaymentUrl = process.env.VNP_URL.trim() + '?' + queryUrl + '&vnp_SecureHash=' + signed;

        return res.status(200).json({
            success: true,
            paymentUrl: finalPaymentUrl
        });

    } catch (error) {
        console.error("❌ Lỗi hệ thống thanh toán VNPAY:", error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi kết nối với cổng thanh toán!'
        });
    }
  }
}