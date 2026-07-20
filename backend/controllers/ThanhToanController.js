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
    const id = req.query.id;
    
    try {
        if (!id) {
            return res.status(400).json({ success: false, message: 'Thiếu tham số lịch đặt!' });
        }
        
        const kiemtra_lichdat = await DatLichModel.kiemtraid(id);
        if (!kiemtra_lichdat) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt!' });
        }

      
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
       
        const kiemtra = await DatLichModel.kiemtraid(id);
        if(!kiemtra){
            io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-thanhtoan', {
                success: false,
                message: "Không tồn tại lịch đặt này!"
            });
            res.end();
            return;
        }

        // 2. Kiểm tra xem lịch này đã được thanh toán trước đó chưa
        const dathanhtoan = await hoadonModel.kiemtraid_hoadon(id);
        if (dathanhtoan) {
            io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-thanhtoan', {
                success: false,
                message: "Hóa đơn đã được thanh toán trước đó!"
            });
            res.end();
            return;
        }
        
        // 3. Xử lý dữ liệu VNPay và kiểm tra chữ ký bảo mật (CheckSum)
        let vnp_Params = { ...req.query };
        const secureHash = vnp_Params['vnp_SecureHash'];
        
        // Loại bỏ các tham số không tham gia vào chuỗi ký băm SHA512
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        delete vnp_Params['id']; // 🌟 Xóa tham số id tự chế để tránh lệch chữ ký

        // Sắp xếp các tham số còn lại theo thứ tự bảng chữ cái alphabet của Key
        const sortedKeys = Object.keys(vnp_Params).sort();
        let signData = "";

        // Tự dựng chuỗi dữ liệu ký chuẩn hóa theo thuật toán của VNPay (thay thế hoàn toàn thư viện qs)
        sortedKeys.forEach((key, index) => {
            if (index === sortedKeys.length - 1) {
                signData += encodeURIComponent(key) + '=' + encodeURIComponent(vnp_Params[key]).replace(/%20/g, "+");
            } else {
                signData += encodeURIComponent(key) + '=' + encodeURIComponent(vnp_Params[key]).replace(/%20/g, "+") + '&';
            }
        });

        // Thực hiện băm chuỗi bằng mã bảo mật VNP_HASHSECRET
        const secretKey = process.env.VNP_HASHSECRET; 
        const hmac = crypto.createHmac("sha512", secretKey);
        const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
        
        // Kiểm tra hai chữ ký hash có khớp nhau không
        if (secureHash !== checkSum) {
            console.error("❌ Lỗi: Chữ ký không khớp! checkSum tính ra:", checkSum, " - secureHash của VNPay:", secureHash);
            io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-thanhtoan', {
                success: false,
                message: "Sai chữ ký bảo mật. Vui lòng kiểm tra lại thông tin!"
            });
            res.end();
            return;
        }
        
    
        const idlichdat = parseInt(vnp_Params['vnp_TxnRef']); 
        const maGiaoDich = vnp_Params['vnp_TransactionNo'];
        const maNganHang = vnp_Params['vnp_BankCode'];
        const soTienVnPay = parseFloat(vnp_Params['vnp_Amount']) / 100; // Chia 100 ra số tiền thực tế
    
        if (vnp_ResponseCode === '00'){
            // Tạo hóa đơn trong hệ thống database
            const them = await hoadonModel.create(soTienVnPay, idlichdat);
            console.log("Hóa đơn mới tạo:", them);
            
            if (them === null) {
                io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-thanhtoan', {
                    success: false,
                    message: "Tạo hóa đơn thất bại. Vui lòng kiểm tra thông tin!"
                });
                res.end();
                return;
            }
            const themthanhtoan = await ThanhToanModal.Them(maGiaoDich, maNganHang, soTienVnPay, 1, them);
            if (!themthanhtoan) {
                io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-thanhtoan', {
                    success: false,
                    message: "Ghi nhận lịch sử thanh toán thất bại!"
                });
                res.end();
                return;
            }
            io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-thanhtoan', {
                success: true,
                message: "Bạn đã thanh toán thành công!"
            });
            res.end();
            return;

        } else {
            io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-thanhtoan', {
                success: false,
                message: `Thanh toán thất bại! Mã lỗi: ${vnp_ResponseCode}`
            });
            res.end();
            return;
        }

    } catch (error) {
        console.error("❌ Hệ thống gặp exception:", error);
        io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-thanhtoan', {
            success: false,
            message: "Hệ thống gặp lỗi trong quá trình xử lý thanh toán!"
        });
        res.end();
        return;
    }
}
}