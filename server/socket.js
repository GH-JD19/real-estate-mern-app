import { Server } from "socket.io"

let io

export const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  })

  io.on("connection", (socket) => {

    console.log("Client connected:", socket.id)

    socket.on("joinAdmin", () => {
      socket.join("admin")
    })

    socket.on("joinAgent", () => {
      socket.join("agent")
    })

    socket.on("joinUser", (userId) => {
      socket.join(`user:${userId}`)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id)
    })

  })
}

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized")
  return io
}