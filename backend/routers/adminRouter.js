// import { Router } from "express";
// import adminController from "../controllers/adminController.js";
// import khonggiancontroller from "../controllers/khonggianController.js";
// import createUpload from "../middleware/upload.js";
// import multer from "multer";
// const adminRouter = Router();
// adminRouter.post("/themkhonggian", khonggiancontroller.createSpace);
// //
// //=========================================
// console.log("✅ adminRouter loaded");
// export default adminRouter;

import { Router } from "express";
// import adminController from "../controllers/adminController.js"; // 👈 COMMENT HOẶC XÓA DÒNG NÀY ĐI

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