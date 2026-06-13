// server.js
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

import adminRouter from './routers/adminRouter.js';
import websiteRoute from './routers/webstiteRoute.js';
import NguoiDungRoute from './routers/userRouter.js';

import './CleanDB.js';

const app = express();

// Cấu hình CORS cho React frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

// Static file
app.use("/uploads", express.static("uploads"));

// Routes
app.get('/', (req, res) => res.json({ message: 'Server API running' }));
app.use('/api/admin', adminRouter);
app.use('/api/website', websiteRoute);
app.use('/api/NguoiDung', NguoiDungRoute);

// Middleware xử lý lỗi
app.use((req, res) =>
  res.json({
    Status: true,
    message: 'Không thể kết nối đến hệ thống, Vui lòng thử lại sau!'
  })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  res.status(500).json({
    message: err.message,
    url: req.originalUrl,
    body: req.body
  });
});

// Khởi tạo server HTTP
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// Khởi tạo Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// Lắng nghe kết nối socket
io.on("connection", (socket) => {
  console.log("Client đã kết nối:", socket.id);

  // Cho phép client join room theo userId
  socket.on("join-room", (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} đã join room`);
  });
});

// Xuất io để controller dùng emit
export { io };

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
