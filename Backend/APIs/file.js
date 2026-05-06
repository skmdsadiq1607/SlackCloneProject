import exp from 'express'
import { verifyToken } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import path from 'path'
import fs from 'fs'
export const fileApp = exp.Router()
// Upload file
fileApp.post("/upload", verifyToken("USER", "ADMIN"), upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
    }
    const fileUrl = `/uploads/${req.file.filename}`
    const fileName = req.file.originalname
    res.status(201).json({
        message: "File uploaded",
        payload: { fileUrl, fileName, mimetype: req.file.mimetype, size: req.file.size }
    })
})
// Download / serve file
fileApp.get("/uploads/:filename", verifyToken("USER", "ADMIN"), (req, res) => {
    const { filename } = req.params
    const filePath = path.resolve("uploads", filename)
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" })
    }
    res.download(filePath)
})
// Delete file
fileApp.delete("/upload/:filename", verifyToken("USER", "ADMIN"), (req, res) => {
    const { filename } = req.params
    const filePath = path.resolve("uploads", filename)
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" })
    }
    fs.unlinkSync(filePath)
    res.status(200).json({ message: "File deleted" })
})