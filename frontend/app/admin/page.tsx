function Admin(){
    return (
        <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Bảng Quản Trị Hệ Thống</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Theo dõi hoạt động tổng thể, quản lý đặt chỗ và tối ưu hóa tài nguyên.</p>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-white border border-slate-200/60 px-3 py-1.5 rounded-xl shadow-xs self-start sm:self-auto text-xs font-semibold text-slate-600">
                        <i className="fa-regular fa-calendar text-indigo-500"></i>
                        <span>14 Tháng 06, 2026</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                        <div>
                            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Đặt đơn mới</span>
                            <span className="text-2xl font-bold text-slate-800 tracking-tight mt-1 block">42 đơn</span>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <i className="fa-solid fa-file-invoice-dollar text-base"></i>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                        <div>
                            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Khách hàng mới</span>
                            <span className="text-2xl font-bold text-slate-800 tracking-tight mt-1 block">108</span>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <i className="fa-solid fa-users text-base"></i>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                        <div>
                            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Danh mục ghế sử dụng</span>
                            <span className="text-2xl font-bold text-slate-800 tracking-tight mt-1 block">78% Tải</span>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <i className="fa-solid fa-chair text-base"></i>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                        <div>
                            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Doanh thu tạm tính</span>
                            <span className="text-xl font-bold text-slate-800 tracking-tight mt-1.5 block">8.450.000đ</span>
                        </div>
                        <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                            <i className="fa-solid fa-wallet text-base"></i>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    <div className="xl:col-span-2 bg-white border border-slate-200/60 rounded-xl shadow-xs overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Danh sách đặt đơn gần đây</h2>
                                <p className="text-[11px] text-slate-400">Cập nhật phiên đặt chỗ và trạng thái hóa đơn của khách hàng</p>
                            </div>
                            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-all">Xem tất cả đơn</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Khách hàng</th>
                                        <th className="px-5 py-3 font-semibold">Vị trí & Loại ghế</th>
                                        <th className="px-5 py-3 font-semibold">Khung giờ đặt</th>
                                        <th className="px-5 py-3 font-semibold">Trạng thái đơn</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/70 font-medium text-slate-600">
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 flex items-center space-x-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px]">LA</div>
                                            <span className="font-semibold text-slate-700">Lê Văn An</span>
                                        </td>
                                        <td className="px-5 py-3.5">Bàn đơn - Khu A <span className="text-slate-400 font-normal text-[11px] bg-slate-100 px-1.5 py-0.5 rounded ml-1">Ghế Công Thái Học</span></td>
                                        <td className="px-5 py-3.5 text-slate-500">08:00 - 17:00</td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold">Đang sử dụng</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 flex items-center space-x-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-[11px]">TM</div>
                                            <span className="font-semibold text-slate-700">Trần Thị Mai</span>
                                        </td>
                                        <td className="px-5 py-3.5">Phòng họp Lớn <span className="text-slate-400 font-normal text-[11px] bg-slate-100 px-1.5 py-0.5 rounded ml-1">Ghế Họp Da Cao Cấp</span></td>
                                        <td className="px-5 py-3.5 text-slate-500">14:00 - 16:00</td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">Đã thanh toán</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white border border-slate-200/60 rounded-xl p-5 space-y-4 shadow-xs">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Hiệu suất tài nguyên hôm nay</h3>
                                <p className="text-[11px] text-slate-400">Trạng thái lấp đầy của danh mục Ghế & Phòng</p>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-slate-600">Ghế đơn (Hot Desk)</span>
                                        <span className="text-indigo-600">92%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: "92%" }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-slate-600">Phòng họp cố định</span>
                                        <span className="text-amber-600">45%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                        <div className="bg-amber-500 h-1.5 rounded-full" style={{width: "45%" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-xs relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-white/10 text-6xl font-bold">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div className="flex items-start space-x-3 relative z-10">
                                <div className="p-1.5 bg-white/20 rounded-lg mt-0.5 text-xs">
                                    <i className="fa-solid fa-screwdriver-wrench"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs tracking-wide">Cảnh báo trang thiết bị</h3>
                                    <p className="text-[11px] text-amber-50/90 mt-1 leading-relaxed">Hệ thống ghi nhận điều hòa tại <b>Phòng họp M-02</b> lỗi tản nhiệt. Lịch đặt đơn liên quan đã tạm ngưng tự động để xử lý kỹ thuật.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
        </>
    )
};
 export default Admin;