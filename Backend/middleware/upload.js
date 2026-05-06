import multer from 'multer'
import path from 'path'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`
        cb(null, uniqueName)
    }
})
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    if (ext) {
        cb(null, true)
    } else {
        cb(new Error("File type not allowed"), false)
    }
}
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})