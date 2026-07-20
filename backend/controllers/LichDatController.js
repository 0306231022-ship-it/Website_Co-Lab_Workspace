import { body, query, validationResult } from 'express-validator';
import NguoiDungModel from '../models/NguoiDungModel.js';
import KhongGianModel from '../models/KhongGianModel.js';
import DatLichModel from '../models/LichDatModel.js';
import GheModel from '../models/gheModel.js';
import moment from 'moment'
import { io } from '../server.js';
import hoadonModel from '../models/hoadonModel.js';
import ThanhToanModal from '../models/ThanhToanModal.js';
export default class LichDatController{
    static async DatLich(req,res){
        const dulieu = req.body;
        const userId = req.user.id;
        const id = req.body.id;

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
                  body('id')
                    .notEmpty().withMessage('Dữ liệu không được bỏ trống!')
                    .custom(async (body) => {
                        const kiemtra = await KhongGianModel.kiemtraid(body);
                        if(!kiemtra) throw new Error('Không ttoonf tại không gian!');
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
            //phát sự kiện
              const loai = await KhongGianModel.LayLoai_KG(id)
              io.to(`space_type_${loai}_id_${id}`).emit('update_schedule', {success:true});
            return res.status(200).json({
                success:true,
                ID_LICHDAT: DatLich,
                message:  'Vui lòng thanh toán trước khi sử dụng dịch vụ!'
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
          const trangthai = req.query.trangthai;
          const search = req.query.search;
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
            const DanhSach = await DatLichModel.DanhSach(limit,offset,trangthai,search);
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
            const tab = req.query.tab;
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
            const lichsu = await DatLichModel.DanhSach_theoIDND(limit, offset, userId, tab);
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
            const kiemtra3 = await hoadonModel.kiemtraid_hoadon(id);
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
                    TrangThai_ThanhToan: kiemtra3
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
                    DOANHTHU:thongke.DOANHTHU,
                    HUYDON:thongke.HUYDON
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
                res.end(); 
                return;
            }
            const laythong_kiemtra = await DatLichModel.ThongTin(id);
            const thongtin_batdau = moment(laythong_kiemtra.KHUNG_BATDAU).valueOf();
            const timeHienTai = new Date().getTime();
            const mocCheckInSom = thongtin_batdau - (15 * 60 * 1000);
            if (timeHienTai >= mocCheckInSom && timeHienTai <= thongtin_batdau) {
                const kiemtra_ckeckin= await DatLichModel.kiemtra_trangthai_lichdat(id);
                if(!kiemtra_ckeckin){
                    io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkin', {
                        success: false,
                        message: "Hiện tại, lịch đặt của bạn đang được sử dụng cho khách trước. Vui lòng check-in sau ít phút!"
                    });
                }
                const kiemtra = await hoadonModel.kiemtraid_hoadon(id);
                if(!kiemtra){
                    io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkin', {
                        success: false,
                        message: "Vui lòng thanh toán trước khi sử dung!"
                    });
                    res.end();
                    return;
                }
               const check = await DatLichModel.checkin(id);
               if(!check){
                    io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkin', {
                        success: false,
                        message: "Check-in thất bại! Vui lòng thực hiện trong giây lát"
                    });
                    res.end();
                    return;
               }
               const idkg= await DatLichModel.layidkg_idlich(id);
               const loai = await KhongGianModel.LayLoai_KG(idkg)
               io.to(`space_type_${loai}_id_${idkg}`).emit('update_schedule', {success:true});
               io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkin', {
                    success: true,
                    message: "Check-in thành công!"
                });
                res.end();
                return;
            } else if (timeHienTai < mocCheckInSom) {
                io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkin', {
                    success: false,
                    message: "Vui lòng Check-in trước 15p!"
                 });
                 res.end();
                return;
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
                io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkout', {
                    success: true,
                    message: "Vui lòng kiểm tra thông tin"
                });
                res.end(); 
                return;
            }
               const check = await DatLichModel.checkout(id);
               if(!check){
                    io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkout', {
                        success: false,
                        message: "Check-out thất bại!"
                    });
                    res.end();
                     return;
               }
               const kiemtra_hoadon = await hoadonModel.kiemtraid_hoadon(id);
               if(!kiemtra_hoadon){
                     io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkout', {
                        success: true,
                        message: "Bạn chưa thanh toán cho lịch này, Vui lòng thanh toán để có trải nghiệm tốt hơn!"
                    });
                    res.end(); 
                    return;
               }
               const capnhat = await DatLichModel.CapNhat_TrangThai(id,1);
               if(!capnhat){
                     io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkout', {
                        success: false,
                        message: "Check-out thất bại, Vui lòng thử lại sau!"
                    });
                    res.end();
                    return;
               }
             const idkg= await DatLichModel.layidkg_idlich(id);
               const loai = await KhongGianModel.LayLoai_KG(idkg)
               io.to(`space_type_${loai}_id_${idkg}`).emit('update_schedule', {success:true});
              io.to(`QuanLi_khunggio-${id}`).emit('thong-bao-checkout', {
                success: true,
                message: "Check-out thành công!"
            });
            res.end();
            return;
        } catch (error) {
              return res.status(401).json({
                success: false,
                message: 'Check-out thất bại: ' + error.message
            });
        }
    }
    static async thongtin_khachhang(req,res){
        const id = req.query.id;
        try {
            const kiemtra = await DatLichModel.kiemtraid(id);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message:'Không tìm thấy thông tin lịch đặt'
                })
            }
            const thongtin = await DatLichModel.thongtin_khachhang(id);
            if(thongtin=== null){
                return res.status(401).json({
                    success:false,
                    message: 'Không tin thấy thông tin khách hàng!'
                })
            }
            const nguoidung = await NguoiDungModel.findByid(thongtin);
            return res.status(200).json({
                success:true,
                dulieu: {
                    TENND: nguoidung.TENND,
                    EMAIL:nguoidung.EMAIL,
                    HINH_ANH:nguoidung.HINH_ANH
                }
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Lấy thông tin người dùng thất bại: ' + error.message
            });
        }
    }
    static async thongtin_hoatdong(req,res){
        const id = req.query.id;
        try {
            if(!id){
                return res.status(401).json({
                    success:false,
                    message:'Vui lòng kiểm tra lại thông tin!'
                })
            }
            const kiemtra = await DatLichModel.kiemtraid(id);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message:'Không tồn tại lịch đặt này!'
                })
            }
            const ketqua = await DatLichModel.thongtin_hoatdong(id);
            return res.status(200).json({
                success:true,
                dulieu:ketqua
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Lấy thông tin đặt đơn thất bại: ' + error.message
            });
        }
    }
    static async laygiatien_thanhtoan(req,res){
        const id = req.query.id;
        try {
             if(!id){
                return res.status(401).json({
                    success:false,
                    message:'Vui lòng kiểm tra lại thông tin!'
                })
            }
            const kiemtra = await DatLichModel.kiemtraid(id);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message:'Không tồn tại lịch đặt này!'
                })
            }
            const giatien = await DatLichModel.DonGia_idlichdat(id);
            const id_hd = await hoadonModel.id(id);
            if(id_hd===null){
                return res.status(200).json({
                    success:true,
                    GiaTien:giatien,
                    ThanhToan: null
                })
            }
            const id_thanhtoan = await ThanhToanModal.laygiatien_thanhtoan(id_hd);
            return res.status(200).json({
                success:true,
                GiaTien:giatien,
                ThanhToan:id_thanhtoan
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Lấy thông tin đặt đơn thất bại: ' + error.message
            });
        }
    }
    static async huylichdat(req,res){
         const userId = req.user.id;
         const id = req.query.id;
        try {
            const kiemtra1 = await DatLichModel.kiemtraid(id);
            if(!kiemtra1){
                return res.status(401).json({
                    success:false,
                    message:'Không tìm thấy lịch đặt cần hủy!'
                })
            }
            const kiemtra2 = await DatLichModel.Kiemtra2(id,userId);
            if(!kiemtra2){
                return res.status(401).json({
                    success:false,
                    message:'Lịch đặt này không phải của bạn!'
                })
            }
            const Huy = await DatLichModel.HuyLichTheoId(id);
            if(!Huy){
                return res.status(401).json({
                    success:false,
                    message:'Không thewer hủy lịch đặt của bạn!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Hủy lịch dặt thành công!'
            })
        } catch (error) {
             return res.status(401).json({
                success: false,
                message: 'Hủ thông tin lịch đặt thất bại: ' + error.message
            })
        }
    }
}