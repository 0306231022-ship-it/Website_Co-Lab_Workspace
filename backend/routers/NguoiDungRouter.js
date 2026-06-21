import { Router } from "express";
import NguoiDungController from "../controllers/NguoiDungController.js";
const nguoidungRouter = Router();
nguoidungRouter.post('/hello', NguoiDungController.Hello);
export default nguoidungRouter;