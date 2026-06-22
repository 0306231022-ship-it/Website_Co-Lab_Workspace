import { randomUUID, randomBytes } from 'crypto';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import NodeGeocoder from 'node-geocoder';
import nodemailer from 'nodemailer';

const options = {
  provider: 'openstreetmap',
};

const geocoder = NodeGeocoder(options);

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const PASSWORD_HASH_ROUNDS = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10;

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.IDND },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// ==================== CẤU HÌNH ĐỒNG BỘ TẠI ĐÂY ====================
const EMAIL_HE_THONG = 'dc01.nnh.2048ae@gmail.com'; 
const MAT_KHAU_UNG_DUNG = 'rusn pjlj rwhp xunn';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_HE_THONG, // Đăng nhập bằng Gmail cá nhân
    pass: MAT_KHAU_UNG_DUNG 
  }
});

export const taoMaOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const guiEmailOTP = async (emailNguoiNhan, maOTP) => {
  const mailOptions = {
    // Đảm bảo phần email trong dấu <> khớp 100% với user đăng nhập ở trên
    from: `"Hệ Thống Xác Thực" <${EMAIL_HE_THONG}>`,
    to: emailNguoiNhan,                                     
    subject: 'Mã xác thực OTP của bạn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px;">
        <h2 style="color: #333333; text-align: center;">MÃ XÁC THỰC (OTP)</h2>
        <p style="color: #666666; font-size: 16px;">Chào bạn,</p>
        <p style="color: #666666; font-size: 16px;">Đây là mã OTP của bạn để xác thực tài khoản. Mã này có hiệu lực trong vòng <b>5 phút</b>:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007bff;">${maOTP}</span>
        </div>
        <p style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Gửi mail thành công! ID tin nhắn:", info.messageId);
    return { 
      success: true, 
      messageId: info.messageId 
    };

  } catch (error) {
    console.error("Gửi mail thất bại lỗi là:", error.message);
    return { success: false, error: error.message };
  }
};






