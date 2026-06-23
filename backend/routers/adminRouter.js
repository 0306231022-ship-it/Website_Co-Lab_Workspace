

import { Router } from "express";


import { 
    getAllThietBi, 
    getThietBiById, 
    createThietBi, 
    updateThietBi, 
    
} from "../controllers/thietbiController.js";
// import createUpload from "../middleware/upload.js";
import multer from "multer";

const adminRouter = Router();

// =========================================
// QUẢN LÝ THIẾT BỊ
// =========================================
adminRouter.get("/thietbi", getAllThietBi);
adminRouter.get("/thietbi/:id", getThietBiById);
adminRouter.post("/thietbi", createThietBi);
adminRouter.put("/thietbi/:id", updateThietBi);
// adminRouter.delete("/thietbi/:id", deleteThietBi);

console.log("✅ adminRouter loaded");
export default adminRouter;