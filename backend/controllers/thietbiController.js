import ThietBi from "../models/thietbiModel.js";

// [GET] /api/admin/thietbi
export const getAllThietBi = async (req, res) => {
    try {
        const data = await ThietBi.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/admin/thietbi/:id
export const getThietBiById = async (req, res) => {
    try {
        const item = await ThietBi.getById(req.params.id);
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
        if (!TEN_THIET_BI) {
            return res.status(400).json({ success: false, message: "Tên thiết bị không được để trống!" });
        }
        const insertId = await ThietBi.create(TEN_THIET_BI, HINH_ANH || null);
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

        if (!TEN_THIET_BI) {
            return res.status(400).json({ success: false, message: "Tên thiết bị không được để trống!" });
        }

        const updated = await ThietBi.update(id, TEN_THIET_BI, HINH_ANH);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Thiết bị không tồn tại hoặc không có thay đổi!" });
        }
        res.status(200).json({ success: true, message: "Cập nhật thiết bị thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [DELETE] /api/admin/thietbi/:id
export const deleteThietBi = async (req, res) => {
    try {
        const deleted = await ThietBi.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Thiết bị không tồn tại hoặc đã bị xóa từ trước!" });
        }
        res.status(200).json({ success: true, message: "Xóa thiết bị thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};