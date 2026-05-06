import { createServer } from 'http'
import { Server } from 'socket.io'
import { app } from './app.js'
import { connectDB } from './config/db.js'
import { initSocket } from './socket/index.js'
import { config } from 'dotenv'
config()
const PORT = process.env.PORT || 5000
const httpServer = createServer(app)

// socket.io setup
const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true }
})
// init socket handlers
initSocket(io)
// connect DB then start server
connectDB().then(() => {
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})