

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
const upload= multer();
// =========================================
// QUẢN LÝ THIẾT BỊ
// =========================================
adminRouter.get("/thietbi", getAllThietBi);
adminRouter.get("/thietbi/:id", getThietBiById);
adminRouter.post("/thietbi",  upload.none(),createThietBi);
adminRouter.post("/CapNhatThietBi", upload.none(), updateThietBi);


console.log("✅ adminRouter loaded");
export default adminRouter;