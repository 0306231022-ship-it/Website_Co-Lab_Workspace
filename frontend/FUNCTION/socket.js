import { io } from 'socket.io-client';
export const socket = io('http://localhost:3001', {
  withCredentials: true,
  autoConnect: true // Cho phép tự động kết nối
});