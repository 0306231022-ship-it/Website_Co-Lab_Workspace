// server.js

import "dotenv/config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import NguoiDungRoute from "./routers/NguoiDungRouter.js";
import adminRouter from "./routers/adminRouter.js";

import "./CleanDB.js";

const app = express();

// Cấu hình CORS cho React frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);



app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

// Static file
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => res.json({ message: "Server API running" }));
app.use("/api/NguoiDung", NguoiDungRoute);
app.use("/api/admin", adminRouter);

// Middleware xử lý lỗi
app.use((req, res) =>
  res.json({
    Status: true,
    message: "Không thể kết nối đến hệ thống, Vui lòng thử lại sau!",
  }),
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  res.status(500).json({
    message: err.message,
    url: req.originalUrl,
    body: req.body,
  });
});

// Khởi tạo server HTTP
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// Khởi tạo Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on('connection', (socket) => {
    socket.on('join_space_room_seat' , (data)=>{
       const { idKhongGian} = data;
       const ten = `khonggian-${idKhongGian}_ghe`;
       socket.join(ten);
    })
    socket.on('ChiTiet_LichDat', (data)=>{
      const {idlichdat} = data;
      const ten = `QuanLi_khunggio-${idlichdat}`;
      socket.join(ten);
    })
    //ĐÃ CHWCK SOCKET phía trên
    socket.on('lich-dat', (idNguoiDung) => {
        socket.join(idNguoiDung); 
    });

    socket.on('thong-bao-thanhtoan', (idNguoiDung) => {
        socket.join(idNguoiDung); 
    });

    socket.on('khach-dang-su-dung', (idNguoiDung) => {
        socket.join(idNguoiDung); 
    });

    socket.on("join-room", (userId) => {
        socket.join(userId.toString());
    });
    socket.on("join_space_room", (data) => {
        const { idKhongGian, loaiKhongGian } = data;
        const roomName = `space_type_${loaiKhongGian}_id_${idKhongGian}`;
        socket.join(roomName);
    });
    socket.on("leave_space", (data) => {
        const { idKhongGian, loaiKhongGian } = data;
        const roomName = `space_type_${loaiKhongGian}_id_${idKhongGian}`;
        socket.leave(roomName);
    });
 

});
//ngrok http 3001 --domain=bacteria-widely-sizing.ngrok-free.dev
// Xuất io để controller dùng emit
export { io };
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
