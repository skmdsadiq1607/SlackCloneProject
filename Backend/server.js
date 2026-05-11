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
app.set("io", io)
// init socket handlers
initSocket(io)
// connect DB then start server
connectDB().then(() => {
    const server = httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))

    // Graceful Shutdown
    process.on('SIGTERM', () => shutdown(server))
    process.on('SIGINT', () => shutdown(server))
})

async function shutdown(server) {
    console.log('Shutting down gracefully...')
    server.close(async () => {
        console.log('HTTP server closed.')
        // close DB connection here if connectDB provides a way, 
        // but Mongoose usually handles its own pool. 
        // For strictness:
        // await mongoose.connection.close()
        process.exit(0)
    })
}