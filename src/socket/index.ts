import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3003"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat: ${chatId}`);
    });

    socket.on("leave_chat", (chatId: string) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat: ${chatId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

export const emitNewMessage = (chatId: string, message: any) => {
  if (io) {
    io.to(chatId).emit("new_message", message);
  }
};
