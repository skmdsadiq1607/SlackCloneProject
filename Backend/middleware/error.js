export const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({ message: messages.join(", ") })
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(409).json({ message: `${field} already exists` })
    }

    // Multer file error
    if (err.name === "MulterError") {
        return res.status(400).json({ message: err.message })
    }

    // JWT error
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" })
    }

    res.status(err.status || 500).json({ message: err.message || "Internal server error" })
}