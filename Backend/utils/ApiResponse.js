export const ApiResponse = (res, status, message, payload = null) => {
    return res.status(status).json({
        success: status < 400,
        message,
        payload
    })
}