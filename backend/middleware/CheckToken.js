import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const loaiNguoiDung = parseInt(req.body?.LoaiND || req.query?.LoaiND);
    const token = loaiNguoiDung===1 ? req.cookies.token_admin : req.cookies.token;
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Không tìm thấy Token. Bạn chưa đăng nhập!" 
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next(); 
        
    } catch (error) {
        console.error("❌ LỖI KHI VERIFY JWT:", error.message); 
        return res.status(403).json({ 
            success: false, 
            message: `Lỗi Token: ${error.message}` 
        });
    }
};