import React, { useState } from 'react';
import * as api from "@/API/API";
import * as ThongBao from '@/FUNCTION/ThongBao';
interface objQuenMatKhau{
    Email: string
}
function QuenMatKhau({ DuLieu } : {DuLieu: objQuenMatKhau}) {
    const [formData, setFormData] = useState({
        otp: '',
        password: '',
        confirmPassword: ''
    });
     const [errors, setErrors] = useState<string[]>([]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };
    const handleSubmit = async () => {
       
        try {
            const dataToSend = new FormData();
            dataToSend.append('Email', DuLieu.Email)
            dataToSend.append('OTP', formData.otp);
            dataToSend.append('MatKhauMoi', formData.password);
            dataToSend.append('XacNhanMatKhau' , formData.confirmPassword);
            const response = await api.CallAPI(dataToSend,{url:'/NguoiDung/QuenMatKhau' , PhuongThuc:1})
            if(response.validate){
               setErrors(response.errors);
                return;
            }
            if (response.success) {
                ThongBao.ThongBao_ThanhCong(response.message);
            } else {
                ThongBao.ThongBao_Loi(response.message);
            }
        } catch (err) {
            console.error("Lỗi kết nối API:", err);
           ThongBao.ThongBao_Loi("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Đặt Lại Mật Khẩu
            </h2>
             {errors && errors.length > 0 && (
        <div className="w-full mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-left animate-pulse">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-xs mb-1.5">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Thông tin đăng nhập không hợp lệ:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((item, index) => (
              <li key={index} className="text-[11px] text-red-500 font-medium">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
            <div id="resetPasswordForm" className="space-y-5">
                {/* Ô nhập mã OTP */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Mã xác thực OTP
                    </label>
                    <input 
                        type="text" 
                        id="otp" 
                        placeholder="Nhập mã 6 số" 
                        required 
                        maxLength={6}
                        pattern="\d{6}"
                        value={formData.otp}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 tracking-widest text-center font-bold text-lg"
                    />
                </div>

                {/* Ô nhập mật khẩu mới */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Mật khẩu mới
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        placeholder="Tối thiểu 6 ký tự" 
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                </div>

                {/* Ô nhập lại mật khẩu */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Xác nhận mật khẩu mới
                    </label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        placeholder="Nhập lại mật khẩu mới" 
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                </div>
                <button 
                    type="button"
                    onClick={()=>{handleSubmit()}}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition duration-150 ease-in-out mt-2"
                >
                    Xác nhận thay đổi
                </button>
            </div>
        </div>
    );
}

export default QuenMatKhau;