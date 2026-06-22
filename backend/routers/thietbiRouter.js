import { Router } from "express";
import { 
    getAllThietBi, 
    getThietBiById, 
    createThietBi, 
    updateThietBi, 
    deleteThietBi 
} from "../controllers/thietbiController.js";

const router = Router(); // Biến này hứng trọn cấu hình bên server.js

// Khai báo các endpoint cho thiết bị
router.get("/thietbi", getAllThietBi);
router.get("/thietbi/:id", getThietBiById);
router.post("/thietbi", createThietBi);
router.put("/thietbi/:id", updateThietBi);
router.delete("/thietbi/:id", deleteThietBi);

export default router; // Export default biến router cho server.js sử dụng