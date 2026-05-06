import exp from 'express'
import { UserModel } from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'
export const userApp = exp.Router()
// Get own profile
userApp.get("/profile", verifyToken("USER", "ADMIN"), async (req, res) => {
    const userId = req.user?.id
    const user = await UserModel.findById(userId).select("-password")
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json({ message: "Profile", payload: user })
})
// Update own profile
userApp.put("/profile", verifyToken("USER", "ADMIN"), async (req, res) => {
    const userId = req.user?.id
    const { username, avatarUrl, status } = req.body
    const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { username, avatarUrl, status } },
        { new: true }
    ).select("-password")
    res.status(200).json({ message: "Profile updated", payload: updatedUser })
})
// Search users by username
userApp.get("/search", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { username } = req.query
    if (!username) {
        return res.status(400).json({ message: "Username query is required" })
    }
    const users = await UserModel.find({
        username: { $regex: username, $options: "i" },
        isUserActive: true
    }).select("username avatarUrl status")
    res.status(200).json({ message: "Search results", payload: users })
})
// Get all users (admin only)
userApp.get("/all", verifyToken("ADMIN"), async (req, res) => {
    const users = await UserModel.find().select("-password")
    res.status(200).json({ message: "All users", payload: users })
})
// Deactivate user (admin only / soft delete)
userApp.patch("/user/:id", verifyToken("ADMIN"), async (req, res) => {
    const { id } = req.params
    const { isUserActive } = req.body
    const user = await UserModel.findById(id)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    if (user.isUserActive === isUserActive) {
        return res.status(200).json({ message: "User already in same state" })
    }
    user.isUserActive = isUserActive
    await user.save()
    res.status(200).json({ message: "User status updated", payload: user })
})