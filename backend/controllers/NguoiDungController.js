import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';



export default class NguoiDungController{
   static async Hello(req, res){
      res.json({ message: "Đã kết nối server thành công!" });
   }
}