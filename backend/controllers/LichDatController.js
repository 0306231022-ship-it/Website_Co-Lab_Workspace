import { body, query, validationResult } from 'express-validator';
import NguoiDungModel from '../models/NguoiDungModel.js';
import KhongGianModel from '../models/KhongGianModel.js';
import DatLichModel from '../models/LichDatModel.js';
import GheModel from '../models/gheModel.js';
import moment from 'moment'
import { io } from '../server.js';
export default class LichDatController{
    static async DatLich(req,res){
        const dulieu = req.body;
        const userId = req.user.id
        try {
            await Promise.all([
                body('KHUNG_BATDAU')
                    .notEmpty().withMessage('Thời gian bắt đầu không được để trống.')
                    .isISO8601().withMessage('Thời gian bắt đầu không đúng định dạng ngày tháng.')
                    .custom((value) => {
                        if (new Date(value) < new Date()) throw new Error('Không thể đặt lịch cho thời gian trong quá khứ.');
                        const formats = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD'];
                        const dateCheck = moment(value, formats, true);
                        if (!dateCheck.isValid()) throw new Error('thời gian bắt đầu không hợp lệ!');
                        return true;
                    })
                    .run(req),
                body('KHUNG_KETTHUC')
                    .notEmpty().withMessage('Thời gian kết thúc không được để trống.')
                    .isISO8601().withMessage('Thời gian kết thúc không đúng định dạng ngày tháng.')
                    .custom((value, { req }) => {
                        if (new Date(value) <= new Date(req.body.KHUNG_BATDAU)) throw new Error('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
                         const formats = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD'];
                        const dateCheck = moment(value, formats, true);
                        if (!dateCheck.isValid()) throw new Error('thời gian kết thúc không hợp lệ!');
                        return true;
                    })
                    .run(req),
                body().custom(async (body) => {
                    const { ID_KHONG_GIAN, ID_GHE } = body;
                    if (!ID_KHONG_GIAN && !ID_GHE) throw new Error('Vui lòng chọn Phòng họp hoặc Ghế ngồi.');
                    if( ID_KHONG_GIAN && ID_GHE)  throw new Error('Không thể vừa đặt Phòng họp vừa đặt Ghế ngồi cùng lúc.');
                    if(ID_KHONG_GIAN){
                        const kiemtra = await KhongGianModel.kiemtraid(ID_KHONG_GIAN);
                        if(!kiemtra) throw new Error('Phòng họp không tồn tại!');
                    }
                    if(ID_GHE){
                        const kiemtra2= await GheModel.testId(ID_GHE)
                        if(!kiemtra2) throw new Error('Ghế không tồn tại!');
                    }
                    return true;
                }).run(req)
            ])
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    validate:true,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            const DatLich = await DatLichModel.DatLich(dulieu,userId);
           
            
            if(!DatLich){
                return res.status(409).json({
                    success:false,
                    message:'Đặt lịch thất bại!'
                })
            }
            return res.status(200).json({
                success:true,
                ID_LICHDAT: DatLich,
                message:'Đặt lịch thành công!'
            })

        } catch (error) {
            return res.status(409).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi hệ thống!'
        });
        }
    }
    static async DanhSachDatLich(req,res){
        try {
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 3;
          const offset = (page - 1) * limit;
           await Promise.all([
                query('page')
                    .notEmpty()
                    .withMessage('Số lượng không được bỏ trống')
                    .isInt({ min: 0 })
                    .withMessage('Số trang phải là số nguyên và không được âm!')
                    .run(req),
           ]);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            const DanhSach = await DatLichModel.DanhSach(limit,offset);
            return res.status(200).json({
                success:true,
                danhsach:DanhSach.DanhSach,
                TongDanhSach:DanhSach.TongDanhSach
            })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Lấy danh sách thất bại: ' + error.message
            });
        }
    }
    static async LichSuDat_theoID_ghe(req,res){
        try {
           const page = parseInt(req.query.page) || 1;
           const IDGHE = parseInt(req.query.IDGHE)
          const limit = parseInt(req.query.limit) || 10;
          const offset = (page - 1) * limit;
          
           await Promise.all([
                query('page')
                    .notEmpty()
                    .withMessage('Số lượng không được bỏ trống')
                    .isInt({ min: 0 })
                    .withMessage('Số trang phải là số nguyên và không được âm!')
                    .run(req),
                 query('IDGHE')
                    .notEmpty().withMessage('id ghế không được bỏ trống!')
                    .isInt().withMessage('ID ghế phải là số nguyên')
                    .custom(async (value) => {
                        const check = await GheModel.testId(value);
                        if (!check) throw new Error('ID không tồn tại!');
                            return true;
                        })
                    .run(req),
           ]);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            const danhsach = await DatLichModel.DanhSach_theoIDGHE(limit, offset, IDGHE);
            return res.status(200).json({
                success:true,
                DanhSach:danhsach.DanhSach,
                TongSo:danhsach.TongSo
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lấy danh sách lịch sử đặt ghế thất bại: ' + error.message
            });
        }
    }
    static async LichDat_HoatDong(req,res){
        try {
            const lichdat = await DatLichModel.DanhSachDang_HoatDong();
            return res.status(200).json({
                success:true,
                DanhSach: lichdat
            })
        } catch (error) {
              return res.status(500).json({
                success: false,
                message: 'Lấy danh sách thất bại: ' + error.message
            });
        }
    }
    static async LichSuDat_theoIDND(req,res){
        const userId = req.user?.id || req.query?.id;
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 3;
            const offset = (page - 1) * limit;
            await Promise.all([
                query('page')
                    .notEmpty()
                    .withMessage('Số lượng không được bỏ trống')
                    .isInt({ min: 0 })
                    .withMessage('Số trang phải là số nguyên và không được âm!')
                    .run(req),
            ]);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            const lichsu = await DatLichModel.DanhSach_theoIDND(limit, offset, userId);
            return res.status(200).json({
                success: true,
                DanhSach: lichsu.DanhSach,
                TongSo: lichsu.TongSo
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lấy danh sách lịch sử đặt thất bại: ' + error.message
            });
        }
    }
    static async ChiTiet_LichDat_theoIDDL(req, res) {
        const id = req.query.id;
        const userId = req.user.id;
        try {
            const kiemtra = await DatLichModel.kiemtraid(id);
            if (!kiemtra) {
                return res.status(404).json({
                    success: false,
                    message: 'Lịch đặt không tồn tại.'
                });
            }
            const kiemtra2 = await DatLichModel.kiemtraidND(id, userId);
            if (!kiemtra2) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền truy cập chi tiết lịch đặt này.'
                });
            }
            const lichDat = await DatLichModel.ChiTiet_LichDat_theoIDDL(id);
            if (!lichDat.success) {
                return res.status(404).json({
                    success: false,
                    message: lichDat.message
                });
            }
            return res.status(200).json({
                success: true,
                lichDat :{
                    cHITiet_NguoiDung: lichDat.ChiTiet_NguoiDung,
                    ChiTiet_ThoiGian: lichDat.ChiTiet_ThoiGian,
                    ChiTiet_Ghe_KhongGian: lichDat.ChiTiet_Ghe_KhongGian,
                } 
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lấy chi tiết lịch đặt thất bại: ' + error.message
            });
        }
    }
    static async ChiTiet_LichDat_TheoID_phong(req,res){
        const idkg= req.query.IDKG;
        const page = req.query.page;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        try {
            const kiemtra = await KhongGianModel.kiemtraid(idkg);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message: 'Không tìm thấy ID không gian!'
                })
            }
            if(page<0 || page === ''){
                return res.status(401).json({
                    success:false,
                    message:'Vui lòng kiểm tra lại số trang!'
                })
            }
            const DanhSach = await DatLichModel.ChiTiet_LichDat_TheoID_phong(idkg , limit , offset);
            return res.status(200).json({
                success:true,
                DanhSach: DanhSach.DanhSach,
                TongDanhSach:DanhSach.TongDanhSach
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Không tìm thấy lịch đặt: ' + error.message
            });
        }
    }
    static async DanhSach_IDGHE_Ngay_HienTai(req,res){
        const id= req.query.ID_GHE;
        try {
            if(!id){
                return res.status(401).json({
                    success:false,
                    message:'Không tìm thấy id ghế!'
                })
            }
            const kiemtra = await GheModel.testId(id);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message:'id ghế không tồn tại!'
                })
            }
            const laykq= await DatLichModel.DanhSach_IDGHE_Ngay_HienTai(id);
            return res.status(200).json({
                success:true,
                dulieu:laykq
            })
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy lịch đặt: ' + error.message
            });
        }
    }
    static async LichDatGhe_TheoNgay(req,res){
        try {
             await Promise.all([
                query('THOIGIAN')
                    .notEmpty().withMessage('Thời gian bắt đầu không được để trống.')
                    .isISO8601().withMessage('Thời gian bắt đầu không đúng định dạng ngày tháng.')
                    .custom((value) => {
                        if (new Date(value) < new Date()) throw new Error('Không thể đặt lịch cho thời gian trong quá khứ.');
                        const formats = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD'];
                        const dateCheck = moment(value, formats, true);
                        if (!dateCheck.isValid()) throw new Error('thời gian bắt đầu không hợp lệ!');
                        return true;
                    })
                    .run(req),
                query('ID_GHE')
                    .notEmpty().withMessage('id ghế không được để trống.')
                    .isInt({ min: 1 }).withMessage('id ghế phải là một số nguyên hợp lệ.')
                    .custom(async (value, { req }) => {
                        const kiemtra = await GheModel.testId(value);
                        if(!kiemtra) throw new Error('ghế không tồn tại!');
                        return true;
                    })
                    .run(req),
            ])
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    validate:true,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            const kq = await DatLichModel.LichDatGhe_TheoNgay(req.query.ID_GHE,req.query.THOIGIAN);
            return res.status(200).json({
                success:true,
                dulieu:kq
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Không tìm thấy lịch đặt: ' + error.message
            });
        }
    }
    static async DanhSachLichDat_HienTai_KhongGian(req,res){
        const dulieu = req.query.IDKG;

        try {
            if(!dulieu){
                return res.status(401).json({
                    success:false,
                    message:'không tìm thấy ID không gian!'
                })
            }
            const kiemtra = await KhongGianModel.kiemtraid(dulieu);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message: 'ID không tồn tại!'
                })
            }
            const ketqua = await DatLichModel.LichDatKhongGian_HienTai(dulieu);
            return res.status(200).json({
                success:true,
                dulieu:ketqua
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Không tìm thấy lịch đặt: ' + error.message
            });
        }
    }
      static async LichDatKhongGian_TheoNgay(req,res){
        try {
             await Promise.all([
                query('THOIGIAN')
                    .notEmpty().withMessage('Thời gian bắt đầu không được để trống.')
                    .isISO8601().withMessage('Thời gian bắt đầu không đúng định dạng ngày tháng.')
                    .custom((value) => {
                        if (new Date(value) < new Date()) throw new Error('Không thể đặt lịch cho thời gian trong quá khứ.');
                        const formats = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD'];
                        const dateCheck = moment(value, formats, true);
                        if (!dateCheck.isValid()) throw new Error('thời gian bắt đầu không hợp lệ!');
                        return true;
                    })
                    .run(req),
                query('IDKG')
                    .notEmpty().withMessage('id không gian không được để trống.')
                    .isInt({ min: 1 }).withMessage('id không gian phải là một số nguyên hợp lệ.')
                    .custom(async (value, { req }) => {
                        const kiemtra = await KhongGianModel.kiemtraid(value)
                        if(!kiemtra) throw new Error('không gian không tồn tại!');
                        return true;
                    })
                    .run(req),
            ])
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    validate:true,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            const kq = await DatLichModel.LichDatKhongGian_TheoNgay(req.query.IDKG,req.query.THOIGIAN);
            return res.status(200).json({
                success:true,
                dulieu:kq
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Không tìm thấy lịch đặt: ' + error.message
            });
        }
    }
    static async thongke_lichdat(req,res){
        try {
            const thongke = await DatLichModel.thongke_lichdat();
            return res.status(200).json({
                success:true,
                dulieu : {
                    TONG:thongke.TONG,
                    HOATDONG:thongke.HOATDONG,
                    DOANHTHU:thongke.DOANHTHU
                }
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Thống kê lịch đặt thất bại: ' + error.message
            });
        }
    }
    static async Checkin(req,res){
        const id = req.query.id;
        try {
            const kiemtra = await DatLichModel.kiemtraid(id);
            if(!kiemtra){
                io.to(id).emit('thong-bao-checkin', {
                    success: false,
                    message: "Không tồn tại lịch đặt này!"
                });
            }
            const laythong_kiemtra = DatLichModel.ThongTin(id);
       const thongtin_batdau = moment(laythong_kiemtra.KHUNG_BATDAU).valueOf();
            const timeHienTai = new Date().getTime();
            const mocCheckInSom = thongtin_batdau - (15 * 60 * 1000);
            if (timeHienTai >= mocCheckInSom && timeHienTai <= thongtin_batdau) {
               const check = await DatLichModel.checkin(id);
               if(!check){
                    io.to(id).emit('thong-bao-checkin', {
                        success: false,
                        message: "Check-in thất bại! Vui lòng thực hiện trong giây lát"
            });
               }
               io.to(id).emit('thong-bao-checkin', {
                success: true,
                message: "Check-in thành công!"
            });
            } else if (timeHienTai < mocCheckInSom) {
                io.to(id).emit('thong-bao-checkout', {
                    success: false,
                    message: "Check-in trước 15p!"
                 });
            } 
        } catch (error) {
              return res.status(401).json({
                success: false,
                message: 'Check-in thất bại: ' + error.message
            });
        }
    }
    static async Checkout(req,res){
        const id = req.query.id;
        try {
            const kiemtra = await DatLichModel.kiemtraid(id);
            if(!kiemtra){
                io.to(id).emit('thong-bao-checkout', {
                success: true,
                message: "Vui lòng kiểm tra thông tin"
            });
            }
               const check = await DatLichModel.checkout(id);
               if(!check){
                    io.to(id).emit('thong-bao-checkout', {
                success: false,
                message: "Check-out thất bại!"
            });
               }
              io.to(id).emit('thong-bao-checkout', {
                success: true,
                message: "Check-out thành công!"
            });
          
        } catch (error) {
              return res.status(401).json({
                success: false,
                message: 'Check-out thất bại: ' + error.message
            });
        }
    }

}