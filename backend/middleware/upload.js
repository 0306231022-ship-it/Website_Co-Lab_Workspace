import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Biến hàm này thành một hàm nhận tham số
const createUpload = (subFolder) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const rootDir = path.resolve('uploads');
            const finalPath = path.join(rootDir, subFolder);

            // Kiểm tra và tạo thư mục nếu chưa có
            if (!fs.existsSync(finalPath)) {
                fs.mkdirSync(finalPath, { recursive: true });
            }
            
            cb(null, finalPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });

    return multer({ storage: storage });
};

export default createUpload;