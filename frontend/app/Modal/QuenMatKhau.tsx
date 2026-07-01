import React, { useState } from 'react';

function QuenMatKhau() {
    // State quản lý dữ liệu nhập vào của form
    const [formData, setFormData] = useState({
        otp: '',
        password: '',
        confirmPassword: ''
    });

    // State quản lý thông báo lỗi
    const [error, setError] = useState('');

    // Hàm bắt sự kiện thay đổi text trong các ô input
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    // Hàm xử lý khi bấm nút "Xác nhận thay đổi"
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn load lại trang
        setError('');       // Reset lỗi

        // 1. Kiểm tra mật khẩu khớp nhau trước khi gửi
        if (formData.password !== formData.confirmPassword) {
            setError('⚠️ Mật khẩu xác nhận không trùng khớp!');
            return;
        }

        try {
            // 2. Khởi tạo đối tượng đại diện cho form dữ liệu (multipart/form-data)
            const dataToSend = new FormData();
            
            // 3. Đút dữ liệu vào FormData (Server sẽ đọc thông qua các 'key' này)
            dataToSend.append('otp', formData.otp);
            dataToSend.append('password', formData.password);

            console.log("Đang gửi dữ liệu dưới dạng FormData...");

            // 4. Gọi API gửi lên Server
            // LƯU Ý: Không thêm 'Content-Type': 'application/json' vào headers nhé!
            const response = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                body: dataToSend // Truyền trực tiếp đối tượng FormData vào body
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert("Đặt lại mật khẩu thành công!");
                // Bạn có thể chuyển hướng trang tại đây (ví dụ: điều hướng về trang Đăng nhập)
            } else {
                alert(result.message || "Đã có lỗi xảy ra từ Server!");
            }

        } catch (err) {
            console.error("Lỗi kết nối API:", err);
            alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Đặt Lại Mật Khẩu
            </h2>
            
            <form id="resetPasswordForm" className="space-y-5" onSubmit={handleSubmit}>
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
                    {error && (
                        <p className="text-sm text-red-500 mt-1.5">
                            {error}
                        </p>
                    )}
                </div>

                {/* Nút bấm Submit */}
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition duration-150 ease-in-out mt-2"
                >
                    Xác nhận thay đổi
                </button>
            </form>
        </div>
    );
}

export default QuenMatKhau;