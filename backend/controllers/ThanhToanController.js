import { body, query, validationResult } from 'express-validator';
import DatLichModel from '../models/LichDatModel.js';
import hoadonModel from '../models/hoadonModel.js';
import 'dotenv/config.js';
import moment from 'moment'
export default class ThanhToanController{
    static async ThanhToan(req,res){
        const id = req.query.id;
        const tongtien = req.query.TongTien;
        try {
            const kiemtra_lichdat = await DatLichModel.kiemtraid(id);
            if(!kiemtra_lichdat){
                return res.status(401).json({
                    success: false,
                    message: 'Không tìm thấy lịch đạt!'
                });
            }
            const kiemtra_hoadon = await hoadonModel.kiemtraid_hoadon(id);
            if(kiemtra_hoadon){
                return res.status(401).json({
                    success: false,
                    message:'Bạn đã thanh toán!'
                })
            }
            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');
            let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = process.env.vnp_TmnCode
            vnp_Params['vnp_Locale'] = 'vn';
            vnp_Params['vnp_CurrCode'] = 'VND';
            vnp_Params['vnp_TxnRef'] = id; 
        
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan lich dat ID: ' + id;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = tongtien * 100; // Tiền nhân 100 theo quy định VNPay
        vnp_Params['vnp_ReturnUrl'] = process.env.vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_BankCode'] = 'VNPAYQR'; // Ép hiển thị giao diện QR Code

        // HÀM BẮT BUỘC: Sắp xếp các tham số alphabet (A-Z) để VNPay không bắt lỗi chữ ký
        vnp_Params = sortObject(vnp_Params);

        // Tạo chuỗi mã hóa bảo mật HMAC-SHA512
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        // ĐÂY LÀ URL THANH TOÁN HOÀN CHỈNH
        const finalPaymentUrl = config.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

        // Tạo thêm ảnh QR từ URL trên để Frontend tiện hiển thị lên Modal luôn
        const qrCodeImage = await QRCode.toDataURL(finalPaymentUrl);
        return res.status(200).json({
            success: true,
            paymentUrl: finalPaymentUrl,
            qrCode: qrCodeImage
        });

        } catch (error) {
            return res.status(409).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi hệ thống!'
        });
        }
    }
}