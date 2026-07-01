import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
   const token = req.cookies.token_admin || req.cookies.token;
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Không tìm thấy Token. Bạn chưa đăng nhập!" 
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); 
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: "Token đã hết hạn hoặc không hợp lệ!" 
        });
    }
};