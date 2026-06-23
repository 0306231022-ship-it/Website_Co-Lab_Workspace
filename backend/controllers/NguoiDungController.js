import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import NguoiDungModel from '../models/NguoiDungModel.js';
import XacThucOTPModel from '../models/XacThucOTPModel.js';
import { body, validationResult } from 'express-validator';
import { taoMaOTP , guiEmailOTP , generateToken } from '../function.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const PASSWORD_HASH_ROUNDS = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10;

export default class NguoiDungController{
      static async XacThucOTP(req, res) {
         /*{
            Email: "",
            TrangThai:
            1: kiểm tra tồn tại
            2: kiểm tra không tonnf tại
         }*/
         try {
            const { Email ,TrangThai } = req.body;
            const user = await NguoiDungModel.findByEmail(Email);
            if(TrangThai===1){
               if (user) {
                  return res.status(404).json({
                     success: false,
                     message: 'Người dùng đã tồn tại!'
                });
               }
            }else{
               if (!user) {
                  return res.status(404).json({
                     success: false,
                     message: 'Người dùng không tồn tại!'
                  });
               }
            }
             const maOTP = taoMaOTP();
             const otpResult = await XacThucOTPModel.ThemOTP(Email, maOTP);
             if (!otpResult) {
               return res.status(500).json({
                  success: false,
                  message: 'Qúa trình tạo OTP thất bại, vui lòng thử lại sau!'
               });
            }
             const emailResult = await guiEmailOTP(Email, maOTP);
             if (!emailResult.success) {
               return res.status(500).json({
                  success: false,
                  message: 'Gửi email xác thực thất bại!'
               });
            }
            return res.status(200).json({
               success: true,
               message: 'Vui lòng check email để nhập mã OTP',
            });
         } catch (error) {
            return res.status(500).json({
               success: false,
               message: 'Xác thực OTP thất bại: ' + error.message
            });
         }
      }
      static async DangNhap(req, res) {
         /*{
            Email: "",
            MatKhau: ""
         }*/
        try {
         const { Email, MatKhau } = req.body;
         await Promise.all([
            body('Email').isEmail().withMessage('Email không hợp lệ').run(req),
            body('MatKhau').notEmpty().withMessage('Mật khẩu không được để trống').run(req),
         ]);
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json({
               success: false,
               message: 'Dữ liệu không hợp lệ!',
               errors: errors.array().map(err => err.msg)
            });
         }
         const user = await NguoiDungModel.findByEmail(Email);
         if (!user) {
            return res.status(404).json({
               success: false,
               message: 'Người dùng không tồn tại!'
            });
         }
         const isPasswordValid = await compare(MatKhau, user.MAT_KHAU);
         if (!isPasswordValid) {
            return res.status(401).json({
               success: false,
               message: 'Mật khẩu không chính xác!'
            });
         }
         const token = generateToken(user);
         return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            ThongTin_NguoiDung: {
               IDND: user.IDND,
               TENND: user.TENND,
               LOAIND: user.LOAIND
            },
            token
         });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Đăng nhập thất bại: ' + error.message
            });
        }
      }
      static async DangKy(req, res) {
         /*{
            TenND: "admin",
            Email: "",
            MatKhau: "123456",
            XacNhanMatKhau: "123456",
            OTP: "123456"
         }*/
        try {
         const { TenND, Email, MatKhau, XacNhanMatKhau ,OTP } = req.body;
         await Promise.all([
            body('TenND').notEmpty().withMessage('Tên người dùng không được để trống').run(req),
            body('Email').isEmail().withMessage('Email không hợp lệ').run(req),
            body('Email').custom(async (value) => {
               const existingUser = await NguoiDungModel.findByEmail(value);
               if (existingUser) {
                  throw new Error('Email đã tồn tại');
               }
               return true;
            }).run(req),
            body('MatKhau').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự').run(req),
            body('XacNhanMatKhau').notEmpty().withMessage('Xác nhận mật khẩu không được để trống').run(req),
            body('XacNhanMatKhau').custom((value, { req }) => {
              if (value !== req.body.MatKhau) {
                  throw new Error('Xác nhận mật khẩu không khớp');
               }
               return true;
            }).run(req),
            body('OTP').notEmpty().withMessage('Mã OTP không được để trống').run(req),
            body('OTP').custom(async (value, { req }) => {
               const otpRecord = await XacThucOTPModel.findByEmail(Email);
               if (!otpRecord) {
                   throw new Error('Yêu cầu xác thực không tồn tại hoặc đã bị hủy.');
               }
               if (otpRecord.SO_LAN_SAI >= 5) {
                  throw new Error('Bạn đã nhập sai OTP quá nhiều lần. Vui lòng yêu cầu mã mới.');
               }
               const kiemtra_thoigian_het_han = new Date(otpRecord.NGAY_HET_HAN) < new Date();
               if (kiemtra_thoigian_het_han) {
                  throw new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
               }
               if (otpRecord.MA_OTP !== value) {
                  await XacThucOTPModel.TangSoLanSai(Email);
                  throw new Error('Mã OTP không chính xác. Vui lòng thử lại.');
               }  
               return true;
            }).run(req),
         ]);
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json({
               success: false,
               message: 'Dữ liệu không hợp lệ!',
               errors: errors.array().map(err => err.msg)
            });
         };
         const matKhauHash = await hash(MatKhau, PASSWORD_HASH_ROUNDS);
         const existingUser = await NguoiDungModel.DangKy(TenND, Email, matKhauHash);
         if (!existingUser) {
            return res.status(500).json({
               success: false,
               message: 'Đăng ký thất bại, vui lòng thử lại sau!'
            });
         }
         const xoa = await XacThucOTPModel.XoaOTP(Email);
         if(!xoa){
            return res.status(500).json({
               success:false,
               message:'Lỗi hệ thống khi xóa dữ liệu OTP!'
            })
         }
         return res.status(200).json({
               success: true,
               message: 'Đăng ký thành công! Vui đăng nhâp để tiếp tục trải nghiệm',
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Đăng ký thất bại: ' + error.message
            });
        }
      }
      static async DangXuat(req, res) {

      }
      static async ThongTin_NguoiDung(req, res) {

      }
      static async ChinhSua_NguoiDung(req, res) {

      }
      static async ChinhSua_TrangThai_NguoiDung(req, res) {
         
      }
      static async QuenMatKhau(req, res) {
         /*{
            Email:'',
            MatKhauMoi:'',
            XacNhanMatKhau: '',
            OTP:
         }*/
         const dulieu = req.body;
         try {
            await Promise.all([
               body('Email').isEmail().withMessage('Email không được bỏ trống').run(req),
               body('MatKhauMoi').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự').run(req),
               body('XacNhanMatKhau').notEmpty().withMessage('Xác nhận mật khẩu không được để trống').run(req),
               body('XacNhanMatKhau').custom((value, { req }) => {
                  if (value !== dulieu.MatKhauMoi) {
                     throw new Error('Xác nhận mật khẩu không khớp');
                  }
                  return true;
               }).run(req),
               body('OTP').notEmpty().withMessage('Mã OTP không được để trống').run(req),
               body('OTP').custom(async (value, { req }) => {
               const otpRecord = await XacThucOTPModel.findByEmail(dulieu.Email);
                  if (!otpRecord) {
                     throw new Error('Yêu cầu xác thực không tồn tại hoặc đã bị hủy.');
                  }
                  if (otpRecord.SO_LAN_SAI >= 5) {
                     throw new Error('Bạn đã nhập sai OTP quá nhiều lần. Vui lòng yêu cầu mã mới.');
                  }
                  const kiemtra_thoigian_het_han = new Date(otpRecord.NGAY_HET_HAN) < new Date();
                  if (kiemtra_thoigian_het_han) {
                     throw new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
                  }
                  if (otpRecord.MA_OTP !== value) {
                     await XacThucOTPModel.TangSoLanSai(dulieu.Email);
                     throw new Error('Mã OTP không chính xác. Vui lòng thử lại.');
                  }  
                  return true;
               }).run(req),
            ]);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
               return res.status(400).json({
                  success: false,
                  message: 'Dữ liệu không hợp lệ!',
                  errors: errors.array().map(err => err.msg)
               });
            };
            const matKhauHash = await hash(dulieu.MatKhauMoi, PASSWORD_HASH_ROUNDS);
            const ketqua= await NguoiDungModel.CapNhatMatKhau(dulieu.Email,matKhauHash);
            if(!ketqua){
               return res.status(500).json({
                  success:false,
                  message:'Đổi mật khẩu thất bại!'
               })
            }
            const xoa = await XacThucOTPModel.XoaOTP(dulieu.Email);
            if(!xoa){
               return res.status(500).json({
                  success:false,
                  message:'Lỗi hệ thống khi xóa dữ liệu OTP!'
               })
            }
            return res.status(200).json({
               success: true,
               message: 'Đổi mật khẩu thành công! Vui đăng nhâp để tiếp tục trải nghiệm',
            });
         } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Đổi mật khẩu thất bại: ' + error.message
            });
         }
      }
      static async DoiMatKhau(req, res) {
         /*{
            MatKhauCu,
            MatKhauMoi,
            XacNhanMatKhau
         }*/
        try {
             const userId = req.user.id;
             const dulieu = req.body;
             await Promise.all([
               body('MatKhauCu').notEmpty().withMessage('Mật khẩu không được bỏ trống!').run(req),
               body('MatKhauCu').custom(async (value, { req }) => {
                   const user = await NguoiDungModel.findByid(userId);
                   if (!user) {
                    throw new Error('Người dùng không tồn tại!');
                  }
                  const isPasswordValid = await compare(dulieu.MatKhauCu, user.MAT_KHAU);
                  if (!isPasswordValid) {
                    throw new Error('Mật khẩu không chính xác!');
                  }
                  return true;
               }).run(req),
                body('MatKhauMoi').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự').run(req),
                body('MatKhauMoi').notEmpty().withMessage('Mật khẩu mới không được bỏ trống!').run(req),
                body('XacNhanMatKhau').notEmpty().withMessage('Xác nhận mật khẩu không được bỏ trống').run(req),
                body('XacNhanMatKhau').custom(async ( value , {req})=>{
                   if (value !== dulieu.MatKhauMoi) {
                     throw new Error('Xác nhận mật khẩu không khớp');
                  }
                  return true;
                }).run(req),
             ]);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
               return res.status(400).json({
                  success: false,
                  message: 'Dữ liệu không hợp lệ!',
                  errors: errors.array().map(err => err.msg)
               });
            };
            const matKhauHash = await hash(dulieu.MatKhauMoi, PASSWORD_HASH_ROUNDS);
            const CapNhat = await NguoiDungModel.CapNhatMatKhau_id(userId,matKhauHash);
            if(!CapNhat){
               return res.status(500).json({
                  success:true,
                  message: 'Đổi mật khẩu thất bại!'
               })
            }
            return res.status(200).json({
               success:true,
               message:'Đổi mật khẩu thành công!'
            })
        } catch (error) {
              return res.status(500).json({
                success: false,
                message: 'Đổi mật khẩu thất bại: ' + error.message
            });
        }
      }
      static async DanhSach_NguoiDung(req, res) {

      }
}
