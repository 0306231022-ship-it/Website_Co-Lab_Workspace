

import { Router } from "express";


import { 
    getAllThietBi, 
    getThietBiById, 
    createThietBi, 
    updateThietBi, 
    
} from "../controllers/thietbiController.js";
import{
    createDanhMucGhe,
    updateDanhMucGhe
}
from"../controllers/danhmucgheController.js";
// import createUpload from "../middleware/upload.js";
import multer from "multer";

const adminRouter = Router();
const upload= multer();
// =========================================
// QUẢN LÝ THIẾT BỊ
adminRouter.get("/thietbi", getAllThietBi);
adminRouter.get("/layid/:id", getThietBiById);
adminRouter.post("/thietbi",  upload.none(),createThietBi);
adminRouter.post("/CapNhatThietBi", upload.none(), updateThietBi);
//Danh Mục ghế
adminRouter.post("/danhmucghe",  upload.none(),createDanhMucGhe);
adminRouter.post("/capnhatdanhmucghe",upload.none(),updateDanhMucGhe);
console.log("✅ adminRouter loaded");
export default adminRouter;