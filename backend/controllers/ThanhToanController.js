import { body, query, validationResult } from 'express-validator';
import DatLichModel from '../models/LichDatModel.js';
import hoadonModel from '../models/hoadonModel.js';
import ThanhToanModal from '../models/ThanhToanModal.js';
import 'dotenv/config.js';
import moment from 'moment'
import crypto from 'crypto';
import { sortObject } from '../function.js';
import { io } from '../server.js';
import qs from 'qs';

export default class ThanhToanController {
 static async ThanhToan(req, res) {
    const id = req.query.id; // Đây là ID lịch đặt (ID_LICHDAT)
    
    try {
        if (!id) {
            return res.status(400).json({ success: false, message: 'Thiếu tham số lịch đặt!' });
        }
        
        const kiemtra_lichdat = await DatLichModel.kiemtraid(id);
        if (!kiemtra_lichdat) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt!' });
        }

        // Kiểm tra xem lịch đặt này thực sự đã có hóa đơn thành công chưa để chặn
        const dathanhtoan = await hoadonModel.kiemtraid_hoadon(id); 
        if (dathanhtoan) {
            return res.status(400).json({ success: false, message: 'Lịch đặt này đã được thanh toán trước đó!' });
        }

        const tongtien = await DatLichModel.DonGia_idlichdat(id);

        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');
        let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Tạo chuỗi timestamp ngẫu nhiên ngắt quãng (Ví dụ: 1719830122)
        const timeStamp = Math.floor(Date.now() / 1000); 

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = process.env.VNP_TMNCODE.trim(); 
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        
        // 🌟 CHIÊU THỨC QUAN TRỌNG: Ghép ID lịch đặt với timestamp ngẫu nhiên
        vnp_Params['vnp_TxnRef'] = `${id}_${timeStamp}`; 
        
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan lich dat ID ' + id; 
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.floor(Number(tongtien) * 100); 
        
        const baseUrl = process.env.VNP_RETURNURL.trim().replace(/\/$/, "");
        vnp_Params['vnp_ReturnUrl'] = `${baseUrl}/chi-tiet-lich-dat/${id}`; 
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;
        vnp_Params = sortObject(vnp_Params);

        // --- Đoạn code tạo chuỗi băm bảo mật SHA512 giữ nguyên như cũ của bạn ---
        let signData = "";
        let queryUrl = "";
        let isFirst = true;
        for (let key in vnp_Params) {
            if (vnp_Params.hasOwnProperty(key)) {
                let value = vnp_Params[key];
                if (isFirst) {
                    signData += encodeURIComponent(key) + "=" + encodeURIComponent(value);
                    queryUrl += encodeURIComponent(key) + "=" + encodeURIComponent(value);
                    isFirst = false;
                } else {
                    signData += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(value);
                    queryUrl += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(value);
                }
            }
        }
        signData = signData.replace(/%20/g, "+");
        queryUrl = queryUrl.replace(/%20/g, "+");

        let hmac = crypto.createHmac("sha512", process.env.VNP_HASHSECRET.trim()); 
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        const finalPaymentUrl = process.env.VNP_URL.trim() + '?' + queryUrl + '&vnp_SecureHash=' + signed;

        return res.status(200).json({ success: true, paymentUrl: finalPaymentUrl });

    } catch (error) {
        console.error("❌ Lỗi hệ thống thanh toán VNPAY:", error);
        return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi kết nối!' });
    }
}
  static async XacNhan_ThanhToan(req, res) {
    let id = req.query.id;
    try {
         const dathanhtoan = await hoadonModel.kiemtraid_hoadon(id); 
        if (dathanhtoan) {
             io.to(id).emit('thong-bao-thanhtoan', {
                    success: false,
                    message: "Hóa đơn đã được thanh toán trước đó!"
                })
        }
        let vnp_Params = { ...req.query };
        const secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        vnp_Params = sortObject(vnp_Params);
        const secretKey = process.env.VNP_HASHSECRET; 
        const signData = qs.stringify(vnp_Params, { encode: false });
       const hmac = crypto.createHmac("sha512", secretKey);
        const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
        if (secureHash !== checkSum) {
            io.to(id).emit('thong-bao-thanhtoan', {
                success: false,
                message: "Vui lòng kiểm tra thông tin"
            })
        }
        const idlichdat = parseInt(vnp_Params['vnp_TxnRef']); 
        const maGiaoDich = vnp_Params['vnp_TransactionNo'];
        const maNganHang = vnp_Params['vnp_BankCode'];
        const soTienVnPay = parseFloat(vnp_Params['vnp_Amount']) / 100; // Chia 100 lấy tiền thực tế
        const payDateRaw = vnp_Params['vnp_PayDate'];
        let formattedPayDate = null;
        if (payDateRaw && payDateRaw.length === 14) {
            formattedPayDate = `${payDateRaw.slice(0, 4)}-${payDateRaw.slice(4, 6)}-${payDateRaw.slice(6, 8)} ${payDateRaw.slice(8, 10)}:${payDateRaw.slice(10, 12)}:${payDateRaw.slice(12, 14)}`;
        } else {
            formattedPayDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Backup ngày hiện tại
        }
        if (vnp_ResponseCode === '00'){
            const them = await hoadonModel.create(soTienVnPay,idlichdat);
            if(them===null){
                io.to(id).emit('thong-bao-thanhtoan', {
                    success: false,
                    message: "Vui lòng kiểm tra thông tin"
                })
            }
            const themthanhtoan = await ThanhToanModal.Them(maGiaoDich,maNganHang,soTienVnPay,1,them);
            if(!themthanhtoan){
                 io.to(id).emit('thong-bao-thanhtoan', {
                    success: false,
                    message: "Vui lòng kiểm tra thông tin"
                 })
            }
             io.to(id).emit('thong-bao-thanhtoan', {
                success: true,
                message: "Bạn đã thanh toán thành công!"
             });
        }else{
             io.to(id).emit('thong-bao-thanhtoan', {
                success: false,
                message: "Thanh toán thất bại, Vui lòng kiểm tra lại!"
            })
        }
    } catch (error) {
        console.log(error)
         io.to(id).emit('thong-bao-thanhtoan', {
                success: false,
                message: "Thanh toán thất bại, Vui lòng kiểm tra lại!"
        })
    }
  }
}