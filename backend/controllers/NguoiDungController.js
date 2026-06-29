import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import NguoiDungModel from '../models/NguoiDungModel.js';
import XacThucOTPModel from '../models/XacThucOTPModel.js';
import { body, query, validationResult } from 'express-validator';
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
         console.log(req.body)
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
               validate: true,
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
      static async ThongTin_NguoiDung(req, res) {
          const userId = req.user.id;
          try {
            const ketqua= await NguoiDungModel.findByid(userId);
            if(!ketqua){
               return res.status(500).json({
                  success:false,
                  message:'Không thể lấy thông tin người dùng, Vui lòng kiểm tra lại!'
               })
            }
            return res.status(200).json({
               success:true,
               dulieu: ketqua
            })
          } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Đăng ký thất bại: ' + error.message
            });
          }
      }
      static async ChinhSua_NguoiDung(req, res) {
         //Cập nhật tên
         /*{
            TENND
         }*/
        const dulieu = req.body;
        const userId = req.user.id;
        try {
            await Promise.all([
               body('TENND')
                  .notEmpty().withMessage('Tên người dùng không được để trống')
                  .isLength({ max: 50 }).withMessage('Tối đa 50 ký tự!')
                  .run(req),
            ])
             const errors = validationResult(req);
             if (!errors.isEmpty()) {
                return res.status(400).json({
                  success: false,
                  message: 'Dữ liệu không hợp lệ!',
                  errors: errors.array().map(err => err.msg)
               });
            };
            const CapNhat = await NguoiDungModel.CapNhat_thongtin(userId,dulieu.TENND);
            if(!CapNhat){
               return res.status(500).json({
                  success:false,
                  message:'Cập nhật dữ liệu thất bại!'
               })
            }
            return res.status(200).json({
               success:true,
               message:'Cập nhật dữ liệu thành công!'
            })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Chỉnh sửa thông tin người dùng thất bại: ' + error.message
            });
        }
      }
      static async CapNhat_anhDaiDien(req,res){
        try {
         const userId = req.user.id;
         const files = req.files;
         let pathFile = files[0].filename;
         let DuongDan = 'uploads/DaiDien/' + pathFile;
            if(!pathFile){
               return res.json({
                  status:true,
                  message:'Lỗi tải ảnh!'
               })
            };
            const ketqua = await NguoiDungModel.CapNhat_Anh(userId,DuongDan);
            if(!ketqua){
               return res.status(500).json({
                  success:false,
                  message:'Cập nhật ảnh đại diện thất bại!'
               })
            }
            return res.status(200).json({
               success:true,
               message:'Cập nhật thành công ảnh đại diện!'
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Chỉnh sửa thông tin ảnh đại diện thất bại: ' + error.message
            });
        }
      }
      static async ChinhSua_TrangThai_NguoiDung(req, res) {
         /*{
            IDND,
            TrangThai
         }*/
        const DuLieu = req.body;
        try {
            await Promise.all([
               body('IDND')
               .notEmpty()
               .withMessage('IDND không được bỏ trống')
               .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
               .custom(async (value) => {
                  const kiemtra = await NguoiDungModel.findByid(value);
                  if(!kiemtra) throw new Error('Người dùng không tồn tại!');
                  return true
               })
               .run(req),
               body('TrangThai')
                  .notEmpty()
                  .withMessage('IDND không được bỏ trống')
                  .isIn([0, 1, '0', '1']).withMessage('Giá trị nhập vào chỉ được phép là số 0 hoặc 1!')
                  .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                  .run(req),
            ])
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
               return res.status(400).json({
                  success: false,
                  message: 'Dữ liệu không hợp lệ!',
                  errors: errors.array().map(err => err.msg)
               });
            };
            const chinhsua = await NguoiDungModel.ChinhSua_TrangThai(DuLieu.IDND,DuLieu.TrangThai);
            if(!chinhsua){
               return res.status(500).json({
                  success:false,
                  message:'Cập nhật trạng thái thất bại!'
               })
            }
            return res.status(200).json({
               success:true,
               message:'Cập nhật trạng thái người dùng thành công!'
            })
        } catch (error) {
          return res.status(500).json({
                success: false,
                message: 'Chỉnh sửa trạng thái thất bại: ' + error.message
            });
        }
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
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
         const offset = (page - 1) * limit;
         try {
            const ketqua = await NguoiDungModel.DSND(limit,offset);
            return res.status(200).json({
               success:true,
               DanhSach:ketqua.DanhSach,
               TongDanhSach:ketqua.TongDanhSach[0].total
            })
         } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Tải danh sách thất bại: ' + error.message
            });
         }
      }
      static async TimKiem_Ten(req,res){
         try {
            const DuLieu= req.query.Ten;
            await Promise.all([
               query('Ten').notEmpty().withMessage('Không đủ dữ liệu để tìm kiếm!').run(req),
            ])
             const errors = validationResult(req);
            if (!errors.isEmpty()) {
               return res.status(400).json({
                  success: false,
                  errors: errors.array().map(err => err.msg)
               });
            };
            const TimKiemdl = await NguoiDungModel.TimKiem(DuLieu);
            if(!TimKiemdl){
               return res.status(500).json({
                  success:false,
                  message:'Không tìm thấy người dùng!'
               })
            }
            return res.status(200).json({
               success:true,
               dulieu:TimKiemdl
            })
         } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Tìm kiếm người dùng thất bại: ' + error.message
            });
         }
      }
}
