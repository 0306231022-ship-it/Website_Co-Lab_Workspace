import ThietBi from "../models/thietbiModel.js";

// [GET] /api/admin/thietbi
// Trích xuất page, limit từ query params để phù hợp với Model phân trang
export const getAllThietBi = async (req, res) => {
    try {
        // Lấy page và limit từ URL (ví dụ: /api/admin/thietbi?page=1&limit=10)
        const { page, limit } = req.query;

        // Gọi model xử lý (hàm getAll trong model đã có giá trị mặc định nếu page, limit trống)
        const result = await ThietBi.getAll(page, limit);
        
        res.status(200).json({ 
            success: true, 
            data: result.data,
            pagination: result.pagination 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/admin/thietbi/:id
export const getThietBiById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate: ID truyền vào bắt buộc phải là số nguyên dương
        if (!id || isNaN(id) || parseInt(id) <= 0) {
            return res.status(400).json({ success: false, message: "ID thiết bị không hợp lệ!" });
        }

        const item = await ThietBi.getById(id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thiết bị!" });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/admin/thietbi
export const createThietBi = async (req, res) => {
    try {
        const { TEN_THIET_BI, HINH_ANH } = req.body;
        
        // --- VALIDATION ĐẦU VÀO ---
        if (!TEN_THIET_BI || typeof TEN_THIET_BI !== 'string' || TEN_THIET_BI.trim() === '') {
            return res.status(400).json({ success: false, message: "Tên thiết bị không được để trống!" });
        }
        if (TEN_THIET_BI.length > 255) {
            return res.status(400).json({ success: false, message: "Tên thiết bị không được vượt quá 255 ký tự!" });
        }
        if (HINH_ANH && HINH_ANH.length > 255) {
            return res.status(400).json({ success: false, message: "Đường dẫn hình ảnh quá dài (tối đa 255 ký tự)!" });
        }

        // Thực hiện thêm mới (Loại bỏ khoảng trắng thừa bằng .trim())
        const insertId = await ThietBi.create(TEN_THIET_BI.trim(), HINH_ANH ? HINH_ANH.trim() : null);
        res.status(201).json({ success: true, message: "Thêm thiết bị thành công!", id: insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PUT] /api/admin/thietbi/:id
export const updateThietBi = async (req, res) => {
    try {
        const { TEN_THIET_BI, HINH_ANH } = req.body;
        const { id } = req.params;

        // --- VALIDATION ID ---
        if (!id || isNaN(id) || parseInt(id) <= 0) {
            return res.status(400).json({ success: false, message: "ID thiết bị không hợp lệ!" });
        }

        // --- VALIDATION DỮ LIỆU SỬA ---
        if (!TEN_THIET_BI || typeof TEN_THIET_BI !== 'string' || TEN_THIET_BI.trim() === '') {
            return res.status(400).json({ success: false, message: "Tên thiết bị không được để trống!" });
        }
        if (TEN_THIET_BI.length > 255) {
            return res.status(400).json({ success: false, message: "Tên thiết bị không được vượt quá 255 ký tự!" });
        }
        if (HINH_ANH && HINH_ANH.length > 255) {
            return res.status(400).json({ success: false, message: "Đường dẫn hình ảnh quá dài (tối đa 255 ký tự)!" });
        }

        const updated = await ThietBi.update(id, TEN_THIET_BI.trim(), HINH_ANH ? HINH_ANH.trim() : null);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Thiết bị không tồn tại hoặc dữ liệu không có thay đổi!" });
        }
        res.status(200).json({ success: true, message: "Cập nhật thiết bị thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

