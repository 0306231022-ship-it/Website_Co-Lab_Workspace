
import ChiNhanhModel from '../models/ChiNhanhModel.js';
import ChiTietThietBiModel from '../models/ChiTiet_ThietBiModel.js';
import KhongGianModel from '../models/KhongGianModel.js';
import DatLichModel from '../models/LichDatModel.js';
import giaModel from '../models/QLGiaModel.js';
import GheModel from '../models/gheModel.js';
import LichDatController from './LichDatController.js';
import { body, query, validationResult } from 'express-validator';
export default class KhongGianController{
    static async DanhSach_KhongGian(req, res) {
          const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 3;
                const offset = (page - 1) * limit;
                const ID = parseInt(req.query.IDCN);
                try {
                    await Promise.all([
                        query('page')
                             .notEmpty()
                             .withMessage('Số lượng không được bỏ trống')
                             .isInt({ min: 0 })
                             .withMessage('Số trang phải là số nguyên và không được âm!')
                            .run(req),
                        query('IDCN')
                                              .notEmpty().withMessage('ID chi nhánh là thông tin bắt buộc')
                                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                                    .custom(async (value) => {
                                        const kiemtra = await ChiNhanhModel.kiemtraid(value);
                                        if (!kiemtra) throw new Error('ID chi nhánh không tồn tại!');
                                        return true;
                                    })
                                    .run(req)   
                    ]);
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        return res.status(400).json({
                            success: false,
                            message: 'Dữ liệu không hợp lệ!',
                            errors: errors.array().map(err => err.msg)
                        });
                    }
                    const trangthai = req.query.Loai;
                    const ten = req.query.TimKiem;
                    const coTrangThai = trangthai !== undefined && trangthai !== null && trangthai !== '';
                    const coTen = ten !== undefined && ten !== null && ten.trim() !== '';
                    const danhsach = coTrangThai || coTen ? await KhongGianModel.TimKiem_KhongGian(ten,trangthai,ID , limit, offset) : await KhongGianModel.LayDanhSach(limit,offset,ID);
                    if(!danhsach){
                        return res.status(500).json({
                            success:false,
                            message:'Lỗi khi tải danh sách không gian!'
                        })
                    }
                    return res.status(200).json({
                        success:true,
                        DanhSach: danhsach.DanhSach,
                        TongDanhSach: danhsach.TongDanhSach
                    })
                } catch (error) {
                     return res.status(500).json({
                        success: false,
                        message: 'Lấy danh sách thất bại: ' + error.message
                    });
                }
        
    }
    static async Them_KhongGian(req, res) {
       const dulieu = req.body;
       const files = req.files;
       let pathFile = files[0].filename;
       let DuongDan = 'uploads/KhongGian/' + pathFile;
        if(!pathFile){
            return res.json({
                status:true,
                message:'Lỗi tải ảnh!'
            })
        };
        try {
            await Promise.all([
                body('TenKhongGian')
                    .notEmpty()
                    .withMessage('Tên không gian không được để trống!')
                    .run(req),
                body('LoaiKG')
                    .notEmpty().withMessage('Loại không gian là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .isIn([0, 1, '0', '1']).withMessage('Giá trị nhập vào chỉ được phép là số 0 hoặc 1!')
                    .run(req),
                body('IDCN')
                     .notEmpty().withMessage('ID chi nhánh là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .custom(async (value, { req }) => {
                        const checkid = await ChiNhanhModel.kiemtraid(value);
                        if(! checkid){
                            throw new Error('ID chi nhánh không tồn tại!');
                        }
                    })
                    .run(req),
            ]);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    validate:true,
                    message: 'Dữ liệu không hợp lệ!',
                    errors: errors.array().map(err => err.msg)
                });
            }
            if(dulieu.IDBangGia){
                if(dulieu.IDBangGia<0){
                    return res.status(401).json({
                        success:false,
                        message:'Vui lòng kiểm tra thông tin giá!'
                    })
                }
                const kiemtra = await giaModel.testid(dulieu.IDBangGia);
                if(!kiemtra){
                    return res.status(401).json({
                        success:false,
                        message:'Vui lòng kiểm tra thông tin giá!'
                    })
                }
            }

            const themKG = await KhongGianModel.ThemKG(dulieu,DuongDan);
            if(!themKG){
                return res.status(500).json({
                    success:false,
                    message:'Thêm không gian thất bại!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Thêm không gian thành công!'
            })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Thêm không gian thất bại: ' + error.message
            });
        }

    }
    static async ChinhSua_TenKhongGian(req, res) {
        const dulieu = req.body;
        try {
            await Promise.all([
                body('IDKG')
                    .notEmpty().withMessage('ID không gian là thông tin bắt buộc')
                    .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .custom(async (value, { req }) => {
                        const checkid = await KhongGianModel.kiemtraid(value);
                        if(! checkid) throw new Error('ID không gian không tồn tại!');
                        return true;
                        
                    })
                    .run(req),
                body('TenKG')
                     .notEmpty().withMessage('tên không gian là thông tin bắt buộc')
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
            const update = await KhongGianModel.CapNhatTen(dulieu.TenKG,dulieu.IDKG);
            if(!update){
                return res.status(500).json({
                    success:false,
                    message:'Cập nhật tên không gian thất bại!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Cập nhật thông tin thành công!'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Thêm không gian thất bại: ' + error.message
            });
        }
    }
    static async ChinhAnh(req,res){
        try {
            const dulieu = req.body;
            const files = req.files;
            let pathFile = files[0].filename;
            let DuongDan = 'uploads/KhongGian/' + pathFile;
            if(!pathFile){
                return res.json({
                    success:false,
                    message:'Lỗi tải ảnh!'
                })
            };
            if(!dulieu.IDKG){
                return res.status(401).json({
                    success:false,
                    message:'Không tìm thấy ID không gian để cập nhật!'
                })
            }
            /*const dd_db = await KhongGianModel.LayChiTiet(dulieu.IDKG);
            const dd = dd_db[0].HINHANH;
            const xoa = xoaFileCu(dd);
            if(!xoa){
                return res.status(500).json({
                    success:false,
                    message:'lỗi khi thao tác hệ thống!'
                })
            }*/
            const kiemtra = await KhongGianModel.kiemtraid(dulieu.IDKG);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message:'ID không gian không tồn tại!'
                })
            }
            
            const update = await KhongGianModel.CapNhatAnh(dulieu.IDKG,DuongDan);
            if(!update){
                return res.status(500).json({
                    success:false,
                    message:'Không thể cập nhật hình ảnh không gian!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Cập nhật ảnh không gian thành công!'
            }) 
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Cập nhật ảnh không gian thất bại: ' + error.message
            });
        }
    }
    static async ChinhSua_TrangThai_KhongGian(req, res) {
          const dulieu = req.body;
                try {
                    await Promise.all([
                        body('NgayBatDau')
                          .notEmpty()
                          .withMessage('ngày bắt đầu không được bỏ trống')
                          .custom(async (value, { req }) => {
                            //Trường hợp 1: phải lớn hơn hoặc bằng ngày hiện tại
                            const now = new Date();
                            const startDate = new Date(value);
                            if (startDate < now) {
                                 throw new Error('Ngày chỉnh sửa không gian phải lớn hơn hoặc bằng ngày hiện tại!');
                            }
                            //Trường hợp 2: lớn hơn thời gian cuối cùng mà khách thuê
                            const kiemtra_lich = await DatLichModel.LichDatCuoi_IDPHONG(req.body.IDKG);
                            if(kiemtra_lich.length>0){
                                const thoigian_ketthuc =  new Date(kiemtra_lich.KHUNG_KETTHUC);
                                if(startDate<thoigian_ketthuc){
                                    throw new Error('Ngày bắt đầu chỉnh sửa phải lớn hơn lịch đặt cuối cùng tại phòng đó!');
                                }
                            }
                            return true;
                          }).run(req),
                          body('NgayHoanThanh')
                             .notEmpty()
                          .withMessage('ngày hoàn thành không được bỏ trống')
                          .custom(async (value, { req }) => {
                            //Trường hợp 1: phải lớn hơn hoặc bằng ngày bắt đầu
                            const endDate = new Date(value);
                            const startDate = new Date(dulieu.NgayBatDau)
                            if (endDate < startDate ) {
                                 throw new Error('Ngày hoàn thành không gian phải lớn hơn hoặc bằng ngày bắt đầu!');
                            }
                            return true;
                          }).run(req),
                          body('IDKG')
                .notEmpty().withMessage('ID không gian là thông tin bắt buộc')
                .isInt().withMessage('Giá trị nhập vào phải là một số nguyên!')
                .custom(async (value) => {
                    const kiemtra = await KhongGianModel.kiemtraid(value);
                    if (!kiemtra) throw new Error('ID không gian không tồn tại!');
                    return true;
                })
                .run(req)
        
                    ]);
                    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ!',
                errors: errors.array().map(err => err.msg)
            });
        }
                const update = await KhongGianModel.CapNhatTrangThai(dulieu.IDKG,dulieu.NgayBatDau,dulieu.NgayHoanThanh);
                if(!update){
                    return res.status(500).json({
                        success:false,
                        message:'Cập nhật trạng thái không gian thất bại!'
                    })
                }
                return res.status(200).json({
                    success:true,
                    message:'Cập nhật trạng thái không gian thành công!'
                })
                } catch (error) {
                     return res.status(500).json({
                        success: false,
                        message: 'Cập nhật trang thái không gian thất bại: ' + error.message
                    });
                }
    }
    static async ChiTiet_KhongGian(req, res) {
        const IDKG = req.query.IDKG;
        const IDCN = req.query.IDCN;
        let DanhSachGhe= null;
        try {
            await Promise.all([
                query('IDKG')
                    .notEmpty().withMessage('ID không gian là thông tin bắt buộc')
                    .isInt({ min: 0 }).withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .custom(async (value) => {
                         const kiemtra = await KhongGianModel.kiemtraid(value);
                         if (!kiemtra) throw new Error('ID không gian không tồn tại!');
                        return true;
                    })
                    .run(req),
                query('IDCN')
                    .notEmpty().withMessage('id ghế không được bỏ trống!')
                    .isInt().withMessage('ID ghế phải là số nguyên')
                    .custom(async (value) => {
                        const check = await ChiNhanhModel.kiemtraid(value);
                        if (!check) throw new Error('ID không tồn tại!');
                        const check2 = await KhongGianModel.kiemtra(value,IDKG);
                        if(!check2) throw new Error('ID này không thuộc chi nhánh!');
                        return true;
                    })
                    .run(req),
            ])
            const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                validate: true,
                message: 'Dữ liệu không hợp lệ!',
                errors: errors.array().map(err => err.msg)
            });
        }   
            const [ThongTin_ChiNhanh,thongTin_KhongGian, DanhSach_ThietBi] = await Promise.all([
                KhongGianModel.TruyVan_ChiNhanh(IDKG),
                KhongGianModel.LayChiTiet(IDKG),
                ChiTietThietBiModel.DanhSachThietBi_Khonggian(IDKG, 5, 0)
            ]);
            // Lấy loại không gian
            const LoaiKG= thongTin_KhongGian[0].LOAI_KHONG_GIAN;
            if(LoaiKG===1){
                const ghe = await GheModel.getIDkhongian(IDKG);
                DanhSachGhe = ghe
                return res.status(200).json({
                     success:true,
                    DanhSach : {
                        ChiNhanh: {
                            TEN_CHI_NHANH:ThongTin_ChiNhanh.TEN_CHI_NHANH,
                            TRANG_THAI: ThongTin_ChiNhanh.TRANG_THAI,
                            DIA_CHI:ThongTin_ChiNhanh.DIA_CHI
                        },
                        KhongGian : thongTin_KhongGian,
                        ThietBi: {
                            DanhSach: DanhSach_ThietBi.DanhSach,
                            TongDanhSach:DanhSach_ThietBi.TongDanhSach
                        }, 
                        Ghe: DanhSachGhe
                    }
                })
            }
            if(DanhSachGhe===null){
                return res.status(200).json({
                    success:true,
                    DanhSach : {
                        ChiNhanh: {
                            TEN_CHI_NHANH:ThongTin_ChiNhanh.TEN_CHI_NHANH,
                            TRANG_THAI: ThongTin_ChiNhanh.TRANG_THAI,
                            DIA_CHI:ThongTin_ChiNhanh.DIA_CHI
                        },
                        KhongGian : thongTin_KhongGian,
                        ThietBi: {
                            DanhSach: DanhSach_ThietBi.DanhSach,
                            TongDanhSach:DanhSach_ThietBi.TongDanhSach
                        }, 
                    }
                })
            }
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Chi tiết không gian thất bại: ' + error.message
            });
        }
    }
    static async TimKiem_KhongGian(req, res) {
        const ten = req.query.TimKiem;
        const trangthai = req.query.Loai;
        const IDCN = req.query.IDCN;
        try {
            const kiemtra = await ChiNhanhModel.kiemtraid(IDCN);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message:'ID chi nhánh không tồn tại!'
                })
            }
            const timkiem = await KhongGianModel.TimKiem_KhongGian(ten,trangthai,IDCN ,3 ,0);
            return res.status(200).json({
                success:true,
                danhsach:timkiem.DanhSach,
                TongDanhSach:timkiem.TongDanhSach
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Tìm kiếm không gian thất bại: ' + error.message
            })
        }
    }
    static async thongTin_KhongGian(req,res){
        const id = req.query.id;
        try {
            const kiemtra = await KhongGianModel.kiemtraid(id);
            if(!kiemtra){
                return res.status(401).json({
                    validate:true,
                    message:'Không tìm thấy id không gian!'
                })
            }
            const [ketqua1 ,ketqua2 ] = await Promise.all([
                KhongGianModel.LayChiTiet(id),
                DatLichModel.LichDatCuoi_IDPHONG(id)
            ]) 
            if(!ketqua1){
                return res.status(401).json({
                    success:false,
                    message:'Không tìm thấy thông tin không gian!'
                })
            }
            return res.json({
                success:true,
                dulieu:{
                    KhongGian:ketqua1,
                    LichDatCuoi:ketqua2
                }
            })
        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Thông tin chi tiêt không gian thất bại: ' + error.message
            })
        }
    }
    static async ThongKe(req,res){
        const id = req.query.id;
        try {
            const kiemtra = await KhongGianModel.kiemtraid(id);
            if(!kiemtra){
                return res.status(401).json({
                    success:false,
                    message: 'ID không gian không tồn tại!'
                })
            }
            const DoanhThu = await KhongGianModel.ThongKe(id);
            return res.status(200).json({
                success:true,
                dulieu:DoanhThu
            })


        } catch (error) {
             return res.status(500).json({
                success: false,
                message: 'Thông tin doanh thu không gian thất bại: ' + error.message
            })
        }
    }
    static async ChinhSua_Gia(req,res){
        const dulieu = req.body;
        try {
             await Promise.all([
                body('IDKG')
                    .notEmpty().withMessage('ID không gian là thông tin bắt buộc')
                    .isInt({ min: 0 }).withMessage('Giá trị nhập vào phải là một số nguyên!')
                    .custom(async (value) => {
                         const kiemtra = await KhongGianModel.kiemtraid(value);
                         if (!kiemtra) throw new Error('ID không gian không tồn tại!');
                        return true;
                    })
                    .run(req),
                body('IDBangGia')
                    .notEmpty().withMessage('id bảng giá không được bỏ trống!')
                    .isInt().withMessage('ID ghế phải là số nguyên')
                    .custom(async (value) => {
                        const check = await giaModel.testid(value)
                        if (!check) throw new Error('ID không tồn tại!');
                        return true;
                    })
                    .run(req),
            ])
            const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                validate: true,
                message: 'Dữ liệu không hợp lệ!',
                errors: errors.array().map(err => err.msg)
            });
        }
            const chinhsua = await KhongGianModel.ChinhSua_Gia(dulieu.IDKG,dulieu.IDBangGia);
            if(!chinhsua){
                return res.status(401).json({
                    success:true,
                    message:'Cập nhật thông tin thất bại!'
                })
            }
            return res.status(200).json({
                success:true,
                message:'Cập nhật thông tin thành công!'
            })
        } catch (error) {
              return res.status(500).json({
                success: false,
                message: 'Cập nhật thông tin không gian thất bại: ' + error.message
            })
        }
    }
    
    

}