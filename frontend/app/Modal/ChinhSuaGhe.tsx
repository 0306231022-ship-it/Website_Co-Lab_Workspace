function ChinhSuaGhe(){
    return (
        <>

        <div className="p-6 space-y-4">
            
            <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Tên ghế (Tên tài sản) <span className="text-red-500">*</span></label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                        <i className="fa-solid fa-signature text-sm"></i>
                    </span>
                    <input type="text" required value="Ghế Ergonomic Sihoo M57" 
                           className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-bold"/>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Danh mục ghế <span className="text-red-500">*</span></label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                        <i className="fa-solid fa-list-ul text-sm"></i>
                    </span>
                    <select className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-800 font-bold appearance-none cursor-pointer">
                        <option value="standard">Ghế tiêu chuẩn (Standard)</option>
                        <option value="ergonomic" selected>Ghế công thái học (Ergonomic)</option>
                        <option value="sofa">Ghế Sofa / Lounge</option>
                        <option value="meeting">Ghế phòng họp</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 pointer-events-none">
                        <i className="fa-solid fa-chevron-down text-[10px]"></i>
                    </span>
                </div>
            </div>

            <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Thời gian áp dụng danh mục mới <span className="text-red-500">*</span></label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                        <i className="fa-regular fa-clock text-sm"></i>
                    </span>
                    <input type="datetime-local" required
                           className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-bold cursor-pointer"/>
                </div>
            </div>

            <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Trạng thái vận hành</label>
                <button type="button" className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-800 rounded-xl text-sm font-bold transition-all cursor-pointer">
                    <div className="flex items-center space-x-2.5">
                        <i className="fa-solid fa-circle-dot text-xs text-amber-500 animate-pulse"></i>
                        <span>🟡 Ghế đang tạm ngưng (Hỏng hóc / Chờ bảo trì)</span>
                    </div>
                    <span className="text-xs text-amber-600 bg-white/80 px-2 py-0.5 rounded border border-amber-200/60 font-medium">Thay đổi</span>
                </button>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl space-y-2">
                <div className="flex items-start space-x-2.5">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5 text-xs animate-bounce"></i>
                    <div>
                        <h4 className="text-xs font-black text-red-900 uppercase tracking-wider">Ràng buộc thời gian đặt chỗ</h4>
                        <p className="text-[11px] text-red-700 leading-relaxed mt-0.5">
                            Ghế này đang được sử dụng hoặc đã có lịch đặt trước. Để tránh xung đột hóa đơn, thời gian áp dụng mới bắt buộc phải <b>sau khi người cuối cùng rời đi</b>.
                        </p>
                    </div>
                </div>
                
                <div className="bg-white/60 rounded-lg p-2.5 border border-red-200/50 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-medium"><i className="fa-solid fa-user-clock mr-1.5 text-gray-400"></i>Lịch người cuối cùng kết thúc:</span>
                    <span className="font-black text-red-600 bg-red-100/80 px-2 py-0.5 rounded border border-red-200">18:00 - Hôm nay</span>
                </div>
                
                <p className="text-[10px] text-gray-400 italic font-medium">
                    * Gợi ý: Hãy chọn thời gian áp dụng từ <span className="text-gray-600 font-bold">18:01</span> trở đi.
                </p>
            </div>

        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button type="button" className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer">
                Hủy bỏ
            </button>
            <button type="submit" className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition shadow-lg flex items-center cursor-pointer">
                <i className="fa-solid fa-floppy-disk mr-2 text-[11px]"></i> Xác nhận thay đổi
            </button>
        </div>
        </>
    )
};
export default ChinhSuaGhe